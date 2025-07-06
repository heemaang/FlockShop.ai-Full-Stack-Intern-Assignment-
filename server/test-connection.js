const axios = require('axios');

async function testServer() {
  console.log('Testing server connection...\n');
  
  try {
    // Test if server is running
    console.log('1. Testing server availability...');
    const testResponse = await axios.get('http://localhost:5000/api/test');
    console.log('✅ Server is running:', testResponse.data);
    
    // Test signup
    console.log('\n2. Testing signup...');
    const signupResponse = await axios.post('http://localhost:5000/api/auth/signup', {
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123'
    });
    console.log('✅ Signup successful:', signupResponse.data);
    
    // Test login
    console.log('\n3. Testing login...');
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'test@example.com',
      password: 'password123'
    });
    console.log('✅ Login successful:', loginResponse.data);
    
    console.log('\n🎉 All tests passed! Server is working correctly.');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Solution: Make sure the server is running with:');
      console.log('   cd server && npm start');
    } else if (error.response) {
      console.log('\n💡 Server responded with error:', error.response.data);
    }
  }
}

testServer(); 