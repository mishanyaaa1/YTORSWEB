async function testAPI() {
  try {
    console.log('Testing API...');
    
    // Test basic endpoint
    const testResponse = await fetch('http://localhost:3001/api/test');
    const testData = await testResponse.json();
    console.log('Test endpoint:', testData);
    
    // Test vehicles endpoint
    const vehiclesResponse = await fetch('http://localhost:3001/api/vehicles');
    const vehiclesData = await vehiclesResponse.json();
    console.log('Vehicles endpoint:', vehiclesData);
    
  } catch (error) {
    console.error('Error:', error);
  }
}

testAPI();
