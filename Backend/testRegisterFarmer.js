const fetch = require('node-fetch');

// Function to test user registration for a farmer
async function testRegisterFarmer() {
  console.log('Starting farmer registration test...');
  
  try {
    // Sample user data for farmer registration
    const userData = {
      name: "Farmer John",
      email: "farmer@example.com",
      password: "123456",
      userType: "farmer"
    };

    console.log('Registering farmer with data:', JSON.stringify(userData, null, 2));
    
    // Send POST request to register endpoint
    console.log('Sending request to http://localhost:5001/api/auth/register');
    const response = await fetch('http://localhost:5001/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(userData)
    });

    // Log response status and data
    console.log('Response status:', response.status);
    console.log('Response headers:', JSON.stringify([...response.headers.entries()], null, 2));
    
    const data = await response.json();
    console.log('Response data:', JSON.stringify(data, null, 2));

    if (data.token) {
      console.log('IMPORTANT - Save this token for product testing:', data.token);
    }
    
    if (!response.ok) {
      console.error('Error registering farmer:', data.error || data.message || 'Unknown error');
    } else {
      console.log('Farmer registered successfully!');
    }
  } catch (error) {
    console.error('Error testing farmer registration:');
    console.error(error.message);
    console.error(error.stack);
  }
}

// Run the test
console.log('Script started');
testRegisterFarmer()
  .then(() => console.log('Farmer registration test completed'))
  .catch(err => console.error('Top level error:', err)); 