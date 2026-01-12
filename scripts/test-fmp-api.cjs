#!/usr/bin/env node

/**
 * Test script for Financial Modeling Prep API endpoints
 * Uses axios (same as the app) for better SSL handling
 * 
 * Usage:
 *   1. Get your API key from https://site.financialmodelingprep.com/developer/docs/
 *   2. Set it in .env as VITE_FMP_API_KEY or pass as argument
 *   3. Run: node scripts/test-fmp-api.cjs [API_KEY]
 */

const axios = require('axios');

// Get API key from command line argument, environment variable, or use fallback
const API_KEY = process.argv[2] || process.env.VITE_FMP_API_KEY || '6HhHKgYFoKOlDJqi4THx75eTc6w3N1xq';

const BASE_URL = 'https://financialmodelingprep.com/api/v3';

// Test endpoints in priority order
const endpoints = [
  {
    name: 'Profile',
    url: `${BASE_URL}/profile/AAPL`,
    expected: 'EPS, PE ratio, ROE, company info'
  },
  {
    name: 'Key Metrics TTM',
    url: `${BASE_URL}/key-metrics-ttm/AAPL`,
    expected: 'PE ratio, ROE, EPS, debt ratios (most comprehensive)'
  },
  {
    name: 'Ratios TTM',
    url: `${BASE_URL}/ratios-ttm/AAPL`,
    expected: 'Current ratio, debt-to-equity, ROE, PE'
  },
  {
    name: 'Income Statement Growth',
    url: `${BASE_URL}/income-statement-growth/AAPL`,
    params: { limit: 1 },
    expected: 'Revenue growth, EPS growth (most recent)'
  },
  {
    name: 'Income Statement',
    url: `${BASE_URL}/income-statement/AAPL`,
    params: { limit: 1 },
    expected: 'EPS, revenue (for growth calculation)'
  },
];

/**
 * Test an endpoint and analyze the response
 */
async function testEndpoint(endpoint) {
  try {
    console.log(`\n⏳ Testing ${endpoint.name}...`);
    const response = await axios.get(endpoint.url, {
      params: { apikey: API_KEY, ...(endpoint.params || {}) },
      headers: { 'Accept': 'application/json' },
      timeout: 10000
    });
    
    if (response.status !== 200) {
      console.error(`❌ Status: ${response.status}`);
      return { success: false, status: response.status };
    }
    
    const data = response.data;
    const isArray = Array.isArray(data);
    const responseData = isArray ? (data.length > 0 ? data[0] : null) : data;
    
    if (!responseData) {
      console.warn('⚠️  No data in response');
      return { success: false, data: null };
    }
    
    console.log(`✅ Success! Response type: ${isArray ? 'Array' : 'Object'}`);
    console.log(`   Fields: ${Object.keys(responseData).length} total`);
    
    // Look for our required fields
    const fields = {
      eps: ['eps', 'earningsPerShare', 'earningsPerShareTTM', 'trailingEps'],
      peRatio: ['peRatio', 'priceToEarningsRatio', 'priceEarningsRatio', 'pe'],
      roe: ['roe', 'returnOnEquity', 'returnOnEquityTTM'],
      debtToEquity: ['debtEquityRatio', 'debtToEquity', 'debtToEquityRatio'],
      currentRatio: ['currentRatio', 'currentRatioTTM'],
      epsGrowth: ['growthEps', 'growthEarningsPerShare', 'epsGrowth'],
      salesGrowth: ['growthRevenue', 'growthSales', 'revenueGrowth'],
      bookValueGrowth: ['growthBookValue', 'growthBVPS', 'bookValueGrowth']
    };
    
    const found = {};
    console.log(`\n🔍 Field Mapping:`);
    
    Object.entries(fields).forEach(([ourField, fmpFields]) => {
      const value = fmpFields.find(field => 
        responseData[field] !== undefined && responseData[field] !== null
      );
      if (value) {
        found[ourField] = { field: value, value: responseData[value] };
        console.log(`   ✅ ${ourField}: "${value}" = ${responseData[value]}`);
      } else {
        console.log(`   ❌ ${ourField}: Not found`);
      }
    });
    
    // Show sample of available fields
    console.log(`\n📝 Sample Available Fields (first 15):`);
    Object.keys(responseData).slice(0, 15).forEach(field => {
      const value = responseData[field];
      const preview = typeof value === 'object' ? JSON.stringify(value).substring(0, 40) : String(value).substring(0, 40);
      console.log(`   - ${field}: ${preview}${preview.length >= 40 ? '...' : ''}`);
    });
    
    return { success: true, data: responseData, found };
    
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      const statusText = error.response?.statusText;
      const errorData = error.response?.data;
      
      console.error(`❌ Error: ${status || 'No status'} ${statusText || ''}`);
      console.error(`   Message: ${error.message || 'Unknown'}`);
      if (errorData) {
        console.error(`   Response: ${JSON.stringify(errorData).substring(0, 200)}`);
      }
      if (error.code) {
        console.error(`   Code: ${error.code}`);
      }
      if (error.response?.config?.url) {
        console.error(`   URL: ${error.response.config.url}`);
      }
      return { success: false, status, error: error.message };
    }
    
    console.error(`❌ Error: ${error.message || error.toString()}`);
    console.error(`   Type: ${error.constructor.name}`);
    if (error.stack) {
      console.error(`   Stack: ${error.stack.split('\n').slice(0, 3).join('\n')}`);
    }
    return { success: false, error: error.message || error.toString() };
  }
}

/**
 * Main test function
 */
async function runTests() {
  console.log('🚀 Testing Financial Modeling Prep API Endpoints');
  console.log(`API Key: ${API_KEY.substring(0, 8)}...${API_KEY.substring(API_KEY.length - 4)}`);
  console.log(`Testing with symbol: AAPL`);
  console.log(`Base URL: ${BASE_URL}`);
  
  const results = {};
  
  for (const endpoint of endpoints) {
    const result = await testEndpoint(endpoint);
    results[endpoint.name] = result;
    
    // Wait a bit between requests to avoid rate limiting
    if (endpoint !== endpoints[endpoints.length - 1]) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }
  
  // Summary
  console.log(`\n${'='.repeat(80)}`);
  console.log('📊 SUMMARY');
  console.log(`${'='.repeat(80)}`);
  
  Object.entries(results).forEach(([name, result]) => {
    if (result.success) {
      const fieldCount = Object.keys(result.found || {}).length;
      console.log(`✅ ${name}: Success (${fieldCount} required fields found)`);
    } else {
      const status = result.status ? ` (${result.status})` : '';
      console.log(`❌ ${name}: Failed${status}`);
    }
  });
  
  // Recommendations
  console.log(`\n💡 Next Steps:`);
  console.log(`1. Review the results above to see which endpoints work`);
  console.log(`2. Check which endpoints provide the most required fields`);
  console.log(`3. Verify field names match our mapping`);
  console.log(`4. Test the integration in the app`);
}

// Run tests
runTests().catch(console.error);
