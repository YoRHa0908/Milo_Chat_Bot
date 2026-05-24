// PostgreSQL database implementation with localStorage fallback
// This provides the same interface as the old localStorageDb but uses PostgreSQL

import { db as postgresDb, initializeDatabase, initializeDemoData as initPostgresDemoData } from './postgresDb'

// Re-export types for compatibility
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

// Check if we have PostgreSQL connection
const hasPostgresConnection = (): boolean => {
  return typeof window === 'undefined' && process.env.DATABASE_URL !== undefined
}

// Fallback to localStorage if PostgreSQL is not available (client-side)
const localStorageFallback = {
  users: {
    getAll: (): UserProfile[] => {
      if (typeof window === 'undefined') return []
      try {
        const stored = localStorage.getItem('milo_users')
        return stored ? JSON.parse(stored) : []
      } catch (error) {
        console.error('Error loading users from localStorage:', error)
        return []
      }
    },
    
    getById: (id: string): UserProfile | null => {
      const users = localStorageFallback.users.getAll()
      return users.find(user => user.id === id) || null
    },
    
    create: (userData: Omit<UserProfile, 'id' | 'created_at' | 'updated_at'>): UserProfile => {
      const users = localStorageFallback.users.getAll()
      const newUser: UserProfile = {
        id: Date.now().toString() + Math.random().toString(36).substring(2, 11),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ...userData
      }
      users.push(newUser)
      localStorage.setItem('milo_users', JSON.stringify(users))
      return newUser
    },
    
    createWithId: (id: string, userData: Omit<UserProfile, 'id' | 'created_at' | 'updated_at'>): UserProfile => {
      const users = localStorageFallback.users.getAll()
      const newUser: UserProfile = {
        id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ...userData
      }
      users.push(newUser)
      localStorage.setItem('milo_users', JSON.stringify(users))
      return newUser
    },
    
    update: (id: string, updates: Partial<UserProfile>): UserProfile | null => {
      const users = localStorageFallback.users.getAll()
      const index = users.findIndex(user => user.id === id)
      
      if (index === -1) return null
      
      users[index] = {
        ...users[index],
        ...updates,
        updated_at: new Date().toISOString()
      }
      
      localStorage.setItem('milo_users', JSON.stringify(users))
      return users[index]
    },
    
    getByEmail: (email: string): UserProfile | null => {
      const users = localStorageFallback.users.getAll()
      return users.find(user => user.email === email) || null
    },
    
    getAllExcept: (excludedIds: string[]): UserProfile[] => {
      const users = localStorageFallback.users.getAll()
      return users.filter(user => !excludedIds.includes(user.id))
    }
  },
  
  chatSessions: {
    getAll: (): ChatSession[] => {
      if (typeof window === 'undefined') return []
      try {
        const stored = localStorage.getItem('milo_chat_sessions')
        return stored ? JSON.parse(stored) : []
      } catch (error) {
        console.error('Error loading chat sessions from localStorage:', error)
        return []
      }
    },
    
    getByUserId: (userId: string): ChatSession | null => {
      const sessions = localStorageFallback.chatSessions.getAll()
      const userSessions = sessions.filter(session => session.user_id === userId)
      return userSessions.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )[0] || null
    },
    
    create: (userId: string): ChatSession => {
      const sessions = localStorageFallback.chatSessions.getAll()
      const newSession: ChatSession = {
        id: Date.now().toString() + Math.random().toString(36).substring(2, 11),
        user_id: userId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      sessions.push(newSession)
      localStorage.setItem('milo_chat_sessions', JSON.stringify(sessions))
      return newSession
    },
    
    getById: (sessionId: string): ChatSession | null => {
      const sessions = localStorageFallback.chatSessions.getAll()
      return sessions.find(session => session.id === sessionId) || null
    }
  },
  
  chatMessages: {
    getBySessionId: (sessionId: string): ChatMessage[] => {
      if (typeof window === 'undefined') return []
      try {
        const stored = localStorage.getItem('milo_chat_messages')
        const messages = stored ? JSON.parse(stored) : []
        return messages
          .filter((message: ChatMessage) => message.session_id === sessionId)
          .sort((a: ChatMessage, b: ChatMessage) => 
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          )
      } catch (error) {
        console.error('Error loading chat messages from localStorage:', error)
        return []
      }
    },
    
    create: (sessionId: string, role: 'user' | 'assistant' | 'system', content: string): ChatMessage => {
      const messages = localStorageFallback.chatMessages.getBySessionId(sessionId)
      const allMessages = localStorageFallback.chatMessages.getAll()
      const newMessage: ChatMessage = {
        id: Date.now().toString() + Math.random().toString(36).substring(2, 11),
        session_id: sessionId,
        role,
        content,
        created_at: new Date().toISOString()
      }
      allMessages.push(newMessage)
      localStorage.setItem('milo_chat_messages', JSON.stringify(allMessages))
      return newMessage
    },
    
    getAll: (): ChatMessage[] => {
      if (typeof window === 'undefined') return []
      try {
        const stored = localStorage.getItem('milo_chat_messages')
        return stored ? JSON.parse(stored) : []
      } catch (error) {
        console.error('Error loading all chat messages from localStorage:', error)
        return []
      }
    }
  },
  
  matches: {
    getAll: (): Match[] => {
      if (typeof window === 'undefined') return []
      try {
        const stored = localStorage.getItem('milo_matches')
        return stored ? JSON.parse(stored) : []
      } catch (error) {
        console.error('Error loading matches from localStorage:', error)
        return []
      }
    },
    
    getByUserId: (userId: string): Match[] => {
      const matches = localStorageFallback.matches.getAll()
      return matches.filter(match => 
        match.user_id === userId || match.matched_user_id === userId
      )
    },
    
    create: (userId: string, matchedUserId: string, matchScore: number): Match => {
      if (userId === matchedUserId) {
        console.error('CRITICAL ERROR: Attempted to create self-match', { userId, matchedUserId })
        throw new Error('Cannot create match with yourself')
      }

      const matches = localStorageFallback.matches.getAll()
      
      const existingMatch = matches.find(match => 
        (match.user_id === userId && match.matched_user_id === matchedUserId) ||
        (match.user_id === matchedUserId && match.matched_user_id === userId)
      )
      
      if (existingMatch) {
        existingMatch.match_score = matchScore
        existingMatch.updated_at = new Date().toISOString()
        localStorage.setItem('milo_matches', JSON.stringify(matches))
        return existingMatch
      }

      const newMatch: Match = {
        id: Date.now().toString() + Math.random().toString(36).substring(2, 11),
        user_id: userId,
        matched_user_id: matchedUserId,
        match_score: matchScore,
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      matches.push(newMatch)
      localStorage.setItem('milo_matches', JSON.stringify(matches))
      return newMatch
    },
    
    updateStatus: (matchId: string, status: Match['status']): Match | null => {
      const matches = localStorageFallback.matches.getAll()
      const index = matches.findIndex(match => match.id === matchId)
      
      if (index === -1) return null
      
      matches[index] = {
        ...matches[index],
        status,
        updated_at: new Date().toISOString()
      }
      
      localStorage.setItem('milo_matches', JSON.stringify(matches))
      return matches[index]
    },
    
    getByUserIds: (userId: string, matchedUserId: string): Match | null => {
      const matches = localStorageFallback.matches.getAll()
      return matches.find(match => 
        (match.user_id === userId && match.matched_user_id === matchedUserId) ||
        (match.user_id === matchedUserId && match.matched_user_id === userId)
      ) || null
    }
  }
}

// Main database interface
export const db = {
  users: {
    getAll: async (): Promise<UserProfile[]> => {
      if (hasPostgresConnection()) {
        try {
          return await postgresDb.users.getAll()
        } catch (error) {
          console.error('PostgreSQL error, falling back to localStorage:', error)
        }
      }
      return localStorageFallback.users.getAll()
    },
    
    getById: async (id: string): Promise<UserProfile | null> => {
      if (hasPostgresConnection()) {
        try {
          return await postgresDb.users.getById(id)
        } catch (error) {
          console.error('PostgreSQL error, falling back to localStorage:', error)
        }
      }
      return localStorageFallback.users.getById(id)
    },
    
    create: async (userData: Omit<UserProfile, 'id' | 'created_at' | 'updated_at'>): Promise<UserProfile> => {
      if (hasPostgresConnection()) {
        try {
          return await postgresDb.users.create(userData)
        } catch (error) {
          console.error('PostgreSQL error, falling back to localStorage:', error)
        }
      }
      return localStorageFallback.users.create(userData)
    },
    
    createWithId: async (id: string, userData: Omit<UserProfile, 'id' | 'created_at' | 'updated_at'>): Promise<UserProfile> => {
      if (hasPostgresConnection()) {
        try {
          return await postgresDb.users.createWithId(id, userData)
        } catch (error) {
          console.error('PostgreSQL error, falling back to localStorage:', error)
        }
      }
      return localStorageFallback.users.createWithId(id, userData)
    },
    
    update: async (id: string, updates: Partial<UserProfile>): Promise<UserProfile | null> => {
      if (hasPostgresConnection()) {
        try {
          return await postgresDb.users.update(id, updates)
        } catch (error) {
          console.error('PostgreSQL error, falling back to localStorage:', error)
        }
      }
      return localStorageFallback.users.update(id, updates)
    },
    
    getByEmail: async (email: string): Promise<UserProfile | null> => {
      if (hasPostgresConnection()) {
        try {
          return await postgresDb.users.getByEmail(email)
        } catch (error) {
          console.error('PostgreSQL error, falling back to localStorage:', error)
        }
      }
      return localStorageFallback.users.getByEmail(email)
    },
    
    getAllExcept: async (excludedIds: string[]): Promise<UserProfile[]> => {
      if (hasPostgresConnection()) {
        try {
          return await postgresDb.users.getAllExcept(excludedIds)
        } catch (error) {
          console.error('PostgreSQL error, falling back to localStorage:', error)
        }
      }
      return localStorageFallback.users.getAllExcept(excludedIds)
    }
  },
  
  chatSessions: {
    getAll: async (): Promise<ChatSession[]> => {
      if (hasPostgresConnection()) {
        try {
          return await postgresDb.chatSessions.getAll()
        } catch (error) {
          console.error('PostgreSQL error, falling back to localStorage:', error)
        }
      }
      return localStorageFallback.chatSessions.getAll()
    },
    
    getByUserId: async (userId: string): Promise<ChatSession | null> => {
      if (hasPostgresConnection()) {
        try {
          return await postgresDb.chatSessions.getByUserId(userId)
        } catch (error) {
          console.error('PostgreSQL error, falling back to localStorage:', error)
        }
      }
      return localStorageFallback.chatSessions.getByUserId(userId)
    },
    
    create: async (userId: string): Promise<ChatSession> => {
      if (hasPostgresConnection()) {
        try {
          return await postgresDb.chatSessions.create(userId)
        } catch (error) {
          console.error('PostgreSQL error, falling back to localStorage:', error)
        }
      }
      return localStorageFallback.chatSessions.create(userId)
    },
    
    getById: async (sessionId: string): Promise<ChatSession | null> => {
      if (hasPostgresConnection()) {
        try {
          return await postgresDb.chatSessions.getById(sessionId)
        } catch (error) {
          console.error('PostgreSQL error, falling back to localStorage:', error)
        }
      }
      return localStorageFallback.chatSessions.getById(sessionId)
    }
  },
  
  chatMessages: {
    getBySessionId: async (sessionId: string): Promise<ChatMessage[]> => {
      if (hasPostgresConnection()) {
        try {
          return await postgresDb.chatMessages.getBySessionId(sessionId)
        } catch (error) {
          console.error('PostgreSQL error, falling back to localStorage:', error)
        }
      }
      return localStorageFallback.chatMessages.getBySessionId(sessionId)
    },
    
    create: async (sessionId: string, role: 'user' | 'assistant' | 'system', content: string): Promise<ChatMessage> => {
      if (hasPostgresConnection()) {
        try {
          return await postgresDb.chatMessages.create(sessionId, role, content)
        } catch (error) {
          console.error('PostgreSQL error, falling back to localStorage:', error)
        }
      }
      return localStorageFallback.chatMessages.create(sessionId, role, content)
    }
  },
  
  matches: {
    getAll: async (): Promise<Match[]> => {
      if (hasPostgresConnection()) {
        try {
          return await postgresDb.matches.getAll()
        } catch (error) {
          console.error('PostgreSQL error, falling back to localStorage:', error)
        }
      }
      return localStorageFallback.matches.getAll()
    },
    
    getByUserId: async (userId: string): Promise<Match[]> => {
      if (hasPostgresConnection()) {
        try {
          return await postgresDb.matches.getByUserId(userId)
        } catch (error) {
          console.error('PostgreSQL error, falling back to localStorage:', error)
        }
      }
      return localStorageFallback.matches.getByUserId(userId)
    },
    
    create: async (userId: string, matchedUserId: string, matchScore: number): Promise<Match> => {
      if (hasPostgresConnection()) {
        try {
          return await postgresDb.matches.create(userId, matchedUserId, matchScore)
        } catch (error) {
          console.error('PostgreSQL error, falling back to localStorage:', error)
        }
      }
      return localStorageFallback.matches.create(userId, matchedUserId, matchScore)
    },
    
    updateStatus: async (matchId: string, status: Match['status']): Promise<Match | null> => {
      if (hasPostgresConnection()) {
        try {
          return await postgresDb.matches.updateStatus(matchId, status)
        } catch (error) {
          console.error('PostgreSQL error, falling back to localStorage:', error)
        }
      }
      return localStorageFallback.matches.updateStatus(matchId, status)
    },
    
    getByUserIds: async (userId: string, matchedUserId: string): Promise<Match | null> => {
      if (hasPostgresConnection()) {
        try {
          return await postgresDb.matches.getByUserIds(userId, matchedUserId)
        } catch (error) {
          console.error('PostgreSQL error, falling back to localStorage:', error)
        }
      }
      return localStorageFallback.matches.getByUserIds(userId, matchedUserId)
    }
  }
}

// Initialize demo data
export const initializeDemoData = async (): Promise<void> => {
  if (hasPostgresConnection()) {
    try {
      await initPostgresDemoData()
    } catch (error) {
      console.error('Error initializing PostgreSQL demo data:', error)
    }
  }
  // localStorage doesn't need initialization
}

// Initialize database on server-side
if (typeof window === 'undefined') {
  if (hasPostgresConnection()) {
    initializeDatabase().catch(console.error)
    initPostgresDemoData().catch(console.error)
  }
}