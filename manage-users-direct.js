// Direct script to manage users in fallback storage
// This works with the localStorage/in-memory fallback system

console.log('Managing users in fallback storage...\n');

// Since we're server-side, we'll work with the in-memory store
// First, let's simulate what the fallback storage does

const serverMemoryStore = {
  users: [],
  chatSessions: [],
  chatMessages: [],
  matches: []
};

// Load existing data from localStorage file if it exists
try {
  const fs = require('fs');
  const path = require('path');
  
  // Check for localStorage backup file
  const localStorageFile = path.join(__dirname, '.localStorageBackup.json');
  
  if (fs.existsSync(localStorageFile)) {
    const data = JSON.parse(fs.readFileSync(localStorageFile, 'utf8'));
    serverMemoryStore.users = data.users || [];
    console.log(`Loaded ${serverMemoryStore.users.length} users from backup file`);
  }
} catch (error) {
  console.log('No localStorage backup file found, starting fresh');
}

// Function to save users
function saveUsers() {
  try {
    const fs = require('fs');
    const path = require('path');
    
    const localStorageFile = path.join(__dirname, '.localStorageBackup.json');
    const data = {
      users: serverMemoryStore.users,
      chatSessions: serverMemoryStore.chatSessions,
      chatMessages: serverMemoryStore.chatMessages,
      matches: serverMemoryStore.matches
    };
    
    fs.writeFileSync(localStorageFile, JSON.stringify(data, null, 2));
    console.log('Users saved to backup file');
  } catch (error) {
    console.log('Error saving to file:', error.message);
  }
}

// Remove any users named "test user" (case insensitive)
console.log('Removing "test user" entries...');
const initialCount = serverMemoryStore.users.length;
serverMemoryStore.users = serverMemoryStore.users.filter(user => 
  !user.name.toLowerCase().includes('test user') && 
  !user.name.toLowerCase().includes('test-user') &&
  !user.name.toLowerCase().includes('testuser')
);

const removedCount = initialCount - serverMemoryStore.users.length;
console.log(`Removed ${removedCount} test user(s)`);

// Add 8 new users
console.log('\nAdding 8 new users...');

const newUsers = [
  {
    id: 'user-' + Date.now() + '-1',
    name: 'Alex Johnson',
    email: 'alex.johnson@example.com',
    age: 28,
    location: 'New York',
    bio: 'Software engineer who loves hiking and photography. Always up for an adventure!',
    interests: ['hiking', 'photography', 'coding', 'travel'],
    looking_for: ['friendship', 'dating'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'user-' + Date.now() + '-2',
    name: 'Maya Chen',
    email: 'maya.chen@example.com',
    age: 32,
    location: 'San Francisco',
    bio: 'Graphic designer and food enthusiast. Love trying new restaurants and cooking classes.',
    interests: ['design', 'cooking', 'art', 'yoga'],
    looking_for: ['friendship', 'networking'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'user-' + Date.now() + '-3',
    name: 'David Wilson',
    email: 'david.wilson@example.com',
    age: 25,
    location: 'Chicago',
    bio: 'Music producer and DJ. Passionate about electronic music and live events.',
    interests: ['music', 'DJing', 'concerts', 'gaming'],
    looking_for: ['friendship', 'activity partners'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'user-' + Date.now() + '-4',
    name: 'Sophia Rodriguez',
    email: 'sophia.rodriguez@example.com',
    age: 30,
    location: 'Miami',
    bio: 'Marine biologist who loves scuba diving and environmental conservation.',
    interests: ['scuba diving', 'environment', 'science', 'reading'],
    looking_for: ['dating', 'activity partners'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'user-' + Date.now() + '-5',
    name: 'James Miller',
    email: 'james.miller@example.com',
    age: 35,
    location: 'Seattle',
    bio: 'Coffee shop owner and book lover. Always reading something new.',
    interests: ['coffee', 'reading', 'writing', 'hiking'],
    looking_for: ['friendship', 'dating'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'user-' + Date.now() + '-6',
    name: 'Emma Thompson',
    email: 'emma.thompson@example.com',
    age: 27,
    location: 'Austin',
    bio: 'Yoga instructor and wellness coach. Passionate about mindfulness and healthy living.',
    interests: ['yoga', 'meditation', 'wellness', 'cooking'],
    looking_for: ['friendship', 'networking'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'user-' + Date.now() + '-7',
    name: 'Carlos Garcia',
    email: 'carlos.garcia@example.com',
    age: 29,
    location: 'Los Angeles',
    bio: 'Film director and screenwriter. Love storytelling in all forms.',
    interests: ['film', 'writing', 'photography', 'travel'],
    looking_for: ['networking', 'activity partners'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'user-' + Date.now() + '-8',
    name: 'Olivia Smith',
    email: 'olivia.smith@example.com',
    age: 31,
    location: 'Boston',
    bio: 'Architect who enjoys urban exploration and historical preservation.',
    interests: ['architecture', 'history', 'travel', 'photography'],
    looking_for: ['dating', 'friendship'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

// Add the new users
newUsers.forEach(user => {
  serverMemoryStore.users.push(user);
  console.log(`✅ Added: ${user.name} (${user.age}, ${user.location})`);
});

// Save all users
saveUsers();

// Show final results
console.log('\n=========================================');
console.log(`Total users in database: ${serverMemoryStore.users.length}`);
console.log('=========================================');

console.log('\nCurrent user list:');
serverMemoryStore.users.forEach((user, index) => {
  console.log(`${index + 1}. ${user.name} (${user.age}, ${user.location})`);
  console.log(`   Interests: ${user.interests.join(', ')}`);
  console.log(`   Looking for: ${user.looking_for.join(', ')}`);
  console.log();
});

console.log('✅ Done! Users have been added to fallback storage.');
console.log('\nNote: Since PostgreSQL is not configured, users are stored in');
console.log('server memory and backed up to .localStorageBackup.json');
console.log('When the server restarts, it will load from this backup file.');