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
  // Check if we're in a Node.js environment and have DATABASE_URL
  if (typeof window === 'undefined' && typeof process !== 'undefined' && process.env) {
    return !!process.env.DATABASE_URL && process.env.DATABASE_URL.trim() !== ''
  }
  return false
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

// Initialize server memory store from backup file if it exists
if (typeof window === 'undefined') {
  // Use an async IIFE to handle dynamic imports
  ;(async () => {
    try {
      // Check if we're in a Node.js environment before trying to import fs/path
      if (typeof process !== 'undefined' && process.versions && process.versions.node) {
        // Use dynamic import for Node.js modules to avoid issues in browser builds
        const fs = await import('fs')
        const path = await import('path')
        const backupFile = path.join(process.cwd(), '.localStorageBackup.json')
        
        if (fs.existsSync(backupFile)) {
          const backupData = JSON.parse(fs.readFileSync(backupFile, 'utf8'))
          
          if (backupData.users) serverMemoryStore.users = backupData.users
          if (backupData.chatSessions) serverMemoryStore.chatSessions = backupData.chatSessions
          if (backupData.chatMessages) serverMemoryStore.chatMessages = backupData.chatMessages
          if (backupData.matches) serverMemoryStore.matches = backupData.matches
          
          console.log(`Loaded ${serverMemoryStore.users.length} users from backup file`)
        }
        
        // If no users exist, create demo users
        if (serverMemoryStore.users.length === 0) {
          const demoUsers = [
            {
              id: 'demo-user-1',
              name: 'Alex Johnson',
              email: 'alex@example.com',
              age: 28,
              location: 'New York, USA',
              bio: 'Software engineer who loves hiking and photography. Looking to meet creative people.',
              interests: ['Technology', 'Hiking', 'Photography', 'Coffee'],
              looking_for: ['Friendship', 'Networking', 'Activity Partners'],
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            },
            {
              id: 'demo-user-2',
              name: 'Sam Taylor',
              email: 'sam@example.com',
              age: 32,
              location: 'London, UK',
              bio: 'Graphic designer and art enthusiast. Enjoy museums, indie films, and trying new restaurants.',
              interests: ['Art', 'Movies', 'Cooking', 'Travel'],
              looking_for: ['Dating', 'Creative Collaboration'],
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            },
            {
              id: 'demo-user-3',
              name: 'Jordan Lee',
              email: 'jordan@example.com',
              age: 25,
              location: 'Tokyo, Japan',
              bio: 'Language teacher and bookworm. Passionate about cultural exchange and learning new things.',
              interests: ['Reading', 'Travel', 'Language Learning', 'Yoga'],
              looking_for: ['Friendship', 'Study Buddies', 'Travel Companions'],
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }
          ]
          
          serverMemoryStore.users = demoUsers
          console.log(`Created ${demoUsers.length} demo users for fallback storage`)
          
          // Save to backup file
          const backupData = {
            users: serverMemoryStore.users,
            chatSessions: serverMemoryStore.chatSessions,
            chatMessages: serverMemoryStore.chatMessages,
            matches: serverMemoryStore.matches
          }
          
          fs.writeFileSync(backupFile, JSON.stringify(backupData, null, 2))
        }
      }
    } catch (error) {
      console.log('No backup file found or error loading backup:', error instanceof Error ? error.message : String(error))
    }
  })()
}

