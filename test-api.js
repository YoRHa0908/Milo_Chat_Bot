// Test the chat API endpoint
const http = require('http');

const testData = {
  message: 'Hello, this is a test message',
  userId: 'test-user-' + Date.now(),
  userName: 'Test User'
};

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/chat',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  }
};

const req = http.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const response = JSON.parse(data);
      console.log('Response:', JSON.stringify(response, null, 2));
      
      if (res.statusCode === 200) {
        console.log('\n✅ Chat API test passed!');
        console.log('Response received:', response.response?.substring(0, 50) + '...');
        console.log('Session ID:', response.sessionId);
      } else {
        console.log('\n❌ Chat API test failed with error:', response.error);
        if (response.details) {
          console.log('Error details:', response.details);
        }
      }
    } catch (error) {
      console.error('Error parsing response:', error);
      console.log('Raw response:', data);
    }
  });
});

req.on('error', (error) => {
  console.error('Request error:', error.message);
  
  if (error.code === 'ECONNREFUSED') {
    console.log('\n⚠️  Server might not be running. Start it with:');
    console.log('  cd milo-app && npm run dev');
  }
});

req.write(JSON.stringify(testData));
req.end();

console.log('Testing chat API...');
console.log('Sending request:', JSON.stringify(testData, null, 2));