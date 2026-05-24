import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/localStorageDb'

// Simple admin authentication (in production, use proper auth)
const ADMIN_PASSWORD = 'milo-admin-2024'

export async function GET(request: NextRequest) {
  try {
    // Check Authorization header
    const authHeader = request.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const token = authHeader.substring(7) // Remove 'Bearer ' prefix
    if (token !== ADMIN_PASSWORD) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get all data for admin dashboard
    let users = await db.users.getAll()
    let allMatches = await db.matches.getAll()
    const chatSessions = await db.chatSessions.getAll()
    
    // If no users exist, create some sample data for demo purposes
    if (users.length === 0) {
      // Create sample users
      const sampleUsers = [
        {
          id: 'demo-user-1',
          name: 'Alex Johnson',
          email: 'alex@example.com',
          age: 28,
          location: 'New York, USA',
          bio: 'Software engineer who loves hiking and photography.',
          interests: ['Technology', 'Hiking', 'Photography', 'Coffee'],
          looking_for: ['Friendship', 'Networking', 'Activity Partners'],
          created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
          updated_at: new Date().toISOString()
        },
        {
          id: 'demo-user-2',
          name: 'Sam Taylor',
          email: 'sam@example.com',
          age: 32,
          location: 'London, UK',
          bio: 'Graphic designer and art enthusiast.',
          interests: ['Art', 'Movies', 'Cooking', 'Travel'],
          looking_for: ['Dating', 'Creative Collaboration'],
          created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
          updated_at: new Date().toISOString()
        },
        {
          id: 'demo-user-3',
          name: 'Jordan Lee',
          email: 'jordan@example.com',
          age: 25,
          location: 'Tokyo, Japan',
          bio: 'Language teacher and bookworm.',
          interests: ['Reading', 'Travel', 'Language Learning', 'Yoga'],
          looking_for: ['Friendship', 'Study Buddies', 'Travel Companions'],
          created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
          updated_at: new Date().toISOString()
        }
      ]
      
      users = sampleUsers
      
      // Create sample matches if none exist
      if (allMatches.length === 0) {
        allMatches = [
          {
            id: 'demo-match-1',
            user_id: 'demo-user-1',
            matched_user_id: 'demo-user-2',
            match_score: 0.85,
            status: 'accepted',
            created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: 'demo-match-2',
            user_id: 'demo-user-1',
            matched_user_id: 'demo-user-3',
            match_score: 0.72,
            status: 'pending',
            created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: 'demo-match-3',
            user_id: 'demo-user-2',
            matched_user_id: 'demo-user-3',
            match_score: 0.91,
            status: 'accepted',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ]
      }
    }
    
    // Calculate statistics
    const totalUsers = users.length
    const totalMatches = allMatches.length
    const totalChatSessions = chatSessions.length

    // Calculate matches by status
    const matchesByStatus = allMatches.reduce((acc: any, match: any) => {
      acc[match.status] = (acc[match.status] || 0) + 1
      return acc
    }, {})

    // Calculate recent activity (last 7 days)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const recentUsers = users.filter((user: any) => 
      new Date(user.created_at) > sevenDaysAgo
    ).length

    const recentMatches = allMatches.filter((match: any) => 
      new Date(match.created_at) > sevenDaysAgo
    ).length

    // Enrich matches with user data
    const enrichedMatches = allMatches.slice(0, 10).map((match: any) => {
      const user = users.find((u: any) => u.id === match.user_id)
      const matchedUser = users.find((u: any) => u.id === match.matched_user_id)
      
      return {
        ...match,
        user: user || null,
        matched_user: matchedUser || null
      }
    })

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
      matches: enrichedMatches, // Last 10 matches with user data
      systemInfo: {
        database: process.env.DATABASE_URL ? 'PostgreSQL' : 'localStorage',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        hasPostgres: !!process.env.DATABASE_URL
      }
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}