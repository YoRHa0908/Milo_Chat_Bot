// Script to add a newly registered user to the database
import http from 'http';

console.log('Adding a newly registered user to the database...\n');

// New user data (simulating a user who just registered)
const newUser = {
  name: 'Sarah Williams',
  email: 'sarah.williams@example.com',
  age: 29,
  location: 'Portland, Oregon',
  bio: 'Environmental scientist passionate about sustainability and outdoor adventures. Love hiking, gardening, and sustainable living.',
  interests: ['hiking', 'gardening', 'environment', 'science', 'yoga', 'reading'],
  looking_for: ['friendship', 'activity partners', 'networking']
};

console.log('New user details:');
console.log('=================');
console.log(`Name: ${newUser.name}`);
console.log(`Email: ${newUser.email}`);
console.log(`Age: ${newUser.age}`);
console.log(`Location: ${newUser.location}`);
console.log(`Bio: ${newUser.bio.substring(0, 100)}...`);
console.log(`Interests: ${newUser.interests.join(', ')}`);
console.log(`Looking for: ${newUser.looking_for.join(', ')}`);
console.log('');

// Function to add user via API
function addUserViaAPI(userData) {
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
        console.log(`API Response Status: ${res.statusCode}`);
        
        try {
          const response = JSON.parse(data);
          if (res.statusCode === 200 || res.statusCode === 201) {
            console.log('✅ User added successfully via API');
            console.log(`User ID: ${response.user?.id}`);
            console.log(`Storage: ${response.storageInfo?.savedTo || 'unknown'}`);
            resolve({ success: true, user: response.user });
          } else {
            console.log(`❌ API Error: ${response.error || 'Unknown error'}`);
            resolve({ success: false, error: response.error });
          }
        } catch (error) {
          console.log('❌ Error parsing API response:', error.message);
          console.log('Raw response:', data);
          resolve({ success: false, error: 'Parse error' });
        }
      });
    });

    req.on('error', (error) => {
      console.log('❌ Request error:', error.message);
      resolve({ success: false, error: error.message });
    });

    req.write(JSON.stringify(userData));
    req.end();
  });
}

// Function to check current users
function getCurrentUsers() {
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
          console.log('Error parsing users response:', error.message);
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
}

async function main() {
  console.log('Checking current users before adding new user...');
  const usersBefore = await getCurrentUsers();
  console.log(`Current users in database: ${usersBefore.length}`);
  
  // Check if user already exists
  const existingUser = usersBefore.find(user => 
    user.email === newUser.email || user.name.toLowerCase() === newUser.name.toLowerCase()
  );
  
  if (existingUser) {
    console.log(`\n⚠️ User "${newUser.name}" already exists in database:`);
    console.log(`   ID: ${existingUser.id}`);
    console.log(`   Email: ${existingUser.email}`);
    console.log('Skipping addition...');
    return;
  }
  
  console.log('\nAdding new user to database...');
  const result = await addUserViaAPI(newUser);
  
  if (result.success) {
    console.log('\n✅ New user added successfully!');
    
    // Verify the addition
    console.log('\nVerifying user addition...');
    const usersAfter = await getCurrentUsers();
    console.log(`Users after addition: ${usersAfter.length}`);
    
    const addedUser = usersAfter.find(user => 
      user.email === newUser.email || user.name.toLowerCase() === newUser.name.toLowerCase()
    );
    
    if (addedUser) {
      console.log('🎉 User successfully verified in database!');
      console.log(`\nNew user details in database:`);
      console.log(`   ID: ${addedUser.id}`);
      console.log(`   Name: ${addedUser.name}`);
      console.log(`   Email: ${addedUser.email}`);
      console.log(`   Age: ${addedUser.age}`);
      console.log(`   Location: ${addedUser.location}`);
      console.log(`   Created: ${new Date(addedUser.created_at).toLocaleString()}`);
    } else {
      console.log('⚠️ User not found in database after addition');
    }
    
    console.log('\n📊 Database Summary:');
    console.log('===================');
    console.log(`Total users: ${usersAfter.length}`);
    console.log(`New user count: ${usersAfter.length - usersBefore.length}`);
    
    // List all users
    console.log('\nAll users in database:');
    usersAfter.forEach((user, i) => {
      console.log(`${i + 1}. ${user.name} (${user.age}, ${user.location})`);
    });
  } else {
    console.log('\n❌ Failed to add new user.');
    console.log('Trying alternative method...');
    
    // Try direct localStorage backup method
    await addUserDirectly();
  }
}

// Alternative method: Add user directly to localStorage backup
async function addUserDirectly() {
  console.log('\nTrying direct addition to localStorage backup...');
  
  try {
    const fs = await import('fs');
    const path = await import('path');
    
    const backupFile = path.join(process.cwd(), '.localStorageBackup.json');
    
    if (fs.existsSync(backupFile)) {
      const backupData = JSON.parse(fs.readFileSync(backupFile, 'utf8'));
      
      // Generate unique ID
      const userId = Date.now().toString() + Math.random().toString(36).substring(2, 11);
      const now = new Date().toISOString();
      
      const userToAdd = {
        id: userId,
        name: newUser.name,
        email: newUser.email,
        age: newUser.age,
        location: newUser.location,
        bio: newUser.bio,
        interests: newUser.interests,
        looking_for: newUser.looking_for,
        created_at: now,
        updated_at: now
      };
      
      // Add to users array
      backupData.users.push(userToAdd);
      
      // Save back to file
      fs.writeFileSync(backupFile, JSON.stringify(backupData, null, 2));
      
      console.log('✅ User added directly to localStorage backup file!');
      console.log(`User ID: ${userId}`);
      console.log(`Backup file updated: ${backupFile}`);
      
      // Need to restart server to load the new user
      console.log('\n⚠️ Note: Server needs to be restarted to load this user.');
      console.log('The user will be available after server restart.');
    } else {
      console.log('❌ Backup file not found:', backupFile);
    }
  } catch (error) {
    console.log('❌ Error adding user directly:', error.message);
  }
}

// Run the script
main().catch(console.error);