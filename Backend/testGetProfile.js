const fetch = require('node-fetch');

// Replace with the token you received from login
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3ZGVhYjJmZTlhZmY5NjcxMmIzNTllMyIsImlhdCI6MTc0MjY0NjA5MSwiZXhwIjoxNzQ1MjM4MDkxfQ.kFsbmjXONvKpnUQIopk2H-p3thZwmv0iJIukZ_gxw-I';

const testGetProfile = async () => {
  try {
    const response = await fetch('http://localhost:5001/api/auth/me', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();
    console.log('Response status:', response.status);
    console.log('Response data:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error:', error.message);
  }
};

testGetProfile(); 