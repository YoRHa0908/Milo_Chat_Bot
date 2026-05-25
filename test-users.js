// Quick test to check users in database
import http from 'http';

console.log('Testing users API...\n');

// Test 1: Get all users
console.log('1. Getting all users...');
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
      console.log(`Status: ${res.statusCode}`);
      try {
        const response = JSON.parse(data);
        console.log(`Response:`, response);
        resolve(response.users || []);
      } catch (error) {
        console.log('Parse error:', error.message);
        console.log('Raw data:', data);
        resolve([]);
      }
    });
  });

  req.on('error', (error) => {
    console.log('Request error:', error.message);
    resolve([]);
  });

  req.end();
});

console.log(`\nTotal users: ${allUsers.length}`);
if (allUsers.length > 0) {
  console.log('\nUser list:');
  allUsers.forEach((user, i) => {
    console.log(`${i + 1}. ${user.name} (ID: ${user.id})`);
  });
}

// Test 2: Create a test user
console.log('\n\n2. Creating a test user...');
const testUserData = {
  name: 'Test User To Delete',
  email: 'test.delete@example.com',
  age: 25,
  location: 'Test City',
  bio: 'This is a test user that should be deleted',
  interests: ['testing', 'debugging'],
  looking_for: ['friendship']
};

const createResult = await new Promise((resolve) => {
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
      console.log(`Status: ${res.statusCode}`);
      try {
        const response = JSON.parse(data);
        console.log('Response:', response);
        resolve({ success: res.statusCode === 200 || res.statusCode === 201, response });
      } catch (error) {
        console.log('Parse error:', error.message);
        resolve({ success: false, error: error.message });
      }
    });
  });

  req.on('error', (error) => {
    console.log('Request error:', error.message);
    resolve({ success: false, error: error.message });
  });

  req.write(JSON.stringify(testUserData));
  req.end();
});

if (createResult.success && createResult.response.user) {
  const testUserId = createResult.response.user.id;
  
  // Test 3: Delete the test user
  console.log('\n\n3. Deleting the test user...');
  const deleteResult = await new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: `/api/users?userId=${encodeURIComponent(testUserId)}`,
      method: 'DELETE',
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log(`Status: ${res.statusCode}`);
        try {
          const response = JSON.parse(data);
          console.log('Response:', response);
          resolve({ success: res.statusCode === 200, response });
        } catch (error) {
          console.log('Parse error:', error.message);
          resolve({ success: false, error: error.message });
        }
      });
    });

    req.on('error', (error) => {
      console.log('Request error:', error.message);
      resolve({ success: false, error: error.message });
    });

    req.end();
  });
  
  if (deleteResult.success) {
    console.log('✅ Test user created and deleted successfully!');
  } else {
    console.log('❌ Failed to delete test user');
  }
}

console.log('\n\nTest complete!');