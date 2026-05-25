// PostgreSQL database implementation
// This replaces localStorageDb with PostgreSQL while maintaining the same interface

import { Pool, PoolClient } from 'pg'

// Types (same as localStorageDb for compatibility)
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

// Database connection pool
let pool: Pool | null = null

const getPool = (): Pool | null => {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL
    
    // If DATABASE_URL is not set, return null to indicate no PostgreSQL connection
    if (!connectionString || connectionString.trim() === '') {
      return null
    }
    
    try {
      pool = new Pool({
        connectionString,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
        max: 20, // Maximum number of clients in the pool
        idleTimeoutMillis: 30000, // How long a client is allowed to remain idle before being closed
        connectionTimeoutMillis: 2000, // How long to wait for a connection
      })
      
      // Test connection silently
      pool.connect((err, client, release) => {
        if (err) {
          pool = null // Reset pool on connection failure
        } else {
          release()
        }
      })
    } catch (error) {
      pool = null
    }
  }
  
  return pool
}

// Helper function to execute PostgreSQL queries with null check
const withPostgres = async <T>(
  operation: (client: PoolClient) => Promise<T>
): Promise<T> => {
  const pool = getPool()
  if (!pool) {
    throw new Error('PostgreSQL not available')
  }
  
  const client = await pool.connect()
  try {
    return await operation(client)
  } finally {
    client.release()
  }
}

// Initialize database tables
export const initializeDatabase = async (): Promise<void> => {
  const pool = getPool()
  if (!pool) {
    return
  }
  
  const client = await pool.connect()
  
  try {
    // Create users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(255) PRIMARY KEY,
        email VARCHAR(255) UNIQUE,
        name VARCHAR(255) NOT NULL,
        age INTEGER,
        location VARCHAR(255),
        bio TEXT,
        interests JSONB DEFAULT '[]'::jsonb,
        looking_for JSONB DEFAULT '[]'::jsonb,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `)
    
    // Create chat_sessions table
    await client.query(`
      CREATE TABLE IF NOT EXISTS chat_sessions (
        id VARCHAR(255) PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `)
    
    // Create chat_messages table
    await client.query(`
      CREATE TABLE IF NOT EXISTS chat_messages (
        id VARCHAR(255) PRIMARY KEY,
        session_id VARCHAR(255) NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
        role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
        content TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `)
    
    // Create matches table
    await client.query(`
      CREATE TABLE IF NOT EXISTS matches (
        id VARCHAR(255) PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        matched_user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        match_score DECIMAL(3,2) NOT NULL DEFAULT 0.5,
        status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'blocked')),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, matched_user_id),
        CHECK (user_id != matched_user_id)
      )
    `)
    
    // Create indexes for better performance
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_id ON chat_sessions(user_id);
      CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id ON chat_messages(session_id);
      CREATE INDEX IF NOT EXISTS idx_matches_user_id ON matches(user_id);
      CREATE INDEX IF NOT EXISTS idx_matches_matched_user_id ON matches(matched_user_id);
      CREATE INDEX IF NOT EXISTS idx_matches_user_matched ON matches(user_id, matched_user_id);
    `)
  } catch (error) {
    throw error
  } finally {
    client.release()
  }
}

// Generate ID (same as localStorageDb for consistency)
const generateId = (): string => {
  return Date.now().toString() + Math.random().toString(36).substring(2, 11)
}

