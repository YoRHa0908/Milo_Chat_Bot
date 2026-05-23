import MistralClient from '@mistralai/mistralai'

const apiKey = process.env.MISTRAL_API_KEY

if (!apiKey) {
  console.warn('MISTRAL_API_KEY is not set. Chat functionality will be limited.')
}

export const mistralClient = apiKey ? new MistralClient(apiKey) : null

export type ChatMessage = {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export async function generateChatResponse(
  messages: ChatMessage[],
  userProfile?: any
): Promise<string> {
  if (!mistralClient) {
    return "I'm currently unavailable. Please check back later or contact support."
  }

  try {
    // Add system prompt based on user profile
    const systemPrompt = userProfile 
      ? `You are Milo, a friendly matchmaking assistant. The user is ${userProfile.name}, ${userProfile.age ? userProfile.age + ' years old' : ''} from ${userProfile.location || 'an unknown location'}. Their interests include: ${userProfile.interests?.join(', ') || 'various interests'}. They're looking for: ${userProfile.looking_for?.join(', ') || 'connections'}. Help them find meaningful connections by asking relevant questions and providing thoughtful advice.`
      : `You are Milo, a friendly matchmaking assistant. Help users discover and connect with relevant people by asking thoughtful questions about their interests, preferences, and what they're looking for in connections.`

    const chatResponse = await mistralClient.chat({
      model: 'mistral-tiny',
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages
      ],
      temperature: 0.7,
      maxTokens: 500,
    })

    return chatResponse.choices[0]?.message?.content || "I couldn't generate a response. Please try again."
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
    return { matches: [], reasoning: 'AI service unavailable' }
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

    const response = await mistralClient.chat({
      model: 'mistral-tiny',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      maxTokens: 800,
    })

    const content = response.choices[0]?.message?.content || '{}'
    
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/)
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