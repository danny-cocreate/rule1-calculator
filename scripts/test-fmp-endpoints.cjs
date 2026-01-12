/**
 * Test script for Financial Modeling Prep API endpoints
 * 
 * Usage:
 *   1. Get your API key from https://site.financialmodelingprep.com/developer/docs/
 *   2. Set it in .env as VITE_FMP_API_KEY or pass as argument
 *   3. Run: node scripts/test-fmp-endpoints.js [API_KEY]
 * 
 * This script tests all FMP endpoints and documents their response structures
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// Get API key from command line argument, environment variable, or use fallback
const API_KEY = process.argv[2] || process.env.VITE_FMP_API_KEY || '6HhHKgYFoKOlDJqi4THx75eTc6w3N1xq';

const BASE_URL = 'https://financialmodelingprep.com/api/v3';

// Test endpoints in priority order
const endpoints = [
  {
    name: 'Profile',
    url: `${BASE_URL}/profile/AAPL?apikey=${API_KEY}`,
    expected: 'EPS, PE ratio, ROE, company info'
  },
  {
    name: 'Key Metrics TTM',
    url: `${BASE_URL}/key-metrics-ttm/AAPL?apikey=${API_KEY}`,
    expected: 'PE ratio, ROE, EPS, debt ratios (most comprehensive)'
  },
  {
    name: 'Ratios TTM',
    url: `${BASE_URL}/ratios-ttm/AAPL?apikey=${API_KEY}`,
    expected: 'Current ratio, debt-to-equity, ROE, PE'
  },
  {
    name: 'Income Statement Growth',
    url: `${BASE_URL}/income-statement-growth/AAPL?apikey=${API_KEY}&limit=1`,
    expected: 'Revenue growth, EPS growth (most recent)'
  },
  {
    name: 'Income Statement',
    url: `${BASE_URL}/income-statement/AAPL?apikey=${API_KEY}&limit=1`,
    expected: 'EPS, revenue (for growth calculation)'
  },
];

/**
 * Make HTTPS request
 */
function makeRequest(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({ status: res.statusCode, data: json });
        } catch (error) {
          resolve({ status: res.statusCode, data: data, error: error.message });
        }
      });
    }).on('error', (error) => {
      reject(error);
    });
  });
}

/**
 * Extract and display key fields from response
 */
function analyzeResponse(name, response) {
  const { status, data } = response;
  
  console.log(`\n${'='.repeat(80)}`);
  console.log(`📊 ${name} Endpoint`);
  console.log(`Status: ${status}`);
  console.log(`${'='.repeat(80)}`);
  
  if (status !== 200) {
    console.error(`❌ Error: ${status}`);
    if (data && data.message) {
      console.error(`Message: ${data.message}`);
    }
    return;
  }
  
  // Check if data is array or object
  const isArray = Array.isArray(data);
  const responseData = isArray ? (data.length > 0 ? data[0] : null) : data;
  
  if (!responseData) {
    console.warn('⚠️  No data in response');
    return;
  }
  
  console.log(`\n📋 Response Structure:`);
  console.log(`   - Type: ${isArray ? 'Array' : 'Object'}`);
  console.log(`   - Fields: ${Object.keys(responseData).length} total`);
  
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
  
  console.log(`\n🔍 Field Mapping:`);
  const found = {};
  
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
  
  // Show all available fields for reference
  console.log(`\n📝 All Available Fields:`);
  Object.keys(responseData).slice(0, 20).forEach(field => {
    const value = responseData[field];
    const type = typeof value;
    const preview = type === 'object' ? JSON.stringify(value).substring(0, 50) : String(value).substring(0, 50);
    console.log(`   - ${field}: ${type} = ${preview}${preview.length >= 50 ? '...' : ''}`);
  });
  
  if (Object.keys(responseData).length > 20) {
    console.log(`   ... and ${Object.keys(responseData).length - 20} more fields`);
  }
  
  // Save full response to file
  const outputDir = path.join(__dirname, '..', 'docs');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  const filename = `fmp-${name.toLowerCase().replace(/\s+/g, '-')}-response.json`;
  const filepath = path.join(outputDir, filename);
  fs.writeFileSync(filepath, JSON.stringify(responseData, null, 2));
  console.log(`\n💾 Full response saved to: ${filepath}`);
  
  return found;
}

/**
 * Main test function
 */
async function testEndpoints() {
  console.log('🚀 Testing Financial Modeling Prep API Endpoints');
  console.log(`API Key: ${API_KEY.substring(0, 8)}...${API_KEY.substring(API_KEY.length - 4)}`);
  console.log(`Testing with symbol: AAPL`);
  
  const results = {};
  
  for (const endpoint of endpoints) {
    try {
      console.log(`\n⏳ Testing ${endpoint.name}...`);
      const response = await makeRequest(endpoint.url);
      const foundFields = analyzeResponse(endpoint.name, response);
      results[endpoint.name] = {
        status: response.status,
        success: response.status === 200,
        fields: foundFields || {}
      };
      
      // Wait a bit between requests to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error(`❌ Error testing ${endpoint.name}:`, error.message);
      results[endpoint.name] = {
        success: false,
        error: error.message
      };
    }
  }
  
  // Summary
  console.log(`\n${'='.repeat(80)}`);
  console.log('📊 SUMMARY');
  console.log(`${'='.repeat(80)}`);
  
  Object.entries(results).forEach(([name, result]) => {
    if (result.success) {
      const fieldCount = Object.keys(result.fields || {}).length;
      console.log(`✅ ${name}: Success (${fieldCount} required fields found)`);
    } else {
      console.log(`❌ ${name}: Failed`);
    }
  });
  
  // Recommendations
  console.log(`\n💡 Recommendations:`);
  console.log(`1. Review the saved JSON files in docs/ folder`);
  console.log(`2. Identify which endpoints provide the most fields`);
  console.log(`3. Choose optimal endpoint combination (goal: 1-2 calls)`);
  console.log(`4. Document exact field names for implementation`);
}

// Run tests
testEndpoints().catch(console.error);
