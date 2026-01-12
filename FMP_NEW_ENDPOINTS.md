# FMP New Endpoints Research

## Documentation Analysis

Based on the FMP documentation at https://site.financialmodelingprep.com/developer/docs, I found:

### Key Finding: `/stable/` Base URL

The new API uses `/stable/` instead of `/api/v3/`:
- **Old (Legacy)**: `https://financialmodelingprep.com/api/v3/quote/AAPL`
- **New**: `https://financialmodelingprep.com/stable/profile?symbol=AAPL`

## Available Endpoints from Documentation

### 1. Company Profile ✅
**Endpoint:** `https://financialmodelingprep.com/stable/profile?symbol=AAPL`
- Provides: Company name, market cap, price, sector, industry, etc.
- **This replaces:** `/api/v3/profile/{symbol}`

### 2. Quote/Price Data
**Need to find:** Individual quote endpoint (not bulk)
- Documentation shows bulk endpoints but need to check for individual quote

### 3. Key Metrics TTM
**Bulk endpoint:** `/stable/key-metrics-ttm-bulk`
- **Question:** Is there an individual endpoint like `/stable/key-metrics-ttm?symbol=AAPL`?

### 4. Ratios TTM
**Bulk endpoint:** `/stable/ratios-ttm-bulk`
- **Question:** Is there an individual endpoint like `/stable/ratios-ttm?symbol=AAPL`?

### 5. Income Statement Growth
**Bulk endpoint:** `/stable/income-statement-growth-bulk`
- **Question:** Is there an individual endpoint?

## Next Steps

1. Test if individual endpoints exist (try `/stable/key-metrics-ttm?symbol=AAPL`)
2. If only bulk exists, we may need to filter by symbol
3. Update BASE_URL from `/api/v3` to `/stable`
4. Update all endpoint calls

## Testing Plan

Test these potential endpoints:
- `/stable/profile?symbol=AAPL&apikey=KEY`
- `/stable/key-metrics-ttm?symbol=AAPL&apikey=KEY`
- `/stable/ratios-ttm?symbol=AAPL&apikey=KEY`
- `/stable/quote?symbol=AAPL&apikey=KEY` (if exists)
