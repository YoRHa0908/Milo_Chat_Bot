import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

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
  session_data: Record<string, any>
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