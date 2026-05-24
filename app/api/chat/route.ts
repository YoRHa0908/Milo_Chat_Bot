import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/localStorageDb'
import { generateChatResponse } from '@/lib/mistral'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    if (!body.message || !body.userId) {
      return NextResponse.json({ error: 'Message and userId are required' }, { status: 400 })
    }

    // Get or create session
    let session = await db.chatSessions.getByUserId(body.userId)
    let sessionId: string | undefined = session?.id
    
    // If sessionId is provided in request, validate it belongs to user
    if (body.sessionId && sessionId !== body.sessionId) {
      const requestedSession = await db.chatSessions.getById(body.sessionId)
      if (!requestedSession || requestedSession.user_id !== body.userId) {
        // Invalid session, create new one
        session = null
        sessionId = undefined
      } else {
        session = requestedSession
        sessionId = body.sessionId
      }
    }
    
    // Create new session if none exists
    if (!session) {
      session = await db.chatSessions.create(body.userId)
      sessionId = session.id
    }
    
    // At this point, session and sessionId are guaranteed to be defined
    const finalSessionId = sessionId!

    // Get user profile for context
    let userProfile = await db.users.getById(body.userId)
    
    // If user doesn't exist in database but we have their name from the request,
    // create and save a minimal profile with the correct name
    if (!userProfile) {
      // Determine the user's name
      let userName = body.userName
      
      // If no name provided in request, use a placeholder
      if (!userName || userName.trim() === '') {
        userName = 'User' // Fallback placeholder
      }
      
      try {
        userProfile = await db.users.createWithId(body.userId, {
          name: userName, // Use the actual name from the request or fallback
          email: null,
          age: null,
          location: null,
          bio: null,
          interests: [],
          looking_for: []
        })
      } catch (error) {
        console.error('Error creating user profile in chat API:', error)
        // Create in-memory profile as fallback
        userProfile = {
          id: body.userId,
          name: userName,
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
    }
    // If userProfile is still null, generateChatResponse will handle it gracefully

    // Get previous messages for context
    const previousMessages = await db.chatMessages.getBySessionId(finalSessionId)

    // Save user message
    await db.chatMessages.create(finalSessionId, 'user', body.message)

    // Prepare messages for AI
    const messages = previousMessages.map(msg => ({
      role: msg.role as 'user' | 'assistant' | 'system',
      content: msg.content
    }))

    messages.push({ role: 'user', content: body.message })

    // Generate AI response
    const aiResponse = await generateChatResponse(messages, userProfile)

    // Save AI response
    await db.chatMessages.create(finalSessionId, 'assistant', aiResponse)

    return NextResponse.json({
      response: aiResponse,
      sessionId: finalSessionId,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('sessionId')
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 })
    }

    let messages: import('@/lib/localStorageDb').ChatMessage[] = []
    
    if (sessionId) {
      // Verify session belongs to user
      const session = await db.chatSessions.getById(sessionId)
      if (!session || session.user_id !== userId) {
        return NextResponse.json({ error: 'Invalid session' }, { status: 403 })
      }
      
      messages = await db.chatMessages.getBySessionId(sessionId)
    } else {
      // Get latest session for user
      const session = await db.chatSessions.getByUserId(userId)
      if (session) {
        messages = await db.chatMessages.getBySessionId(session.id)
      }
    }

    return NextResponse.json({ messages })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}