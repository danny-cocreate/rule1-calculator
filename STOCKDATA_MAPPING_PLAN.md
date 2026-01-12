# StockData.org Field Mapping Plan - Implementation Guide

## Executive Summary

**Findings:**
- ✅ StockData.org quote endpoint works well for price data
- ❌ StockData.org does NOT provide fundamentals endpoints (all return 404)
- ⚠️ Critical data missing: EPS, Growth Rates, Financial Ratios

**Solution:**
- Use StockData.org for price/symbol/company name
- Integrate secondary API for fundamentals data
- Implement smart fallbacks

## Current Field Mapping (Quote Data Only)

### Working Mappings

```typescript
// From quoteData object (confirmed fields):
{
  symbol: quoteData.ticker,              // ✅ "NVDA"
  companyName: quoteData.name,           // ✅ "NVIDIA Corporation"
  currentPrice: parseFloat(quoteData.price),  // ✅ 184.82
  lastUpdated: new Date().toLocaleString()    // ✅ Current timestamp
}
```

### Missing Critical Fields (Must Get from Alternative Source)

```typescript
{
  eps: null,                    // ❌ Required for sticker price calculation
  epsGrowth: 0.08,             // ⚠️ Using 8% default (not ideal)
  salesGrowth: 0.08,           // ⚠️ Using 8% default (not ideal)
  bookValueGrowth: null,       // ✅ Optional (can be null)
  roe: null,                   // ❌ Shows "N/A" in Financial Health
  debtToEquity: null,          // ❌ Shows "N/A" in Financial Health
  currentRatio: null,          // ❌ Shows "N/A" in Financial Health
  peRatio: null                // ❌ Shows "N/A" in Financial Health
}
```

## Recommended Solutions

### Option 1: Hybrid API Approach (RECOMMENDED)

**Use StockData.org + Secondary Fundamentals API**

#### Implementation Strategy:

1. **Primary Data Source: StockData.org**
   - Get: `symbol`, `companyName`, `currentPrice`
   - Endpoint: `/data/quote`
   - Status: ✅ Working

2. **Secondary Data Source: Fundamentals API**
   - Get: `eps`, `epsGrowth`, `salesGrowth`, `roe`, `debtToEquity`, `currentRatio`, `peRatio`
   - Options:
     - **Yahoo Finance API via RapidAPI** (✅ RECOMMENDED - Good free tier)
     - **Financial Modeling Prep** (Alternative)
     - **EodHistoricalData** (Alternative)
     - **Alpha Vantage** (Original option, but had rate limit issues)

3. **Fallback Chain:**
   ```
   StockData.org (price) + Fundamentals API (financials)
   ↓ If fundamentals API fails
   StockData.org (price) + Defaults (8% growth, EPS=1.0)
   ```

#### Recommended: Yahoo Finance API via RapidAPI

**Why:**
- ✅ Free tier: 500 API calls/month (Basic plan)
- ✅ Additional calls: $0.002 each (very affordable)
- ✅ Comprehensive fundamentals data
- ✅ Well-documented via RapidAPI
- ✅ Reliable and widely used
- ✅ Access: https://rapidapi.com/sparior/api/yahoo-finance15

**Pricing Comparison:**
| API | Free Tier | Additional Cost |
|-----|-----------|-----------------|
| **Yahoo Finance (RapidAPI)** | 500/month | $0.002/call |
| Financial Modeling Prep | 250/day | Varies |
| EodHistoricalData | Limited | $0.01-0.02/call |
| Alpha Vantage | 25/day, 5/min | Free tier limits |

**Expected Fields Available:**
```typescript
{
  // From Yahoo Finance API endpoints
  // Need to check specific endpoint structure, but typically includes:
  eps: data.eps || data.earningsPerShare,           // Earnings per share
  peRatio: data.peRatio || data.priceToEarnings,    // PE Ratio
  roe: data.returnOnEquity || data.roe,             // ROE (%)
  debtToEquity: data.debtToEquity,                  // Debt/Equity
  currentRatio: data.currentRatio,                  // Current Ratio
  epsGrowth: data.epsGrowth || data.earningsGrowth, // EPS Growth YoY
  salesGrowth: data.revenueGrowth,                  // Revenue Growth YoY
  // ... additional financial metrics
}
```

