// Simple localStorage-based database
// This is a much simpler implementation than trying to mimic Supabase

export type UserProfile = {
  id: string
  email: string | null
  name: string
  age: number | null
  location: string | null
  bio: string | null
  interests: string[]
  looking_for: string[]
  created_at: string
  updated_at: string
}

export type ChatSession = {
  id: string
  user_id: string
  created_at: string
  updated_at: string
}

export type ChatMessage = {
  id: string
  session_id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  created_at: string
}

export type Match = {
  id: string
  user_id: string
  matched_user_id: string
  match_score: number
  status: 'pending' | 'accepted' | 'rejected' | 'blocked'
  created_at: string
  updated_at: string
}

// In-memory storage for server-side
const serverData: Record<string, any[]> = {}

// Load data from localStorage (client) or in-memory (server)
const loadData = <T>(key: string, defaultValue: T[]): T[] => {
  if (typeof window === 'undefined') {
    // Server-side: use in-memory storage
    return serverData[key] || defaultValue
  }
  
  // Client-side: use localStorage
  try {
    const stored = localStorage.getItem(key)
    return stored ? JSON.parse(stored) : defaultValue
  } catch (error) {
    console.error(`Error loading ${key} from localStorage:`, error)
    return defaultValue
  }
}

// Save data to localStorage (client) or in-memory (server)
const saveData = <T>(key: string, data: T[]) => {
  if (typeof window === 'undefined') {
    // Server-side: save to in-memory storage
    serverData[key] = data
    return
  }
  
  // Client-side: save to localStorage
  try {
    localStorage.setItem(key, JSON.stringify(data))
  } catch (error) {
    console.error(`Error saving ${key} to localStorage:`, error)
  }
}

// Generate ID
const generateId = () => Date.now().toString() + Math.random().toString(36).substring(2, 11)

