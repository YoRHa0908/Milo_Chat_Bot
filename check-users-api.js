// Simple script to check users API
import http from 'http';

console.log('Checking users API...\n');

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/users',
  method: 'GET',
  headers: {
    'User-Agent': 'Node.js Test Script'
  }
};

const req = http.request(options, (res) => {
  console.log(`Status Code: ${res.statusCode}`);
  console.log(`Status Message: ${res.statusMessage}`);
  console.log(`Headers:`, res.headers);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('\nResponse Body:');
    console.log('==============');
    
    try {
      const response = JSON.parse(data);
      console.log(JSON.stringify(response, null, 2));
      
      if (response.users) {
        console.log(`\n✅ Found ${response.users.length} users in database`);
        if (response.users.length > 0) {
          console.log('\nUser list:');
          response.users.forEach((user, i) => {
            console.log(`${i + 1}. ${user.name} (ID: ${user.id})`);
          });
        }
      } else if (response.error) {
        console.log(`\n❌ Error: ${response.error}`);
      }
    } catch (error) {
      console.log('Could not parse JSON response:');
      console.log(data);
    }
  });
});

req.on('error', (error) => {
  console.log('Request error:', error.message);
});

req.end();