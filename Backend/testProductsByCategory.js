console.log('**************** TEST PRODUCTS BY CATEGORY SCRIPT ****************');
const fetch = require('node-fetch');
console.log('Fetch module loaded');

// Function to test getting products by category
async function testProductsByCategory() {
  console.log('Starting get products by category test...');
  
  try {
    // Category to test
    const category = 'vegetables';
    
    // Send GET request to category endpoint
    const url = `http://localhost:5001/api/products/category/${category}`;
    console.log(`Sending request to ${url}`);
    
    const response = await fetch(url, {
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
      console.error('Error getting products by category:', data.error || data.message || 'Unknown error');
    } else {
      console.log(`Products in "${category}" category retrieved successfully!`);
      console.log('Total products found:', data.count);
      
      // List products found
      if (data.data && data.data.length > 0) {
        console.log('Products:');
        data.data.forEach((product, index) => {
          console.log(`${index + 1}. ${product.name} - $${product.price}`);
        });
      } else {
        console.log('No products found in this category.');
      }
    }
  } catch (error) {
    console.error('Error testing get products by category:');
    console.error(error.message);
    console.error(error.stack);
  }
}

// Run the test
console.log('Script started');
testProductsByCategory()
  .then(() => console.log('Test completed'))
  .catch(err => {
    console.error('Top level error:'); 
    console.error(err.message);
    console.error(err.stack);
  }); 