// Simple database operations
export const db = {
  users: {
    getAll: (): UserProfile[] => loadData('milo_users', []),
    getById: (id: string): UserProfile | null => {
      const users = loadData<UserProfile>('milo_users', [])
      return users.find(user => user.id === id) || null
    },
    create: (userData: Omit<UserProfile, 'id' | 'created_at' | 'updated_at'>): UserProfile => {
      const users = loadData<UserProfile>('milo_users', [])
      const newUser: UserProfile = {
        id: generateId(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ...userData
      }
      users.push(newUser)
      saveData('milo_users', users)
      return newUser
    },
    createWithId: (id: string, userData: Omit<UserProfile, 'id' | 'created_at' | 'updated_at'>): UserProfile => {
      const users = loadData<UserProfile>('milo_users', [])
      const newUser: UserProfile = {
        id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ...userData
      }
      users.push(newUser)
      saveData('milo_users', users)
      return newUser
    },
    update: (id: string, updates: Partial<UserProfile>): UserProfile | null => {
      const users = loadData<UserProfile>('milo_users', [])
      const index = users.findIndex(user => user.id === id)
      
      if (index === -1) return null
      
      users[index] = {
        ...users[index],
        ...updates,
        updated_at: new Date().toISOString()
      }
      
      saveData('milo_users', users)
      return users[index]
    },
    getByEmail: (email: string): UserProfile | null => {
      const users = loadData<UserProfile>('milo_users', [])
      return users.find(user => user.email === email) || null
    },
    getAllExcept: (excludedIds: string[]): UserProfile[] => {
      const users = loadData<UserProfile>('milo_users', [])
      return users.filter(user => !excludedIds.includes(user.id))
    }
  },
  
  chatSessions: {
    getAll: (): ChatSession[] => loadData('milo_chat_sessions', []),
    getByUserId: (userId: string): ChatSession | null => {
      const sessions = loadData<ChatSession>('milo_chat_sessions', [])
      // Get latest session for user
      const userSessions = sessions.filter(session => session.user_id === userId)
      return userSessions.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )[0] || null
    },
    create: (userId: string): ChatSession => {
      const sessions = loadData<ChatSession>('milo_chat_sessions', [])
      const newSession: ChatSession = {
        id: generateId(),
        user_id: userId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      sessions.push(newSession)
      saveData('milo_chat_sessions', sessions)
      return newSession
    },
    getById: (sessionId: string): ChatSession | null => {
      const sessions = loadData<ChatSession>('milo_chat_sessions', [])
      return sessions.find(session => session.id === sessionId) || null
    }
  },
  
  chatMessages: {
    getBySessionId: (sessionId: string): ChatMessage[] => {
      const messages = loadData<ChatMessage>('milo_chat_messages', [])
      return messages
        .filter(message => message.session_id === sessionId)
        .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    },
    create: (sessionId: string, role: 'user' | 'assistant' | 'system', content: string): ChatMessage => {
      const messages = loadData<ChatMessage>('milo_chat_messages', [])
      const newMessage: ChatMessage = {
        id: generateId(),
        session_id: sessionId,
        role,
        content,
        created_at: new Date().toISOString()
      }
      messages.push(newMessage)
      saveData('milo_chat_messages', messages)
      return newMessage
    }
  },
  
  matches: {
    getAll: (): Match[] => loadData('milo_matches', []),
    getByUserId: (userId: string): Match[] => {
      const matches = loadData<Match>('milo_matches', [])
      return matches.filter(match => 
        match.user_id === userId || match.matched_user_id === userId
      )
    },
    create: (userId: string, matchedUserId: string, matchScore: number): Match => {
      // Prevent users from matching with themselves
      if (userId === matchedUserId) {
        console.error('CRITICAL ERROR: Attempted to create self-match', { userId, matchedUserId })
        throw new Error('Cannot create match with yourself')
      }

      const matches = loadData<Match>('milo_matches', [])
      
      // Also check if this match already exists
      const existingMatch = matches.find(match => 
        (match.user_id === userId && match.matched_user_id === matchedUserId) ||
        (match.user_id === matchedUserId && match.matched_user_id === userId)
      )
      
      if (existingMatch) {
        // Update existing match instead of creating duplicate
        existingMatch.match_score = matchScore
        existingMatch.updated_at = new Date().toISOString()
        saveData('milo_matches', matches)
        return existingMatch
      }

      const newMatch: Match = {
        id: generateId(),
        user_id: userId,
        matched_user_id: matchedUserId,
        match_score: matchScore,
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      matches.push(newMatch)
      saveData('milo_matches', matches)
      return newMatch
    },
    updateStatus: (matchId: string, status: Match['status']): Match | null => {
      const matches = loadData<Match>('milo_matches', [])
      const index = matches.findIndex(match => match.id === matchId)
      
      if (index === -1) return null
      
      matches[index] = {
        ...matches[index],
        status,
        updated_at: new Date().toISOString()
      }
      
      saveData('milo_matches', matches)
      return matches[index]
    },
    getByUserIds: (userId: string, matchedUserId: string): Match | null => {
      const matches = loadData<Match>('milo_matches', [])
      return matches.find(match => 
        (match.user_id === userId && match.matched_user_id === matchedUserId) ||
        (match.user_id === matchedUserId && match.matched_user_id === userId)
      ) || null
    }
  }
}

// Initialize with demo data - SIMPLIFIED VERSION
// Only create demo data if we're on server-side AND no users exist
// On client-side, users will be created via the onboarding form
export const initializeDemoData = () => {
  if (typeof window === 'undefined') {
    // Server-side: check if we need to initialize demo data
    const users = db.users.getAll()
    if (users.length === 0) {
      // Create demo users for server-side
      db.users.create({
        name: 'Alex Johnson',
        email: 'alex@example.com',
        age: 28,
        location: 'New York, USA',
        bio: 'Software engineer who loves hiking and photography. Looking to meet creative people.',
        interests: ['Technology', 'Hiking', 'Photography', 'Coffee'],
        looking_for: ['Friendship', 'Networking', 'Activity Partners']
      })
      
      db.users.create({
        name: 'Sam Taylor',
        email: 'sam@example.com',
        age: 32,
        location: 'London, UK',
        bio: 'Graphic designer and art enthusiast. Enjoy museums, indie films, and trying new restaurants.',
        interests: ['Art', 'Movies', 'Cooking', 'Travel'],
        looking_for: ['Dating', 'Creative Collaboration']
      })
      
      db.users.create({
        name: 'Jordan Lee',
        email: 'jordan@example.com',
        age: 25,
        location: 'Tokyo, Japan',
        bio: 'Language teacher and bookworm. Passionate about cultural exchange and learning new things.',
        interests: ['Reading', 'Travel', 'Language Learning', 'Yoga'],
        looking_for: ['Friendship', 'Study Buddies', 'Travel Companions']
      })
    }
  }
  // Client-side: don't auto-create demo data - let users create their own profiles
}

// Initialize demo data on server side only
if (typeof window === 'undefined') {
  initializeDemoData()
}