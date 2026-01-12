#!/usr/bin/env node

/**
 * Test FMP Response Structure
 * Inspects actual response structure to find EPS field names
 */

const axios = require('axios');
const https = require('https');

const API_KEY = '6HhHKgYFoKOlDJqi4THx75eTc6w3N1xq';
const BASE_URL = 'https://financialmodelingprep.com/stable';
const TEST_SYMBOL = 'AAPL';

const axiosConfig = {
  httpsAgent: new https.Agent({
    rejectUnauthorized: false
  }),
  timeout: 10000
};

async function inspectResponse(endpointName, path, params) {
  try {
    const response = await axios.get(`${BASE_URL}${path}`, {
      params: params,
      headers: { 'Accept': 'application/json' },
      ...axiosConfig
    });
    
    if (response.status === 200) {
      let data = response.data;
      if (Array.isArray(data) && data.length > 0) {
        data = data[0];
      }
      
      console.log(`\n${'='.repeat(60)}`);
      console.log(`${endpointName} - Response Structure`);
      console.log('='.repeat(60));
      console.log('All keys:', Object.keys(data).join(', '));
      console.log('\nEPS-related fields:');
      Object.keys(data).filter(k => 
        k.toLowerCase().includes('eps') || 
        k.toLowerCase().includes('earnings') ||
        k.toLowerCase().includes('per share')
      ).forEach(k => {
        console.log(`  - ${k}: ${data[k]} (type: ${typeof data[k]})`);
      });
      
      console.log('\nPE-related fields:');
      Object.keys(data).filter(k => 
        k.toLowerCase().includes('pe') || 
        k.toLowerCase().includes('price') && k.toLowerCase().includes('earnings')
      ).forEach(k => {
        console.log(`  - ${k}: ${data[k]} (type: ${typeof data[k]})`);
      });
      
      console.log('\nSample of all data (first 20 fields):');
      Object.keys(data).slice(0, 20).forEach(k => {
        const value = data[k];
        const displayValue = typeof value === 'object' ? JSON.stringify(value).substring(0, 50) : value;
        console.log(`  ${k}: ${displayValue}`);
      });
      
      return data;
    }
  } catch (error) {
    console.error(`Error: ${error.message}`);
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error(`Data:`, error.response.data);
    }
  }
}

async function runInspection() {
  console.log('Inspecting FMP API Response Structures...');
  console.log(`Symbol: ${TEST_SYMBOL}`);
  console.log(`API Key: ${API_KEY.substring(0, 8)}...`);
  
  // Inspect each endpoint
  await inspectResponse('Profile', '/profile', { symbol: TEST_SYMBOL, apikey: API_KEY });
  await inspectResponse('Key Metrics TTM', '/key-metrics-ttm', { symbol: TEST_SYMBOL, apikey: API_KEY });
  await inspectResponse('Ratios TTM', '/ratios-ttm', { symbol: TEST_SYMBOL, apikey: API_KEY });
  await inspectResponse('Quote', '/quote', { symbol: TEST_SYMBOL, apikey: API_KEY });
  
  console.log('\n' + '='.repeat(60));
  console.log('Inspection Complete');
  console.log('='.repeat(60));
}

runInspection();
