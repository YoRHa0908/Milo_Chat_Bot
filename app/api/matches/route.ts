import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/localStorageDb'
import { generateMatchSuggestions } from '@/lib/mistral'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const status = searchParams.get('status')

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 })
    }

    let matches = await db.matches.getByUserId(userId)

    // Filter by status if specified
    if (status) {
      matches = matches.filter(match => match.status === status)
    }

    // Sort by match score
    matches.sort((a, b) => b.match_score - a.match_score)

    // Get user details for matched users
    const matchesWithUsers = await Promise.all(matches.map(async (match) => {
      // Determine which user is the "other" user (not the current user)
      const otherUserId = match.user_id === userId ? match.matched_user_id : match.user_id
      const matchedUser = await db.users.getById(otherUserId)
      
      return {
        ...match,
        matched_user: matchedUser || null,
        // Add metadata about which user is which
        is_current_user_initiator: match.user_id === userId
      }
    }))

    return NextResponse.json({ matches: matchesWithUsers })
  } catch (error) {
    // Unexpected error
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    if (!body.userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 })
    }

    // Get current user profile - try from database first, then use data from request
    let currentUser = await db.users.getById(body.userId)

    if (!currentUser && body.userProfile) {
      // Use profile data sent from client
      const userName = body.userProfile.name || 'User' // Use 'User' instead of 'New User'
      currentUser = {
        id: body.userId,
        name: userName,
        email: body.userProfile.email || null,
        age: body.userProfile.age || null,
        location: body.userProfile.location || null,
        bio: body.userProfile.bio || null,
        interests: body.userProfile.interests || [],
        looking_for: body.userProfile.looking_for || [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      
      // Also save this user to the database for future requests
      await db.users.create({
        name: currentUser.name,
        email: currentUser.email,
        age: currentUser.age,
        location: currentUser.location,
        bio: currentUser.bio,
        interests: currentUser.interests,
        looking_for: currentUser.looking_for
      })
    } else if (!currentUser) {
      // User doesn't exist in database and no profile data sent
      // Try to get user from chat API or use a generic name
      currentUser = {
        id: body.userId,
        name: 'User', // Generic name instead of 'New User'
        email: null,
        age: null,
        location: null,
        bio: null,
        interests: [],
        looking_for: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    }

    // Get existing matches to exclude
    const existingMatches = await db.matches.getByUserId(body.userId)
    const excludedUserIds = [
      body.userId,
      ...(existingMatches?.map(m => m.matched_user_id) || [])
    ]

    // Get potential matches
    const potentialMatches = (await db.users.getAllExcept(excludedUserIds)).slice(0, 20)

    if (potentialMatches.length === 0) {
      return NextResponse.json({ 
        matches: [],
        message: 'No potential matches found at the moment. Check back later!' 
      })
    }

    // Use simple matching algorithm (more reliable than AI for deployment)
    const createdMatches = await Promise.all(potentialMatches.map(async (matchedUser) => {
        // DOUBLE-CHECK: Ensure user is not matching with themselves
        if (matchedUser.id === body.userId) {
          console.error('CRITICAL: User trying to match with themselves!', {
            userId: body.userId,
            matchedUserId: matchedUser.id
          })
          return null // Skip this match
        }

        // Calculate match score based on shared interests
        const sharedInterests = currentUser.interests?.filter((interest: string) => 
          matchedUser.interests?.includes(interest)
        ).length || 0

        const totalInterests = new Set([
          ...(currentUser.interests || []),
          ...(matchedUser.interests || [])
        ]).size

        const matchScore = totalInterests > 0 ? sharedInterests / totalInterests : 0.5

        const match = await db.matches.create(body.userId, matchedUser.id, matchScore)
        
        return {
          ...match,
          matched_user: matchedUser
        }
      }))
    
    // Filter out null matches and sort
    const filteredMatches = createdMatches
      .filter(match => match !== null) // Remove any null matches (self-matches)
      .sort((a, b) => b.match_score - a.match_score)
      .slice(0, 10) // Return top 10 matches (increased from 3)

    return NextResponse.json({
      matches: filteredMatches,
      reasoning: 'Selected based on shared interests and compatibility',
      totalCreated: filteredMatches.length
    })
  } catch (error) {
    // Unexpected error
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    
    if (!body.matchId || !body.status || !body.userId) {
      return NextResponse.json({ error: 'matchId, status, and userId are required' }, { status: 400 })
    }

    // First verify the match belongs to the user
    const userMatches = await db.matches.getByUserId(body.userId)
    const existingMatch = userMatches.find(match => match.id === body.matchId)

    if (!existingMatch) {
      return NextResponse.json({ error: 'Match not found or access denied' }, { status: 404 })
    }

    const updatedMatch = await db.matches.updateStatus(body.matchId, body.status)

    if (!updatedMatch) {
      return NextResponse.json({ error: 'Failed to update match' }, { status: 500 })
    }

    return NextResponse.json({ match: updatedMatch })
  } catch (error) {
    // Unexpected error
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