**Implementation Notes:**
- Uses RapidAPI authentication (X-RapidAPI-Key header)
- Need to subscribe on RapidAPI first
- Free tier: 500 calls/month = ~16 calls/day
- Our app uses 1-2 calls per stock search (price + fundamentals)

#### Alternative: Financial Modeling Prep API

**Why Consider:**
- ✅ Free tier: 250 requests/day (more generous daily limit)
- ✅ Comprehensive fundamentals
- ✅ Direct API (no RapidAPI middleware)

**Fields Available:**
```typescript
{
  // From Financial Modeling Prep /api/v3/profile/{symbol}
  eps: data.eps,                           // Earnings per share
  peRatio: data.peRatio,                   // PE Ratio
  roe: data.returnOnEquity,                // ROE (%)
  debtToEquity: data.debtEquity,           // Debt/Equity
  
  // From /api/v3/income-statement-growth/{symbol}
  epsGrowth: data.growthEps,               // EPS Growth YoY
  salesGrowth: data.growthRevenue,         // Revenue Growth YoY
  
  // From /api/v3/ratios-ttm/{symbol}
  currentRatio: data.currentRatio          // Current Ratio
}
```

### Option 2: Use Defaults with UI Warning

**If we stick with StockData.org only:**

1. ✅ Keep current implementation
2. ⚠️ Add UI warning when using defaults:
   ```typescript
   // Show warning in UI if critical data is missing
   if (stockData.eps === 1.0) {
     showWarning("EPS not available - using default estimate. Calculations may be less accurate.");
   }
   ```
3. ⚠️ Make defaults more conservative:
   ```typescript
   eps: 1.0,              // Conservative default
   epsGrowth: 0.08,       // 8% default
   salesGrowth: 0.08,     // 8% default
   ```

### Option 3: Calculate from Available Data

**Use additional StockData.org endpoints if available:**

1. **Check for alternative endpoints:**
   - `/data/earnings?symbols={symbol}`
   - `/data/financials?symbols={symbol}`
   - `/entity/profile?symbols={symbol}`

2. **Use calculated values:**
   - If market_cap becomes available: Calculate EPS from market_cap/PE
   - Use historical price data to estimate growth trends

## Implementation Plan

### Phase 1: Immediate Fixes (Current Implementation)

**Goal:** Make the app work with StockData.org only, using defaults

**Changes Needed:**

1. **Update stockDataService.ts to properly map quote data:**
   ```typescript
   const stockData: StockData = {
     symbol: quoteData.ticker || symbol,                    // ✅ Confirmed
     companyName: quoteData.name || symbol,                 // ✅ Confirmed
     currentPrice: parseFloat(quoteData.price) || 0,        // ✅ Confirmed
     eps: 1.0,                                              // ⚠️ Default
     epsGrowth: 0.08,                                       // ⚠️ Default (8%)
     salesGrowth: 0.08,                                     // ⚠️ Default (8%)
     bookValueGrowth: null,                                 // ✅ Optional
     roe: null,                                             // ❌ Not available
     debtToEquity: null,                                    // ❌ Not available
     currentRatio: null,                                    // ❌ Not available
     peRatio: null,                                         // ❌ Not available
     lastUpdated: new Date().toLocaleString(),              // ✅ Generated
   };
   ```

2. **Add UI indicator for estimated values:**
   - Show "⚠️ Estimated" badge next to fields using defaults
   - Add tooltip explaining data limitations

### Phase 2: Add Secondary API (Recommended)

**Goal:** Integrate fundamentals API to get real financial data

**Steps:**

1. **Choose fundamentals API:**
   - ✅ **Yahoo Finance via RapidAPI** (RECOMMENDED - good free tier, affordable)
   - Financial Modeling Prep (alternative - more daily calls)
   - EodHistoricalData (alternative)
   - Alpha Vantage (original option, but had rate limit issues)

2. **Create fundamentals service:**
   ```typescript
   // src/services/fundamentalsService.ts
   export const fetchFundamentals = async (symbol: string) => {
     // Fetch from chosen fundamentals API
     // Map to our StockData interface
   };
   ```

