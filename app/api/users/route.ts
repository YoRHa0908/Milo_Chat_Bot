import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/localStorageDb'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const limit = parseInt(searchParams.get('limit') || '100')
    const offset = parseInt(searchParams.get('offset') || '0')

    if (userId) {
      // Get specific user
      const user = await db.users.getById(userId)
      
      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 })
      }

      return NextResponse.json({ users: [user] })
    } else {
      // Get all users with pagination
      const allUsers = await db.users.getAll()
      const users = allUsers
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(offset, offset + limit)

      return NextResponse.json({ users })
    }
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate required fields
    if (!body.name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }

    // Check if email already exists
    if (body.email) {
      const existingUser = await db.users.getByEmail(body.email)
      if (existingUser) {
        return NextResponse.json({ error: 'Email already in use' }, { status: 400 })
      }
    }

    // Check if user with this ID already exists
    let user
    if (body.id) {
      // Try to update existing user
      user = await db.users.update(body.id, {
        name: body.name,
        email: body.email || null,
        age: body.age || null,
        location: body.location || null,
        bio: body.bio || null,
        interests: body.interests || [],
        looking_for: body.looking_for || []
      })
      
      if (!user) {
        // User doesn't exist, create with provided ID
        user = await db.users.createWithId(body.id, {
          name: body.name,
          email: body.email || null,
          age: body.age || null,
          location: body.location || null,
          bio: body.bio || null,
          interests: body.interests || [],
          looking_for: body.looking_for || []
        })
      }
    } else {
      // Create new user with generated ID
      user = await db.users.create({
        name: body.name,
        email: body.email || null,
        age: body.age || null,
        location: body.location || null,
        bio: body.bio || null,
        interests: body.interests || [],
        looking_for: body.looking_for || []
      })
    }

    return NextResponse.json({ 
      user,
      // Include a message about storage location
      storageInfo: {
        savedTo: typeof window === 'undefined' ? 'server-memory' : 'localStorage',
        userId: user.id
      }
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    
    if (!body.id) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    const user = await db.users.update(body.id, {
      name: body.name,
      email: body.email,
      age: body.age,
      location: body.location,
      bio: body.bio,
      interests: body.interests,
      looking_for: body.looking_for
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    // Get all users
    const allUsers = await db.users.getAll()
    
    // Find the user to delete
    const userIndex = allUsers.findIndex(user => user.id === userId)
    
    if (userIndex === -1) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    
    // Remove the user from the array
    const deletedUser = allUsers[userIndex]
    allUsers.splice(userIndex, 1)
    
    // Save updated users list
    // Note: This is a simplified approach for the fallback storage
    // In a real PostgreSQL implementation, we'd have a proper delete method
    if (typeof window === 'undefined') {
      // Server-side: update in-memory store
      const { saveToStorage } = require('@/lib/localStorageDb')
      saveToStorage('users', allUsers)
    } else {
      // Client-side: update localStorage
      localStorage.setItem('milo_users', JSON.stringify(allUsers))
    }
    
    return NextResponse.json({ 
      success: true,
      message: `User "${deletedUser.name}" deleted successfully`,
      deletedUser
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}