import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// Simple admin authentication (in production, use proper auth)
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'milo-admin-2024'

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    if (token !== ADMIN_TOKEN) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Get all users
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)
      .range(offset, offset + limit - 1)

    if (usersError) {
      console.error('Error fetching users:', usersError)
      return NextResponse.json({ error: usersError.message }, { status: 500 })
    }

    // Get all matches
    const { data: matches, error: matchesError } = await supabase
      .from('matches')
      .select(`
        *,
        user:users!matches_user_id_fkey(*),
        matched_user:users!matches_matched_user_id_fkey(*)
      `)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (matchesError) {
      console.error('Error fetching matches:', matchesError)
      return NextResponse.json({ error: matchesError.message }, { status: 500 })
    }

    // Get chat statistics
    const { data: chatStats, error: chatError } = await supabase
      .from('chat_sessions')
      .select(`
        count,
        users:user_id(count)
      `)

    if (chatError) {
      console.error('Error fetching chat stats:', chatError)
    }

    // Get user growth over time
    const { data: userGrowth } = await supabase
      .from('users')
      .select('created_at')
      .order('created_at', { ascending: true })

    const stats = {
      totalUsers: users?.length || 0,
      totalMatches: matches?.length || 0,
      activeMatches: matches?.filter(m => m.status === 'accepted').length || 0,
      pendingMatches: matches?.filter(m => m.status === 'pending').length || 0,
      userGrowth: userGrowth?.map((user, index) => ({
        date: user.created_at,
        cumulative: index + 1
      })) || []
    }

    return NextResponse.json({
      users,
      matches,
      stats,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}