// Database operations (same interface as localStorageDb)
export const db = {
  users: {
    getAll: async (): Promise<UserProfile[]> => {
      return withPostgres(async (client) => {
        const result = await client.query('SELECT * FROM users ORDER BY created_at DESC')
        return result.rows.map(row => ({
          ...row,
          interests: row.interests || [],
          looking_for: row.looking_for || []
        }))
      })
    },
    
    getById: async (id: string): Promise<UserProfile | null> => {
      return withPostgres(async (client) => {
        const result = await client.query('SELECT * FROM users WHERE id = $1', [id])
        if (result.rows.length === 0) return null
        
        const row = result.rows[0]
        return {
          ...row,
          interests: row.interests || [],
          looking_for: row.looking_for || []
        }
      })
    },
    
    create: async (userData: Omit<UserProfile, 'id' | 'created_at' | 'updated_at'>): Promise<UserProfile> => {
      return withPostgres(async (client) => {
        const id = generateId()
        const now = new Date().toISOString()
        
        const result = await client.query(
          `INSERT INTO users (id, email, name, age, location, bio, interests, looking_for, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
           RETURNING *`,
          [
            id,
            userData.email,
            userData.name,
            userData.age,
            userData.location,
            userData.bio,
            JSON.stringify(userData.interests || []),
            JSON.stringify(userData.looking_for || []),
            now,
            now
          ]
        )
        
        const row = result.rows[0]
        return {
          ...row,
          interests: row.interests || [],
          looking_for: row.looking_for || []
        }
      })
    },
    
    createWithId: async (id: string, userData: Omit<UserProfile, 'id' | 'created_at' | 'updated_at'>): Promise<UserProfile> => {
      return withPostgres(async (client) => {
        const now = new Date().toISOString()
        
        const result = await client.query(
          `INSERT INTO users (id, email, name, age, location, bio, interests, looking_for, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
           ON CONFLICT (id) DO UPDATE SET
             email = EXCLUDED.email,
             name = EXCLUDED.name,
             age = EXCLUDED.age,
             location = EXCLUDED.location,
             bio = EXCLUDED.bio,
             interests = EXCLUDED.interests,
             looking_for = EXCLUDED.looking_for,
             updated_at = EXCLUDED.updated_at
           RETURNING *`,
          [
            id,
            userData.email,
            userData.name,
            userData.age,
            userData.location,
            userData.bio,
            JSON.stringify(userData.interests || []),
            JSON.stringify(userData.looking_for || []),
            now,
            now
          ]
        )
        
        const row = result.rows[0]
        return {
          ...row,
          interests: row.interests || [],
          looking_for: row.looking_for || []
        }
      })
    },
    
    update: async (id: string, updates: Partial<UserProfile>): Promise<UserProfile | null> => {
      return withPostgres(async (client) => {
        // Build dynamic update query
        const fields = []
        const values = []
        let paramCount = 1
        
        if (updates.email !== undefined) {
          fields.push(`email = $${paramCount}`)
          values.push(updates.email)
          paramCount++
        }
        if (updates.name !== undefined) {
          fields.push(`name = $${paramCount}`)
          values.push(updates.name)
          paramCount++
        }
        if (updates.age !== undefined) {
          fields.push(`age = $${paramCount}`)
          values.push(updates.age)
          paramCount++
        }
        if (updates.location !== undefined) {
          fields.push(`location = $${paramCount}`)
          values.push(updates.location)
          paramCount++
        }
        if (updates.bio !== undefined) {
          fields.push(`bio = $${paramCount}`)
          values.push(updates.bio)
          paramCount++
        }
        if (updates.interests !== undefined) {
          fields.push(`interests = $${paramCount}`)
          values.push(JSON.stringify(updates.interests))
          paramCount++
        }
        if (updates.looking_for !== undefined) {
          fields.push(`looking_for = $${paramCount}`)
          values.push(JSON.stringify(updates.looking_for))
          paramCount++
        }
        
        // Always update updated_at
        fields.push(`updated_at = $${paramCount}`)
        values.push(new Date().toISOString())
        paramCount++
        
        values.push(id) // WHERE id = $lastParam
        
        const query = `
          UPDATE users 
          SET ${fields.join(', ')}
          WHERE id = $${paramCount}
          RETURNING *
        `
        
        const result = await client.query(query, values)
        
        if (result.rows.length === 0) return null
        
        const row = result.rows[0]
        return {
          ...row,
          interests: row.interests || [],
          looking_for: row.looking_for || []
        }
      })
    },
    
    getByEmail: async (email: string): Promise<UserProfile | null> => {
      return withPostgres(async (client) => {
        const result = await client.query('SELECT * FROM users WHERE email = $1', [email])
        if (result.rows.length === 0) return null
        
        const row = result.rows[0]
        return {
          ...row,
          interests: row.interests || [],
          looking_for: row.looking_for || []
        }
      })
    },
    
    getAllExcept: async (excludedIds: string[]): Promise<UserProfile[]> => {
      return withPostgres(async (client) => {
        const result = await client.query(
          'SELECT * FROM users WHERE id != ALL($1) ORDER BY created_at DESC',
          [excludedIds]
        )
        return result.rows.map(row => ({
          ...row,
          interests: row.interests || [],
          looking_for: row.looking_for || []
        }))
      })
    }
  },
  
  chatSessions: {
    getAll: async (): Promise<ChatSession[]> => {
      return withPostgres(async (client) => {
        const result = await client.query('SELECT * FROM chat_sessions ORDER BY created_at DESC')
        return result.rows
      })
    },
    
    getByUserId: async (userId: string): Promise<ChatSession | null> => {
      return withPostgres(async (client) => {
        const result = await client.query(
          'SELECT * FROM chat_sessions WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1',
          [userId]
        )
        return result.rows[0] || null
      })
    },
    
    create: async (userId: string): Promise<ChatSession> => {
      return withPostgres(async (client) => {
        const id = generateId()
        const now = new Date().toISOString()
        
        const result = await client.query(
          `INSERT INTO chat_sessions (id, user_id, created_at, updated_at)
           VALUES ($1, $2, $3, $4)
           RETURNING *`,
          [id, userId, now, now]
        )
        
        return result.rows[0]
      })
    },
    
    getById: async (sessionId: string): Promise<ChatSession | null> => {
      return withPostgres(async (client) => {
        const result = await client.query('SELECT * FROM chat_sessions WHERE id = $1', [sessionId])
        return result.rows[0] || null
      })
    }
  },
  
  chatMessages: {
    getBySessionId: async (sessionId: string): Promise<ChatMessage[]> => {
      return withPostgres(async (client) => {
        const result = await client.query(
          'SELECT * FROM chat_messages WHERE session_id = $1 ORDER BY created_at ASC',
          [sessionId]
        )
        return result.rows
      })
    },
    
    create: async (sessionId: string, role: 'user' | 'assistant' | 'system', content: string): Promise<ChatMessage> => {
      return withPostgres(async (client) => {
        const id = generateId()
        const now = new Date().toISOString()
        
        const result = await client.query(
          `INSERT INTO chat_messages (id, session_id, role, content, created_at)
           VALUES ($1, $2, $3, $4, $5)
           RETURNING *`,
          [id, sessionId, role, content, now]
        )
        
        return result.rows[0]
      })
    }
  },
  
  matches: {
    getAll: async (): Promise<Match[]> => {
      return withPostgres(async (client) => {
        const result = await client.query('SELECT * FROM matches ORDER BY created_at DESC')
        return result.rows
      })
    },
    
    getByUserId: async (userId: string): Promise<Match[]> => {
      return withPostgres(async (client) => {
        const result = await client.query(
          `SELECT * FROM matches 
           WHERE user_id = $1 OR matched_user_id = $1
           ORDER BY created_at DESC`,
          [userId]
        )
        return result.rows
      })
    },
    
    create: async (userId: string, matchedUserId: string, matchScore: number): Promise<Match> => {
      // Prevent users from matching with themselves
      if (userId === matchedUserId) {
        throw new Error('Cannot create match with yourself')
      }

      return withPostgres(async (client) => {
        const id = generateId()
        const now = new Date().toISOString()
        
        // Use ON CONFLICT to handle duplicate matches
        const result = await client.query(
          `INSERT INTO matches (id, user_id, matched_user_id, match_score, status, created_at, updated_at)
           VALUES ($1, $2, $3, $4, 'pending', $5, $6)
           ON CONFLICT (user_id, matched_user_id) DO UPDATE SET
             match_score = EXCLUDED.match_score,
             updated_at = EXCLUDED.updated_at
           RETURNING *`,
          [id, userId, matchedUserId, matchScore, now, now]
        )
        
        return result.rows[0]
      })
    },
    
    updateStatus: async (matchId: string, status: Match['status']): Promise<Match | null> => {
      return withPostgres(async (client) => {
        const result = await client.query(
          `UPDATE matches 
           SET status = $1, updated_at = $2
           WHERE id = $3
           RETURNING *`,
          [status, new Date().toISOString(), matchId]
        )
        
        return result.rows[0] || null
      })
    },
    
    getByUserIds: async (userId: string, matchedUserId: string): Promise<Match | null> => {
      return withPostgres(async (client) => {
        const result = await client.query(
          `SELECT * FROM matches 
           WHERE (user_id = $1 AND matched_user_id = $2)
              OR (user_id = $2 AND matched_user_id = $1)`,
          [userId, matchedUserId]
        )
        
        return result.rows[0] || null
      })
    }
  }
}

