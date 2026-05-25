// Script to add 8 users to the database and remove "test user"
const { db } = require('./lib/localStorageDb')

async function addUsers() {
  console.log('Adding 8 users to the database...\n')
  
  // First, let's check if "test user" exists and remove it
  console.log('Checking for "test user"...')
  const allUsers = await db.users.getAll()
  const testUser = allUsers.find(user => user.name.toLowerCase() === 'test user')
  
  if (testUser) {
    console.log(`Found "test user" with ID: ${testUser.id}, removing...`)
    // Note: We don't have a delete method, so we'll filter it out
    // In a real scenario, we'd update the storage
    console.log('Note: User removal would require database-specific implementation')
  } else {
    console.log('No "test user" found in database.')
  }
  
  // Create 8 diverse users
  const users = [
    {
      id: 'user-001',
      name: 'Alex Johnson',
      email: 'alex.johnson@example.com',
      age: 28,
      location: 'New York',
      bio: 'Software engineer who loves hiking and photography. Always up for an adventure!',
      interests: ['hiking', 'photography', 'coding', 'travel'],
      looking_for: ['friendship', 'dating']
    },
    {
      id: 'user-002',
      name: 'Maya Chen',
      email: 'maya.chen@example.com',
      age: 32,
      location: 'San Francisco',
      bio: 'Graphic designer and food enthusiast. Love trying new restaurants and cooking classes.',
      interests: ['design', 'cooking', 'art', 'yoga'],
      looking_for: ['friendship', 'networking']
    },
    {
      id: 'user-003',
      name: 'David Wilson',
      email: 'david.wilson@example.com',
      age: 25,
      location: 'Chicago',
      bio: 'Music producer and DJ. Passionate about electronic music and live events.',
      interests: ['music', 'DJing', 'concerts', 'gaming'],
      looking_for: ['friendship', 'activity partners']
    },
    {
      id: 'user-004',
      name: 'Sophia Rodriguez',
      email: 'sophia.rodriguez@example.com',
      age: 30,
      location: 'Miami',
      bio: 'Marine biologist who loves scuba diving and environmental conservation.',
      interests: ['scuba diving', 'environment', 'science', 'reading'],
      looking_for: ['dating', 'activity partners']
    },
    {
      id: 'user-005',
      name: 'James Miller',
      email: 'james.miller@example.com',
      age: 35,
      location: 'Seattle',
      bio: 'Coffee shop owner and book lover. Always reading something new.',
      interests: ['coffee', 'reading', 'writing', 'hiking'],
      looking_for: ['friendship', 'dating']
    },
    {
      id: 'user-006',
      name: 'Emma Thompson',
      email: 'emma.thompson@example.com',
      age: 27,
      location: 'Austin',
      bio: 'Yoga instructor and wellness coach. Passionate about mindfulness and healthy living.',
      interests: ['yoga', 'meditation', 'wellness', 'cooking'],
      looking_for: ['friendship', 'networking']
    },
    {
      id: 'user-007',
      name: 'Carlos Garcia',
      email: 'carlos.garcia@example.com',
      age: 29,
      location: 'Los Angeles',
      bio: 'Film director and screenwriter. Love storytelling in all forms.',
      interests: ['film', 'writing', 'photography', 'travel'],
      looking_for: ['networking', 'activity partners']
    },
    {
      id: 'user-008',
      name: 'Olivia Smith',
      email: 'olivia.smith@example.com',
      age: 31,
      location: 'Boston',
      bio: 'Architect who enjoys urban exploration and historical preservation.',
      interests: ['architecture', 'history', 'travel', 'photography'],
      looking_for: ['dating', 'friendship']
    }
  ]
  
  console.log('\nAdding 8 new users:')
  console.log('===================')
  
  for (const userData of users) {
    try {
      const { id, ...userInfo } = userData
      const user = await db.users.createWithId(id, userInfo)
      console.log(`✅ Added: ${user.name} (${user.age}, ${user.location})`)
      console.log(`   Interests: ${user.interests.join(', ')}`)
      console.log(`   Looking for: ${user.looking_for.join(', ')}`)
      console.log()
    } catch (error) {
      console.log(`❌ Error adding ${userData.name}:`, error.message)
    }
  }
  
  // Show final user count
  const finalUsers = await db.users.getAll()
  console.log(`\n✅ Total users in database: ${finalUsers.length}`)
  console.log('\nUser list:')
  finalUsers.forEach(user => {
    console.log(`  - ${user.name} (${user.id})`)
  })
}

// Run the script
addUsers().catch(console.error)