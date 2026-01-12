# Yahoo Finance API Integration Plan

## Overview

Integrating **Yahoo Finance API via RapidAPI** as the fundamentals data source, while keeping **StockData.org** for price data.

**API Details:**
- **Provider:** RapidAPI - Yahoo Finance15
- **URL:** https://rapidapi.com/sparior/api/yahoo-finance15
- **Free Tier:** 500 API calls/month
- **Additional:** $0.002 per call (very affordable)

## Why Yahoo Finance via RapidAPI?

### Advantages:
- ✅ **Good free tier:** 500 calls/month = ~16 calls/day
- ✅ **Affordable pricing:** $0.002 per additional call
- ✅ **Comprehensive data:** Full fundamentals including EPS, ratios, growth rates
- ✅ **Well-documented:** Easy integration via RapidAPI
- ✅ **Reliable:** Widely used and maintained
- ✅ **Complete solution:** Can provide all missing fields

### Our Usage:
- 1-2 API calls per stock search (1 for price from StockData.org, 1 for fundamentals from Yahoo Finance)
- 500 calls/month = ~250-500 stock searches/month (free tier)
- More than sufficient for personal/testing use

## Implementation Strategy

### Architecture:
```
User searches stock
  ↓
[StockData.org] → Get price, symbol, company name (1 call)
  ↓
[Yahoo Finance] → Get fundamentals (EPS, growth, ratios) (1 call)
  ↓
Merge data → Display complete StockData
```

### Data Flow:
1. **Primary Source: StockData.org** (Price data)
   - Endpoint: `/data/quote`
   - Returns: `price`, `ticker`, `name`, volume, etc.

2. **Secondary Source: Yahoo Finance** (Fundamentals)
   - Endpoint: Need to identify correct endpoint from RapidAPI docs
   - Returns: `eps`, `peRatio`, `roe`, `debtToEquity`, `currentRatio`, growth rates, etc.

3. **Merge:** Combine both responses into our `StockData` interface

## Required Steps

### Step 1: Sign Up on RapidAPI

1. **Create account:** https://rapidapi.com/
2. **Subscribe to Yahoo Finance API:**
   - Go to: https://rapidapi.com/sparior/api/yahoo-finance15
   - Choose **Basic** plan (500 calls/month free)
   - Subscribe
3. **Get API Key:**
   - Copy your `X-RapidAPI-Key` from RapidAPI dashboard
   - Add to `.env` file as `VITE_YAHOO_FINANCE_API_KEY`

### Step 2: Identify Correct Endpoint

**Need to investigate:**
- Which endpoint provides fundamentals data?
- Common endpoints:
  - `/v1/get-summary` - Summary/overview
  - `/v1/get-statistics` - Financial statistics
  - `/v1/get-financials` - Financial statements
  - `/v1/get-key-statistics` - Key metrics (EPS, PE, etc.)

**Test endpoint structure:**
```javascript
// Example endpoint format
GET https://yahoo-finance15.p.rapidapi.com/api/v1/{endpoint}
Headers:
  X-RapidAPI-Key: your_api_key
  X-RapidAPI-Host: yahoo-finance15.p.rapidapi.com
```

### Step 3: Create Yahoo Finance Service

**File: `src/services/yahooFinanceService.ts`**

