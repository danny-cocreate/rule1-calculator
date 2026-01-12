# StockData.org API Investigation & Mapping Plan

## Current Status

✅ **Working:**
- Price information is being retrieved successfully
- Quote endpoint is functional

❌ **Missing/Unknown:**
- EPS (Earnings Per Share)
- EPS Growth Rate
- Sales/Revenue Growth Rate
- Book Value Growth
- ROE (Return on Equity)
- Debt-to-Equity Ratio
- Current Ratio
- PE Ratio (might be calculable)
- Company Name (might be in quote response)

## Required Data Fields

### Critical (Required for Sticker Price Calculation)
1. **EPS** - Required for `calculateStickerPrice()`
   - Current calculation: `stickerPrice = calculateStickerPrice(stockData.eps, growthRate)`
   - Default fallback: `1.0` (not ideal)

2. **EPS Growth** - Required for default growth rate
   - Used in: `calculateDefaultGrowthRate()` - takes minimum of epsGrowth, salesGrowth, bookValueGrowth
   - Default fallback: `8%`

3. **Sales Growth** - Required for default growth rate
   - Used in: `calculateDefaultGrowthRate()`
   - Default fallback: `8%`

### Important (For Financial Health Display)
4. **ROE** - Displayed in FinancialHealth component
   - Used in: Fisher Scorecard calculations (Criterion #5: Profit Margin)
   - Current status: Shows "N/A" if null

5. **Debt-to-Equity** - Displayed in FinancialHealth component
   - Current status: Shows "N/A" if null

6. **Current Ratio** - Displayed in FinancialHealth component
   - Current status: Shows "N/A" if null

7. **PE Ratio** - Displayed in FinancialHealth component
   - Can be calculated: `PE = Price / EPS` if we have both

### Optional
8. **Book Value Growth** - Used in default growth rate calculation if available
   - Current status: Optional, can be null

9. **Company Name** - Displayed in UI
   - Current status: Falls back to symbol if not available

## Actual Findings (From Console Logs)

### ✅ Quote Endpoint Response Structure

**Endpoint Working:** `/data/quote?symbols=NVDA&api_token=...`

**Available Fields (19 fields total):**
```json
{
  "ticker": "NVDA",
  "name": "NVIDIA Corporation",
  "exchange_short": null,
  "exchange_long": null,
  "price": 184.82,
  "day_high": 186.34,
  "day_low": 183.69,
  "day_open": 185.07,
  "previous_close_price": 185,
  "day_change": -0.1,
  "volume": 2644521,
  "last_trade_time": "2026-01-09T15:59:58.000000",
  "52_week_high": null,
  "52_week_low": null,
  "market_cap": null
  // ... additional fields (19 total)
}
```

**Confirmed Available:**
- ✅ `ticker` - Symbol
- ✅ `name` - Company Name
- ✅ `price` - Current Price
- ✅ `day_high`, `day_low`, `day_open` - Intraday data
- ✅ `previous_close_price` - Previous close
- ✅ `day_change` - Daily change
- ✅ `volume` - Trading volume
- ✅ `last_trade_time` - Last trade timestamp

**Confirmed Missing from Quote:**
- ❌ EPS (earnings per share)
- ❌ PE Ratio
- ❌ ROE
- ❌ Debt-to-Equity
- ❌ Current Ratio
- ❌ EPS Growth
- ❌ Revenue/Sales Growth
- ❌ Book Value Growth

### ❌ Fundamentals Endpoints - All Fail

**Tested Endpoints (All Return 404):**
1. `/entity/fundamentals?symbols=NVDA&api_token=...` → **404 Not Found**
2. `/data/fundamentals?symbols=NVDA&api_token=...` → **404 Not Found**
3. `/fundamentals?symbol=NVDA&api_token=...` → **404 Not Found**

**Conclusion:** StockData.org does NOT provide fundamentals endpoints on the free tier (or possibly at all).

## Investigation Plan

### Step 1: Analyze Quote Endpoint Response ✅ COMPLETE

**Actions:**
1. Check browser console for "StockData.org full response" log
2. Document ALL fields in the quote response
3. Identify what fields ARE available vs what we need

**Expected Fields in Quote Response:**
- `price`, `close`, `last_price`, `latest_price` (one of these should be price)
- `ticker`, `symbol` (symbol)
- `name`, `company_name` (company name - might be here)
- `eps`, `earnings_per_share` (might be here)
- `pe`, `pe_ratio`, `price_to_earnings` (might be here)
- Other fields that might help

**Check Console Logs For:** ✅ DONE
- ✅ `console.log('StockData.org full response:', ...)` - Confirmed structure
- ✅ `console.log('StockData.org quote response:', ...)` - Confirmed fields
- ✅ `console.log('Extracting data from quote:', ...)` - Confirmed 19 fields

### Step 2: Test Fundamentals Endpoints ✅ COMPLETE

**Endpoints to Test:**
1. `/entity/fundamentals?symbols=AAPL&api_token=...`
2. `/data/fundamentals?symbols=AAPL&api_token=...`
3. `/fundamentals?symbol=AAPL&api_token=...`
4. `/entity/fundamentals?symbol=AAPL&api_token=...`

**Expected Outcomes:** ✅ CONFIRMED
- ❌ All endpoints return 404 Not Found
- ❌ No fundamentals endpoint exists

**Check Console Logs For:** ✅ DONE
- ✅ All endpoints logged: `/entity/fundamentals`, `/data/fundamentals`, `/fundamentals`
- ✅ All returned 404 errors
- ✅ `console.warn('No fundamentals data available from any endpoint')` - Confirmed

### Step 3: Identify Available Data Sources ✅ COMPLETE

**Based on Web Research:**
- StockData.org appears to focus on **price data, news, and sentiment**
- May NOT provide comprehensive fundamentals data
- Free tier might have limited access

**Alternative Approaches to Consider:**

#### Option A: Use Quote Data Only ❌ INSUFFICIENT
- ✅ Extract available data from quote endpoint
- ❌ Cannot calculate PE (no EPS available)
- ⚠️ Must use defaults for critical fields (EPS, growth rates)
- **Result:** App will work but with limited accuracy

#### Option B: Hybrid Approach ✅ RECOMMENDED
- ✅ Use StockData.org for price data (working well)
- ✅ Integrate additional API for fundamentals
- **Fallback chain:** Alternative API fundamentals → Defaults
- **Options:**
  - **Alpha Vantage** (if user still has access)
  - **EodHistoricalData API** (provides fundamentals)
  - **Yahoo Finance API** (free, unofficial but reliable)
  - **Financial Modeling Prep API** (free tier available)

#### Option C: Alternative API for Fundamentals ✅ BEST OPTION
- ✅ Keep StockData.org for price data
- ✅ Add separate fundamentals API
- **Recommended:**
  1. **EodHistoricalData** - Good free tier, includes fundamentals
  2. **Financial Modeling Prep** - Comprehensive fundamentals, free tier
  3. **Alpha Vantage** - Back to original (if user wants to try again)

## Field Mapping Plan - ACTUAL IMPLEMENTATION

### Quote Endpoint Fields → StockData Interface

#### Confirmed Working:
```typescript
// currentPrice - WORKING ✅
const currentPrice = parseFloat(quoteData.price) || 0;  // Simplified - we know this field exists

// symbol - WORKING ✅
const symbol = quoteData.ticker || symbol;  // 'ticker' field is confirmed

// companyName - WORKING ✅
const companyName = quoteData.name || symbol;  // 'name' field is confirmed
```

#### Confirmed Missing (Not in quote response):
```typescript
// These fields DO NOT exist in StockData.org quote response:

// ❌ EPS - NOT AVAILABLE
// Must get from alternative source or use default
eps = 1.0;  // Default fallback (not ideal for calculations)

// ❌ PE Ratio - NOT AVAILABLE  
// Cannot calculate (no EPS), must get from alternative source
peRatio = null;  // Will show "N/A" in UI

// ❌ Growth Rates - NOT AVAILABLE
epsGrowth = 0.08;  // 8% default
salesGrowth = 0.08;  // 8% default
bookValueGrowth = null;  // Optional

// ❌ Financial Ratios - NOT AVAILABLE
roe = null;  // Will show "N/A"
debtToEquity = null;  // Will show "N/A"
currentRatio = null;  // Will show "N/A"
```

### Fundamentals Endpoint Fields → StockData Interface

**❌ Fundamentals Endpoints DO NOT EXIST**

**All tested endpoints return 404:**
- `/entity/fundamentals` → 404
- `/data/fundamentals` → 404  
- `/fundamentals` → 404

**Conclusion:** StockData.org does NOT provide fundamentals data through their API.

**Alternative Solution Required:**

#### Financial Ratios:
```typescript
// ROE
roe = fundamentals.roe || 
      fundamentals.return_on_equity || 
      fundamentals.returnOnEquity ||
      fundamentals.ROE ||
      null;

// Debt-to-Equity
debtToEquity = fundamentals.debt_to_equity || 
               fundamentals.total_debt_to_equity ||
               fundamentals.debtToEquity ||
               fundamentals.debtToEquityRatio ||
               null;

// Current Ratio
currentRatio = fundamentals.current_ratio || 
               fundamentals.currentRatio ||
               fundamentals.currentRatioRatio ||
               null;
```

#### Growth Rates:
```typescript
// EPS Growth (year-over-year)
epsGrowth = fundamentals.eps_growth_yoy ||
           fundamentals.earnings_growth_yoy ||
           fundamentals.eps_growth ||
           fundamentals.earnings_growth ||
           fundamentals.epsGrowthRate ||
           0.08;  // 8% default

// Revenue/Sales Growth
salesGrowth = fundamentals.revenue_growth_yoy ||
             fundamentals.sales_growth_yoy ||
             fundamentals.revenue_growth ||
             fundamentals.sales_growth ||
             fundamentals.revenueGrowthRate ||
             0.08;  // 8% default

// Book Value Growth
bookValueGrowth = fundamentals.book_value_growth_yoy ||
                 fundamentals.bvps_growth_yoy ||
                 fundamentals.book_value_growth ||
                 fundamentals.bvps_growth ||
                 null;  // optional
```

#### Earnings Data:
```typescript
// EPS (might be in fundamentals instead of quote)
eps = parseFloat(fundamentals.eps) || 
      parseFloat(fundamentals.earnings_per_share) ||
      parseFloat(fundamentals.diluted_eps) ||
      parseFloat(fundamentals.epsTTM) ||
      1.0;  // fallback
```

## Implementation Priority

### Phase 1: Extract Available Quote Data (HIGH PRIORITY)
1. ✅ Log all quote response fields
2. ✅ Extract company name from quote
3. ✅ Extract EPS from quote (if available)
4. ✅ Extract PE from quote (if available)
5. ✅ Calculate PE from Price/EPS if both available

### Phase 2: Test Fundamentals Endpoints (MEDIUM PRIORITY)
1. ✅ Try all fundamentals endpoint variations
2. ✅ Log which endpoint works (if any)
3. ✅ Extract all available fundamentals fields
4. ✅ Map fundamentals to our interface

### Phase 3: Handle Missing Data (HIGH PRIORITY)
1. Document which fields are missing
2. Update UI to clearly indicate when using defaults
3. Consider adding secondary data source
4. Add user warnings for incomplete data

### Phase 4: Optimization (LOW PRIORITY)
1. Cache fundamentals data if available
2. Batch requests if possible
3. Add data validation
4. Improve error messages

## Console Logging Checklist

When testing, verify these console logs appear:

- [ ] `Successfully used endpoint: /data/quote` (or similar)
- [ ] `StockData.org full response: {...}` (full JSON structure)
- [ ] `Extracting data from quote: [...]` (list of available fields)
- [ ] `StockData.org quote response: {...}` (quote data object)
- [ ] `Fundamentals endpoint ... response: {...}` (for each endpoint tested)
- [ ] `Successfully fetched fundamentals from ...` (if successful)
- [ ] `Fundamentals data: {...}` (fundamentals structure)
- [ ] `No fundamentals data available from any endpoint` (if all fail)

## Next Steps

1. **Run the application** and check browser console
2. **Search for a stock** (e.g., AAPL, MSFT)
3. **Document the actual response structure** from console logs
4. **Identify which fields are available** vs missing
5. **Update field mappings** based on actual API response structure
6. **Implement fallbacks** for missing critical data
7. **Consider alternative data sources** if fundamentals aren't available

## Questions to Answer

1. Does the quote endpoint provide EPS or PE ratio?
2. Does any fundamentals endpoint exist and return data?
3. What is the exact field name structure in the response?
4. Are growth rates available in any form?
5. Can we calculate missing ratios from available data?
6. Do we need a secondary API for fundamentals?
