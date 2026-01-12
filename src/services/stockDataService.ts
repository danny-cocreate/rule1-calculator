import { StockData } from '../types';
import { fetchQuote, fetchFundamentals, FMPFundamentals, FMPQuote } from './fmpService';

/**
 * Merge FMP quote data with FMP fundamentals
 * Throws error if critical data is missing (no misleading defaults)
 */
const mergeStockData = (
  quoteData: FMPQuote,
  fmpFundamentals: FMPFundamentals | null,
  symbol: string
): StockData => {
  // Extract price from FMP quote
  const currentPrice = quoteData.price || 0;
  
  if (currentPrice === 0) {
    throw new Error('Unable to retrieve stock price. Please check the symbol and try again.');
  }
  
  const companyName = fmpFundamentals?.companyName ||
                     quoteData.name ||
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
    symbol: quoteData.symbol || symbol,
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

/**
 * Fetch stock data using FMP API (quote + fundamentals)
 * Replaces StockData.org - now using FMP for everything
 */
export const fetchStockData = async (symbol: string): Promise<StockData> => {
  try {
    console.log(`Fetching stock data for ${symbol} using FMP API...`);

    // Fetch quote (price data) and fundamentals in parallel for better performance
    const [quoteData, fmpFundamentals] = await Promise.all([
      fetchQuote(symbol),
      fetchFundamentals(symbol)
    ]);

    console.log('FMP quote data fetched:', quoteData);
    console.log('FMP fundamentals fetched:', fmpFundamentals);

    // Merge FMP quote data with FMP fundamentals
    // mergeStockData will throw error if critical data is missing
    const stockData = mergeStockData(quoteData, fmpFundamentals, symbol);

    return stockData;
  } catch (error) {
    console.error('Error fetching stock data from FMP:', error);
    
    // Re-throw custom errors as-is
    if (error instanceof Error) {
      throw error;
    }
    
    // Otherwise, generic error
    throw new Error('Failed to fetch stock data. Please check the symbol and try again.');
  }
};
