import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { generateChatResponse } from '@/lib/mistral'

// Helper function to check if a string is a valid UUID
function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  return uuidRegex.test(uuid)
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    if (!body.message || !body.userId) {
      return NextResponse.json({ error: 'Message and userId are required' }, { status: 400 })
    }

    // Validate or create session
    let sessionId = body.sessionId
    
    // If sessionId is provided but invalid, ignore it
    if (sessionId && !isValidUUID(sessionId)) {
      sessionId = undefined
    }
    
    // Create new session if no valid sessionId
    if (!sessionId) {
      const { data: session, error: sessionError } = await supabase
        .from('chat_sessions')
        .insert([{ user_id: body.userId }])
        .select()
        .single()

      if (sessionError) {
        console.error('Error creating session:', sessionError)
        return NextResponse.json({ error: sessionError.message }, { status: 500 })
      }
      
      sessionId = session.id
    }

    // Get user profile for context
    const { data: userProfile } = await supabase
      .from('users')
      .select('*')
      .eq('id', body.userId)
      .single()

    // Get previous messages for context
    const { data: previousMessages } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true })
      .limit(10)

    // Save user message
    const { error: messageError } = await supabase
      .from('chat_messages')
      .insert([{
        session_id: sessionId,
        role: 'user',
        content: body.message
      }])

    if (messageError) {
      console.error('Error saving message:', messageError)
      return NextResponse.json({ error: messageError.message }, { status: 500 })
    }

    // Prepare messages for AI
    const messages = previousMessages?.map(msg => ({
      role: msg.role as 'user' | 'assistant' | 'system',
      content: msg.content
    })) || []

    messages.push({ role: 'user', content: body.message })

    // Generate AI response
    const aiResponse = await generateChatResponse(messages, userProfile)

    // Save AI response
    const { error: aiMessageError } = await supabase
      .from('chat_messages')
      .insert([{
        session_id: sessionId,
        role: 'assistant',
        content: aiResponse
      }])

    if (aiMessageError) {
      console.error('Error saving AI message:', aiMessageError)
      return NextResponse.json({ error: aiMessageError.message }, { status: 500 })
    }

    return NextResponse.json({
      response: aiResponse,
      sessionId,
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

    if (!sessionId && !userId) {
      return NextResponse.json({ error: 'sessionId or userId is required' }, { status: 400 })
    }

    let query = supabase
      .from('chat_messages')
      .select('*')
      .order('created_at', { ascending: true })

    if (sessionId && isValidUUID(sessionId)) {
      query = query.eq('session_id', sessionId)
    } else if (userId) {
      // Get latest session for user
      const { data: session } = await supabase
        .from('chat_sessions')
        .select('id')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (session) {
        query = query.eq('session_id', session.id)
      }
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching messages:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ messages: data })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}