```typescript
import axios from 'axios';
import { StockData } from '../types';

const RAPIDAPI_KEY = import.meta.env.VITE_YAHOO_FINANCE_API_KEY || '';
const RAPIDAPI_HOST = 'yahoo-finance15.p.rapidapi.com';
const BASE_URL = 'https://yahoo-finance15.p.rapidapi.com/api/v1';

export const fetchFundamentals = async (symbol: string): Promise<Partial<StockData>> => {
  try {
    if (!RAPIDAPI_KEY) {
      throw new Error('Yahoo Finance API key is not configured. Please set VITE_YAHOO_FINANCE_API_KEY in your environment variables.');
    }

    // Try different endpoints to get fundamentals
    // Need to test which endpoint provides the best data
    const endpoints = [
      { path: '/get-statistics', params: { ticker: symbol } },
      { path: '/get-key-statistics', params: { ticker: symbol } },
      { path: '/get-financials', params: { ticker: symbol } },
      { path: '/get-summary', params: { ticker: symbol } },
    ];

    let fundamentals = null;
    
    for (const endpoint of endpoints) {
      try {
        const response = await axios.get(`${BASE_URL}${endpoint.path}`, {
          params: endpoint.params,
          headers: {
            'X-RapidAPI-Key': RAPIDAPI_KEY,
            'X-RapidAPI-Host': RAPIDAPI_HOST,
          },
        });

        console.log(`Yahoo Finance ${endpoint.path} response:`, response.data);

        if (response.data && !response.data.error) {
          fundamentals = response.data;
          console.log(`Successfully fetched from ${endpoint.path}`);
          break;
        }
      } catch (error) {
        console.log(`Yahoo Finance ${endpoint.path} failed, trying next...`);
        continue;
      }
    }

    if (!fundamentals) {
      throw new Error('Unable to fetch fundamentals from Yahoo Finance API');
    }

    // Map Yahoo Finance response to our StockData interface
    // Field names will depend on actual API response structure
    // Need to inspect response to map correctly
    
    return {
      eps: parseFloat(fundamentals.eps) || 
           parseFloat(fundamentals.earningsPerShare) ||
           parseFloat(fundamentals.trailingEps) ||
           1.0,
      
      peRatio: parseFloat(fundamentals.peRatio) || 
               parseFloat(fundamentals.priceToEarnings) ||
               parseFloat(fundamentals.trailingPE) ||
               null,
      
      roe: parseFloat(fundamentals.returnOnEquity) || 
           parseFloat(fundamentals.roe) ||
           null,
      
      debtToEquity: parseFloat(fundamentals.debtToEquity) || 
                    parseFloat(fundamentals.totalDebtToEquity) ||
                    null,
      
      currentRatio: parseFloat(fundamentals.currentRatio) || 
                    parseFloat(fundamentals.liquidityRatio) ||
                    null,
      
      // Growth rates - might need separate endpoint or calculation
      epsGrowth: parseFloat(fundamentals.epsGrowth) || 
                 parseFloat(fundamentals.earningsGrowth) ||
                 0.08,
      
      salesGrowth: parseFloat(fundamentals.revenueGrowth) || 
                   parseFloat(fundamentals.salesGrowth) ||
                   0.08,
    };
  } catch (error) {
    console.error('Error fetching fundamentals from Yahoo Finance:', error);
    throw error;
  }
};
```

### Step 4: Update StockData Service

**File: `src/services/stockDataService.ts`**

```typescript
import { fetchFundamentals } from './yahooFinanceService';

export const fetchStockData = async (symbol: string): Promise<StockData> => {
  try {
    // 1. Get price data from StockData.org
    const quoteResponse = await fetchFromStockDataOrg(symbol);
    const quoteData = extractQuoteData(quoteResponse);

    // 2. Get fundamentals from Yahoo Finance
    let fundamentals = null;
    try {
      fundamentals = await fetchFundamentals(symbol);
      console.log('Yahoo Finance fundamentals:', fundamentals);
    } catch (error) {
      console.warn('Yahoo Finance API failed, using defaults:', error);
      // Continue with defaults if Yahoo Finance fails
    }

    // 3. Merge data
    const stockData: StockData = {
      symbol: quoteData.ticker || symbol,
      companyName: quoteData.name || symbol,
      currentPrice: parseFloat(quoteData.price) || 0,
      
      // From Yahoo Finance (if available)
      eps: fundamentals?.eps || 1.0,
      peRatio: fundamentals?.peRatio || null,
      roe: fundamentals?.roe || null,
      debtToEquity: fundamentals?.debtToEquity || null,
      currentRatio: fundamentals?.currentRatio || null,
      epsGrowth: fundamentals?.epsGrowth || 0.08,
      salesGrowth: fundamentals?.salesGrowth || 0.08,
      bookValueGrowth: fundamentals?.bookValueGrowth || null,
      
      lastUpdated: new Date().toLocaleString(),
    };

    return stockData;
  } catch (error) {
    // Handle errors
  }
};
```

