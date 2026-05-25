// Test conversation flow with mock AI
const http = require('http');

console.log('Testing conversation flow with improved mock AI...\n');

const userId = 'test-convo-user-' + Date.now();
let sessionId = '';

async function sendMessage(message, userName = 'Test User') {
  return new Promise((resolve) => {
    const testData = {
      message: message,
      userId: userId,
      userName: userName
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
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          if (res.statusCode === 200) {
            sessionId = response.sessionId || sessionId;
            resolve({ success: true, response: response.response });
          } else {
            resolve({ success: false, error: response.error });
          }
        } catch (error) {
          resolve({ success: false, error: 'Parse error' });
        }
      });
    });

    req.on('error', (error) => {
      resolve({ success: false, error: error.message });
    });

    req.write(JSON.stringify(testData));
    req.end();
  });
}

async function runConversationTest() {
  console.log('=== Conversation Test ===\n');
  
  // Test 1: Initial greeting
  console.log('User: Hello');
  const result1 = await sendMessage('Hello');
  if (result1.success) {
    console.log('AI:', result1.response);
    console.log('');
  } else {
    console.log('Error:', result1.error);
    return;
  }
  
  // Test 2: Respond to AI's question about connection type
  console.log('User: I\'m looking for friendship');
  const result2 = await sendMessage('I\'m looking for friendship');
  if (result2.success) {
    console.log('AI:', result2.response);
    console.log('');
  } else {
    console.log('Error:', result2.error);
    return;
  }
  
  // Test 3: Share interests
  console.log('User: I enjoy reading and hiking');
  const result3 = await sendMessage('I enjoy reading and hiking');
  if (result3.success) {
    console.log('AI:', result3.response);
    console.log('');
  } else {
    console.log('Error:', result3.error);
    return;
  }
  
  // Test 4: Respond to age question
  console.log('User: Maybe 25-35');
  const result4 = await sendMessage('Maybe 25-35');
  if (result4.success) {
    console.log('AI:', result4.response);
    console.log('');
  } else {
    console.log('Error:', result4.error);
    return;
  }
  
  // Test 5: Respond to location question
  console.log('User: I prefer nearby connections');
  const result5 = await sendMessage('I prefer nearby connections');
  if (result5.success) {
    console.log('AI:', result5.response);
    console.log('');
  } else {
    console.log('Error:', result5.error);
    return;
  }
  
  // Test 6: Respond to qualities question
  console.log('User: Kindness and sense of humor are important');
  const result6 = await sendMessage('Kindness and sense of humor are important');
  if (result6.success) {
    console.log('AI:', result6.response);
    console.log('');
  } else {
    console.log('Error:', result6.error);
    return;
  }
  
  // Test 7: Ask for matches
  console.log('User: Can you find matches for me?');
  const result7 = await sendMessage('Can you find matches for me?');
  if (result7.success) {
    console.log('AI:', result7.response);
    console.log('');
  } else {
    console.log('Error:', result7.error);
    return;
  }
  
  console.log('=== Test Complete ===');
  console.log('\n✅ Conversation flow test completed!');
  console.log('The AI should have:');
  console.log('1. Started with introduction');
  console.log('2. Asked about connection type');
  console.log('3. Asked about interests');
  console.log('4. Asked about age range');
  console.log('5. Asked about location');
  console.log('6. Asked about qualities');
  console.log('7. Directed to "Get Matches" button');
  console.log('\nSession ID:', sessionId);
}

runConversationTest().catch(console.error);