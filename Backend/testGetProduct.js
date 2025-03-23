console.log('**************** TEST GET PRODUCT SCRIPT ****************');
const fetch = require('node-fetch');
console.log('Fetch module loaded');

// Function to test getting a single product by ID
async function testGetProduct() {
  console.log('Starting get single product test...');
  
  try {
    // Product ID from the previous test
    const productId = '67dead81c27f18a1cd3066f6';
    console.log('Using product ID:', productId);
    
    // Send GET request to products/:id endpoint
    const url = `http://localhost:5001/api/products/${productId}`;
    console.log(`Sending request to ${url}`);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Log response status and data
    console.log('Response status:', response.status);
    console.log('Response headers:', JSON.stringify([...response.headers.entries()], null, 2));
    
    const data = await response.json();
    console.log('Response data:', JSON.stringify(data, null, 2));
    
    if (!response.ok) {
      console.error('Error getting product:', data.error || data.message || 'Unknown error');
    } else {
      console.log('Product retrieved successfully!');
      if (data.data) {
        console.log('Product name:', data.data.name);
        console.log('Farmer name:', data.data.farmer ? data.data.farmer.name : 'Unknown');
      } else {
        console.log('No product data received in the response');
      }
    }
  } catch (error) {
    console.error('Error testing get product:');
    console.error(error.message);
    console.error(error.stack);
  }
}

// Run the test
console.log('Script started');
testGetProduct()
  .then(() => console.log('Test completed'))
  .catch(err => {
    console.error('Top level error:'); 
    console.error(err.message);
    console.error(err.stack);
  }); 