console.log('**************** TEST UPDATE PRODUCT SCRIPT ****************');
const fetch = require('node-fetch');
console.log('Fetch module loaded');

// Function to test updating a product
async function testUpdateProduct() {
  console.log('Starting update product test...');
  
  try {
    // Farmer token from login
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3ZGVhZDI5YzI3ZjE4YTFjZDMwNjZmMCIsImlhdCI6MTc0MjY0NjYzMSwiZXhwIjoxNzQ1MjM4NjMxfQ.rtLH-3Dk7JSlzrdGfgQsPpKnlrjAl3eT5XnJ-ENou5k';
    
    // Product ID from the previous test
    const productId = '67dead81c27f18a1cd3066f6';
    console.log('Using product ID:', productId);
    
    // Updated product data
    const updatedData = {
      name: "Premium Organic Tomatoes",
      description: "Locally grown, premium organic tomatoes harvested from our sustainable farm. Rich in flavor and nutrients. Now with improved quality!",
      price: 3.49,
      stock: 75
    };

    console.log('Sending update request with data:', JSON.stringify(updatedData, null, 2));
    console.log('Using farmer token for authorization');
    
    // Send PUT request to update product
    const url = `http://localhost:5001/api/products/${productId}`;
    console.log(`Sending request to ${url}`);
    
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(updatedData)
    });

    // Log response status and data
    console.log('Response status:', response.status);
    console.log('Response headers:', JSON.stringify([...response.headers.entries()], null, 2));
    
    const data = await response.json();
    console.log('Response data:', JSON.stringify(data, null, 2));
    
    if (!response.ok) {
      console.error('Error updating product:', data.error || data.message || 'Unknown error');
    } else {
      console.log('Product updated successfully!');
      console.log('Updated product name:', data.data.name);
      console.log('Updated product price:', data.data.price);
    }
  } catch (error) {
    console.error('Error testing update product:');
    console.error(error.message);
    console.error(error.stack);
  }
}

// Run the test
console.log('Script started');
testUpdateProduct()
  .then(() => console.log('Test completed'))
  .catch(err => {
    console.error('Top level error:'); 
    console.error(err.message);
    console.error(err.stack);
  }); 