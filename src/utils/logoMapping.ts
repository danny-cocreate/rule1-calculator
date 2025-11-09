// Mapping of stock symbols to company domains for logo.dev API
// This helps convert stock symbols to their actual company domains

const DOMAIN_MAP: Record<string, string> = {
  // Tech Giants
  'AAPL': 'apple.com',
  'MSFT': 'microsoft.com',
  'GOOGL': 'google.com',
  'GOOG': 'google.com',
  'AMZN': 'amazon.com',
  'META': 'meta.com',
  'TSLA': 'tesla.com',
  'NVDA': 'nvidia.com',
  'NFLX': 'netflix.com',
  
  // Financial
  'JPM': 'jpmorganchase.com',
  'V': 'visa.com',
  'MA': 'mastercard.com',
  'BAC': 'bankofamerica.com',
  'WFC': 'wellsfargo.com',
  'GS': 'goldmansachs.com',
  'MS': 'morganstanley.com',
  'C': 'citigroup.com',
  'BRK.B': 'berkshirehathaway.com',
  'BRK.A': 'berkshirehathaway.com',
  
  // Retail & Consumer
  'WMT': 'walmart.com',
  'HD': 'homedepot.com',
  'MCD': 'mcdonalds.com',
  'NKE': 'nike.com',
  'SBUX': 'starbucks.com',
  'TGT': 'target.com',
  'COST': 'costco.com',
  'DIS': 'disney.com',
  'KO': 'coca-cola.com',
  'PEP': 'pepsi.com',
  
  // Healthcare & Pharma
  'JNJ': 'jnj.com',
  'UNH': 'unitedhealthgroup.com',
  'PFE': 'pfizer.com',
  'ABBV': 'abbvie.com',
  'TMO': 'thermofisher.com',
  'MRK': 'merck.com',
  'ABT': 'abbott.com',
  
  // Industrial & Aviation
  'BA': 'boeing.com',
  'CAT': 'caterpillar.com',
  'GE': 'ge.com',
  'MMM': '3m.com',
  'HON': 'honeywell.com',
  'LMT': 'lockheedmartin.com',
  
  // Telecom & Media
  'T': 'att.com',
  'VZ': 'verizon.com',
  'CMCSA': 'comcastcorporation.com',
  
  // Energy
  'XOM': 'exxonmobil.com',
  'CVX': 'chevron.com',
  'COP': 'conocophillips.com',
  
  // Automotive
  'F': 'ford.com',
  'GM': 'gm.com',
  
  // Semiconductors
  'INTC': 'intel.com',
  'AMD': 'amd.com',
  'QCOM': 'qualcomm.com',
  'TSM': 'tsmc.com',
  'AVGO': 'broadcom.com',
  
  // Software & Cloud
  'ORCL': 'oracle.com',
  'CRM': 'salesforce.com',
  'ADBE': 'adobe.com',
  'CSCO': 'cisco.com',
  'IBM': 'ibm.com',
  'SAP': 'sap.com',
};

/**
 * Get company domain from stock symbol
 * Falls back to symbol.com if no mapping exists
 */
export const getCompanyDomain = (symbol: string): string => {
  const cleanSymbol = symbol.toUpperCase().trim();
  return DOMAIN_MAP[cleanSymbol] || `${cleanSymbol.toLowerCase()}.com`;
};

/**
 * Check if we have a local logo for this symbol
 */
export const hasLocalLogo = (symbol: string): boolean => {
  const cleanSymbol = symbol.toUpperCase().replace('.', '_');
  // We'll check if the logo exists at build time
  // For now, return true for top 50 companies
  const topSymbols = [
    'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'META', 'NVDA', 'NFLX',
    'JPM', 'V', 'MA', 'BAC', 'WFC', 'GS', 'MS', 'C', 'BRK_B', 'BRK_A',
    'WMT', 'HD', 'MCD', 'NKE', 'SBUX', 'TGT', 'COST', 'DIS', 'KO', 'PEP',
    'JNJ', 'UNH', 'PFE', 'ABBV', 'TMO', 'MRK', 'ABT',
    'BA', 'CAT', 'GE', 'MMM', 'HON', 'LMT',
    'T', 'VZ', 'CMCSA', 'XOM', 'CVX', 'COP', 'F', 'GM', 'INTC', 'AMD'
  ];
  return topSymbols.includes(cleanSymbol);
};

/**
 * Get logo URL for a company
 * Tries local logos first, then falls back to external sources
 * @param symbol Stock symbol
 * @param size Logo size (default: 48)
 */
export const getLogoUrl = (symbol: string, size: number = 48): string => {
  const cleanSymbol = symbol.toUpperCase().replace('.', '_');
  
  // Try local logo first
  if (hasLocalLogo(symbol)) {
    return `/logos/${cleanSymbol}.png`;
  }
  
  // Fall back to external sources
  const domain = getCompanyDomain(symbol);
  return `https://logo.clearbit.com/${domain}`;
};

/**
 * Get fallback logo URL (Google's favicon service - rarely blocked)
 * @param symbol Stock symbol
 * @param size Logo size (default: 48)
 */
export const getFallbackLogoUrl = (symbol: string, size: number = 48): string => {
  const domain = getCompanyDomain(symbol);
  
  // Google's favicon service - more reliable, less likely to be blocked
  return `https://www.google.com/s2/favicons?domain=${domain}&sz=${size}`;
};

