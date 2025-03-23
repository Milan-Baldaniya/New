console.log('**************** TEST DELETE PRODUCT SCRIPT ****************');
const fetch = require('node-fetch');
console.log('Fetch module loaded');

// Farmer token from login
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3ZGVhZDI5YzI3ZjE4YTFjZDMwNjZmMCIsImlhdCI6MTc0MjY0NjYzMSwiZXhwIjoxNzQ1MjM4NjMxfQ.rtLH-3Dk7JSlzrdGfgQsPpKnlrjAl3eT5XnJ-ENou5k';

// Function to create a test product for deletion
async function createTestProduct() {
  console.log('Creating a test product for deletion...');
  
  try {
    // Sample product data
    const productData = {
      name: "Test Product for Deletion",
      description: "This product will be deleted as part of testing.",
      price: 1.99,
      category: "fruits",
      stock: 10,
      unit: "kg",
      isOrganic: false
    };

    console.log('Sending request with data:', JSON.stringify(productData, null, 2));
    
    // Send POST request to create product
    const response = await fetch('http://localhost:5001/api/products', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(productData)
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('Product created with ID:', data.data._id);
      return data.data._id;
    } else {
      throw new Error(`Failed to create product: ${data.error || data.message || 'Unknown error'}`);
    }
  } catch (error) {
    console.error('Error creating test product:');
    console.error(error.message);
    throw error;
  }
}

// Function to wait for some time
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Function to test deleting a product
async function testDeleteProduct(productId) {
  console.log('Starting delete product test...');
  console.log('Using product ID:', productId);
  
  try {
    // Send DELETE request to delete product
    const url = `http://localhost:5001/api/products/${productId}`;
    console.log(`Sending DELETE request to ${url}`);
    
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    // Log response status and data
    console.log('Response status:', response.status);
    
    const data = await response.json();
    console.log('Response data:', JSON.stringify(data, null, 2));
    
    if (!response.ok) {
      console.error('Error deleting product:', data.error || data.message || 'Unknown error');
    } else {
      console.log('Product deleted successfully!');
    }
  } catch (error) {
    console.error('Error testing delete product:');
    console.error(error.message);
    console.error(error.stack);
  }
}

// Run the test
console.log('Script started');
createTestProduct()
  .then(async productId => {
    console.log('Waiting 2 seconds before deletion...');
    await sleep(2000);
    return testDeleteProduct(productId);
  })
  .then(() => console.log('Test completed'))
  .catch(err => {
    console.error('Top level error:'); 
    console.error(err.message);
    console.error(err.stack);
  }); 