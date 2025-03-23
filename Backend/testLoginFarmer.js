const fetch = require('node-fetch');

// Function to test farmer login
async function testLoginFarmer() {
  console.log('Starting farmer login test...');
  
  try {
    // Farmer login credentials
    const loginData = {
      email: "farmer@example.com",
      password: "123456"
    };

    console.log('Logging in with data:', JSON.stringify(loginData, null, 2));
    
    // Send POST request to login endpoint
    console.log('Sending request to http://localhost:5001/api/auth/login');
    const response = await fetch('http://localhost:5001/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(loginData)
    });

    // Log response status and data
    console.log('Response status:', response.status);
    
    const data = await response.json();
    console.log('Response data:', JSON.stringify(data, null, 2));

    if (data.token) {
      console.log('IMPORTANT - Save this token for product testing:', data.token);
    }
    
    if (!response.ok) {
      console.error('Error logging in as farmer:', data.error || data.message || 'Unknown error');
    } else {
      console.log('Farmer logged in successfully!');
    }
  } catch (error) {
    console.error('Error testing farmer login:');
    console.error(error.message);
    console.error(error.stack);
  }
}

// Run the test
console.log('Script started');
testLoginFarmer()
  .then(() => console.log('Farmer login test completed'))
  .catch(err => console.error('Top level error:', err)); 