// Script to remove the "tiger" user from the database
import http from 'http';

console.log('Removing "tiger" user from the database...\n');

// First, get all users to find the tiger user
const getUsers = () => {
  return new Promise((resolve) => {
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
          console.log('Error parsing response:', error.message);
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
};

// Delete a user by ID
const deleteUser = (userId) => {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: `/api/users?userId=${encodeURIComponent(userId)}`,
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
};

async function main() {
  // Get all users
  const users = await getUsers();
  console.log(`Found ${users.length} users in database.`);
  
  // Find tiger user
  const tigerUser = users.find(user => user.name.toLowerCase() === 'tiger');
  
  if (!tigerUser) {
    console.log('✅ No "tiger" user found in database.');
    console.log('\nCurrent users:');
    users.forEach((user, i) => {
      console.log(`${i + 1}. ${user.name} (ID: ${user.id})`);
    });
    return;
  }
  
  console.log(`Found "tiger" user: ${tigerUser.name} (ID: ${tigerUser.id})`);
  console.log(`Age: ${tigerUser.age}, Location: ${tigerUser.location}`);
  console.log(`Interests: ${tigerUser.interests?.join(', ') || 'None'}`);
  
  // Delete the tiger user
  console.log('\nDeleting "tiger" user...');
  const result = await deleteUser(tigerUser.id);
  
  if (result.success) {
    console.log(`✅ ${result.message}`);
  } else {
    console.log(`❌ Failed to delete: ${result.error}`);
    return;
  }
  
  // Verify deletion
  console.log('\nVerifying deletion...');
  const remainingUsers = await getUsers();
  
  const remainingTiger = remainingUsers.find(user => user.name.toLowerCase() === 'tiger');
  
  if (!remainingTiger) {
    console.log('✅ "tiger" user successfully removed!');
    console.log(`\nRemaining users: ${remainingUsers.length}`);
    
    if (remainingUsers.length === 8) {
      console.log('🎉 Perfect! Database now has exactly 8 users (no test users).');
    } else {
      console.log(`⚠️  Database has ${remainingUsers.length} users (expected 8).`);
    }
    
    console.log('\nCurrent user list:');
    remainingUsers.forEach((user, i) => {
      console.log(`${i + 1}. ${user.name} (${user.age}, ${user.location})`);
    });
  } else {
    console.log('❌ "tiger" user still exists in database.');
  }
}

main().catch(console.error);