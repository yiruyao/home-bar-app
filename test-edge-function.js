// Simple test script to check if the Edge Function is working
const testImageGeneration = async () => {
  try {
    console.log('🧪 Testing Edge Function...');
    
    const response = await fetch('https://pijqlyzuavxgxcqblykx.supabase.co/functions/v1/generate-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBpanFseXp1YXZ4Z3hjcWJseWt4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQwMDI3NzgsImV4cCI6MjA2OTU3ODc3OH0.QkSeXVfJI2muDUj9RLIfCxZRYT8VugkuO6zfZv5dpPI`,
      },
      body: JSON.stringify({ 
        prompt: 'A simple test bottle with clear liquid, professional photography, white background' 
      }),
    });
    
    console.log('Response status:', response.status, response.statusText);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response:', errorText);
      return;
    }
    
    const data = await response.json();
    console.log('✅ Success! Response:', data);
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
};

testImageGeneration();