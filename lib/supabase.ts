// This file exports the localStorage database as a Supabase replacement
// No environment variables required!

export { db as supabase } from './localStorageDb.old'
export type { UserProfile, ChatSession, ChatMessage, Match } from './localStorageDb.old'