#!/usr/bin/env node

/**
 * Test Income Statement Growth endpoint structure
 * Focus on EPS growth fields
 */

const axios = require('axios');
const https = require('https');

const API_KEY = '6HhHKgYFoKOlDJqi4THx75eTc6w3N1xq';
const BASE_URL = 'https://financialmodelingprep.com/stable';
const TEST_SYMBOL = 'GOOGL';

const axiosConfig = {
  httpsAgent: new https.Agent({
    rejectUnauthorized: false
  }),
  timeout: 10000
};

async function testGrowthEndpoint() {
  try {
    console.log('Testing Income Statement Growth endpoint...');
    console.log(`Symbol: ${TEST_SYMBOL}`);
    console.log('');
    
    const response = await axios.get(`${BASE_URL}/income-statement-growth`, {
      params: { symbol: TEST_SYMBOL, apikey: API_KEY, limit: 2 },
      headers: { 'Accept': 'application/json' },
      ...axiosConfig
    });
    
    if (response.data && Array.isArray(response.data) && response.data.length > 0) {
      console.log(`✅ Received ${response.data.length} periods of growth data\n`);
      
      // Show first period (most recent)
      const latest = response.data[0];
      console.log('Latest period keys:', Object.keys(latest).join(', '));
      console.log('');
      
      // Find all EPS-related fields
      console.log('EPS-related fields:');
      Object.keys(latest).filter(k => 
        k.toLowerCase().includes('eps') || 
        k.toLowerCase().includes('earnings') ||
        k.toLowerCase().includes('per share')
      ).forEach(k => {
        console.log(`  - ${k}: ${latest[k]} (type: ${typeof latest[k]})`);
      });
      
      console.log('');
      console.log('Growth-related fields:');
      Object.keys(latest).filter(k => 
        k.toLowerCase().includes('growth')
      ).forEach(k => {
        console.log(`  - ${k}: ${latest[k]} (type: ${typeof latest[k]})`);
      });
      
      console.log('');
      console.log('All fields with values (first 30):');
      Object.keys(latest).slice(0, 30).forEach(k => {
        const value = latest[k];
        const displayValue = typeof value === 'object' ? JSON.stringify(value).substring(0, 50) : value;
        console.log(`  ${k}: ${displayValue}`);
      });
      
      // Show second period if available (for comparison)
      if (response.data.length > 1) {
        console.log('\n' + '='.repeat(60));
        console.log('Second period (for comparison):');
        const second = response.data[1];
        Object.keys(second).filter(k => 
          k.toLowerCase().includes('eps') || 
          k.toLowerCase().includes('growth')
        ).forEach(k => {
          console.log(`  ${k}: ${second[k]}`);
        });
      }
      
    } else {
      console.log('❌ No data returned or unexpected format');
      console.log('Response:', JSON.stringify(response.data).substring(0, 500));
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
}

testGrowthEndpoint();
