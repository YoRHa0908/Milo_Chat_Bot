// Script to remove "test user" from the database
const http = require('http');

console.log('Removing "test user" from the database...\n');

async function removeTestUser() {
  // First, get all users to find the test user
  console.log('Fetching all users...');
  
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
          console.log('Error parsing response:', error);
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
  
  console.log(`Found ${allUsers.length} users in database.`);
  
  // Find test user(s)
  const testUsers = allUsers.filter(user => 
    user.name.toLowerCase().includes('test') || 
    user.name.toLowerCase() === 'test user' ||
    user.id.includes('test-convo-user')
  );
  
  if (testUsers.length === 0) {
    console.log('✅ No test users found in database.');
    return;
  }
  
  console.log(`\nFound ${testUsers.length} test user(s):`);
  testUsers.forEach((user, index) => {
    console.log(`${index + 1}. ${user.name} (ID: ${user.id})`);
  });
  
  // Delete each test user
  console.log('\nDeleting test user(s)...');
  
  for (const testUser of testUsers) {
    console.log(`\nDeleting: ${testUser.name} (${testUser.id})...`);
    
    const result = await new Promise((resolve) => {
      const options = {
        hostname: 'localhost',
        port: 3000,
        path: `/api/users?userId=${encodeURIComponent(testUser.id)}`,
        method: 'DELETE',
      };

      const req = http.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          try {
            const response = JSON.parse(data);
            if (res.statusCode === 200) {
              resolve({ success: true, message: response.message });
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

      req.end();
    });
    
    if (result.success) {
      console.log(`✅ ${result.message}`);
    } else {
      console.log(`❌ Failed to delete: ${result.error}`);
    }
  }
  
  // Verify deletion
  console.log('\nVerifying deletion...');
  
  const remainingUsers = await new Promise((resolve) => {
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
  
  const remainingTestUsers = remainingUsers.filter(user => 
    user.name.toLowerCase().includes('test') || 
    user.name.toLowerCase() === 'test user' ||
    user.id.includes('test-convo-user')
  );
  
  if (remainingTestUsers.length === 0) {
    console.log('✅ All test users have been successfully removed!');
    console.log(`\nRemaining users: ${remainingUsers.length}`);
    console.log('\nCurrent user list:');
    remainingUsers.forEach(user => {
      console.log(`  - ${user.name} (${user.age}, ${user.location})`);
    });
  } else {
    console.log(`⚠️ Still found ${remainingTestUsers.length} test user(s) after deletion.`);
  }
}

// Run the script
removeTestUser().catch(console.error);