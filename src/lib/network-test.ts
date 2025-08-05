// Network diagnostic tool for Claude API connectivity

export const runNetworkDiagnostics = async () => {
  console.log('🏥 Starting Claude API Network Diagnostics...');
  
  const results = {
    internet: false,
    anthropicReachable: false,
    apiEndpoint: false,
    corsHeaders: false
  };

  // Test 1: Basic Internet Connectivity
  try {
    console.log('🧪 Test 1: Basic Internet Connectivity');
    const response = await fetch('https://httpbin.org/get', { 
      method: 'GET',
      timeout: 5000 
    });
    results.internet = response.ok;
    console.log(results.internet ? '✅ Internet: Connected' : '❌ Internet: Failed');
  } catch (error) {
    console.log('❌ Internet: Failed -', error.message);
  }

  // Test 2: Can reach Anthropic domain
  try {
    console.log('🧪 Test 2: Anthropic Domain Reachability');
    const response = await fetch('https://anthropic.com', { 
      method: 'HEAD',
      timeout: 5000 
    });
    results.anthropicReachable = response.ok;
    console.log(results.anthropicReachable ? '✅ Anthropic: Reachable' : '❌ Anthropic: Unreachable');
  } catch (error) {
    console.log('❌ Anthropic: Unreachable -', error.message);
  }

  // Test 3: API Endpoint accessibility (without auth)
  try {
    console.log('🧪 Test 3: API Endpoint Test');
    const response = await fetch('https://api.anthropic.com/v1/messages', { 
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ test: true }),
      timeout: 5000 
    });
    // We expect a 401 or 400, not a network error
    results.apiEndpoint = response.status === 401 || response.status === 400;
    console.log(results.apiEndpoint ? '✅ API Endpoint: Accessible' : `❌ API Endpoint: Status ${response.status}`);
  } catch (error) {
    console.log('❌ API Endpoint: Network Error -', error.message);
  }

  // Test 4: CORS Headers check
  try {
    console.log('🧪 Test 4: CORS Headers Test');
    const response = await fetch('https://api.anthropic.com/v1/messages', { 
      method: 'OPTIONS',
      timeout: 5000 
    });
    results.corsHeaders = response.ok;
    console.log(results.corsHeaders ? '✅ CORS: Supported' : '❌ CORS: Blocked');
  } catch (error) {
    console.log('❌ CORS: Error -', error.message);
  }

  // Summary
  console.log('📊 Diagnostic Summary:', results);
  
  if (!results.internet) {
    console.log('🔥 CRITICAL: No internet connectivity in simulator');
  } else if (!results.anthropicReachable) {
    console.log('🔥 CRITICAL: Cannot reach Anthropic servers');
  } else if (!results.apiEndpoint) {
    console.log('🔥 CRITICAL: API endpoint blocked by network/firewall');
  } else {
    console.log('✅ DIAGNOSIS: Network connectivity looks good - API key or request format issue');
  }

  return results;
};

// Quick API test with actual credentials
export const testClaudeAPIConnection = async (apiKey: string) => {
  console.log('🧪 Testing actual Claude API connection...');
  
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 10,
        messages: [{ role: 'user', content: 'Hi' }]
      })
    });

    console.log('📡 API Response Status:', response.status);
    console.log('📡 API Response Headers:', Object.fromEntries(response.headers.entries()));

    if (response.ok) {
      const data = await response.json();
      console.log('✅ API Connection: SUCCESS');
      console.log('📄 Response:', data);
      return true;
    } else {
      const errorText = await response.text();
      console.log('❌ API Connection: FAILED');
      console.log('📄 Error Response:', errorText);
      return false;
    }
  } catch (error) {
    console.log('❌ API Connection: NETWORK ERROR');
    console.log('📄 Error Details:', error);
    return false;
  }
};