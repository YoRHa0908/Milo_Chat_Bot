import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/localStorageDb'

// Simple admin authentication (in production, use proper auth)
const ADMIN_PASSWORD = 'milo-admin-2024'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const password = searchParams.get('password')

    if (password !== ADMIN_PASSWORD) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get all data for admin dashboard
    const users = db.users.getAll()
    const matches = db.matches.getAll()
    const chatSessions = db.chatSessions.getAll()
    
    // Calculate statistics
    const totalUsers = users.length
    const totalMatches = matches.length
    const totalChatSessions = chatSessions.length
    // Note: totalMessages not available in current implementation

    // Calculate matches by status
    const matchesByStatus = matches.reduce((acc: any, match: any) => {
      acc[match.status] = (acc[match.status] || 0) + 1
      return acc
    }, {})

    // Calculate recent activity (last 7 days)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const recentUsers = users.filter((user: any) => 
      new Date(user.created_at) > sevenDaysAgo
    ).length

    const recentMatches = matches.filter((match: any) => 
      new Date(match.created_at) > sevenDaysAgo
    ).length

    return NextResponse.json({
      stats: {
        totalUsers,
        totalMatches,
        totalChatSessions,
        recentUsers,
        recentMatches,
        matchesByStatus
      },
      users: users.slice(0, 10), // Last 10 users
      recentMatches: matches.slice(0, 10), // Last 10 matches
      systemInfo: {
        database: 'localStorage',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
      }
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}