const fetch = require('node-fetch');

// Function to test getting all products
async function testGetProducts() {
  console.log('Starting get products test...');
  
  try {
    // Send GET request to products endpoint
    console.log('Sending request to http://localhost:5001/api/products');
    const response = await fetch('http://localhost:5001/api/products', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Log response status and data
    console.log('Response status:', response.status);
    
    const data = await response.json();
    console.log('Response data:', JSON.stringify(data, null, 2));
    
    if (!response.ok) {
      console.error('Error getting products:', data.error || data.message || 'Unknown error');
    } else {
      console.log('Products retrieved successfully!');
      console.log('Total products:', data.count);
    }
  } catch (error) {
    console.error('Error testing get products:');
    console.error(error.message);
    console.error(error.stack);
  }
}

// Run the test
console.log('Script started');
testGetProducts()
  .then(() => console.log('Test completed'))
  .catch(err => console.error('Top level error:', err)); 