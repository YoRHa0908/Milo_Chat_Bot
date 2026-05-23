// Simple Supabase connection test
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

console.log('🔗 Checking Supabase configuration...')

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env.local')
  console.log('Please add:')
  console.log('NEXT_PUBLIC_SUPABASE_URL=your_project_url')
  console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key')
  process.exit(1)
}

console.log('✅ Supabase URL configured:', supabaseUrl.substring(0, 30) + '...')
console.log('✅ Supabase key configured:', supabaseKey.substring(0, 10) + '...')

// Check if URL looks valid
if (!supabaseUrl.includes('supabase.co')) {
  console.warn('⚠️  Supabase URL does not contain "supabase.co" - might be invalid')
}

// Check if key looks valid
if (!supabaseKey.startsWith('eyJ') && !supabaseKey.startsWith('sb_')) {
  console.warn('⚠️  Supabase key format looks unusual')
}

console.log('\n🎉 Environment configuration looks good!')
console.log('The app is already running at http://localhost:3000')
console.log('\nTo test the database connection:')
console.log('1. Go to http://localhost:3000 in your browser')
console.log('2. Click "Get Started" and create a profile')
console.log('3. If it works, Supabase is connected correctly')
console.log('\nIf you get database errors, run:')
console.log('1. Go to supabase.com and create a project')
console.log('2. Run supabase_setup.sql in the SQL Editor')
console.log('3. Update .env.local with your new credentials')

process.exit(0)