#!/usr/bin/env node

/**
 * Direct FMP API Test
 * Tests the API key directly to verify it works
 */

const axios = require('axios');
const https = require('https');

// Configure axios to handle SSL certificates
const axiosConfig = {
  httpsAgent: new https.Agent({
    rejectUnauthorized: false // Allow self-signed certificates for testing
  }),
  timeout: 10000
};

const API_KEY = '6HhHKgYFoKOlDJqi4THx75eTc6w3N1xq';
const BASE_URL = 'https://financialmodelingprep.com/api/v3';
const TEST_SYMBOL = 'AAPL';

console.log('='.repeat(60));
console.log('FMP API Direct Test');
console.log('='.repeat(60));
console.log(`API Key: ${API_KEY.substring(0, 8)}...${API_KEY.substring(API_KEY.length - 4)}`);
console.log(`Testing symbol: ${TEST_SYMBOL}`);
console.log('');

// Test 1: Quote endpoint
async function testQuote() {
  console.log('Test 1: Quote Endpoint');
  console.log('-'.repeat(60));
  try {
    const url = `${BASE_URL}/quote/${TEST_SYMBOL}`;
    console.log(`URL: ${url}`);
    console.log(`Params: apikey=${API_KEY.substring(0, 8)}...`);
    
    const response = await axios.get(url, {
      params: { apikey: API_KEY },
      headers: { 'Accept': 'application/json' },
      ...axiosConfig
    });
    
    console.log(`✅ Status: ${response.status}`);
    console.log(`✅ Response type: ${Array.isArray(response.data) ? 'Array' : typeof response.data}`);
    
    if (Array.isArray(response.data) && response.data.length > 0) {
      const quote = response.data[0];
      console.log(`✅ Symbol: ${quote.symbol}`);
      console.log(`✅ Name: ${quote.name}`);
      console.log(`✅ Price: $${quote.price}`);
      console.log(`✅ PE: ${quote.pe || 'N/A'}`);
      console.log(`✅ EPS: ${quote.eps || 'N/A'}`);
      return { success: true, data: quote };
    } else if (response.data && !Array.isArray(response.data)) {
      console.log(`✅ Data received (single object)`);
      console.log(`✅ Keys: ${Object.keys(response.data).slice(0, 5).join(', ')}...`);
      return { success: true, data: response.data };
    } else {
      console.log(`⚠️ Unexpected response format`);
      console.log(`Response: ${JSON.stringify(response.data).substring(0, 200)}`);
      return { success: false, data: response.data };
    }
  } catch (error) {
    if (error.response) {
      console.log(`❌ Status: ${error.response.status}`);
      console.log(`❌ Status Text: ${error.response.statusText}`);
      console.log(`❌ Response Data:`, error.response.data);
      
      if (error.response.status === 403) {
        console.log(`\n❌ ERROR: 403 Forbidden - API key is invalid or expired`);
      } else if (error.response.status === 401) {
        console.log(`\n❌ ERROR: 401 Unauthorized - API key is invalid`);
      } else if (error.response.status === 429) {
        console.log(`\n❌ ERROR: 429 Rate Limit - Too many requests`);
      }
    } else {
      console.log(`❌ Network Error: ${error.message}`);
    }
    return { success: false, error };
  }
}

// Test 2: Key Metrics TTM endpoint
async function testKeyMetrics() {
  console.log('\nTest 2: Key Metrics TTM Endpoint');
  console.log('-'.repeat(60));
  try {
    const url = `${BASE_URL}/key-metrics-ttm/${TEST_SYMBOL}`;
    console.log(`URL: ${url}`);
    
    const response = await axios.get(url, {
      params: { apikey: API_KEY },
      headers: { 'Accept': 'application/json' },
      ...axiosConfig
    });
    
    console.log(`✅ Status: ${response.status}`);
    console.log(`✅ Response type: ${Array.isArray(response.data) ? 'Array' : typeof response.data}`);
    
    if (Array.isArray(response.data) && response.data.length > 0) {
      const metrics = response.data[0];
      console.log(`✅ EPS: ${metrics.peRatio || metrics.eps || 'N/A'}`);
      console.log(`✅ PE Ratio: ${metrics.peRatio || 'N/A'}`);
      console.log(`✅ ROE: ${metrics.roe || 'N/A'}`);
      console.log(`✅ Keys available: ${Object.keys(metrics).slice(0, 10).join(', ')}...`);
      return { success: true, data: metrics };
    } else {
      console.log(`⚠️ Unexpected response format`);
      console.log(`Response: ${JSON.stringify(response.data).substring(0, 200)}`);
      return { success: false, data: response.data };
    }
  } catch (error) {
    if (error.response) {
      console.log(`❌ Status: ${error.response.status}`);
      console.log(`❌ Status Text: ${error.response.statusText}`);
      console.log(`❌ Response Data:`, error.response.data);
    } else {
      console.log(`❌ Network Error: ${error.message}`);
    }
    return { success: false, error };
  }
}

// Test 3: Profile endpoint
async function testProfile() {
  console.log('\nTest 3: Profile Endpoint');
  console.log('-'.repeat(60));
  try {
    const url = `${BASE_URL}/profile/${TEST_SYMBOL}`;
    console.log(`URL: ${url}`);
    
    const response = await axios.get(url, {
      params: { apikey: API_KEY },
      headers: { 'Accept': 'application/json' },
      ...axiosConfig
    });
    
    console.log(`✅ Status: ${response.status}`);
    
    if (Array.isArray(response.data) && response.data.length > 0) {
      const profile = response.data[0];
      console.log(`✅ Company Name: ${profile.companyName || profile.name || 'N/A'}`);
      console.log(`✅ Symbol: ${profile.symbol || 'N/A'}`);
      return { success: true, data: profile };
    } else {
      console.log(`⚠️ Unexpected response format`);
      return { success: false, data: response.data };
    }
  } catch (error) {
    if (error.response) {
      console.log(`❌ Status: ${error.response.status}`);
      console.log(`❌ Response Data:`, error.response.data);
    } else {
      console.log(`❌ Network Error: ${error.message}`);
    }
    return { success: false, error };
  }
}

// Run all tests
async function runAllTests() {
  console.log('Starting tests...\n');
  
  const results = {
    quote: await testQuote(),
    keyMetrics: await testKeyMetrics(),
    profile: await testProfile()
  };
  
  console.log('\n' + '='.repeat(60));
  console.log('Test Summary');
  console.log('='.repeat(60));
  console.log(`Quote: ${results.quote.success ? '✅ PASSED' : '❌ FAILED'}`);
  console.log(`Key Metrics: ${results.keyMetrics.success ? '✅ PASSED' : '❌ FAILED'}`);
  console.log(`Profile: ${results.profile.success ? '✅ PASSED' : '❌ FAILED'}`);
  
  const allPassed = results.quote.success && results.keyMetrics.success && results.profile.success;
  
  if (allPassed) {
    console.log('\n✅ All tests passed! API key is working correctly.');
    console.log('If you\'re still getting errors in the app, check:');
    console.log('1. Environment variable is set correctly in Netlify');
    console.log('2. You triggered a new deploy after adding the variable');
    console.log('3. The variable name is exactly: VITE_FMP_API_KEY');
  } else {
    console.log('\n❌ Some tests failed. Check the errors above.');
    if (!results.quote.success && results.quote.error?.response?.status === 403) {
      console.log('\n⚠️ The API key appears to be invalid or expired.');
      console.log('Please verify the key in your FMP dashboard.');
    }
  }
  
  return allPassed;
}

runAllTests().then(success => {
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error('\n❌ Test runner error:', error);
  process.exit(1);
});
