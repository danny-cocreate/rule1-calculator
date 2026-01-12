#!/usr/bin/env node

/**
 * Test FMP Stable Endpoints
 * Tests the new /stable/ endpoints to see if they work
 */

const axios = require('axios');
const https = require('https');

const API_KEY = '6HhHKgYFoKOlDJqi4THx75eTc6w3N1xq';
const BASE_URL = 'https://financialmodelingprep.com/stable';
const TEST_SYMBOL = 'AAPL';

// Configure axios to handle SSL
const axiosConfig = {
  httpsAgent: new https.Agent({
    rejectUnauthorized: false
  }),
  timeout: 10000
};

console.log('='.repeat(60));
console.log('FMP Stable Endpoints Test');
console.log('='.repeat(60));
console.log(`API Key: ${API_KEY.substring(0, 8)}...${API_KEY.substring(API_KEY.length - 4)}`);
console.log(`Testing symbol: ${TEST_SYMBOL}`);
console.log('');

// Test endpoints to try
const endpoints = [
  { name: 'Profile', path: '/profile', params: { symbol: TEST_SYMBOL, apikey: API_KEY } },
  { name: 'Quote', path: '/quote', params: { symbol: TEST_SYMBOL, apikey: API_KEY } },
  { name: 'Key Metrics TTM', path: '/key-metrics-ttm', params: { symbol: TEST_SYMBOL, apikey: API_KEY } },
  { name: 'Ratios TTM', path: '/ratios-ttm', params: { symbol: TEST_SYMBOL, apikey: API_KEY } },
  { name: 'Income Statement Growth', path: '/income-statement-growth', params: { symbol: TEST_SYMBOL, apikey: API_KEY } },
];

async function testEndpoint(endpoint) {
  console.log(`\nTesting: ${endpoint.name}`);
  console.log('-'.repeat(60));
  try {
    const url = `${BASE_URL}${endpoint.path}`;
    console.log(`URL: ${url}`);
    console.log(`Params: symbol=${endpoint.params.symbol}, apikey=${API_KEY.substring(0, 8)}...`);
    
    const response = await axios.get(url, {
      params: endpoint.params,
      headers: { 'Accept': 'application/json' },
      ...axiosConfig
    });
    
    console.log(`✅ Status: ${response.status}`);
    console.log(`✅ Response type: ${Array.isArray(response.data) ? 'Array' : typeof response.data}`);
    
    if (Array.isArray(response.data) && response.data.length > 0) {
      const data = response.data[0];
      console.log(`✅ Data received. Keys: ${Object.keys(data).slice(0, 10).join(', ')}...`);
      return { success: true, name: endpoint.name, data };
    } else if (response.data && !Array.isArray(response.data)) {
      console.log(`✅ Data received (single object). Keys: ${Object.keys(response.data).slice(0, 10).join(', ')}...`);
      return { success: true, name: endpoint.name, data: response.data };
    } else {
      console.log(`⚠️ Unexpected response format`);
      return { success: false, name: endpoint.name, data: response.data };
    }
  } catch (error) {
    if (error.response) {
      console.log(`❌ Status: ${error.response.status}`);
      console.log(`❌ Status Text: ${error.response.statusText}`);
      console.log(`❌ Response Data:`, JSON.stringify(error.response.data).substring(0, 300));
      
      if (error.response.status === 403) {
        console.log(`\n❌ ERROR: 403 Forbidden`);
      } else if (error.response.status === 404) {
        console.log(`\n⚠️ 404 Not Found - Endpoint may not exist`);
      }
    } else {
      console.log(`❌ Network Error: ${error.message}`);
    }
    return { success: false, name: endpoint.name, error: error.response?.data || error.message };
  }
}

async function runAllTests() {
  console.log('Starting tests...\n');
  
  const results = [];
  for (const endpoint of endpoints) {
    const result = await testEndpoint(endpoint);
    results.push(result);
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('Test Summary');
  console.log('='.repeat(60));
  
  results.forEach(result => {
    console.log(`${result.name}: ${result.success ? '✅ PASSED' : '❌ FAILED'}`);
  });
  
  const passed = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  
  console.log(`\n✅ Passed: ${passed.length}/${results.length}`);
  console.log(`❌ Failed: ${failed.length}/${results.length}`);
  
  if (passed.length > 0) {
    console.log('\n✅ Working endpoints:');
    passed.forEach(r => console.log(`  - ${r.name}`));
  }
  
  if (failed.length > 0) {
    console.log('\n❌ Non-working endpoints:');
    failed.forEach(r => console.log(`  - ${r.name}`));
  }
  
  return passed.length > 0;
}

runAllTests().then(success => {
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error('\n❌ Test runner error:', error);
  process.exit(1);
});
