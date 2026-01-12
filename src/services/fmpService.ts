/**
 * Financial Modeling Prep (FMP) API Service
 * 
 * Provides fundamentals data (EPS, growth rates, financial ratios)
 * FMP API Documentation: https://site.financialmodelingprep.com/developer/docs/
 * 
 * Free tier: 250 API calls/day
 */

import axios from 'axios';

const API_KEY = import.meta.env.VITE_FMP_API_KEY || '6HhHKgYFoKOlDJqi4THx75eTc6w3N1xq';
const BASE_URL = 'https://financialmodelingprep.com/api/v3';

/**
 * Fundamentals data from FMP API
 */
export interface FMPFundamentals {
  eps?: number;
  peRatio?: number | null;
  roe?: number | null;
  debtToEquity?: number | null;
  currentRatio?: number | null;
  epsGrowth?: number;
  salesGrowth?: number;
  bookValueGrowth?: number | null;
  companyName?: string;
}

/**
 * Normalize ROE value to percentage
 * FMP may return as decimal (0.92) or percentage (92)
 */
const normalizeROE = (value: any): number | null => {
  if (value === null || value === undefined) return null;
  const num = parseFloat(String(value));
  if (isNaN(num) || !isFinite(num)) return null;
  // If between 0 and 1, it's decimal format (convert to %)
  return num > 1 ? num : num * 100;
};

/**
 * Normalize growth rate to percentage
 * FMP may return as decimal (0.15) or percentage (15)
 */
const normalizeGrowth = (value: any, defaultVal: number = 0.08): number => {
  if (value === null || value === undefined) return defaultVal * 100;
  const num = parseFloat(String(value));
  if (isNaN(num) || !isFinite(num)) return defaultVal * 100;
  // Convert decimal to percentage if needed
  // Growth rates can be negative (loss-making companies)
  return num > 1 || num < -1 ? num : num * 100;
};

/**
 * Normalize EPS value
 * EPS must be a number (can be 0 for loss-making companies)
 */
const normalizeEPS = (value: any, defaultVal: number = 1.0): number => {
  if (value === null || value === undefined) return defaultVal;
  const num = parseFloat(String(value));
  if (isNaN(num) || !isFinite(num) || num < 0) {
    // Allow 0 (break-even) but not negative
    return num === 0 ? 0 : defaultVal;
  }
  // Cap at reasonable maximum
  if (num > 1000) return defaultVal;
  return num;
};

/**
 * Normalize ratio value (can be null)
 */
const normalizeRatio = (value: any): number | null => {
  if (value === null || value === undefined) return null;
  const num = parseFloat(String(value));
  if (isNaN(num) || !isFinite(num)) return null;
  return num;
};

/**
 * Map FMP response data to our fundamentals interface
 * Handles different response structures and field name variations
 */
