export interface StockData {
  symbol: string;
  companyName: string;
  currentPrice: number;
  eps: number;
  epsGrowth: number;
  salesGrowth: number;
  bookValueGrowth: number | null;
  roe: number | null;
  debtToEquity: number | null;
  currentRatio: number | null;
  peRatio: number | null;
  lastUpdated: string;
}

export interface CalculatedMetrics {
  stickerPrice: number;
  mosPrice: number;
  signal: 'BUY' | 'WAIT' | 'SELL';
  customGrowthRate: number;
}

