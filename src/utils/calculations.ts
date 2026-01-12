import { StockData, CalculatedMetrics } from '../types';

/**
 * Calculate Sticker Price using Rule #1 methodology
 * Formula: Future EPS × Future PE / (1 + MARR)^Years
 * Where:
 * - Future EPS = Current EPS × (1 + Growth Rate)^Years
 * - Future PE = 2 × Growth Rate (Phil Town's formula)
 * - MARR = Minimum Acceptable Rate of Return (typically 15%)
 * - Years = typically 10 years
 */
export const calculateStickerPrice = (
  currentEPS: number,
  growthRate: number,
  years: number = 10,
  marr: number = 0.15
): number => {
  // Convert growth rate from percentage to decimal
  const growthDecimal = growthRate / 100;
  
  // Calculate future EPS
  const futureEPS = currentEPS * Math.pow(1 + growthDecimal, years);
  
  // Calculate future PE ratio (2x growth rate, minimum 8, maximum 25)
  const futurePE = Math.min(Math.max(2 * growthRate, 8), 25);
  
  // Calculate future stock price
  const futurePrice = futureEPS * futurePE;
  
  // Discount back to present value
  const stickerPrice = futurePrice / Math.pow(1 + marr, years);
  
  return Math.max(stickerPrice, 0);
};

/**
 * Calculate Margin of Safety Price
 * MOS Price = Sticker Price × 0.5 (50% discount)
 */
export const calculateMOSPrice = (stickerPrice: number): number => {
  return stickerPrice * 0.5;
};

/**
 * Determine investment signal based on current price vs sticker price
 */
export const determineSignal = (
  currentPrice: number,
  stickerPrice: number,
  mosPrice: number
): 'BUY' | 'WAIT' | 'SELL' => {
  if (currentPrice <= mosPrice) {
    return 'BUY';
  } else if (currentPrice <= stickerPrice) {
    return 'WAIT';
  } else {
    return 'WAIT'; // Still wait if overvalued
  }
};

/**
 * Calculate all metrics for a stock
 */
export const calculateMetrics = (
  stockData: StockData,
  customGrowthRate?: number
): CalculatedMetrics => {
  // Use custom growth rate or default to EPS growth
  const growthRate = customGrowthRate !== undefined 
    ? customGrowthRate 
    : stockData.epsGrowth;

  const stickerPrice = calculateStickerPrice(stockData.eps, growthRate);
  const mosPrice = calculateMOSPrice(stickerPrice);
  const signal = determineSignal(stockData.currentPrice, stickerPrice, mosPrice);

  return {
    stickerPrice,
    mosPrice,
    signal,
    customGrowthRate: growthRate,
  };
};

/**
 * Calculate the default growth rate (LOWEST of available growth metrics)
 * Throws error if no valid growth rates available
 */
export const calculateDefaultGrowthRate = (stockData: StockData): number => {
  const rates = [stockData.epsGrowth, stockData.salesGrowth];
  if (stockData.bookValueGrowth !== null && stockData.bookValueGrowth !== undefined) {
    rates.push(stockData.bookValueGrowth);
  }
  
  const validRates = rates.filter(rate => rate !== null && rate !== undefined && rate > 0);
  if (validRates.length === 0) {
    throw new Error('No valid growth rate data available. Growth rates are required for calculations.');
  }
  
  // Return the minimum (most conservative) growth rate
  return Math.min(...validRates);
};

