#!/usr/bin/env node

/**
 * Test Backend Connection
 * Tests if the Scuttlebutt backend is accessible
 */

const axios = require('axios');
const https = require('https');

// Test URLs (try both HTTP and HTTPS)
const TEST_URLS = [
  'https://srv999305.hstgr.cloud:8000',
  'http://srv999305.hstgr.cloud:8000',
  'https://srv999305.hstgr.cloud',
  'http://srv999305.hstgr.cloud',
];

const axiosConfig = {
  httpsAgent: new https.Agent({
    rejectUnauthorized: false
  }),
  timeout: 10000
};

async function testEndpoint(baseUrl) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`Testing: ${baseUrl}`);
  console.log('='.repeat(60));
  
  // Test health endpoint
  try {
    console.log(`\n1. Testing /health endpoint...`);
    const healthResponse = await axios.get(`${baseUrl}/health`, {
      ...axiosConfig
    });
    console.log(`✅ Health check: ${healthResponse.status} ${healthResponse.statusText}`);
    console.log(`   Response:`, JSON.stringify(healthResponse.data));
    return { success: true, url: baseUrl, endpoint: 'health' };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.code === 'ECONNREFUSED') {
        console.log(`❌ Connection refused - Backend not running or wrong port`);
      } else if (error.code === 'ETIMEDOUT' || error.code === 'ECONNABORTED') {
        console.log(`❌ Connection timeout - Firewall blocking or backend not accessible`);
      } else if (error.code === 'ENOTFOUND') {
        console.log(`❌ DNS error - Hostname not found`);
      } else if (error.response) {
        console.log(`⚠️  Got response: ${error.response.status} ${error.response.statusText}`);
        console.log(`   This means the server is reachable but endpoint might be wrong`);
      } else {
        console.log(`❌ Error: ${error.code || error.message}`);
      }
    } else {
      console.log(`❌ Unknown error: ${error.message}`);
    }
    return { success: false, url: baseUrl, error: error.message };
  }
}

async function testFisherResearch(baseUrl) {
  console.log(`\n2. Testing /fisher-research endpoint...`);
  try {
    const response = await axios.post(
      `${baseUrl}/fisher-research`,
      {
        symbol: 'AAPL',
        companyName: 'Apple Inc.',
        criteriaToResearch: [1, 2, 3]
      },
      {
        headers: { 'Content-Type': 'application/json' },
        ...axiosConfig,
        timeout: 5000 // Short timeout for quick test
      }
    );
    console.log(`✅ Fisher research: ${response.status} ${response.statusText}`);
    return { success: true, url: baseUrl, endpoint: 'fisher-research' };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        console.log(`⚠️  Got response: ${error.response.status}`);
        console.log(`   This means the endpoint exists but might have validation errors`);
        return { success: true, url: baseUrl, endpoint: 'fisher-research', warning: true };
      } else {
        console.log(`❌ Network error: ${error.code || error.message}`);
      }
    } else {
      console.log(`❌ Error: ${error.message}`);
    }
    return { success: false, url: baseUrl, error: error.message };
  }
}

async function runAllTests() {
  console.log('Backend Connection Diagnostic Tool');
  console.log('Testing Scuttlebutt backend accessibility...\n');
  
  const results = [];
  
  for (const url of TEST_URLS) {
    const healthResult = await testEndpoint(url);
    results.push(healthResult);
    
    // Only test fisher-research if health check passed
    if (healthResult.success) {
      await testFisherResearch(url);
    }
    
    // Small delay between tests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log(`\n${'='.repeat(60)}`);
  console.log('Summary');
  console.log('='.repeat(60));
  
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  
  if (successful.length > 0) {
    console.log(`\n✅ Working URLs:`);
    successful.forEach(r => {
      console.log(`   - ${r.url} (${r.endpoint})`);
    });
  }
  
  if (failed.length > 0) {
    console.log(`\n❌ Failed URLs:`);
    failed.forEach(r => {
      console.log(`   - ${r.url}: ${r.error || 'Connection failed'}`);
    });
  }
  
  if (successful.length === 0) {
    console.log(`\n⚠️  No working URLs found. Possible issues:`);
    console.log(`   1. Backend is not running on the VPS`);
    console.log(`   2. Port 8000 is blocked by firewall`);
    console.log(`   3. Backend is on a different port`);
    console.log(`   4. Backend requires authentication`);
    console.log(`   5. DNS/hostname issue`);
  }
  
  return successful.length > 0;
}

runAllTests().then(success => {
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error('\n❌ Test runner error:', error);
  process.exit(1);
});
