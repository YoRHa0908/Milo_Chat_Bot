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
    let session = db.chatSessions.getByUserId(body.userId)
    let sessionId: string | undefined = session?.id
    
    // If sessionId is provided in request, validate it belongs to user
    if (body.sessionId && sessionId !== body.sessionId) {
      const requestedSession = db.chatSessions.getById(body.sessionId)
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
      session = db.chatSessions.create(body.userId)
      sessionId = session.id
    }
    
    // At this point, session and sessionId are guaranteed to be defined
    const finalSessionId = sessionId!

    // Get user profile for context
    let userProfile = db.users.getById(body.userId)
    
    if (!userProfile) {
      // Use demo profile if user doesn't exist in database
      userProfile = {
        id: body.userId,
        name: 'User',
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

    // Get previous messages for context
    const previousMessages = db.chatMessages.getBySessionId(finalSessionId)

    // Save user message
    db.chatMessages.create(finalSessionId, 'user', body.message)

    // Prepare messages for AI
    const messages = previousMessages.map(msg => ({
      role: msg.role as 'user' | 'assistant' | 'system',
      content: msg.content
    }))

    messages.push({ role: 'user', content: body.message })

    // Generate AI response
    const aiResponse = await generateChatResponse(messages, userProfile)

    // Save AI response
    db.chatMessages.create(finalSessionId, 'assistant', aiResponse)

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
      const session = db.chatSessions.getById(sessionId)
      if (!session || session.user_id !== userId) {
        return NextResponse.json({ error: 'Invalid session' }, { status: 403 })
      }
      
      messages = db.chatMessages.getBySessionId(sessionId)
    } else {
      // Get latest session for user
      const session = db.chatSessions.getByUserId(userId)
      if (session) {
        messages = db.chatMessages.getBySessionId(session.id)
      }
    }

    return NextResponse.json({ messages })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}