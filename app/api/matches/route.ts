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

    let matches = db.matches.getByUserId(userId)

    // Filter by status if specified
    if (status) {
      matches = matches.filter(match => match.status === status)
    }

    // Sort by match score
    matches.sort((a, b) => b.match_score - a.match_score)

    // Get user details for matched users
    const matchesWithUsers = matches.map(match => {
      const matchedUser = db.users.getById(match.matched_user_id)
      return {
        ...match,
        matched_user: matchedUser || null
      }
    })

    return NextResponse.json({ matches: matchesWithUsers })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    if (!body.userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 })
    }

    // Get current user profile
    let currentUser = db.users.getById(body.userId)

    if (!currentUser) {
      // User doesn't exist in database - use demo user data
      // This happens in serverless environments where localStorage isn't available
      currentUser = {
        id: body.userId,
        name: 'New User',
        email: null,
        age: 28,
        location: 'Unknown',
        bio: 'Just joined Milo!',
        interests: ['Technology', 'Music', 'Sports', 'Travel'],
        looking_for: ['Friendship', 'Networking', 'Activity Partners'],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    }

    // Get existing matches to exclude
    const existingMatches = db.matches.getByUserId(body.userId)
    const excludedUserIds = [
      body.userId,
      ...(existingMatches?.map(m => m.matched_user_id) || [])
    ]

    // Get potential matches
    const potentialMatches = db.users.getAllExcept(excludedUserIds).slice(0, 20)

    if (potentialMatches.length === 0) {
      return NextResponse.json({ 
        matches: [],
        message: 'No potential matches found at the moment. Check back later!' 
      })
    }

    // Use simple matching algorithm (more reliable than AI for deployment)
    const createdMatches = potentialMatches
      .map(matchedUser => {
        // Calculate match score based on shared interests
        const sharedInterests = currentUser.interests?.filter((interest: string) => 
          matchedUser.interests?.includes(interest)
        ).length || 0

        const totalInterests = new Set([
          ...(currentUser.interests || []),
          ...(matchedUser.interests || [])
        ]).size

        const matchScore = totalInterests > 0 ? sharedInterests / totalInterests : 0.5

        const match = db.matches.create(body.userId, matchedUser.id, matchScore)
        
        return {
          ...match,
          matched_user: matchedUser
        }
      })
      .sort((a, b) => b.match_score - a.match_score)
      .slice(0, 3) // Return top 3 matches

    return NextResponse.json({
      matches: createdMatches,
      reasoning: 'Selected based on shared interests and compatibility',
      totalCreated: createdMatches.length
    })
  } catch (error) {
    console.error('Unexpected error:', error)
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
    const userMatches = db.matches.getByUserId(body.userId)
    const existingMatch = userMatches.find(match => match.id === body.matchId)

    if (!existingMatch) {
      return NextResponse.json({ error: 'Match not found or access denied' }, { status: 404 })
    }

    const updatedMatch = db.matches.updateStatus(body.matchId, body.status)

    if (!updatedMatch) {
      return NextResponse.json({ error: 'Failed to update match' }, { status: 500 })
    }

    return NextResponse.json({ match: updatedMatch })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}