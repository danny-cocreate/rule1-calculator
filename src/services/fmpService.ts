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
// Updated to use /stable/ endpoints (new API structure, replaces legacy /api/v3/)
const BASE_URL = 'https://financialmodelingprep.com/stable';

/**
 * Quote data from FMP API (price, volume, etc.)
 */
export interface FMPQuote {
  symbol?: string;
  name?: string;
  price?: number;
  changesPercentage?: number;
  change?: number;
  dayLow?: number;
  dayHigh?: number;
  yearHigh?: number;
  yearLow?: number;
  marketCap?: number;
  priceAvg50?: number;
  priceAvg200?: number;
  volume?: number;
  avgVolume?: number;
  exchange?: string;
  open?: number;
  previousClose?: number;
  eps?: number;
  pe?: number;
}

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
 * EPS must be a number (can be 0 for loss-making companies, can be negative for losses)
 * Note: netIncomePerShareTTM from new /stable/ endpoints is already EPS
 * Returns null if invalid (to throw proper errors instead of using defaults)
 */
const normalizeEPS = (value: any): number | null => {
  if (value === null || value === undefined) return null;
  const num = parseFloat(String(value));
  if (isNaN(num) || !isFinite(num)) {
    return null;
  }
  // Allow negative EPS (loss-making companies) and 0 (break-even)
  // Cap at reasonable maximum
  if (Math.abs(num) > 1000) return null;
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
  growthData?: any,
  metricsData?: any
): FMPFundamentals => {
  const fundamentals: FMPFundamentals = {};

  // Extract data from profile/key-metrics (whichever is available)
  const metrics = metricsData || profileData || {};
  
  // Extract data from ratios (CRITICAL: contains netIncomePerShareTTM which is EPS)
  const ratios = ratiosData || {};
  
  // Extract data from growth
  const growth = growthData || {};
  
  // Debug: Log what we received
  console.log('FMP mapping - Ratios data keys:', Object.keys(ratios).slice(0, 10).join(', '));
  console.log('FMP mapping - Metrics data keys:', Object.keys(metrics).slice(0, 10).join(', '));

  // EPS: Try multiple field names (new /stable/ endpoints use netIncomePerShareTTM)
  // CRITICAL: netIncomePerShareTTM from Ratios TTM is the EPS value
  const epsFields = [
    ratios.netIncomePerShareTTM,  // New /stable/ endpoint field (Ratios TTM) - PRIMARY
    ratios.netIncomePerShare,      // Fallback
    metrics.eps,
    metrics.earningsPerShare,
    metrics.earningsPerShareTTM,
    metrics.trailingEps,
    ratios.earningsPerShare,
    ratios.eps
  ];
  const epsValue = epsFields.find(v => v !== undefined && v !== null);
  if (epsValue !== undefined && epsValue !== null) {
    const normalized = normalizeEPS(epsValue);
    if (normalized !== null) {
      fundamentals.eps = normalized;
      console.log('FMP: EPS extracted:', normalized, 'from field:', 
        ratios.netIncomePerShareTTM !== undefined ? 'netIncomePerShareTTM' : 'other');
    }
  } else {
    console.warn('FMP: EPS not found in any field. Available ratio fields:', Object.keys(ratios).filter(k => k.toLowerCase().includes('share') || k.toLowerCase().includes('eps')).join(', '));
  }

  // PE Ratio: Try multiple field names (new /stable/ endpoints use priceToEarningsRatioTTM)
  const peFields = [
    ratios.priceToEarningsRatioTTM,  // New /stable/ endpoint field
    ratios.priceToEarningsRatio,      // Fallback
    metrics.peRatio,
    metrics.priceToEarningsRatio,
    metrics.priceEarningsRatio,
    metrics.pe,
    ratios.peRatio,
    ratios.priceEarningsRatio
  ];
  const peValue = peFields.find(v => v !== undefined && v !== null);
  fundamentals.peRatio = normalizeRatio(peValue);

  // ROE: Try multiple field names (new /stable/ endpoints use returnOnEquityTTM)
  // Note: ROE might be in Key Metrics TTM, Ratios TTM, or need to calculate from income statement
  const roeFields = [
    metrics.returnOnEquityTTM,  // New /stable/ endpoint field (Key Metrics TTM) - PRIMARY
    ratios.returnOnEquityTTM,   // Also check Ratios TTM
    metrics.roe,
    metrics.returnOnEquity,
    ratios.roe,
    ratios.returnOnEquity
  ];
  const roeValue = roeFields.find(v => v !== undefined && v !== null);
  fundamentals.roe = normalizeROE(roeValue);
  
  // Debug: Log ROE extraction
  if (fundamentals.roe === null) {
    console.warn('FMP: ROE not found. Available ROE-related keys in metrics:', 
      Object.keys(metrics).filter(k => k.toLowerCase().includes('roe') || k.toLowerCase().includes('return')).join(', '));
    console.warn('FMP: ROE-related keys in ratios:', 
      Object.keys(ratios).filter(k => k.toLowerCase().includes('roe') || k.toLowerCase().includes('return')).join(', '));
  } else {
    console.log('FMP: ROE extracted:', fundamentals.roe, '%');
  }

  // Debt-to-Equity: Try multiple field names (new /stable/ endpoints use debtToEquityRatioTTM)
  const debtEquityFields = [
    ratios.debtToEquityRatioTTM,  // New /stable/ endpoint field
    ratios.debtToEquityRatio,      // Fallback
    metrics.debtEquityRatio,
    metrics.debtToEquity,
    metrics.debtToEquityRatio,
    ratios.debtEquityRatio,
    ratios.debtToEquity
  ];
  const debtEquityValue = debtEquityFields.find(v => v !== undefined && v !== null);
  fundamentals.debtToEquity = normalizeRatio(debtEquityValue);

  // Current Ratio: Try multiple field names (new /stable/ endpoints use currentRatioTTM)
  const currentRatioFields = [
    ratios.currentRatioTTM,  // New /stable/ endpoint field (Ratios TTM)
    metrics.currentRatioTTM,  // Also check Key Metrics TTM
    ratios.currentRatio,
    metrics.currentRatio
  ];
  const currentRatioValue = currentRatioFields.find(v => v !== undefined && v !== null);
  fundamentals.currentRatio = normalizeRatio(currentRatioValue);

  // EPS Growth: From growth endpoint (new /stable/ endpoints use growthEPS)
  // growthEPS is a decimal (0.39 = 39%), normalizeGrowth will convert to percentage
  const epsGrowthFields = [
    growth.growthEPS,              // New /stable/ endpoint field (PRIMARY) - capital EPS
    growth.growthEPSDiluted,       // Also try diluted EPS growth
    growth.growthEps,               // Fallback (lowercase)
    growth.growthEarningsPerShare,
    growth.epsGrowth,
    growth.earningsPerShareGrowth
  ];
  const epsGrowthValue = epsGrowthFields.find(v => v !== undefined && v !== null);
  if (epsGrowthValue !== undefined && epsGrowthValue !== null) {
    const normalized = normalizeGrowth(epsGrowthValue);
    if (normalized !== null) {
      fundamentals.epsGrowth = normalized;
      console.log('FMP: EPS Growth extracted:', normalized, '% from field:', 
        growth.growthEPS !== undefined ? 'growthEPS' : 
        growth.growthEPSDiluted !== undefined ? 'growthEPSDiluted' : 'other');
    } else {
      console.warn('FMP: EPS Growth value found but invalid:', epsGrowthValue);
    }
  } else {
    console.warn('FMP: EPS Growth not found. Available growth fields:', Object.keys(growth).filter(k => k.toLowerCase().includes('eps') || k.toLowerCase().includes('growth')).join(', '));
  }

  // Sales/Revenue Growth: From growth endpoint (new /stable/ endpoints use growthRevenue)
  // growthRevenue is a decimal (0.14 = 14%), normalizeGrowth will convert to percentage
  // NOTE: FMP may return quarterly growth, so values < 5% might be quarterly, not annual
  const salesGrowthFields = [
    growth.growthRevenue,          // New /stable/ endpoint field (PRIMARY)
    growth.growthSales,
    growth.revenueGrowth,
    growth.salesGrowth,
    growth.revenueGrowthPercentage,
    growth.revenueGrowthPercent
  ];
  const salesGrowthValue = salesGrowthFields.find(v => v !== undefined && v !== null);
  if (salesGrowthValue !== undefined && salesGrowthValue !== null) {
    const normalized = normalizeGrowth(salesGrowthValue);
    if (normalized !== null) {
      // Warn if growth seems too low (might be quarterly instead of annual)
      if (Math.abs(normalized) < 5 && normalized !== 0) {
        console.warn('FMP: Sales Growth seems unusually low (', normalized, '%). This might be quarterly growth, not annual. Consider verifying with income statements.');
      }
      fundamentals.salesGrowth = normalized;
      console.log('FMP: Sales Growth extracted:', normalized, '% from field:', 
        growth.growthRevenue !== undefined ? 'growthRevenue' : 'other');
    } else {
      console.warn('FMP: Sales Growth value found but invalid:', salesGrowthValue);
    }
  } else {
    console.warn('FMP: Sales Growth not found. Available growth fields:', Object.keys(growth).filter(k => k.toLowerCase().includes('revenue') || k.toLowerCase().includes('sales')).join(', '));
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
 * Fetch real-time quote data from FMP API
 * Provides current price, volume, market cap, etc.
 */
export const fetchQuote = async (symbol: string): Promise<FMPQuote> => {
  if (!API_KEY) {
    throw new Error('FMP API key is not configured. Please set VITE_FMP_API_KEY in your environment variables.');
  }

  try {
    // New endpoint format: /stable/quote?symbol=AAPL&apikey=KEY (query params, not path params)
    const response = await axios.get(`${BASE_URL}/quote`, {
      params: { symbol: symbol, apikey: API_KEY },
      headers: { 'Accept': 'application/json' },
      timeout: 5000
    });

    if (response.data && Array.isArray(response.data) && response.data.length > 0) {
      const quote = response.data[0];
      console.log('FMP: Quote data fetched successfully');
      return quote;
    } else if (response.data && !Array.isArray(response.data)) {
      console.log('FMP: Quote data fetched successfully (single object)');
      return response.data;
    } else {
      throw new Error('No quote data returned from FMP API');
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      
      if (status === 401 || status === 403) {
        const errorMessage = error.response?.data?.Error || error.response?.data?.message || 'Invalid API key or access denied';
        throw new Error(`FMP Quote API Error (403): ${errorMessage}. Please check your API key.`);
      }
      
      if (status === 404) {
        throw new Error(`Stock symbol "${symbol}" not found in FMP database.`);
      }
      
      const errorMessage = error.response?.data?.Error || error.response?.data?.message || error.message;
      throw new Error(`FMP Quote API Error: ${errorMessage}`);
    }
    
    throw new Error(`FMP Quote API Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
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
    // New endpoint format: /stable/key-metrics-ttm?symbol=AAPL&apikey=KEY
    try {
      const metricsResponse = await axios.get(`${BASE_URL}/key-metrics-ttm`, {
        params: { symbol: symbol, apikey: API_KEY },
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

    // Try Ratios TTM - ALWAYS fetch this (contains EPS as netIncomePerShareTTM)
    // New endpoint format: /stable/ratios-ttm?symbol=AAPL&apikey=KEY
    // This is critical because it contains netIncomePerShareTTM (EPS) and priceToEarningsRatioTTM (PE)
    try {
      const ratiosResponse = await axios.get(`${BASE_URL}/ratios-ttm`, {
        params: { symbol: symbol, apikey: API_KEY },
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

    // Try Income Statement Growth for growth rates (may require paid tier - 402 error)
    // If that fails, calculate from income statements instead
    try {
      const growthResponse = await axios.get(`${BASE_URL}/income-statement-growth`, {
        params: { symbol: symbol, apikey: API_KEY, limit: 10 },
        headers: { 'Accept': 'application/json' },
        timeout: 5000
      });
      
      if (growthResponse.data && Array.isArray(growthResponse.data) && growthResponse.data.length > 0) {
        const annualPeriod = growthResponse.data.find((period: any) => {
          const date = period.date || '';
          return date.includes('12-31') || date.includes('01-31') || period.period === 'FY';
        }) || growthResponse.data[0];
        
        growthData = annualPeriod;
        console.log('FMP: Income Statement Growth data fetched (period:', growthData.date || 'N/A', ')');
      } else if (growthResponse.data && !Array.isArray(growthResponse.data)) {
        growthData = growthResponse.data;
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        if (status === 402) {
          console.warn('FMP: Income Statement Growth requires paid tier (402). Calculating from income statements instead...');
        } else if (status === 403) {
          console.error('FMP: Income Statement Growth - 403 Forbidden');
        } else {
          console.warn('FMP: Income Statement Growth endpoint failed, calculating from income statements instead...');
        }
      } else {
        console.warn('FMP: Income Statement Growth endpoint failed, calculating from income statements instead...');
      }
    }
    
    // Calculate growth from income statements if growth endpoint failed or unavailable
    // Check if we need to calculate (growthData is null or missing growth fields)
    const needsGrowthCalculation = !growthData || 
                                   growthData.growthEPS === undefined || 
                                   growthData.growthEPS === null ||
                                   growthData.growthRevenue === undefined || 
                                   growthData.growthRevenue === null;
    
    if (needsGrowthCalculation) {
      try {
        console.log('FMP: Growth endpoint unavailable, fetching income statements to calculate growth...');
        const incomeResponse = await axios.get(`${BASE_URL}/income-statement`, {
          params: { symbol: symbol, apikey: API_KEY, limit: 5 }, // Get annual statements (period param may not be supported)
          headers: { 'Accept': 'application/json' },
          timeout: 5000
        });
        
        if (incomeResponse.data && Array.isArray(incomeResponse.data) && incomeResponse.data.length >= 2) {
          const statements = incomeResponse.data;
          
          // Filter for annual statements (typically have dates ending in specific months or period='FY')
          // Most recent is first, previous year is second
          const annualStatements = statements.filter((s: any) => {
            const date = s.date || '';
            const period = s.period || '';
            // Annual statements typically end in Q4 (Dec/Jan) or are marked as 'FY'
            return period === 'FY' || date.includes('12-31') || date.includes('01-31') || 
                   date.includes('-12-') || date.includes('-01-');
          });
          
          // Use filtered annual statements, or fall back to first 2 if no annual found
          const statementsToUse = annualStatements.length >= 2 ? annualStatements : statements.slice(0, 2);
          
          if (statementsToUse.length >= 2) {
            const current = statementsToUse[0];
            const previous = statementsToUse[1];
            
            console.log('FMP: Using income statements - Current:', current.date || 'N/A', 'Previous:', previous.date || 'N/A');
            
            // Calculate EPS Growth - try multiple field names
            const currentEPS = current.eps || current.earningsPerShare || current.netIncomePerShare || 
                              (current.netIncome && current.weightedAverageShsOut ? current.netIncome / current.weightedAverageShsOut : null);
            const previousEPS = previous.eps || previous.earningsPerShare || previous.netIncomePerShare ||
                               (previous.netIncome && previous.weightedAverageShsOut ? previous.netIncome / previous.weightedAverageShsOut : null);
            
            // Calculate Revenue Growth
            const currentRevenue = current.revenue || current.totalRevenue || current.revenues;
            const previousRevenue = previous.revenue || previous.totalRevenue || previous.revenues;
            
            if (currentEPS && previousEPS && previousEPS !== 0) {
              const epsGrowth = ((currentEPS - previousEPS) / Math.abs(previousEPS)) * 100;
              if (!growthData) growthData = {};
              // Store as percentage (already multiplied by 100), normalizeGrowth will detect it's > 1
              growthData.growthEPS = epsGrowth;
              console.log('FMP: ✅ Calculated EPS Growth from income statements:', epsGrowth.toFixed(2), '%');
            } else {
              console.warn('FMP: Could not calculate EPS Growth - Current EPS:', currentEPS, 'Previous EPS:', previousEPS);
            }
            
            if (currentRevenue && previousRevenue && previousRevenue !== 0) {
              const revenueGrowth = ((currentRevenue - previousRevenue) / Math.abs(previousRevenue)) * 100;
              if (!growthData) growthData = {};
              // Store as percentage (already multiplied by 100), normalizeGrowth will detect it's > 1
              growthData.growthRevenue = revenueGrowth;
              console.log('FMP: ✅ Calculated Revenue Growth from income statements:', revenueGrowth.toFixed(2), '%');
            } else {
              console.warn('FMP: Could not calculate Revenue Growth - Current Revenue:', currentRevenue, 'Previous Revenue:', previousRevenue);
            }
          } else {
            console.warn('FMP: Not enough income statements to calculate growth (need at least 2 periods). Found:', statementsToUse.length);
          }
        } else {
          console.warn('FMP: Income statement response format unexpected:', incomeResponse.data ? 'array length < 2' : 'not an array');
        }
      } catch (error) {
        if (axios.isAxiosError(error)) {
          const status = error.response?.status;
          if (status === 402) {
            console.error('FMP: Income Statement endpoint also requires paid tier (402). Growth rates unavailable.');
          } else if (status === 403) {
            console.error('FMP: Income Statement endpoint - 403 Forbidden');
          } else {
            console.error('FMP: Failed to fetch income statements for growth calculation:', error.message);
          }
        } else {
          console.error('FMP: Failed to fetch income statements:', error instanceof Error ? error.message : 'Unknown error');
        }
      }
    } else {
      console.log('FMP: Growth data already available from growth endpoint');
    }

    // Fallback: Try Profile endpoint if we're missing basic data
    // New endpoint format: /stable/profile?symbol=AAPL&apikey=KEY
    if (!metricsData || (!metricsData.eps && !metricsData.peRatio)) {
      try {
        const profileResponse = await axios.get(`${BASE_URL}/profile`, {
          params: { symbol: symbol, apikey: API_KEY },
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
    // Pass metricsData separately so it can be used for ROE (returnOnEquityTTM)
    const fundamentals = mapResponseToFundamentals(
      profileData,
      ratiosData,
      growthData,
      metricsData
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
