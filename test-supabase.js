// Test Supabase connection
const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env.local')
  console.log('Please add:')
  console.log('NEXT_PUBLIC_SUPABASE_URL=your_project_url')
  console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key')
  process.exit(1)
}

console.log('🔗 Testing Supabase connection...')
console.log('URL:', supabaseUrl)

const supabase = createClient(supabaseUrl, supabaseKey)

async function testConnection() {
  try {
    // Test 1: Check if we can connect
    const { data, error } = await supabase.from('users').select('count').limit(1)
    
    if (error) {
      console.error('❌ Connection failed:', error.message)
      
      if (error.message.includes('JWT')) {
        console.log('\n⚠️  Possible issues:')
        console.log('1. Wrong API key - check your anon key')
        console.log('2. Database not set up - run supabase_setup.sql')
        console.log('3. RLS policies blocking - check SQL setup')
      }
      
      return false
    }
    
    console.log('✅ Connected to Supabase successfully!')
    
    // Test 2: Check if tables exist
    const tables = ['users', 'chat_sessions', 'chat_messages', 'matches']
    
    for (const table of tables) {
      const { error: tableError } = await supabase.from(table).select('*').limit(1)
      
      if (tableError && tableError.message.includes('does not exist')) {
        console.log(`❌ Table "${table}" doesn't exist. Run supabase_setup.sql`)
        return false
      }
    }
    
    console.log('✅ All tables exist')
    
    // Test 3: Try to insert a test user
    const testUser = {
      name: 'Test User',
      email: 'test@example.com',
      interests: ['Testing'],
      looking_for: ['Friendship']
    }
    
    const { data: userData, error: insertError } = await supabase
      .from('users')
      .insert([testUser])
      .select()
    
    if (insertError) {
      console.log('⚠️  Could not insert test user (might be RLS):', insertError.message)
    } else {
      console.log('✅ Test user inserted:', userData[0].id)
      
      // Clean up
      await supabase.from('users').delete().eq('id', userData[0].id)
    }
    
    return true
    
  } catch (err) {
    console.error('❌ Unexpected error:', err)
    return false
  }
}

testConnection().then(success => {
  if (success) {
    console.log('\n🎉 Supabase setup complete!')
    console.log('Next: Start the app with "npm run dev"')
  } else {
    console.log('\n🔧 Please fix the issues above and try again')
  }
  process.exit(success ? 0 : 1)
})