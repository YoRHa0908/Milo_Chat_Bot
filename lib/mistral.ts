import { Mistral } from '@mistralai/mistralai'

const apiKey = process.env.MISTRAL_API_KEY

if (!apiKey) {
  console.warn('MISTRAL_API_KEY is not set. Chat functionality will be limited.')
}

// Initialize Mistral client with API key
export const mistralClient = apiKey ? new Mistral({ apiKey }) : null

export type ChatMessage = {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export async function generateChatResponse(
  messages: ChatMessage[],
  userProfile?: any
): Promise<string> {
  if (!mistralClient) {
    // Mock responses for development when API key is not set
    console.log('Using mock AI responses (MISTRAL_API_KEY not set)')
    
    // Get the last user message
    const lastUserMessage = messages
      .filter(msg => msg.role === 'user')
      .pop()?.content || ''
    
    // Don't include the user's name if it's generic (User, New User, etc.)
    const isGenericName = userProfile && 
      (userProfile.name === 'User' || 
       userProfile.name === 'New User' || 
       userProfile.name === 'USER' ||
       userProfile.name.toLowerCase() === 'user')
    
    const userName = userProfile && !isGenericName ? userProfile.name : 'there'
    
    // Simple mock responses based on conversation context
    if (messages.length <= 2) {
      // First message or early in conversation
      return `Milo: Hi ${userName}! I'm your AI matchmaking assistant. I'm here to help you find meaningful connections. Tell me about yourself - what brings you here today?`
    }
    
    // Check for common topics in the message
    const message = lastUserMessage.toLowerCase()
    
    if (message.includes('hello') || message.includes('hi') || message.includes('hey')) {
      return `Milo: Hello ${userName}! How can I help you find connections today?`
    } else if (message.includes('interest') || message.includes('hobby')) {
      return `Milo: That's interesting! Knowing your interests helps me find better matches. What else do you enjoy doing in your free time?`
    } else if (message.includes('match') || message.includes('find') || message.includes('connect')) {
      return `Milo: I can help you find matches based on shared interests and compatibility. Tell me more about what you're looking for in a connection.`
    } else if (message.includes('name') || message.includes('call')) {
      return `Milo: Nice to meet you ${userName}! I'm Milo, your matchmaking assistant. What would you like to talk about?`
    } else if (message.includes('age') || message.includes('old')) {
      return `Milo: Age can be an important factor in compatibility. Is there a specific age range you're interested in connecting with?`
    } else if (message.includes('location') || message.includes('city') || message.includes('live')) {
      return `Milo: Location matters for connections! Are you open to long-distance connections or prefer meeting people nearby?`
    } else if (message.includes('bio') || message.includes('about')) {
      return `Milo: Your bio helps others get to know you. What would you like people to know about you?`
    } else if (message.includes('thank') || message.includes('thanks')) {
      return `Milo: You're welcome ${userName}! I'm here to help. Is there anything else you'd like to discuss?`
    } else if (message.includes('bye') || message.includes('goodbye')) {
      return `Milo: Goodbye ${userName}! Feel free to come back anytime you want to chat or find new connections.`
    } else {
      // Generic response for other messages
      const responses = [
        `Milo: Thanks for sharing that ${userName}! Tell me more about what you're looking for in connections.`,
        `Milo: I understand ${userName}. What are some of your main interests or hobbies?`,
        `Milo: That's helpful to know ${userName}. How would you describe your ideal connection?`,
        `Milo: Interesting point ${userName}! What qualities are most important to you in a match?`,
        `Milo: Got it ${userName}. Are you looking for friendship, dating, networking, or something else?`
      ]
      return responses[Math.floor(Math.random() * responses.length)]
    }
  }

  try {
    // Add system prompt based on user profile
    // Don't include the user's name if it's generic (User, New User, etc.)
    const isGenericName = userProfile && 
      (userProfile.name === 'User' || 
       userProfile.name === 'New User' || 
       userProfile.name === 'USER' ||
       userProfile.name.toLowerCase() === 'user')
    
    const systemPrompt = userProfile && !isGenericName
      ? `You are Milo, a matchmaking assistant. Keep responses brief (1-2 sentences). Always start responses with "Milo:" or include your name. The user is ${userProfile.name}. Their interests: ${userProfile.interests?.join(', ') || 'various'}. Looking for: ${userProfile.looking_for?.join(', ') || 'connections'}. Ask concise questions to help find matches.`
      : `You are Milo, a matchmaking assistant. Keep all responses brief (1-2 sentences). Always start with "Milo:" or include your name. Ask short, direct questions to understand what the user wants in connections.`

    // Prepare messages with system prompt
    const allMessages = [
      { role: 'system' as const, content: systemPrompt },
      ...messages
    ]

    // Call Mistral API
    const chatResponse = await mistralClient.chat.complete({
      model: 'mistral-tiny',
      messages: allMessages,
      temperature: 0.7,
      maxTokens: 500,
    })

    const content = chatResponse.choices[0]?.message?.content
    // Handle ContentChunk[] by converting to string
    if (Array.isArray(content)) {
      return content.map(chunk => {
        // Handle different chunk types
        if ('text' in chunk) return chunk.text
        if ('content' in chunk) return chunk.content
        return ''
      }).join('') || "I couldn't generate a response. Please try again."
    }
    return content || "I couldn't generate a response. Please try again."
  } catch (error) {
    console.error('Mistral AI error:', error)
    return "I'm having trouble connecting right now. Please try again in a moment."
  }
}

export async function generateMatchSuggestions(
  currentUser: any,
  potentialMatches: any[]
): Promise<{ matches: any[], reasoning: string }> {
  if (!mistralClient) {
    // Mock match suggestions for development
    console.log('Using mock match suggestions (MISTRAL_API_KEY not set)')
    
    // Simple matching based on shared interests (fallback)
    const matches = potentialMatches
      .filter(user => user.id !== currentUser.id)
      .map(user => {
        const sharedInterests = currentUser.interests?.filter((interest: string) => 
          user.interests?.includes(interest)
        ).length || 0
        return { ...user, score: sharedInterests }
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map(user => user.id)

    return {
      matches,
      reasoning: 'Selected based on shared interests (mock algorithm - MISTRAL_API_KEY not set)'
    }
  }

  try {
    const prompt = `
      Current user profile:
      - Name: ${currentUser.name}
      - Age: ${currentUser.age || 'Not specified'}
      - Location: ${currentUser.location || 'Not specified'}
      - Bio: ${currentUser.bio || 'Not specified'}
      - Interests: ${currentUser.interests?.join(', ') || 'None specified'}
      - Looking for: ${currentUser.looking_for?.join(', ') || 'Not specified'}

      Potential matches (${potentialMatches.length} users):
      ${potentialMatches.map((user, i) => `
        ${i + 1}. ${user.name}, ${user.age || '?'} from ${user.location || '?'}
           Interests: ${user.interests?.join(', ') || 'None'}
           Looking for: ${user.looking_for?.join(', ') || 'Not specified'}
      `).join('')}

      Analyze these profiles and select the top 3 most compatible matches for the current user.
      Consider: shared interests, complementary personalities, location proximity, and stated preferences.
      Return ONLY a JSON object with this structure:
      {
        "matches": [array of user IDs in order of compatibility],
        "reasoning": "brief explanation of why these matches were selected"
      }
    `

    const response = await mistralClient.chat.complete({
      model: 'mistral-tiny',
      messages: [{ role: 'user' as const, content: prompt }],
      temperature: 0.3,
      maxTokens: 800,
    })

    const content = response.choices[0]?.message?.content
    let contentString = '{}'
    
    // Handle ContentChunk[] by converting to string
    if (Array.isArray(content)) {
      contentString = content.map(chunk => {
        // Handle different chunk types
        if ('text' in chunk) return chunk.text
        if ('content' in chunk) return chunk.content
        return ''
      }).join('')
    } else if (typeof content === 'string') {
      contentString = content
    }
    
    try {
      const jsonMatch = contentString.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0])
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError)
    }

    // Fallback: simple matching based on shared interests
    const matches = potentialMatches
      .filter(user => user.id !== currentUser.id)
      .map(user => {
        const sharedInterests = currentUser.interests?.filter((interest: string) => 
          user.interests?.includes(interest)
        ).length || 0
        return { ...user, score: sharedInterests }
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map(user => user.id)

    return {
      matches,
      reasoning: 'Selected based on shared interests (fallback algorithm)'
    }
  } catch (error) {
    console.error('Match generation error:', error)
    return { matches: [], reasoning: 'Error generating matches' }
  }
}