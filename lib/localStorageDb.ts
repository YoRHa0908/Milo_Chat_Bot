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
  return typeof window === 'undefined' && !!process.env.DATABASE_URL && process.env.DATABASE_URL.trim() !== ''
}

// In-memory store for server-side fallback (when PostgreSQL is not available)
const serverMemoryStore: {
  users: UserProfile[]
  chatSessions: ChatSession[]
  chatMessages: ChatMessage[]
  matches: Match[]
} = {
  users: [],
  chatSessions: [],
  chatMessages: [],
  matches: []
}

// Helper function to save to appropriate storage
const saveToStorage = (key: string, data: any): void => {
  if (typeof window === 'undefined') {
    // Server-side: update in-memory store
    switch (key) {
      case 'users':
        serverMemoryStore.users = data
        break
      case 'chatSessions':
        serverMemoryStore.chatSessions = data
        break
      case 'chatMessages':
        serverMemoryStore.chatMessages = data
        break
      case 'matches':
        serverMemoryStore.matches = data
        break
    }
  } else {
    // Client-side: update localStorage
    localStorage.setItem(`milo_${key}`, JSON.stringify(data))
  }
}

// Helper function to load from appropriate storage
const loadFromStorage = (key: string): any => {
  if (typeof window === 'undefined') {
    // Server-side: load from in-memory store
    switch (key) {
      case 'users':
        return serverMemoryStore.users
      case 'chatSessions':
        return serverMemoryStore.chatSessions
      case 'chatMessages':
        return serverMemoryStore.chatMessages
      case 'matches':
        return serverMemoryStore.matches
      default:
        return []
    }
  } else {
    // Client-side: load from localStorage
    try {
      const stored = localStorage.getItem(`milo_${key}`)
      return stored ? JSON.parse(stored) : []
    } catch (error) {
      console.error(`Error loading ${key} from localStorage:`, error)
      return []
    }
  }
}

