import { StockData } from '../types';
import { FisherCriterion, FISHER_CRITERIA_TEMPLATE } from '../types/fisher';

/**
 * Calculate Fisher criteria ratings from Alpha Vantage data
 * These are the quantitative criteria that can be auto-calculated
 */
export const calculateQuantitativeFisherCriteria = (stockData: StockData): Partial<FisherCriterion>[] => {
  const results: Partial<FisherCriterion>[] = [];
  
  // Criterion 1: Products/Services with Market Potential
  // Based on revenue growth rate
  const marketPotentialRating = rateMarketPotential(stockData);
  results.push({
    id: 1,
    title: FISHER_CRITERIA_TEMPLATE[0].title,
    description: FISHER_CRITERIA_TEMPLATE[0].description,
    category: 'quantitative',
    rating: marketPotentialRating.rating,
    justification: marketPotentialRating.justification,
    dataSource: 'alpha_vantage',
    confidence: 'high',
    sources: ['Alpha Vantage API - Revenue Growth'],
    lastUpdated: new Date(),
  });
  
  // Criterion 5: Profit Margin
  // Based on operating margins and ROE
  const profitMarginRating = rateProfitMargin(stockData);
  results.push({
    id: 5,
    title: FISHER_CRITERIA_TEMPLATE[4].title,
    description: FISHER_CRITERIA_TEMPLATE[4].description,
    category: 'quantitative',
    rating: profitMarginRating.rating,
    justification: profitMarginRating.justification,
    dataSource: 'alpha_vantage',
    confidence: 'high',
    sources: ['Alpha Vantage API - ROE, Financial Ratios'],
    lastUpdated: new Date(),
  });
  
  // Note: Criterion 10 (Cost Analysis) moved to Gemini AI for better qualitative analysis
  
  return results;
};

/**
 * Rate market potential based on revenue and EPS growth
 */
function rateMarketPotential(stockData: StockData): { rating: number; justification: string } {
  const avgGrowth = (stockData.epsGrowth + stockData.salesGrowth) / 2;
  
  let rating: number;
  let justification: string;
  
  if (avgGrowth >= 20) {
    rating = 5;
    justification = `Exceptional growth potential with ${avgGrowth.toFixed(1)}% average growth rate. Revenue growth: ${stockData.salesGrowth.toFixed(1)}%, EPS growth: ${stockData.epsGrowth.toFixed(1)}%. This indicates strong market demand and expansion capability.`;
  } else if (avgGrowth >= 15) {
    rating = 4;
    justification = `Strong growth potential with ${avgGrowth.toFixed(1)}% average growth rate. Revenue growth: ${stockData.salesGrowth.toFixed(1)}%, EPS growth: ${stockData.epsGrowth.toFixed(1)}%. Above-average market expansion.`;
  } else if (avgGrowth >= 10) {
    rating = 3;
    justification = `Moderate growth potential with ${avgGrowth.toFixed(1)}% average growth rate. Revenue growth: ${stockData.salesGrowth.toFixed(1)}%, EPS growth: ${stockData.epsGrowth.toFixed(1)}%. Steady but not exceptional.`;
  } else if (avgGrowth >= 5) {
    rating = 2;
    justification = `Below-average growth potential with ${avgGrowth.toFixed(1)}% average growth rate. Revenue growth: ${stockData.salesGrowth.toFixed(1)}%, EPS growth: ${stockData.epsGrowth.toFixed(1)}%. Limited expansion potential.`;
  } else {
    rating = 1;
    justification = `Poor growth potential with ${avgGrowth.toFixed(1)}% average growth rate. Revenue growth: ${stockData.salesGrowth.toFixed(1)}%, EPS growth: ${stockData.epsGrowth.toFixed(1)}%. Minimal market expansion capability.`;
  }
  
  return { rating, justification };
}

/**
 * Rate profit margins based on ROE
 */
function rateProfitMargin(stockData: StockData): { rating: number; justification: string } {
  const roe = stockData.roe || 0;
  
  let rating: number;
  let justification: string;
  
  if (roe >= 20) {
    rating = 5;
    justification = `Excellent profit margins with ${roe.toFixed(1)}% ROE. This demonstrates superior capital efficiency and strong pricing power, placing the company well above industry averages.`;
  } else if (roe >= 15) {
    rating = 4;
    justification = `Good profit margins with ${roe.toFixed(1)}% ROE. Above-average returns on equity indicate effective management and competitive advantages.`;
  } else if (roe >= 10) {
    rating = 3;
    justification = `Average profit margins with ${roe.toFixed(1)}% ROE. Acceptable returns but room for improvement in operational efficiency.`;
  } else if (roe >= 5) {
    rating = 2;
    justification = `Below-average profit margins with ${roe.toFixed(1)}% ROE. Returns are subpar, indicating challenges in operational efficiency or competitive positioning.`;
  } else {
    rating = 1;
    justification = `Poor profit margins with ${roe.toFixed(1)}% ROE. Very low returns on equity suggest significant operational or competitive challenges.`;
  }
  
  return { rating, justification };
}

/**
 * Calculate overall Fisher score from all criteria
 */
export const calculateOverallFisherScore = (criteria: FisherCriterion[]): number => {
  const validRatings = criteria
    .filter(c => c.rating !== null)
    .map(c => c.rating as number);
  
  if (validRatings.length === 0) return 0;
  
  const sum = validRatings.reduce((acc, rating) => acc + rating, 0);
  return sum / validRatings.length;
};

/**
 * Get color for Fisher rating
 */
export const getFisherRatingColor = (rating: number | null): string => {
  if (rating === null) return '#9ca3af'; // gray
  if (rating >= 4) return '#10b981'; // green
  if (rating >= 3) return '#f59e0b'; // yellow
  return '#ef4444'; // red
};

/**
 * Get rating label
 */
export const getFisherRatingLabel = (rating: number | null): string => {
  if (rating === null) return 'Not Rated';
  if (rating >= 4.5) return 'Excellent';
  if (rating >= 4) return 'Good';
  if (rating >= 3) return 'Average';
  if (rating >= 2) return 'Below Average';
  return 'Poor';
};

