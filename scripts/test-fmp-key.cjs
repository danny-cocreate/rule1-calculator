#!/usr/bin/env node

/**
 * Test FMP API Key
 * 
 * This script tests if the FMP API key is valid by making a direct API call.
 */

const axios = require('axios');

const API_KEY = '6HhHKgYFoKOlDJqi4THx75eTc6w3N1xq';
const BASE_URL = 'https://financialmodelingprep.com/api/v3';
const TEST_SYMBOL = 'AAPL';

console.log('Testing FMP API Key...');
console.log('API Key:', API_KEY);
console.log('Testing with symbol:', TEST_SYMBOL);
console.log('');

// Test 1: Profile endpoint
async function testProfile() {
  try {
    const url = `${BASE_URL}/profile/${TEST_SYMBOL}`;
    console.log('Test 1: Profile endpoint');
    console.log('URL:', url);
    
    const response = await axios.get(url, {
      params: { apikey: API_KEY },
      headers: { 'Accept': 'application/json' },
      timeout: 10000
    });
    
    console.log('Status Code:', response.status);
    
    if (response.status === 200) {
      console.log('✅ SUCCESS! API key is valid.');
      console.log('Response (first 200 chars):', JSON.stringify(response.data).substring(0, 200));
      return { success: true, data: response.data };
    } else {
      console.log('⚠️ Unexpected status code:', response.status);
      return { success: false, status: response.status, data: response.data };
    }
  } catch (error) {
    if (error.response) {
      console.log('Status Code:', error.response.status);
      if (error.response.status === 403) {
        console.log('❌ FAILED! 403 Forbidden - API key is invalid or expired.');
        console.log('Response:', error.response.data);
        throw new Error('403 Forbidden');
      } else {
        console.log('⚠️ Error response:', error.response.data);
        return { success: false, status: error.response.status, data: error.response.data };
      }
    } else {
      console.error('❌ Network error:', error.message);
      throw error;
    }
  }
}

// Test 2: Key Metrics TTM endpoint
async function testKeyMetrics() {
  try {
    const url = `${BASE_URL}/key-metrics-ttm/${TEST_SYMBOL}`;
    console.log('\nTest 2: Key Metrics TTM endpoint');
    console.log('URL:', url);
    
    const response = await axios.get(url, {
      params: { apikey: API_KEY },
      headers: { 'Accept': 'application/json' },
      timeout: 10000
    });
    
    console.log('Status Code:', response.status);
    
    if (response.status === 200) {
      console.log('✅ SUCCESS! Key Metrics endpoint works.');
      if (Array.isArray(response.data) && response.data.length > 0) {
        console.log('Data keys:', Object.keys(response.data[0]).slice(0, 10).join(', '), '...');
      }
      return { success: true, data: response.data };
    } else {
      console.log('⚠️ Unexpected status code:', response.status);
      return { success: false, status: response.status, data: response.data };
    }
  } catch (error) {
    if (error.response) {
      console.log('Status Code:', error.response.status);
      if (error.response.status === 403) {
        console.log('❌ FAILED! 403 Forbidden - API key is invalid or expired.');
        console.log('Response:', error.response.data);
        throw new Error('403 Forbidden');
      } else {
        console.log('⚠️ Error response:', error.response.data);
        return { success: false, status: error.response.status, data: error.response.data };
      }
    } else {
      console.error('❌ Network error:', error.message);
      throw error;
    }
  }
}

// Run tests
async function runTests() {
  try {
    await testProfile();
    await testKeyMetrics();
    console.log('\n✅ All tests completed!');
    console.log('\nIf both tests passed, the API key is valid.');
    console.log('If you\'re still getting 403 errors on Netlify, check:');
    console.log('1. Environment variable is set correctly in Netlify');
    console.log('2. You triggered a new deploy after adding the variable');
    console.log('3. The variable name is exactly: VITE_FMP_API_KEY');
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.log('\nThe API key appears to be invalid or expired.');
    console.log('Please check:');
    console.log('1. The key is correct: 6HhHKgYFoKOlDJqi4THx75eTc6w3N1xq');
    console.log('2. The key is active in FMP dashboard');
    console.log('3. You haven\'t exceeded rate limits (250/day)');
    process.exit(1);
  }
}

runTests();
