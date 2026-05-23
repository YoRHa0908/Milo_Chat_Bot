-- Milo Database Setup for Supabase
-- Run this in the Supabase SQL Editor

-- 1. Create tables
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE,
  name TEXT NOT NULL,
  age INTEGER,
  location TEXT,
  bio TEXT,
  interests TEXT[] DEFAULT '{}',
  looking_for TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE chat_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  session_data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE chat_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES chat_sessions(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE matches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  matched_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  match_score FLOAT DEFAULT 0.0,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'blocked')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, matched_user_id)
);

-- 2. Create indexes for better performance
CREATE INDEX idx_users_interests ON users USING GIN(interests);
CREATE INDEX idx_users_looking_for ON users USING GIN(looking_for);
CREATE INDEX idx_chat_messages_session_id ON chat_messages(session_id);
CREATE INDEX idx_matches_user_id ON matches(user_id);
CREATE INDEX idx_matches_matched_user_id ON matches(matched_user_id);

-- 3. Create function to update timestamps (FIXED: using $$ instead of $)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 4. Create triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_chat_sessions_updated_at BEFORE UPDATE ON chat_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_matches_updated_at BEFORE UPDATE ON matches
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 5. Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;

-- 6. Create basic policies (for demo - in production, use proper auth)
CREATE POLICY "Enable read access for all users" ON users
  FOR SELECT USING (true);

CREATE POLICY "Enable insert for all users" ON users
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable read access for all matches" ON matches
  FOR SELECT USING (true);

CREATE POLICY "Enable insert for all matches" ON matches
  FOR INSERT WITH CHECK (true);

-- 7. Insert some sample data (optional)
INSERT INTO users (name, email, age, location, bio, interests, looking_for) VALUES
('Alex Johnson', 'alex@example.com', 28, 'New York, USA', 'Software engineer who loves hiking and photography', ARRAY['Technology', 'Hiking', 'Photography'], ARRAY['Friendship', 'Networking']),
('Sam Taylor', 'sam@example.com', 32, 'London, UK', 'Digital marketer and food enthusiast', ARRAY['Cooking', 'Travel', 'Movies'], ARRAY['Dating', 'Activity Partners']),
('Jordan Lee', 'jordan@example.com', 25, 'Tokyo, Japan', 'Graphic designer and gamer', ARRAY['Art', 'Gaming', 'Music'], ARRAY['Friendship', 'Creative Collaboration']);

-- 8. Verify tables were created
SELECT 'Database setup complete!' as message;