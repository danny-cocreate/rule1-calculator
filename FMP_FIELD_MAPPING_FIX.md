# FMP Field Mapping Fix

## Problem Identified

The new `/stable/` endpoints use **different field names** than the legacy `/api/v3/` endpoints:

### Key Finding: EPS Field Name Changed

**Old (Legacy):** `eps`, `earningsPerShare`
**New (/stable/):** `netIncomePerShareTTM` (in Ratios TTM endpoint)

From test results:
- Ratios TTM contains: `netIncomePerShareTTM: 7.49305950429809` ← This is EPS!
- No `eps` or `earningsPerShare` field found in any endpoint

## Field Name Mappings

| Data | Old Field Name | New Field Name | Location |
|------|---------------|----------------|----------|
| **EPS** | `eps`, `earningsPerShare` | `netIncomePerShareTTM` | Ratios TTM |
| **PE Ratio** | `peRatio`, `priceToEarningsRatio` | `priceToEarningsRatioTTM` | Ratios TTM |
| **ROE** | `roe`, `returnOnEquity` | `returnOnEquityTTM` | Key Metrics TTM |
| **Current Ratio** | `currentRatio` | `currentRatioTTM` | Ratios TTM |
| **Debt-to-Equity** | `debtToEquity`, `debtToEquityRatio` | `debtToEquityRatioTTM` | Ratios TTM |

## Changes Made

1. ✅ Updated EPS mapping to prioritize `netIncomePerShareTTM`
2. ✅ Updated PE Ratio mapping to prioritize `priceToEarningsRatioTTM`
3. ✅ Updated ROE mapping to prioritize `returnOnEquityTTM`
4. ✅ Updated Current Ratio mapping to prioritize `currentRatioTTM`
5. ✅ Updated Debt-to-Equity mapping to prioritize `debtToEquityRatioTTM`
6. ✅ Changed Ratios TTM to ALWAYS fetch (not conditional) - it contains critical EPS data
7. ✅ Added debug logging to show which fields are found
8. ✅ Updated `normalizeEPS` to return `null` instead of default (to throw proper errors)

## Test Results

From actual API response inspection:
- ✅ `netIncomePerShareTTM: 7.49305950429809` (AAPL) - This is EPS
- ✅ `priceToEarningsRatioTTM: 34.61469908936702` - This is PE Ratio
- ✅ `returnOnEquityTTM: 1.6404691029851675` - This is ROE (already a ratio)
- ✅ `currentRatioTTM: 0.8932929222186667` - This is Current Ratio
- ✅ `debtToEquityRatioTTM` - Should be available

## Next Steps

1. ✅ Code updated
2. ⏳ Test locally
3. ⏳ Deploy
4. ⏳ Verify EPS is extracted correctly
