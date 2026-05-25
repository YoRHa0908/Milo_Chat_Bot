// Simple script to add users via API calls
const http = require('http');

console.log('Adding 8 users to the database via API...\n');

const users = [
  {
    name: 'Alex Johnson',
    email: 'alex.johnson@example.com',
    age: 28,
    location: 'New York',
    bio: 'Software engineer who loves hiking and photography. Always up for an adventure!',
    interests: ['hiking', 'photography', 'coding', 'travel'],
    looking_for: ['friendship', 'dating']
  },
  {
    name: 'Maya Chen',
    email: 'maya.chen@example.com',
    age: 32,
    location: 'San Francisco',
    bio: 'Graphic designer and food enthusiast. Love trying new restaurants and cooking classes.',
    interests: ['design', 'cooking', 'art', 'yoga'],
    looking_for: ['friendship', 'networking']
  },
  {
    name: 'David Wilson',
    email: 'david.wilson@example.com',
    age: 25,
    location: 'Chicago',
    bio: 'Music producer and DJ. Passionate about electronic music and live events.',
    interests: ['music', 'DJing', 'concerts', 'gaming'],
    looking_for: ['friendship', 'activity partners']
  },
  {
    name: 'Sophia Rodriguez',
    email: 'sophia.rodriguez@example.com',
    age: 30,
    location: 'Miami',
    bio: 'Marine biologist who loves scuba diving and environmental conservation.',
    interests: ['scuba diving', 'environment', 'science', 'reading'],
    looking_for: ['dating', 'activity partners']
  },
  {
    name: 'James Miller',
    email: 'james.miller@example.com',
    age: 35,
    location: 'Seattle',
    bio: 'Coffee shop owner and book lover. Always reading something new.',
    interests: ['coffee', 'reading', 'writing', 'hiking'],
    looking_for: ['friendship', 'dating']
  },
  {
    name: 'Emma Thompson',
    email: 'emma.thompson@example.com',
    age: 27,
    location: 'Austin',
    bio: 'Yoga instructor and wellness coach. Passionate about mindfulness and healthy living.',
    interests: ['yoga', 'meditation', 'wellness', 'cooking'],
    looking_for: ['friendship', 'networking']
  },
  {
    name: 'Carlos Garcia',
    email: 'carlos.garcia@example.com',
    age: 29,
    location: 'Los Angeles',
    bio: 'Film director and screenwriter. Love storytelling in all forms.',
    interests: ['film', 'writing', 'photography', 'travel'],
    looking_for: ['networking', 'activity partners']
  },
  {
    name: 'Olivia Smith',
    email: 'olivia.smith@example.com',
    age: 31,
    location: 'Boston',
    bio: 'Architect who enjoys urban exploration and historical preservation.',
    interests: ['architecture', 'history', 'travel', 'photography'],
    looking_for: ['dating', 'friendship']
  }
];

function createUser(userData) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/users',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          if (res.statusCode === 200 || res.statusCode === 201) {
            resolve({ success: true, user: response });
          } else {
            resolve({ success: false, error: response.error || 'Unknown error' });
          }
        } catch (error) {
          resolve({ success: false, error: 'Parse error' });
        }
      });
    });

    req.on('error', (error) => {
      resolve({ success: false, error: error.message });
    });

    req.write(JSON.stringify(userData));
    req.end();
  });
}

async function addAllUsers() {
  console.log('Adding 8 users:');
  console.log('===============\n');
  
  let successCount = 0;
  let failCount = 0;
  
  for (let i = 0; i < users.length; i++) {
    const userData = users[i];
    console.log(`Adding user ${i + 1}: ${userData.name}...`);
    
    const result = await createUser(userData);
    
    if (result.success) {
      console.log(`✅ Successfully added: ${userData.name}`);
      console.log(`   Age: ${userData.age}, Location: ${userData.location}`);
      console.log(`   Interests: ${userData.interests.join(', ')}`);
      console.log(`   Looking for: ${userData.looking_for.join(', ')}`);
      successCount++;
    } else {
      console.log(`❌ Failed to add ${userData.name}: ${result.error}`);
      failCount++;
    }
    console.log();
  }
  
  console.log('=========================================');
  console.log(`Results: ${successCount} users added successfully, ${failCount} failed`);
  console.log('=========================================');
  
  // Also test getting all users
  console.log('\nFetching all users to verify...');
  
  const allUsers = await new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/users',
      method: 'GET',
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          resolve(response.users || []);
        } catch (error) {
          resolve([]);
        }
      });
    });

    req.on('error', () => {
      resolve([]);
    });

    req.end();
  });
  
  console.log(`Total users in database: ${allUsers.length}`);
  
  // Check for "test user" and remove if found
  const testUser = allUsers.find(user => user.name.toLowerCase() === 'test user');
  if (testUser) {
    console.log(`\n⚠️ Found "test user" with ID: ${testUser.id}`);
    console.log('Note: User removal would require DELETE API endpoint implementation');
  } else {
    console.log('\n✅ No "test user" found in database.');
  }
}

// Run the script
addAllUsers().catch(console.error);