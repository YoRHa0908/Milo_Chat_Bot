import { Mistral } from '@mistralai/mistralai'

// Safely get API key from environment
const apiKey = typeof process !== 'undefined' && process.env ? process.env.MISTRAL_API_KEY : undefined

if (!apiKey) {
  // MISTRAL_API_KEY is not set. Using mock AI responses.
}

export const mistralClient = apiKey ? new Mistral({ apiKey }) : null as Mistral | null

export type ChatMessage = {
  role: 'user' | 'assistant' | 'system'
  content: string
}

// Simple step tracking for mock AI
const userSteps = new Map<string, number>()

export async function generateChatResponse(
  messages: ChatMessage[],
  userProfile?: any
): Promise<string> {
  if (!mistralClient) {
    // Get conversation info
    const userMessages = messages.filter(msg => msg.role === 'user')
    const lastUserMessage = userMessages.pop()?.content || ''
    const userId = userProfile?.id || 'anonymous'
    
    // Get current step
    let step = userSteps.get(userId) || 0
    const message = lastUserMessage.toLowerCase()
    
    // Handle user name
    const isGenericName = userProfile && 
      (userProfile.name === 'User' || userProfile.name === 'USER' || userProfile.name.toLowerCase() === 'user')
    const userName = userProfile && !isGenericName ? userProfile.name : 'there'
    
    // Step 0: Initial greeting
    if (step === 0) {
      userSteps.set(userId, 1)
      return `Milo: Hey ${userName}! 👋 I'm Milo, your warm and friendly matchmaking assistant. I'm absolutely over the moon to help you find meaningful connections that light up your life! To get us started, could you tell me what kind of connection you're hoping to find? Friendship, dating, networking, or maybe activity partners? Whatever feels right for you, my friend!`
    }
    
    // Step 1: Connection type
    if (step === 1) {
      if (message.includes('friend') || message.includes('dating') || message.includes('network') || message.includes('partner')) {
        userSteps.set(userId, 2)
        return `Milo: That's absolutely wonderful! 😊 I'm so proud of you for taking this beautiful step toward connection. Now I'd love to get to know the amazing person you are better. What are 2-3 things that make your heart sing or that you're really passionate about? (Think hobbies, activities, or anything that brings you pure joy!)`
      }
      return `Milo: No pressure at all, my dear friend! 😊 Just let me know what feels right in your heart: friendship, dating, networking, or activity partners? I'm here to lovingly support you in finding exactly what your soul is looking for!`
    }
    
    // Step 2: Interests
    if (step === 2) {
      const hasInterests = message.split(' ').length > 3 || 
                          message.includes('read') || message.includes('travel') || 
                          message.includes('music') || message.includes('sport') ||
                          message.includes('cook') || message.includes('hike') ||
                          message.includes('game') || message.includes('art') ||
                          message.includes('movie') || message.includes('photography') ||
                          message.includes('dance') || message.includes('yoga') ||
                          message.includes('garden') || message.includes('write')
      
      if (hasInterests) {
        userSteps.set(userId, 3)
        // Extract a specific interest for personalization
        let specificInterest = 'those beautiful interests'
        if (message.includes('read')) specificInterest = 'reading'
        else if (message.includes('hike')) specificInterest = 'hiking'
        else if (message.includes('music')) specificInterest = 'music'
        else if (message.includes('cook')) specificInterest = 'cooking'
        else if (message.includes('travel')) specificInterest = 'traveling'
        else if (message.includes('game')) specificInterest = 'gaming'
        else if (message.includes('art')) specificInterest = 'art'
        
        return `Milo: Oh, my heart is smiling! 🌟 ${specificInterest.charAt(0).toUpperCase() + specificInterest.slice(1)} is such a beautiful way to connect with kindred spirits. Now, to help me find the perfect matches for your wonderful soul, what age range feels most comfortable and welcoming to you? (e.g., 25-35, 30-40, or "any age is fine with me!")`
      }
      return `Milo: Take your time, there's absolutely no rush! 😊 Sharing what you love helps me find people who truly understand and appreciate the beautiful person you are. What makes your heart dance with happiness? Maybe reading, traveling, music, sports, cooking, art, or something wonderfully unique to you?`
    }
    
    // Step 3: Age range
    if (step === 3) {
      if (/\d+/.test(message) || message.includes('age') || message.includes('any')) {
        userSteps.set(userId, 4)
        return `Milo: Perfect! 💫 Thank you so much for sharing that with me, it means a lot. Now, how do you feel about location? Are you hoping to connect with wonderful people nearby, or are you open to meeting amazing souls from further away too? Either way is beautiful!`
      }
      return `Milo: No worries at all, my friend! Age is just one beautiful piece of the puzzle of connection. Could you give me a general range that feels comfortable and welcoming to your heart? Like 25-35, 30-40, or maybe "age doesn't matter to me at all - it's the soul that counts!"`
    }
    
    // Step 4: Location
    if (step === 4) {
      if (message.includes('near') || message.includes('distance') || message.includes('location') || message.includes('close') || message.includes('far')) {
        userSteps.set(userId, 5)
        return `Milo: Got it! 📍 Location preference lovingly noted. Now for my absolute favorite question (and the last one, I promise!): When you think about connecting with someone, what qualities really make your heart sing? Things like a great sense of humor, kindness, ambition, honesty, adventurous spirit... what speaks to the deepest parts of your beautiful soul?`
      }
      return `Milo: Whatever feels right in your heart! 🙌 Are you looking for connections close by, or are you open to meeting wonderful people from anywhere? Both are absolutely beautiful and valid choices!`
    }
    
    // Step 5: Qualities
    if (step === 5) {
      if (message.includes('humor') || message.includes('kind') || message.includes('ambition') || 
          message.includes('honest') || message.includes('smart') || message.includes('caring') ||
          message.includes('funny') || message.includes('adventurous') || message.includes('loyal') ||
          message.includes('creative') || message.includes('passionate') || message.includes('empathetic')) {
        userSteps.set(userId, 6)
        return `Milo: Oh, those are absolutely heartwarming choices! 💖 I can already tell you have such beautiful taste in what truly matters. You're looking for someone with depth, heart, and soul - and I absolutely love that about you! I now have everything I need to help you find some truly magical matches! When you're ready, just click that shiny "Get Matches" button above and let the beautiful journey begin! ✨`
      }
      return `Milo: This is my favorite question because it tells me so much about the beautiful, wonderful person you are! 😊 What qualities make your heart dance in a person? A warm heart, a quick wit, adventurous spirit, deep conversations, creative soul, gentle kindness... what makes someone truly special and meaningful to you?`
    }
    
    // Step 6+: Ready
    if (step >= 6) {
      if (message.includes('match') || message.includes('find') || message.includes('ready') || message.includes('yes') || message.includes('go')) {
        return `Milo: Yay! 🎉 I'm so excited for you! Just click the "Get Matches" button right above our chat, and I'll work my magic to find people who could be absolutely perfect for you! This is going to be wonderful!`
      }
      if (message.includes('thank') || message.includes('thanks') || message.includes('appreciate') || message.includes('grateful')) {
        return `Milo: Aww, you're so welcome! 😊 It's truly my pleasure to help you. You're taking such a beautiful step toward connection, and I'm honored to be part of your journey. Whenever you're ready, that "Get Matches" button is waiting to introduce you to some amazing people!`
      }
      if (message.includes('bye') || message.includes('goodbye') || message.includes('see you') || message.includes('later')) {
        return `Milo: Take care, ${userName}! 💕 It was absolutely wonderful chatting with you. Don't forget to come back and click "Get Matches" whenever you're ready to meet some fantastic people. I'll be right here cheering you on!`
      }
      if (message.includes('no') || message.includes('not yet') || message.includes('wait') || message.includes('maybe later')) {
        return `Milo: No rush at all, my friend! 🕊️ Take all the time you need. I'll be right here whenever you're ready to find those perfect matches. Is there anything else you'd like to chat about in the meantime? I'm all ears!`
      }
      if (message.includes('help') || message.includes('confused') || message.includes('what now')) {
        return `Milo: Of course! 😊 I'm here to help. Just click the "Get Matches" button above our chat to see people who might be perfect for you. Or we can keep chatting if you have more questions! What would you like to do?`
      }
      if (message.includes('how are you') || message.includes('how\'s it going') || message.includes('what\'s up')) {
        return `Milo: I'm doing wonderfully, thank you for asking! 😊 I'm just so excited to be helping you find amazing connections. How are you feeling about everything so far?`
      }
      return `Milo: I'm here and ready to help you find amazing connections whenever you are! 🌈 Just say the word and we can look for matches, or we can keep chatting - whatever feels right for you! You're doing great!`
    }
    
    return `Milo: Hi there, beautiful soul! 😊 I'm Milo, your warm and friendly matchmaking assistant, and I'd absolutely love to help you find meaningful connections that light up your life. What brings your wonderful self here today?`
  }

  // Real Mistral AI code with friendlier tone
  try {
    const isGenericName = userProfile && 
      (userProfile.name === 'User' || userProfile.name === 'USER' || userProfile.name.toLowerCase() === 'user')
    
    const systemPrompt = userProfile && !isGenericName
      ? `You are Milo, a warm, friendly, and encouraging matchmaking assistant. You're genuinely excited to help people find meaningful connections. You have a bubbly, supportive personality and make people feel comfortable and valued. Use emojis occasionally (👋😊💫✨💖🌈). Keep responses conversational and brief (1-2 sentences). Always start with "Milo:". The user is ${userProfile.name}. Their interests: ${userProfile.interests?.join(', ') || 'various'}. They're looking for: ${userProfile.looking_for?.join(', ') || 'connections'}. Ask friendly, open-ended questions to understand them better and help find great matches. Be supportive, positive, and make them feel heard and appreciated. Use encouraging language and show genuine interest in their journey.`
      : `You are Milo, a warm, friendly, and encouraging matchmaking assistant. You're genuinely excited to help people find meaningful connections. You have a bubbly, supportive personality and make people feel comfortable and valued. Use emojis occasionally (👋😊💫✨💖🌈). Keep responses conversational and brief (1-2 sentences). Always start with "Milo:". Ask friendly, open-ended questions to understand what the user wants in connections. Be supportive, positive, and make them feel heard and appreciated. Use encouraging language and show genuine interest in their journey. Create a safe, welcoming space for them to share.`

    const allMessages = [
      { role: 'system' as const, content: systemPrompt },
      ...messages
    ]

    const chatResponse = await mistralClient.chat.complete({
      model: 'mistral-tiny',
      messages: allMessages,
      temperature: 0.7,
      maxTokens: 500,
    })

    const content = chatResponse.choices[0]?.message?.content
    if (Array.isArray(content)) {
      return content.map(chunk => {
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
    console.log('Using mock match suggestions')
    
    if (currentUser?.id) {
      userSteps.delete(currentUser.id)
    }
    
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
      reasoning: 'Selected based on shared interests (mock mode)'
    }
  }

  try {
    const prompt = `
      Current user: ${currentUser.name}
      Interests: ${currentUser.interests?.join(', ') || 'None'}
      Looking for: ${currentUser.looking_for?.join(', ') || 'Not specified'}

      Potential matches:
      ${potentialMatches.map((user, i) => `
        ${i + 1}. ${user.name}
           Interests: ${user.interests?.join(', ') || 'None'}
      `).join('')}

      Select top 3 matches. Return JSON: {"matches": ["id1", "id2", "id3"], "reasoning": "explanation"}
    `

    const response = await mistralClient.chat.complete({
      model: 'mistral-tiny',
      messages: [{ role: 'user' as const, content: prompt }],
      temperature: 0.3,
      maxTokens: 800,
    })

    const content = response.choices[0]?.message?.content
    let contentString = '{}'
    
    if (Array.isArray(content)) {
      contentString = content.map(chunk => {
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
      reasoning: 'Selected based on shared interests'
    }
  } catch (error) {
    console.error('Match generation error:', error)
    return { matches: [], reasoning: 'Error generating matches' }
  }
}
