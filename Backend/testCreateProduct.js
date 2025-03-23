const fetch = require('node-fetch');

// Function to test product creation
async function testCreateProduct() {
  try {
    // Farmer token from login
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3ZGVhZDI5YzI3ZjE4YTFjZDMwNjZmMCIsImlhdCI6MTc0MjY0NjYzMSwiZXhwIjoxNzQ1MjM4NjMxfQ.rtLH-3Dk7JSlzrdGfgQsPpKnlrjAl3eT5XnJ-ENou5k';
    
    console.log('Starting product creation test as farmer...');
    // Sample product data
    const productData = {
      name: "Fresh Organic Tomatoes",
      description: "Locally grown, organic tomatoes harvested from our sustainable farm. Rich in flavor and nutrients.",
      price: 2.99,
      category: "vegetables",
      stock: 50,
      unit: "kg",
      isOrganic: true
    };

    console.log('Sending request with data:', JSON.stringify(productData, null, 2));
    console.log('Using farmer token for authorization');
    
    // Send POST request to create product
    const response = await fetch('http://localhost:5001/api/products', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(productData)
    });

    // Log response status and data
    console.log('Response status:', response.status);
    console.log('Response headers:', JSON.stringify([...response.headers.entries()], null, 2));
    
    const data = await response.json();
    console.log('Response data:', JSON.stringify(data, null, 2));
    
    if (!response.ok) {
      console.error('Error creating product:', data.error || data.message || 'Unknown error');
    } else {
      console.log('Product created successfully!');
      console.log('Product ID:', data.data._id);
    }
  } catch (error) {
    console.error('Error testing product creation:');
    console.error(error.message);
    console.error(error.stack);
  }
}

// Run the test
console.log('Script started');
testCreateProduct()
  .then(() => console.log('Test completed'))
  .catch(err => console.error('Top level error:', err)); 