const mapResponseToFundamentals = (
  profileData?: any,
  ratiosData?: any,
  growthData?: any
): FMPFundamentals => {
  const fundamentals: FMPFundamentals = {};

  // Extract data from profile/key-metrics (whichever is available)
  const metrics = profileData || {};
  
  // Extract data from ratios
  const ratios = ratiosData || {};
  
  // Extract data from growth
  const growth = growthData || {};

  // EPS: Try multiple field names
  const epsFields = [
    metrics.eps,
    metrics.earningsPerShare,
    metrics.earningsPerShareTTM,
    metrics.trailingEps,
    ratios.earningsPerShare,
    ratios.eps
  ];
  const epsValue = epsFields.find(v => v !== undefined && v !== null);
  if (epsValue !== undefined && epsValue !== null) {
    fundamentals.eps = normalizeEPS(epsValue);
  }

  // PE Ratio: Try multiple field names
  const peFields = [
    metrics.peRatio,
    metrics.priceToEarningsRatio,
    metrics.priceEarningsRatio,
    metrics.pe,
    ratios.peRatio,
    ratios.priceToEarningsRatio,
    ratios.priceEarningsRatio
  ];
  const peValue = peFields.find(v => v !== undefined && v !== null);
  fundamentals.peRatio = normalizeRatio(peValue);

  // ROE: Try multiple field names
  const roeFields = [
    metrics.roe,
    metrics.returnOnEquity,
    metrics.returnOnEquityTTM,
    ratios.roe,
    ratios.returnOnEquity,
    ratios.returnOnEquityTTM
  ];
  const roeValue = roeFields.find(v => v !== undefined && v !== null);
  fundamentals.roe = normalizeROE(roeValue);

  // Debt-to-Equity: Try multiple field names
  const debtEquityFields = [
    metrics.debtEquityRatio,
    metrics.debtToEquity,
    metrics.debtToEquityRatio,
    ratios.debtEquityRatio,
    ratios.debtToEquity,
    ratios.debtToEquityRatio
  ];
  const debtEquityValue = debtEquityFields.find(v => v !== undefined && v !== null);
  fundamentals.debtToEquity = normalizeRatio(debtEquityValue);

  // Current Ratio: Try multiple field names
  const currentRatioFields = [
    ratios.currentRatio,
    ratios.currentRatioTTM,
    metrics.currentRatio
  ];
  const currentRatioValue = currentRatioFields.find(v => v !== undefined && v !== null);
  fundamentals.currentRatio = normalizeRatio(currentRatioValue);

  // EPS Growth: From growth endpoint
  const epsGrowthFields = [
    growth.growthEps,
    growth.growthEarningsPerShare,
    growth.epsGrowth,
    growth.earningsPerShareGrowth
  ];
  const epsGrowthValue = epsGrowthFields.find(v => v !== undefined && v !== null);
  if (epsGrowthValue !== undefined && epsGrowthValue !== null) {
    fundamentals.epsGrowth = normalizeGrowth(epsGrowthValue);
  }

  // Sales/Revenue Growth: From growth endpoint
  const salesGrowthFields = [
    growth.growthRevenue,
    growth.growthSales,
    growth.revenueGrowth,
    growth.salesGrowth,
    growth.revenueGrowthPercentage,
    growth.revenueGrowthPercent
  ];
  const salesGrowthValue = salesGrowthFields.find(v => v !== undefined && v !== null);
  if (salesGrowthValue !== undefined && salesGrowthValue !== null) {
    fundamentals.salesGrowth = normalizeGrowth(salesGrowthValue);
  }

  // Book Value Growth: From growth endpoint
  const bookValueGrowthFields = [
    growth.growthBookValue,
    growth.growthBVPS,
    growth.bookValueGrowth,
    growth.bookValuePerShareGrowth
  ];
  const bookValueGrowthValue = bookValueGrowthFields.find(v => v !== undefined && v !== null);
  if (bookValueGrowthValue !== undefined && bookValueGrowthValue !== null) {
    fundamentals.bookValueGrowth = normalizeROE(bookValueGrowthValue);
  }

  // Company Name: From profile
  const nameFields = [
    profileData?.companyName,
    profileData?.name,
    profileData?.symbol,
    metrics?.companyName,
    metrics?.name
  ];
  const nameValue = nameFields.find(v => v !== undefined && v !== null && v !== '');
  if (nameValue) {
    fundamentals.companyName = String(nameValue);
  }

  return fundamentals;
};

/**
 * Fetch fundamentals data from FMP API
 * 
 * Strategy: Try optimal endpoint combination (1-2 calls)
 * 1. Key Metrics TTM (most comprehensive - EPS, PE, ROE, ratios)
 * 2. Income Statement Growth (growth rates)
 * 
 * Falls back to additional endpoints if needed
 */