// Initialize demo data for PostgreSQL
export const initializeDemoData = async (): Promise<void> => {
  const pool = getPool()
  if (!pool) {
    return
  }
  
  const client = await pool.connect()
  
  try {
    // Check if we need to initialize demo data
    const usersResult = await client.query('SELECT COUNT(*) as count FROM users')
    const userCount = parseInt(usersResult.rows[0].count)
    
    if (userCount === 0) {
      // Create demo users
      const demoUsers = [
        {
          id: 'demo-user-1',
          name: 'Alex Johnson',
          email: 'alex@example.com',
          age: 28,
          location: 'New York, USA',
          bio: 'Software engineer who loves hiking and photography. Looking to meet creative people.',
          interests: ['Technology', 'Hiking', 'Photography', 'Coffee'],
          looking_for: ['Friendship', 'Networking', 'Activity Partners']
        },
        {
          id: 'demo-user-2',
          name: 'Sam Taylor',
          email: 'sam@example.com',
          age: 32,
          location: 'London, UK',
          bio: 'Graphic designer and art enthusiast. Enjoy museums, indie films, and trying new restaurants.',
          interests: ['Art', 'Movies', 'Cooking', 'Travel'],
          looking_for: ['Dating', 'Creative Collaboration']
        },
        {
          id: 'demo-user-3',
          name: 'Jordan Lee',
          email: 'jordan@example.com',
          age: 25,
          location: 'Tokyo, Japan',
          bio: 'Language teacher and bookworm. Passionate about cultural exchange and learning new things.',
          interests: ['Reading', 'Travel', 'Language Learning', 'Yoga'],
          looking_for: ['Friendship', 'Study Buddies', 'Travel Companions']
        }
      ]
      
      for (const userData of demoUsers) {
        await db.users.createWithId(userData.id, userData)
      }
    }
  } catch (error) {
    // Silently handle demo data initialization errors
  } finally {
    client.release()
  }
}

// Initialize database on module load (server-side only)
if (typeof window === 'undefined') {
  initializeDatabase().catch(() => {})
  initializeDemoData().catch(() => {})
}
