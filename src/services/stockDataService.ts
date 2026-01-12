import axios from 'axios';
import { StockData } from '../types';
import { fetchFundamentals, FMPFundamentals } from './fmpService';

const API_KEY = import.meta.env.VITE_STOCKDATA_API_KEY || 'Tsdj7Z3d3OwzL1MO3UJW4uunrRGOABTzuEqQWOlj';
const BASE_URL = 'https://api.stockdata.org/v1';

/**
 * Merge StockData.org price data with FMP fundamentals
 * Throws error if critical data is missing (no misleading defaults)
 */
const mergeStockData = (
  quoteData: any,
  fmpFundamentals: FMPFundamentals | null,
  symbol: string
): StockData => {
  // Extract price and company name from StockData.org (confirmed working)
  const currentPrice = parseFloat(quoteData.price) || 
                      parseFloat(quoteData.close) || 
                      parseFloat(quoteData.last_price) || 
                      parseFloat(quoteData.latest_price) ||
                      parseFloat(quoteData.market_price) ||
                      0;
  
  if (currentPrice === 0) {
    throw new Error('Unable to retrieve stock price. Please check the symbol and try again.');
  }
  
  const companyName = fmpFundamentals?.companyName ||
                     quoteData.name ||
                     quoteData.company_name ||
                     symbol;

  // Get EPS - required for calculations
  let eps = fmpFundamentals?.eps ?? 
            parseFloat(quoteData.eps) ?? 
            parseFloat(quoteData.earnings_per_share) ?? 
            parseFloat(quoteData.diluted_eps) ?? 
            null;
  
  if (eps === null || eps === undefined || isNaN(eps)) {
    throw new Error('Unable to retrieve Earnings Per Share (EPS) data. This is required for calculations. Please check your FMP API key or try a different stock symbol.');
  }

  // Get growth rates - required for calculations
  let epsGrowth = fmpFundamentals?.epsGrowth ?? null;
  let salesGrowth = fmpFundamentals?.salesGrowth ?? null;
  
  if (epsGrowth === null || epsGrowth === undefined) {
    throw new Error('Unable to retrieve EPS Growth Rate. This is required for calculations. Please check your FMP API key and ensure fundamentals data is available.');
  }
  
  if (salesGrowth === null || salesGrowth === undefined) {
    throw new Error('Unable to retrieve Sales Growth Rate. This is required for calculations. Please check your FMP API key and ensure fundamentals data is available.');
  }

  return {
    symbol: quoteData.ticker || quoteData.symbol || symbol,
    companyName: companyName,
    currentPrice: currentPrice,
    
    // Fundamentals from FMP (required)
    eps: eps,
    peRatio: fmpFundamentals?.peRatio ?? 
             parseFloat(quoteData.pe_ratio) ?? 
             parseFloat(quoteData.pe) ??
             parseFloat(quoteData.price_to_earnings) ??
             null,
    roe: fmpFundamentals?.roe ?? null,
    debtToEquity: fmpFundamentals?.debtToEquity ?? null,
    currentRatio: fmpFundamentals?.currentRatio ?? null,
    epsGrowth: epsGrowth,
    salesGrowth: salesGrowth,
    bookValueGrowth: fmpFundamentals?.bookValueGrowth ?? null,
    
    lastUpdated: new Date().toLocaleString(),
  };
};