// Fallback storage for when PostgreSQL is not available
const fallbackStorage = {
  users: {
    getAll: (): UserProfile[] => {
      return loadFromStorage('users')
    },
    
    getById: (id: string): UserProfile | null => {
      const users = fallbackStorage.users.getAll()
      return users.find(user => user.id === id) || null
    },
    
    create: (userData: Omit<UserProfile, 'id' | 'created_at' | 'updated_at'>): UserProfile => {
      const users = fallbackStorage.users.getAll()
      const newUser: UserProfile = {
        id: Date.now().toString() + Math.random().toString(36).substring(2, 11),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ...userData
      }
      users.push(newUser)
      saveToStorage('users', users)
      return newUser
    },
    
    createWithId: (id: string, userData: Omit<UserProfile, 'id' | 'created_at' | 'updated_at'>): UserProfile => {
      const users = fallbackStorage.users.getAll()
      const newUser: UserProfile = {
        id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ...userData
      }
      users.push(newUser)
      saveToStorage('users', users)
      return newUser
    },
    
    update: (id: string, updates: Partial<UserProfile>): UserProfile | null => {
      const users = fallbackStorage.users.getAll()
      const index = users.findIndex(user => user.id === id)
      
      if (index === -1) return null
      
      users[index] = {
        ...users[index],
        ...updates,
        updated_at: new Date().toISOString()
      }
      
      saveToStorage('users', users)
      return users[index]
    },
    
    getByEmail: (email: string): UserProfile | null => {
      const users = fallbackStorage.users.getAll()
      return users.find(user => user.email === email) || null
    },
    
    getAllExcept: (excludedIds: string[]): UserProfile[] => {
      const users = fallbackStorage.users.getAll()
      return users.filter(user => !excludedIds.includes(user.id))
    }
  },
  
  chatSessions: {
    getAll: (): ChatSession[] => {
      return loadFromStorage('chatSessions')
    },
    
    getByUserId: (userId: string): ChatSession | null => {
      const sessions = fallbackStorage.chatSessions.getAll()
      const userSessions = sessions.filter(session => session.user_id === userId)
      return userSessions.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )[0] || null
    },
    
    create: (userId: string): ChatSession => {
      const sessions = fallbackStorage.chatSessions.getAll()
      const newSession: ChatSession = {
        id: Date.now().toString() + Math.random().toString(36).substring(2, 11),
        user_id: userId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      sessions.push(newSession)
      saveToStorage('chatSessions', sessions)
      return newSession
    },
    
    getById: (sessionId: string): ChatSession | null => {
      const sessions = fallbackStorage.chatSessions.getAll()
      return sessions.find(session => session.id === sessionId) || null
    }
  },
  
  chatMessages: {
    getBySessionId: (sessionId: string): ChatMessage[] => {
      const allMessages = fallbackStorage.chatMessages.getAll()
      return allMessages
        .filter((message: ChatMessage) => message.session_id === sessionId)
        .sort((a: ChatMessage, b: ChatMessage) => 
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        )
    },
    
    create: (sessionId: string, role: 'user' | 'assistant' | 'system', content: string): ChatMessage => {
      const allMessages = fallbackStorage.chatMessages.getAll()
      const newMessage: ChatMessage = {
        id: Date.now().toString() + Math.random().toString(36).substring(2, 11),
        session_id: sessionId,
        role,
        content,
        created_at: new Date().toISOString()
      }
      allMessages.push(newMessage)
      saveToStorage('chatMessages', allMessages)
      return newMessage
    },
    
    getAll: (): ChatMessage[] => {
      return loadFromStorage('chatMessages')
    }
  },
  
  matches: {
    getAll: (): Match[] => {
      return loadFromStorage('matches')
    },
    
    getByUserId: (userId: string): Match[] => {
      const matches = fallbackStorage.matches.getAll()
      return matches.filter(match => 
        match.user_id === userId || match.matched_user_id === userId
      )
    },
    
    create: (userId: string, matchedUserId: string, matchScore: number): Match => {
      if (userId === matchedUserId) {
        console.error('CRITICAL ERROR: Attempted to create self-match', { userId, matchedUserId })
        throw new Error('Cannot create match with yourself')
      }

      const matches = fallbackStorage.matches.getAll()
      
      const existingMatch = matches.find(match => 
        (match.user_id === userId && match.matched_user_id === matchedUserId) ||
        (match.user_id === matchedUserId && match.matched_user_id === userId)
      )
      
      if (existingMatch) {
        existingMatch.match_score = matchScore
        existingMatch.updated_at = new Date().toISOString()
        saveToStorage('matches', matches)
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
      saveToStorage('matches', matches)
      return newMatch
    },
    
    updateStatus: (matchId: string, status: Match['status']): Match | null => {
      const matches = fallbackStorage.matches.getAll()
      const index = matches.findIndex(match => match.id === matchId)
      
      if (index === -1) return null
      
      matches[index] = {
        ...matches[index],
        status,
        updated_at: new Date().toISOString()
      }
      
      saveToStorage('matches', matches)
      return matches[index]
    },
    
    getByUserIds: (userId: string, matchedUserId: string): Match | null => {
      const matches = fallbackStorage.matches.getAll()
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
          console.error('PostgreSQL error, falling back to fallback storage:', error)
        }
      }
      return fallbackStorage.users.getAll()
    },
    
    getById: async (id: string): Promise<UserProfile | null> => {
      if (hasPostgresConnection()) {
        try {
          return await postgresDb.users.getById(id)
        } catch (error) {
          console.error('PostgreSQL error, falling back to fallback storage:', error)
        }
      }
      return fallbackStorage.users.getById(id)
    },
    
    create: async (userData: Omit<UserProfile, 'id' | 'created_at' | 'updated_at'>): Promise<UserProfile> => {
      if (hasPostgresConnection()) {
        try {
          return await postgresDb.users.create(userData)
        } catch (error) {
          console.error('PostgreSQL error, falling back to fallback storage:', error)
        }
      }
      return fallbackStorage.users.create(userData)
    },
    
    createWithId: async (id: string, userData: Omit<UserProfile, 'id' | 'created_at' | 'updated_at'>): Promise<UserProfile> => {
      if (hasPostgresConnection()) {
        try {
          return await postgresDb.users.createWithId(id, userData)
        } catch (error) {
          console.error('PostgreSQL error, falling back to fallback storage:', error)
        }
      }
      return fallbackStorage.users.createWithId(id, userData)
    },
    
    update: async (id: string, updates: Partial<UserProfile>): Promise<UserProfile | null> => {
      if (hasPostgresConnection()) {
        try {
          return await postgresDb.users.update(id, updates)
        } catch (error) {
          console.error('PostgreSQL error, falling back to fallback storage:', error)
        }
      }
      return fallbackStorage.users.update(id, updates)
    },
    
    getByEmail: async (email: string): Promise<UserProfile | null> => {
      if (hasPostgresConnection()) {
        try {
          return await postgresDb.users.getByEmail(email)
        } catch (error) {
          console.error('PostgreSQL error, falling back to fallback storage:', error)
        }
      }
      return fallbackStorage.users.getByEmail(email)
    },
    
    getAllExcept: async (excludedIds: string[]): Promise<UserProfile[]> => {
      if (hasPostgresConnection()) {
        try {
          return await postgresDb.users.getAllExcept(excludedIds)
        } catch (error) {
          console.error('PostgreSQL error, falling back to fallback storage:', error)
        }
      }
      return fallbackStorage.users.getAllExcept(excludedIds)
    }
  },
  
  chatSessions: {
    getAll: async (): Promise<ChatSession[]> => {
      if (hasPostgresConnection()) {
        try {
          return await postgresDb.chatSessions.getAll()
        } catch (error) {
          console.error('PostgreSQL error, falling back to fallback storage:', error)
        }
      }
      return fallbackStorage.chatSessions.getAll()
    },
    
    getByUserId: async (userId: string): Promise<ChatSession | null> => {
      if (hasPostgresConnection()) {
        try {
          return await postgresDb.chatSessions.getByUserId(userId)
        } catch (error) {
          console.error('PostgreSQL error, falling back to fallback storage:', error)
        }
      }
      return fallbackStorage.chatSessions.getByUserId(userId)
    },
    
    create: async (userId: string): Promise<ChatSession> => {
      if (hasPostgresConnection()) {
        try {
          return await postgresDb.chatSessions.create(userId)
        } catch (error) {
          console.error('PostgreSQL error, falling back to fallback storage:', error)
        }
      }
      return fallbackStorage.chatSessions.create(userId)
    },
    
    getById: async (sessionId: string): Promise<ChatSession | null> => {
      if (hasPostgresConnection()) {
        try {
          return await postgresDb.chatSessions.getById(sessionId)
        } catch (error) {
          console.error('PostgreSQL error, falling back to fallback storage:', error)
        }
      }
      return fallbackStorage.chatSessions.getById(sessionId)
    }
  },
  
  chatMessages: {
    getBySessionId: async (sessionId: string): Promise<ChatMessage[]> => {
      if (hasPostgresConnection()) {
        try {
          return await postgresDb.chatMessages.getBySessionId(sessionId)
        } catch (error) {
          console.error('PostgreSQL error, falling back to fallback storage:', error)
        }
      }
      return fallbackStorage.chatMessages.getBySessionId(sessionId)
    },
    
    create: async (sessionId: string, role: 'user' | 'assistant' | 'system', content: string): Promise<ChatMessage> => {
      if (hasPostgresConnection()) {
        try {
          return await postgresDb.chatMessages.create(sessionId, role, content)
        } catch (error) {
          console.error('PostgreSQL error, falling back to fallback storage:', error)
        }
      }
      return fallbackStorage.chatMessages.create(sessionId, role, content)
    }
  },
  
  matches: {
    getAll: async (): Promise<Match[]> => {
      if (hasPostgresConnection()) {
        try {
          return await postgresDb.matches.getAll()
        } catch (error) {
          console.error('PostgreSQL error, falling back to fallback storage:', error)
        }
      }
      return fallbackStorage.matches.getAll()
    },
    
    getByUserId: async (userId: string): Promise<Match[]> => {
      if (hasPostgresConnection()) {
        try {
          return await postgresDb.matches.getByUserId(userId)
        } catch (error) {
          console.error('PostgreSQL error, falling back to fallback storage:', error)
        }
      }
      return fallbackStorage.matches.getByUserId(userId)
    },
    
    create: async (userId: string, matchedUserId: string, matchScore: number): Promise<Match> => {
      if (hasPostgresConnection()) {
        try {
          return await postgresDb.matches.create(userId, matchedUserId, matchScore)
        } catch (error) {
          console.error('PostgreSQL error, falling back to fallback storage:', error)
        }
      }
      return fallbackStorage.matches.create(userId, matchedUserId, matchScore)
    },
    
    updateStatus: async (matchId: string, status: Match['status']): Promise<Match | null> => {
      if (hasPostgresConnection()) {
        try {
          return await postgresDb.matches.updateStatus(matchId, status)
        } catch (error) {
          console.error('PostgreSQL error, falling back to fallback storage:', error)
        }
      }
      return fallbackStorage.matches.updateStatus(matchId, status)
    },
    
    getByUserIds: async (userId: string, matchedUserId: string): Promise<Match | null> => {
      if (hasPostgresConnection()) {
        try {
          return await postgresDb.matches.getByUserIds(userId, matchedUserId)
        } catch (error) {
          console.error('PostgreSQL error, falling back to fallback storage:', error)
        }
      }
      return fallbackStorage.matches.getByUserIds(userId, matchedUserId)
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
  // fallback storage doesn't need initialization
}

// Initialize database on server-side
if (typeof window === 'undefined') {
  if (hasPostgresConnection()) {
    initializeDatabase().catch(console.error)
    initializeDemoData().catch(console.error)
  }
}