export const fetchFundamentals = async (symbol: string): Promise<FMPFundamentals> => {
  // Debug: Log API key status (without exposing full key)
  const apiKeySet = !!API_KEY;
  const apiKeyPreview = API_KEY ? `${API_KEY.substring(0, 8)}...${API_KEY.substring(API_KEY.length - 4)}` : 'NOT SET';
  console.log('FMP API Key Status:', apiKeySet ? `Set (${apiKeyPreview})` : 'NOT SET');
  console.log('FMP API Key Source:', import.meta.env.VITE_FMP_API_KEY ? 'Environment variable' : 'Fallback/default');
  
  if (!API_KEY) {
    console.warn('FMP API key not configured, using default values for fundamentals');
    return {};
  }

  try {
    // Strategy: Use 2 endpoints for optimal data coverage
    // 1. Key Metrics TTM (most comprehensive)
    // 2. Income Statement Growth (growth rates)
    
    let metricsData: any = null;
    let ratiosData: any = null;
    let growthData: any = null;
    let profileData: any = null;

    // Try Key Metrics TTM first (most comprehensive single endpoint)
    try {
      const metricsResponse = await axios.get(`${BASE_URL}/key-metrics-ttm/${symbol}`, {
        params: { apikey: API_KEY },
        headers: { 'Accept': 'application/json' },
        timeout: 5000
      });
      
      if (metricsResponse.data && Array.isArray(metricsResponse.data) && metricsResponse.data.length > 0) {
        metricsData = metricsResponse.data[0];
        console.log('FMP: Key Metrics TTM data fetched');
      } else if (metricsResponse.data && !Array.isArray(metricsResponse.data)) {
        metricsData = metricsResponse.data;
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        if (status === 403) {
          console.error('FMP: 403 Forbidden - API key invalid or rate limit reached');
          console.error('FMP: Error response:', error.response?.data);
        } else {
          console.warn('FMP: Key Metrics TTM endpoint failed, trying alternatives:', error.message);
        }
      } else {
        console.warn('FMP: Key Metrics TTM endpoint failed, trying alternatives');
      }
    }

    // Try Ratios TTM as alternative/complement
    if (!metricsData || !metricsData.roe || !metricsData.currentRatio) {
      try {
        const ratiosResponse = await axios.get(`${BASE_URL}/ratios-ttm/${symbol}`, {
          params: { apikey: API_KEY },
          headers: { 'Accept': 'application/json' },
          timeout: 5000
        });
        
        if (ratiosResponse.data && Array.isArray(ratiosResponse.data) && ratiosResponse.data.length > 0) {
          ratiosData = ratiosResponse.data[0];
          console.log('FMP: Ratios TTM data fetched');
        } else if (ratiosResponse.data && !Array.isArray(ratiosResponse.data)) {
          ratiosData = ratiosResponse.data;
        }
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 403) {
          console.error('FMP: Ratios TTM - 403 Forbidden');
        } else {
          console.warn('FMP: Ratios TTM endpoint failed');
        }
      }
    }

    // Try Income Statement Growth for growth rates
    try {
      const growthResponse = await axios.get(`${BASE_URL}/income-statement-growth/${symbol}`, {
        params: { apikey: API_KEY, limit: 1 },
        headers: { 'Accept': 'application/json' },
        timeout: 5000
      });
      
      if (growthResponse.data && Array.isArray(growthResponse.data) && growthResponse.data.length > 0) {
        growthData = growthResponse.data[0];
        console.log('FMP: Income Statement Growth data fetched');
      } else if (growthResponse.data && !Array.isArray(growthResponse.data)) {
        growthData = growthResponse.data;
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 403) {
        console.error('FMP: Income Statement Growth - 403 Forbidden');
      } else {
        console.warn('FMP: Income Statement Growth endpoint failed');
      }
    }

    // Fallback: Try Profile endpoint if we're missing basic data
    if (!metricsData || (!metricsData.eps && !metricsData.peRatio)) {
      try {
        const profileResponse = await axios.get(`${BASE_URL}/profile/${symbol}`, {
          params: { apikey: API_KEY },
          headers: { 'Accept': 'application/json' },
          timeout: 5000
        });
        
        if (profileResponse.data && Array.isArray(profileResponse.data) && profileResponse.data.length > 0) {
          profileData = profileResponse.data[0];
          console.log('FMP: Profile data fetched (fallback)');
        } else if (profileResponse.data && !Array.isArray(profileResponse.data)) {
          profileData = profileResponse.data;
        }
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 403) {
          console.error('FMP: Profile - 403 Forbidden');
        } else {
          console.warn('FMP: Profile endpoint failed');
        }
      }
    }

    // Map all data to our fundamentals interface
    const fundamentals = mapResponseToFundamentals(
      metricsData || profileData,
      ratiosData,
      growthData
    );

    console.log('FMP fundamentals extracted:', fundamentals);
    return fundamentals;

  } catch (error) {
    // Handle specific error cases
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      
      if (status === 401 || status === 403) {
        const errorMessage = error.response?.data?.Error || error.response?.data?.message || 'Invalid API key or access denied';
        throw new Error(`FMP API Error (403): ${errorMessage}. Please check your API key at https://site.financialmodelingprep.com/developer/docs/ and ensure it's set in VITE_FMP_API_KEY environment variable.`);
      }
      
      if (status === 429) {
        console.warn('FMP API rate limit exceeded (250/day)');
        throw new Error('FMP API rate limit reached (250 calls/day). Using default values.');
      }
      
      if (status === 404) {
        throw new Error(`Stock symbol "${symbol}" not found in FMP database. Please verify the symbol is correct.`);
      }
      
      if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        throw new Error('FMP API request timeout. Please check your internet connection and try again.');
      }
      
      const errorMessage = error.response?.data?.Error || error.response?.data?.message || error.message;
      throw new Error(`FMP API Error: ${errorMessage}. Please try again or check the API status.`);
    }
    
    throw new Error(`FMP API Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};