export const fetchStockData = async (symbol: string): Promise<StockData> => {
  try {
    if (!API_KEY) {
      throw new Error('StockData.org API key is not configured. Please set VITE_STOCKDATA_API_KEY in your environment variables.');
    }

    // StockData.org API endpoints - try quote first
    // Common patterns: /data/quote, /quote, /data/realtime
    let quoteResponse;

    // Try different endpoint patterns
    const endpoints = [
      { path: '/data/quote', params: { symbols: symbol, api_token: API_KEY } },
      { path: '/quote', params: { symbol: symbol, api_token: API_KEY } },
      { path: '/data/realtime', params: { symbols: symbol, api_token: API_KEY } },
      { path: '/data/quote', params: { symbol: symbol, api_key: API_KEY } },
    ];

    let lastError = null;
    for (const endpoint of endpoints) {
      try {
        quoteResponse = await axios.get(`${BASE_URL}${endpoint.path}`, {
          params: endpoint.params,
          headers: {
            'Accept': 'application/json',
          },
        });

        // If we got a response without errors, break
        if (quoteResponse.data && !quoteResponse.data.error && quoteResponse.data.status !== 'error') {
          console.log(`Successfully used endpoint: ${endpoint.path}`);
          break;
        }
      } catch (err) {
        lastError = err;
        console.log(`Endpoint ${endpoint.path} failed, trying next...`);
        continue;
      }
    }

    if (!quoteResponse) {
      throw lastError || new Error('Unable to connect to StockData.org API. Please check your API key and try again.');
    }

    // Debug: Log full response for troubleshooting
    console.log('StockData.org full response:', JSON.stringify(quoteResponse.data, null, 2));

    // Check for API errors
    if (quoteResponse.data.error || quoteResponse.data.status === 'error') {
      const errorMessage = quoteResponse.data.message || quoteResponse.data.error || 'Unknown error from StockData.org API';
      console.error('StockData.org API error:', errorMessage);
      if (errorMessage.toLowerCase().includes('rate limit') || errorMessage.toLowerCase().includes('limit')) {
        throw new Error('API rate limit reached. StockData.org free tier allows 100 requests/day. Please wait a few minutes or try again tomorrow.');
      }
      throw new Error(`StockData.org API error: ${errorMessage}`);
    }

    // Check if we have data - handle different response structures
    let quoteData = null;
    
    // Try different response structures
    if (quoteResponse.data.data && Array.isArray(quoteResponse.data.data) && quoteResponse.data.data.length > 0) {
      quoteData = quoteResponse.data.data[0];
    } else if (quoteResponse.data.data && !Array.isArray(quoteResponse.data.data)) {
      // Response might be a single object
      quoteData = quoteResponse.data.data;
    } else if (quoteResponse.data && !quoteResponse.data.data) {
      // Response might not have a data wrapper - check common field names
      if (quoteResponse.data.price || quoteResponse.data.symbol || quoteResponse.data.ticker) {
        quoteData = quoteResponse.data;
      } else if (Array.isArray(quoteResponse.data) && quoteResponse.data.length > 0) {
        quoteData = quoteResponse.data[0];
      }
    }

    if (!quoteData) {
      console.error('No data in response. Full response:', JSON.stringify(quoteResponse.data, null, 2));
      const errorMsg = quoteResponse.data?.message || quoteResponse.data?.error || 'Unknown response format';
      throw new Error(`Invalid stock symbol or data not available: ${errorMsg}. Response: ${JSON.stringify(quoteResponse.data).substring(0, 200)}`);
    }

    // Fetch fundamentals from FMP (primary source)
    // StockData.org is used only for price data, FMP provides all fundamentals
    // If FMP fails, throw error (no misleading defaults)
    const fmpFundamentals = await fetchFundamentals(symbol);
    console.log('FMP fundamentals fetched successfully:', fmpFundamentals);

    // Merge StockData.org price data with FMP fundamentals
    // mergeStockData will throw error if critical data is missing
    const stockData = mergeStockData(quoteData, fmpFundamentals, symbol);

    // Debug: Log what we received
    console.log('StockData.org quote data:', quoteData);
    if (fmpFundamentals) {
      console.log('FMP fundamentals data:', fmpFundamentals);
    }

    return stockData;
  } catch (error) {
    console.error('Error fetching stock data from StockData.org:', error);
    
    // If it's already our custom error, re-throw it
    if (error instanceof Error && error.message.includes('rate limit')) {
      throw error;
    }
    
    // Handle axios errors
    if (axios.isAxiosError(error)) {
      console.error('Axios error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });

      if (error.response?.status === 429) {
        throw new Error('API rate limit reached. StockData.org free tier allows 100 requests/day. Please wait a few minutes or try again tomorrow.');
      }
      if (error.response?.status === 401 || error.response?.status === 403) {
        throw new Error('Invalid API key. Please check your VITE_STOCKDATA_API_KEY environment variable.');
      }
      if (error.response?.data) {
        const errorData = error.response.data;
        const errorMessage = errorData.message || errorData.error || errorData.message || JSON.stringify(errorData);
        throw new Error(`StockData.org API error: ${errorMessage}`);
      }
      if (error.message) {
        throw new Error(`Network error: ${error.message}. Please check your connection and try again.`);
      }
    }
    
    // Otherwise, generic error
    throw new Error('Failed to fetch stock data. Please check the symbol and try again.');
  }
};
