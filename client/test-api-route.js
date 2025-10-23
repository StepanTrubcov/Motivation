// Simple test to verify the API route is working
const testApiRoute = async () => {
  try {
    const response = await fetch('/api/achievement/share', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: 'Test Achievement',
        description: 'This is a test achievement',
        points: 100,
        username: 'testuser'
      })
    });
    
    const data = await response.json();
    console.log('API Response:', data);
    
    if (data.success) {
      console.log('✅ API route is working correctly');
      console.log('Generated URL:', data.url);
    } else {
      console.log('❌ API route returned an error:', data.message);
    }
  } catch (error) {
    console.error('❌ Error testing API route:', error);
  }
};

// Run the test
testApiRoute();