// Helper function to save to appropriate storage
export const saveToStorage = async (key: string, data: any): Promise<void> => {
  if (typeof window === 'undefined') {
    // Server-side: update in-memory store and backup file
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
    
    // Save to backup file - only if we're in a Node.js environment
    try {
      // Check if we're in Node.js environment before trying to import fs/path
      if (typeof process !== 'undefined' && process.versions && process.versions.node) {
        // Use dynamic import for Node.js modules
        const fs = await import('fs')
        const path = await import('path')
        const backupFile = path.join(process.cwd(), '.localStorageBackup.json')
        
        const backupData = {
          users: serverMemoryStore.users,
          chatSessions: serverMemoryStore.chatSessions,
          chatMessages: serverMemoryStore.chatMessages,
          matches: serverMemoryStore.matches
        }
        
        fs.writeFileSync(backupFile, JSON.stringify(backupData, null, 2))
      }
    } catch (error) {
      // Error saving to backup file - silent fail
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
    
    create: async (userData: Omit<UserProfile, 'id' | 'created_at' | 'updated_at'>): Promise<UserProfile> => {
      const users = fallbackStorage.users.getAll()
      const newUser: UserProfile = {
        id: Date.now().toString() + Math.random().toString(36).substring(2, 11),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ...userData
      }
      users.push(newUser)
      await saveToStorage('users', users)
      return newUser
    },
    
    createWithId: async (id: string, userData: Omit<UserProfile, 'id' | 'created_at' | 'updated_at'>): Promise<UserProfile> => {
      const users = fallbackStorage.users.getAll()
      const newUser: UserProfile = {
        id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ...userData
      }
      users.push(newUser)
      await saveToStorage('users', users)
      return newUser
    },
    
    update: async (id: string, updates: Partial<UserProfile>): Promise<UserProfile | null> => {
      const users = fallbackStorage.users.getAll()
      const index = users.findIndex(user => user.id === id)
      
      if (index === -1) return null
      
      users[index] = {
        ...users[index],
        ...updates,
        updated_at: new Date().toISOString()
      }
      
      await saveToStorage('users', users)
      return users[index]
    },
    
    getByEmail: (email: string): UserProfile | null => {
      const users = fallbackStorage.users.getAll()
      return users.find(user => user.email === email) || null
    },
    
    getAllExcept: (excludedIds: string[]): UserProfile[] => {
      const users = fallbackStorage.users.getAll()
      return users.filter(user => !excludedIds.includes(user.id))
    },
    
    delete: async (id: string): Promise<boolean> => {
      const users = fallbackStorage.users.getAll()
      const initialLength = users.length
      const filteredUsers = users.filter(user => user.id !== id)
      
      if (filteredUsers.length < initialLength) {
        await saveToStorage('users', filteredUsers)
        return true
      }
      return false
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
    
    create: async (userId: string): Promise<ChatSession> => {
      const sessions = fallbackStorage.chatSessions.getAll()
      const newSession: ChatSession = {
        id: Date.now().toString() + Math.random().toString(36).substring(2, 11),
        user_id: userId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      sessions.push(newSession)
      await saveToStorage('chatSessions', sessions)
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
    
    create: async (sessionId: string, role: 'user' | 'assistant' | 'system', content: string): Promise<ChatMessage> => {
      const allMessages = fallbackStorage.chatMessages.getAll()
      const newMessage: ChatMessage = {
        id: Date.now().toString() + Math.random().toString(36).substring(2, 11),
        session_id: sessionId,
        role,
        content,
        created_at: new Date().toISOString()
      }
      allMessages.push(newMessage)
      await saveToStorage('chatMessages', allMessages)
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
    
    create: async (userId: string, matchedUserId: string, matchScore: number): Promise<Match> => {
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
        await saveToStorage('matches', matches)
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
      await saveToStorage('matches', matches)
      return newMatch
    },
    
    updateStatus: async (matchId: string, status: Match['status']): Promise<Match | null> => {
      const matches = fallbackStorage.matches.getAll()
      const index = matches.findIndex(match => match.id === matchId)
      
      if (index === -1) return null
      
      matches[index] = {
        ...matches[index],
        status,
        updated_at: new Date().toISOString()
      }
      
      await saveToStorage('matches', matches)
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
    },
    
    delete: async (id: string): Promise<boolean> => {
      if (hasPostgresConnection()) {
        try {
          // PostgreSQL delete method needs to be implemented
          // For now, fall back to fallback storage
          return fallbackStorage.users.delete(id)
        } catch (error) {
          console.error('PostgreSQL error, falling back to fallback storage:', error)
        }
      }
      return fallbackStorage.users.delete(id)
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
