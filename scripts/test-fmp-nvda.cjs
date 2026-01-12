#!/usr/bin/env node
/**
 * Test FMP API for NVDA to debug growth rates and ROE
 */

const axios = require('axios');
const API_KEY = process.env.VITE_FMP_API_KEY || '6HhHKgYFoKOlDJqi4THx75eTc6w3N1xq';
const BASE_URL = 'https://financialmodelingprep.com/stable';
const SYMBOL = 'NVDA';

async function testFMP() {
  console.log('Testing FMP API for NVDA...\n');
  console.log('API Key:', API_KEY.substring(0, 8) + '...' + API_KEY.substring(API_KEY.length - 4));
  console.log('');

  try {
    // Test Key Metrics TTM (for ROE)
    console.log('=== Key Metrics TTM ===');
    const metricsResponse = await axios.get(`${BASE_URL}/key-metrics-ttm`, {
      params: { symbol: SYMBOL, apikey: API_KEY },
      timeout: 10000
    });
    
    if (metricsResponse.data && Array.isArray(metricsResponse.data) && metricsResponse.data.length > 0) {
      const metrics = metricsResponse.data[0];
      console.log('ROE fields:');
      console.log('  returnOnEquityTTM:', metrics.returnOnEquityTTM);
      console.log('  roe:', metrics.roe);
      console.log('  returnOnEquity:', metrics.returnOnEquity);
      console.log('');
      console.log('All ROE-related keys:', Object.keys(metrics).filter(k => k.toLowerCase().includes('roe') || k.toLowerCase().includes('return')).join(', '));
      console.log('');
    }

    // Test Ratios TTM
    console.log('=== Ratios TTM ===');
    const ratiosResponse = await axios.get(`${BASE_URL}/ratios-ttm`, {
      params: { symbol: SYMBOL, apikey: API_KEY },
      timeout: 10000
    });
    
    if (ratiosResponse.data && Array.isArray(ratiosResponse.data) && ratiosResponse.data.length > 0) {
      const ratios = ratiosResponse.data[0];
      console.log('ROE in Ratios:');
      console.log('  returnOnEquityTTM:', ratios.returnOnEquityTTM);
      console.log('  roe:', ratios.roe);
      console.log('');
    }

    // Test Income Statement Growth (for growth rates)
    console.log('=== Income Statement Growth ===');
    const growthResponse = await axios.get(`${BASE_URL}/income-statement-growth`, {
      params: { symbol: SYMBOL, apikey: API_KEY, limit: 5 },
      timeout: 10000
    });
    
    if (growthResponse.data && Array.isArray(growthResponse.data) && growthResponse.data.length > 0) {
      console.log(`Found ${growthResponse.data.length} growth records`);
      console.log('');
      
      // Show most recent (first) record
      const growth = growthResponse.data[0];
      console.log('Most recent growth record (date:', growth.date || 'N/A', '):');
      console.log('  growthEPS:', growth.growthEPS);
      console.log('  growthEPSDiluted:', growth.growthEPSDiluted);
      console.log('  growthRevenue:', growth.growthRevenue);
      console.log('  growthSales:', growth.growthSales);
      console.log('');
      
      // Show all growth records
      console.log('All growth records:');
      growthResponse.data.forEach((g, i) => {
        console.log(`  [${i}] Date: ${g.date || 'N/A'}, EPS Growth: ${g.growthEPS}, Revenue Growth: ${g.growthRevenue}`);
      });
      console.log('');
      
      // Show all growth-related keys
      console.log('All growth-related keys:', Object.keys(growth).filter(k => 
        k.toLowerCase().includes('growth') || 
        k.toLowerCase().includes('eps') || 
        k.toLowerCase().includes('revenue') ||
        k.toLowerCase().includes('sales')
      ).join(', '));
      console.log('');
      
      // Show full growth object (first 20 keys)
      console.log('Full growth object (first 20 keys):');
      const keys = Object.keys(growth).slice(0, 20);
      keys.forEach(key => {
        console.log(`  ${key}:`, growth[key]);
      });
    }

    // Test if there's a better endpoint for growth
    console.log('\n=== Testing Revenue Growth Endpoint ===');
    try {
      const revenueGrowthResponse = await axios.get(`${BASE_URL}/revenue-growth`, {
        params: { symbol: SYMBOL, apikey: API_KEY, limit: 1 },
        timeout: 10000
      });
      if (revenueGrowthResponse.data && Array.isArray(revenueGrowthResponse.data) && revenueGrowthResponse.data.length > 0) {
        console.log('Revenue Growth endpoint data:', revenueGrowthResponse.data[0]);
      }
    } catch (e) {
      console.log('Revenue Growth endpoint not available or failed');
    }

  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Error:', error.response?.status, error.response?.data || error.message);
    } else {
      console.error('Error:', error.message);
    }
  }
}

testFMP();