### Step 5: Update Environment Variables

**File: `.env`**

```env
# StockData.org (for price data)
VITE_STOCKDATA_API_KEY=Tsdj7Z3d3OwzL1MO3UJW4uunrRGOABTzuEqQWOlj

# Yahoo Finance via RapidAPI (for fundamentals)
VITE_YAHOO_FINANCE_API_KEY=your_rapidapi_key_here
```

**File: `src/vite-env.d.ts`**

```typescript
interface ImportMetaEnv {
  readonly VITE_STOCKDATA_API_KEY: string
  readonly VITE_YAHOO_FINANCE_API_KEY: string  // Add this
  readonly VITE_GEMINI_API_KEY: string
}
```

### Step 6: Testing Plan

1. **Test Yahoo Finance API:**
   - Subscribe to RapidAPI
   - Test endpoints manually or with Postman
   - Document response structure
   - Identify correct endpoint for fundamentals

2. **Test Integration:**
   - Test with multiple stocks (AAPL, MSFT, NVDA)
   - Verify all fields are populated
   - Check error handling
   - Monitor API usage

3. **Verify Data Quality:**
   - Compare EPS values with known sources
   - Verify growth rates are reasonable
   - Check ratios are correct

## Expected Field Mappings

### From Yahoo Finance API Response

**Need to verify actual response structure, but expected fields:**

```typescript
// Key Statistics Endpoint
{
  eps: number,                    // Earnings per share
  peRatio: number,                // Price-to-Earnings ratio
  returnOnEquity: number,         // ROE (%)
  debtToEquity: number,           // Debt-to-Equity ratio
  currentRatio: number,           // Current Ratio
  earningsGrowth: number,         // EPS Growth (%)
  revenueGrowth: number,          // Revenue Growth (%)
  // ... additional fields
}
```

## Cost Analysis

### Monthly Usage Scenarios:

| Searches/Day | Calls/Day | Calls/Month | Free Tier Covers? | Additional Cost |
|--------------|-----------|-------------|-------------------|-----------------|
| 5 | 10 | 300 | ✅ Yes | $0 |
| 10 | 20 | 600 | ⚠️ Partial | $0.20 ($0.002 × 100) |
| 20 | 40 | 1,200 | ❌ No | $1.40 ($0.002 × 700) |
| 50 | 100 | 3,000 | ❌ No | $5.00 ($0.002 × 2,500) |

**Conclusion:** Free tier is excellent for personal/testing use. Even heavy usage is very affordable.

## Fallback Strategy

If Yahoo Finance API fails:
1. ✅ Continue with StockData.org price data
2. ⚠️ Use defaults for fundamentals (EPS=1.0, Growth=8%)
3. 📝 Log warning to console
4. 🎨 Show UI indicator that data is estimated

## Next Steps

1. **Sign up on RapidAPI** - Get API key
2. **Test endpoints** - Identify which endpoint provides best fundamentals
3. **Implement service** - Create `yahooFinanceService.ts`
4. **Update stockDataService** - Integrate Yahoo Finance data
5. **Test thoroughly** - Verify all fields populate correctly
6. **Update documentation** - Document new API usage

## Comparison with Alternatives

| Feature | Yahoo Finance (RapidAPI) | Financial Modeling Prep | EodHistoricalData |
|---------|-------------------------|------------------------|-------------------|
| Free Tier | 500/month | 250/day | Limited |
| Additional Cost | $0.002/call | Varies | $0.01-0.02/call |
| Data Quality | ✅ Excellent | ✅ Excellent | ✅ Good |
| Documentation | ✅ Good (RapidAPI) | ✅ Good | ⚠️ Varies |
| Ease of Use | ✅ Easy | ✅ Easy | ⚠️ Moderate |
| **Recommendation** | **✅ BEST** | ✅ Good | ⚠️ Alternative |

## Conclusion

**Yahoo Finance API via RapidAPI** is an excellent choice because:
- Generous free tier (500 calls/month)
- Very affordable if you exceed free tier
- Comprehensive fundamentals data
- Easy integration
- Reliable and well-maintained

This solves the missing fundamentals data problem while keeping StockData.org for price data (which works great).
