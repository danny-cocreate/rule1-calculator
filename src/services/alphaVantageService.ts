import axios from 'axios';
import { StockData } from '../types';

const API_KEY = import.meta.env.VITE_ALPHA_VANTAGE_API_KEY || 'LH82CXE5Y5HTVXA4';
const BASE_URL = 'https://www.alphavantage.co/query';

export const fetchStockData = async (symbol: string): Promise<StockData> => {
  try {
    // Fetch overview data (includes company name, PE, EPS, etc.)
    const overviewResponse = await axios.get(BASE_URL, {
      params: {
        function: 'OVERVIEW',
        symbol: symbol,
        apikey: API_KEY,
      },
    });

    // Fetch quote data (current price)
    const quoteResponse = await axios.get(BASE_URL, {
      params: {
        function: 'GLOBAL_QUOTE',
        symbol: symbol,
        apikey: API_KEY,
      },
    });

    const overview = overviewResponse.data;
    const quote = quoteResponse.data['Global Quote'];

    // Debug: Log what we received
    console.log('Overview response:', overview);
    console.log('Quote response:', quoteResponse.data);

    // Check for API rate limit messages
    if (overview.Note || overview.Information || overview['Note'] || overview['Information']) {
      console.log('Rate limit detected in overview');
      throw new Error('API rate limit reached. Alpha Vantage free tier allows 25 requests/day and 5 requests/minute. Please wait a few minutes or try again tomorrow.');
    }

    if (quoteResponse.data.Note || quoteResponse.data.Information || quoteResponse.data['Note'] || quoteResponse.data['Information']) {
      console.log('Rate limit detected in quote');
      throw new Error('API rate limit reached. Alpha Vantage free tier allows 25 requests/day and 5 requests/minute. Please wait a few minutes or try again tomorrow.');
    }

    // Check if we got valid data
    if (!overview.Symbol || !quote || !quote['05. price']) {
      throw new Error('Invalid stock symbol or data not available. Please check the symbol and try again.');
    }

    // Calculate growth rates from quarterly earnings
    // Alpha Vantage returns growth as decimals (0.179 = 17.9%), so multiply by 100
    const epsGrowthRaw = parseFloat(overview.QuarterlyEarningsGrowthYOY) || 
                         parseFloat(overview.EPSGrowth) || 
                         0.08; // Default fallback 8%
    const epsGrowth = epsGrowthRaw > 1 ? epsGrowthRaw : epsGrowthRaw * 100;

    const salesGrowthRaw = parseFloat(overview.QuarterlyRevenueGrowthYOY) || 
                           parseFloat(overview.RevenueGrowthYOY) || 
                           0.08; // Default fallback 8%
    const salesGrowth = salesGrowthRaw > 1 ? salesGrowthRaw : salesGrowthRaw * 100;

    const bookValueGrowthRaw = parseFloat(overview.BookValueGrowth);
    const bookValueGrowth = bookValueGrowthRaw ? 
                           (bookValueGrowthRaw > 1 ? bookValueGrowthRaw : bookValueGrowthRaw * 100) : 
                           null;

    const stockData: StockData = {
      symbol: overview.Symbol,
      companyName: overview.Name || symbol,
      currentPrice: parseFloat(quote['05. price']),
      eps: parseFloat(overview.EPS) || 1.0,
      epsGrowth: epsGrowth,
      salesGrowth: salesGrowth,
      bookValueGrowth: bookValueGrowth,
      roe: parseFloat(overview.ReturnOnEquityTTM) ? parseFloat(overview.ReturnOnEquityTTM) * 100 : null,
      debtToEquity: parseFloat(overview.DebtToEquity) || null,
      currentRatio: parseFloat(overview.CurrentRatio) || null,
      peRatio: parseFloat(overview.PERatio) || null,
      lastUpdated: new Date().toLocaleString(),
    };

    return stockData;
  } catch (error) {
    console.error('Error fetching stock data:', error);
    
    // If it's already our custom error, re-throw it
    if (error instanceof Error && error.message.includes('rate limit')) {
      throw error;
    }
    
    // Otherwise, generic error
    throw new Error('Failed to fetch stock data. Please check the symbol and try again.');
  }
};

