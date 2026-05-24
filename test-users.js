// Test script to verify user storage and matching
console.log('🔍 Testing Milo User Database...\n')

// Simulate creating multiple users
const testUsers = [
  {
    name: 'Test User 1',
    email: 'test1@example.com',
    age: 25,
    location: 'Test City',
    bio: 'Test bio 1',
    interests: ['Technology', 'Music', 'Sports'],
    looking_for: ['Friendship', 'Networking']
  },
  {
    name: 'Test User 2', 
    email: 'test2@example.com',
    age: 30,
    location: 'Another City',
    bio: 'Test bio 2',
    interests: ['Art', 'Travel', 'Cooking'],
    looking_for: ['Dating', 'Activity Partners']
  },
  {
    name: 'Test User 3',
    email: 'test3@example.com',
    age: 28,
    location: 'Different City',
    bio: 'Test bio 3',
    interests: ['Reading', 'Fitness', 'Photography'],
    looking_for: ['Study Buddies', 'Travel Companions']
  }
]

console.log('✅ Test users created:')
testUsers.forEach((user, i) => {
  console.log(`${i + 1}. ${user.name} (${user.age}, ${user.location})`)
  console.log(`   Interests: ${user.interests.join(', ')}`)
  console.log(`   Looking for: ${user.looking_for.join(', ')}`)
  console.log('')
})

console.log('📊 Expected Results:')
console.log('1. Each new user should be stored in the database')
console.log('2. When getting matches, should see up to 10 potential matches')
console.log('3. Demo users (Alex, Sam, Jordan) + new users should all appear')
console.log('4. Match scores calculated based on shared interests')
console.log('')

console.log('🔧 How to Test:')
console.log('1. Run the app: npm run dev')
console.log('2. Create a new user profile')
console.log('3. Go to chat page and click "Get Matches"')
console.log('4. Check sidebar - should show up to 10 matches')
console.log('5. Check admin page (/admin) - should show all users')
console.log('')

console.log('💡 Note: The app now returns top 10 matches (increased from 3)')
console.log('💡 All users are stored in localStorage (browser) or server memory')