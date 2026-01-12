# StockData.org Removed - Now Using FMP Only

## What Changed

✅ **Removed**: StockData.org API dependency
✅ **Now Using**: FMP API for everything (quote + fundamentals)

## Benefits

1. **Simpler**: One API instead of two
2. **One API Key**: Only need `VITE_FMP_API_KEY` (remove `VITE_STOCKDATA_API_KEY`)
3. **Better Rate Limits**: FMP (250/day) vs StockData (100/day)
4. **Less Code**: Removed ~100 lines of StockData endpoint handling
5. **Faster**: Parallel fetching of quote + fundamentals

## What You Need to Do

### 1. Remove StockData API Key from Netlify

1. Go to Netlify → Environment variables
2. Delete `VITE_STOCKDATA_API_KEY` (no longer needed)
3. Keep only `VITE_FMP_API_KEY`

### 2. Update Local .env File

Remove this line from `.env`:
```
VITE_STOCKDATA_API_KEY=Tsdj7Z3d3OwzL1MO3UJW4uunrRGOABTzuEqQWOlj
```

Keep only:
```
VITE_FMP_API_KEY=6HhHKgYFoKOlDJqi4THx75eTc6w3N1xq
```

### 3. Test the Changes

After deploying:
1. Search for a stock (e.g., AAPL)
2. Verify price and fundamentals load correctly
3. Check browser console for any errors

## Technical Details

### Before
- StockData.org → Price data
- FMP → Fundamentals data
- **2 API calls per stock lookup**

### After
- FMP → Quote endpoint (price)
- FMP → Fundamentals endpoints
- **2-3 API calls per stock lookup (all from FMP)**

### Code Changes

- `src/services/stockDataService.ts`: Now uses `fetchQuote()` from FMP
- `src/services/fmpService.ts`: Added `fetchQuote()` function
- Removed all StockData.org API endpoint handling

## API Usage

**FMP Free Tier**: 250 calls/day
- Quote: 1 call
- Fundamentals: 1-2 calls (Key Metrics + Growth)
- **Total per stock**: 2-3 calls

This is well within the 250/day limit for normal usage.
