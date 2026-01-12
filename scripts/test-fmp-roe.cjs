#!/usr/bin/env node
/**
 * Test FMP API for ROE extraction - debug why NVDA shows 1% instead of 107%
 */

const axios = require('axios');
const API_KEY = process.env.VITE_FMP_API_KEY || '6HhHKgYFoKOlDJqi4THx75eTc6w3N1xq';
const BASE_URL = 'https://financialmodelingprep.com/stable';
const SYMBOL = 'NVDA';

async function testROE() {
  console.log('Testing FMP ROE extraction for', SYMBOL, '...\n');

  try {
    // Test Key Metrics TTM
    console.log('=== Key Metrics TTM ===');
    const metricsResponse = await axios.get(`${BASE_URL}/key-metrics-ttm`, {
      params: { symbol: SYMBOL, apikey: API_KEY },
      timeout: 10000
    });
    
    if (metricsResponse.data && Array.isArray(metricsResponse.data) && metricsResponse.data.length > 0) {
      const metrics = metricsResponse.data[0];
      console.log('ROE fields in Key Metrics TTM:');
      console.log('  returnOnEquityTTM:', metrics.returnOnEquityTTM, '(type:', typeof metrics.returnOnEquityTTM, ')');
      console.log('  roe:', metrics.roe);
      console.log('  returnOnEquity:', metrics.returnOnEquity);
      console.log('');
      console.log('All ROE-related keys:', Object.keys(metrics).filter(k => 
        k.toLowerCase().includes('roe') || 
        k.toLowerCase().includes('return') ||
        k.toLowerCase().includes('equity')
      ).join(', '));
      console.log('');
      
      // Show all return-related fields with values
      console.log('All return-related fields:');
      Object.keys(metrics).filter(k => k.toLowerCase().includes('return')).forEach(k => {
        console.log(`  ${k}: ${metrics[k]} (type: ${typeof metrics[k]})`);
      });
    }

    // Test Ratios TTM
    console.log('\n=== Ratios TTM ===');
    const ratiosResponse = await axios.get(`${BASE_URL}/ratios-ttm`, {
      params: { symbol: SYMBOL, apikey: API_KEY },
      timeout: 10000
    });
    
    if (ratiosResponse.data && Array.isArray(ratiosResponse.data) && ratiosResponse.data.length > 0) {
      const ratios = ratiosResponse.data[0];
      console.log('ROE fields in Ratios TTM:');
      console.log('  returnOnEquityTTM:', ratios.returnOnEquityTTM, '(type:', typeof ratios.returnOnEquityTTM, ')');
      console.log('  roe:', ratios.roe);
      console.log('  returnOnEquity:', ratios.returnOnEquity);
      console.log('');
      
      // Show all return-related fields
      console.log('All return-related fields in Ratios:');
      Object.keys(ratios).filter(k => k.toLowerCase().includes('return')).forEach(k => {
        console.log(`  ${k}: ${ratios[k]} (type: ${typeof ratios[k]})`);
      });
    }

    // Try to calculate ROE from income statement if available
    console.log('\n=== Attempting to calculate ROE from Income Statement ===');
    try {
      const incomeResponse = await axios.get(`${BASE_URL}/income-statement`, {
        params: { symbol: SYMBOL, apikey: API_KEY, limit: 1 },
        timeout: 10000
      });
      
      if (incomeResponse.data && Array.isArray(incomeResponse.data) && incomeResponse.data.length > 0) {
        const income = incomeResponse.data[0];
        console.log('Income Statement fields available:');
        console.log('  netIncome:', income.netIncome);
        console.log('  revenue:', income.revenue);
        console.log('');
      }
    } catch (e) {
      console.log('Income Statement endpoint not available or failed');
    }

    // Try Balance Sheet for Shareholders Equity
    console.log('\n=== Attempting to get Balance Sheet for Shareholders Equity ===');
    try {
      const balanceResponse = await axios.get(`${BASE_URL}/balance-sheet-statement`, {
        params: { symbol: SYMBOL, apikey: API_KEY, limit: 1 },
        timeout: 10000
      });
      
      if (balanceResponse.data && Array.isArray(balanceResponse.data) && balanceResponse.data.length > 0) {
        const balance = balanceResponse.data[0];
        console.log('Balance Sheet fields available:');
        console.log('  totalStockholdersEquity:', balance.totalStockholdersEquity);
        console.log('  shareholdersEquity:', balance.shareholdersEquity);
        console.log('  commonStock:', balance.commonStock);
        console.log('');
        
        // Try to calculate ROE if we have both net income and equity
        if (incomeResponse && incomeResponse.data && incomeResponse.data.length > 0) {
          const income = incomeResponse.data[0];
          const netIncome = income.netIncome;
          const equity = balance.totalStockholdersEquity || balance.shareholdersEquity;
          
          if (netIncome && equity && equity !== 0) {
            const calculatedROE = (netIncome / equity) * 100;
            console.log('Calculated ROE:', calculatedROE.toFixed(2), '%');
            console.log('  Net Income:', netIncome);
            console.log('  Shareholders Equity:', equity);
          }
        }
      }
    } catch (e) {
      console.log('Balance Sheet endpoint not available or failed');
    }

  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Error:', error.response?.status, error.response?.data || error.message);
    } else {
      console.error('Error:', error.message);
    }
  }
}

testROE();
