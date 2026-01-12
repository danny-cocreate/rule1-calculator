# Replace StockData with FMP - Analysis

## Current Situation

**StockData.org** is currently used ONLY for:
- Real-time stock price (`currentPrice`)
- Company name (fallback)

**FMP** is used for:
- All fundamentals (EPS, growth rates, ratios, ROE, etc.)

## Why Replace?

1. **Simplify**: One API instead of two
2. **Reduce API keys**: One less key to manage
3. **Better rate limits**: FMP (250/day) vs StockData (100/day)
4. **Less complexity**: Fewer endpoints to maintain
5. **Cost**: One less API service to worry about

## FMP Quote Endpoint

FMP provides a `/quote/{symbol}` endpoint that returns:
- Current price
- Volume
- Market cap
- Company name
- And more

This can replace StockData entirely!

## Implementation Plan

1. Add `fetchQuote` function to `fmpService.ts`
2. Update `stockDataService.ts` to use FMP for price data
3. Remove StockData API calls
4. Update environment variables (remove `VITE_STOCKDATA_API_KEY`)
5. Update documentation

## Benefits

- ✅ One API (FMP) for everything
- ✅ One API key to manage
- ✅ Better rate limits (250/day)
- ✅ Simpler codebase
- ✅ Less maintenance