3. **Update stockDataService.ts:**
   ```typescript
   // Fetch quote from StockData.org
   const quoteData = await fetchFromStockDataOrg(symbol);
   
   // Fetch fundamentals from secondary API
   let fundamentals = null;
   try {
     fundamentals = await fetchFundamentals(symbol);
   } catch (error) {
     console.warn('Fundamentals API failed, using defaults');
   }
   
   // Merge data
   const stockData = {
     ...quoteData,  // Price, symbol, company name
     ...fundamentals,  // EPS, growth rates, ratios
   };
   ```

4. **Update environment variables:**
   ```env
   VITE_STOCKDATA_API_KEY=Tsdj7Z3d3OwzL1MO3UJW4uunrRGOABTzuEqQWOlj
   VITE_FUNDAMENTALS_API_KEY=your_fundamentals_api_key
   ```

### Phase 3: Enhanced Error Handling

**Goal:** Better user experience when data is missing

**Changes:**

1. **Data quality indicators:**
   ```typescript
   interface StockDataQuality {
     hasRealEPS: boolean;
     hasRealGrowthRates: boolean;
     hasFinancialRatios: boolean;
     dataSource: 'full' | 'partial' | 'minimal';
   }
   ```

2. **Warning messages:**
   ```typescript
   if (!dataQuality.hasRealEPS) {
     showWarning("EPS data estimated. Sticker price calculations may be less accurate.");
   }
   ```

3. **Fallback messaging:**
   ```typescript
   if (peRatio === null) {
     return "N/A (data not available from API)";
   }
   ```

## Specific Field Mappings

### From StockData.org Quote Response

```typescript
// CONFIRMED FIELD MAPPINGS
const mappings = {
  // Direct mappings (exact field names):
  'symbol': quoteData.ticker,                    // ✅ "NVDA"
  'companyName': quoteData.name,                 // ✅ "NVIDIA Corporation"
  'currentPrice': parseFloat(quoteData.price),   // ✅ 184.82
  
  // Additional available fields (not currently used):
  'dayHigh': parseFloat(quoteData.day_high),     // ✅ Available
  'dayLow': parseFloat(quoteData.day_low),       // ✅ Available
  'dayOpen': parseFloat(quoteData.day_open),     // ✅ Available
  'previousClose': parseFloat(quoteData.previous_close_price), // ✅ Available
  'dayChange': parseFloat(quoteData.day_change), // ✅ Available
  'volume': parseInt(quoteData.volume),          // ✅ Available
  'lastTradeTime': quoteData.last_trade_time,    // ✅ Available
  
  // Missing fields (require alternative source):
  'eps': null,                                   // ❌ Not available
  'epsGrowth': null,                             // ❌ Not available
  'salesGrowth': null,                           // ❌ Not available
  'bookValueGrowth': null,                       // ❌ Not available
  'roe': null,                                   // ❌ Not available
  'debtToEquity': null,                          // ❌ Not available
  'currentRatio': null,                          // ❌ Not available
  'peRatio': null,                               // ❌ Not available
};
```

### From Secondary Fundamentals API (To Be Implemented)

**Example using Financial Modeling Prep:**

```typescript
// Profile endpoint: /api/v3/profile/{symbol}
const profileMappings = {
  'eps': data.eps,
  'peRatio': data.peRatio,
  'roe': data.returnOnEquity,
  'debtToEquity': data.debtEquity,
  'currentRatio': data.currentRatio,  // May need ratios endpoint
};

// Growth endpoint: /api/v3/income-statement-growth/{symbol}
const growthMappings = {
  'epsGrowth': data.growthEps,         // Year-over-year growth
  'salesGrowth': data.growthRevenue,   // Year-over-year growth
};
```

## Recommendations

### Short Term (Keep StockData.org Only)

1. ✅ **Accept limitations** - Use defaults with clear UI indicators
2. ⚠️ **Add warnings** - Show users when data is estimated
3. 📝 **Document limitations** - Update README with data availability

### Long Term (Recommended)

1. ✅ **Add fundamentals API** - Integrate Financial Modeling Prep or similar
2. ✅ **Hybrid approach** - Best of both worlds (price + fundamentals)
3. ✅ **Better accuracy** - Real financial data for calculations

## Next Steps

1. **Decision:** Choose between:
   - A) Keep StockData.org only with defaults
   - B) Add secondary fundamentals API
   
2. **If Option B:** Choose fundamentals API provider

3. **Implement chosen solution**

4. **Test thoroughly** with multiple stocks

5. **Update documentation**
