import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { generateMatchSuggestions } from '@/lib/mistral'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const status = searchParams.get('status')

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 })
    }

    let query = supabase
      .from('matches')
      .select(`
        *,
        matched_user:users!matches_matched_user_id_fkey(*)
      `)
      .or(`user_id.eq.${userId},matched_user_id.eq.${userId}`)
      .order('match_score', { ascending: false })

    if (status) {
      query = query.eq('status', status)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching matches:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ matches: data })
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
    const { data: currentUser, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', body.userId)
      .single()

    if (userError || !currentUser) {
      console.error('Error fetching user:', userError)
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get potential matches (excluding existing matches)
    const { data: existingMatches } = await supabase
      .from('matches')
      .select('matched_user_id')
      .eq('user_id', body.userId)

    const excludedUserIds = [
      body.userId,
      ...(existingMatches?.map(m => m.matched_user_id) || [])
    ]

    const { data: potentialMatches, error: matchesError } = await supabase
      .from('users')
      .select('*')
      .not('id', 'in', `(${excludedUserIds.join(',')})`)
      .limit(20)

    if (matchesError) {
      console.error('Error fetching potential matches:', matchesError)
      return NextResponse.json({ error: matchesError.message }, { status: 500 })
    }

    if (potentialMatches.length === 0) {
      return NextResponse.json({ 
        matches: [],
        message: 'No potential matches found at the moment. Check back later!' 
      })
    }

    // Generate match suggestions using AI
    const { matches: suggestedUserIds, reasoning } = await generateMatchSuggestions(
      currentUser,
      potentialMatches
    )

    // Create match records
    const matchPromises = suggestedUserIds.map(async (matchedUserId: string) => {
      // Calculate simple match score based on shared interests
      const matchedUser = potentialMatches.find(u => u.id === matchedUserId)
      if (!matchedUser) return null

      const sharedInterests = currentUser.interests?.filter((interest: string) => 
        matchedUser.interests?.includes(interest)
      ).length || 0

      const totalInterests = new Set([
        ...(currentUser.interests || []),
        ...(matchedUser.interests || [])
      ]).size

      const matchScore = totalInterests > 0 ? sharedInterests / totalInterests : 0

      const { data: match, error: matchError } = await supabase
        .from('matches')
        .insert([{
          user_id: body.userId,
          matched_user_id: matchedUserId,
          match_score: matchScore,
          status: 'pending'
        }])
        .select()
        .single()

      if (matchError) {
        console.error('Error creating match:', matchError)
        return null
      }

      return {
        ...match,
        matched_user: matchedUser
      }
    })

    const matches = (await Promise.all(matchPromises)).filter(Boolean)

    return NextResponse.json({
      matches,
      reasoning,
      totalSuggested: suggestedUserIds.length,
      totalCreated: matches.length
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
    const { data: existingMatch, error: fetchError } = await supabase
      .from('matches')
      .select('*')
      .eq('id', body.matchId)
      .or(`user_id.eq.${body.userId},matched_user_id.eq.${body.userId}`)
      .single()

    if (fetchError || !existingMatch) {
      return NextResponse.json({ error: 'Match not found or access denied' }, { status: 404 })
    }

    const { data, error } = await supabase
      .from('matches')
      .update({
        status: body.status,
        updated_at: new Date().toISOString()
      })
      .eq('id', body.matchId)
      .select()
      .single()

    if (error) {
      console.error('Error updating match:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ match: data })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}