# FMP Growth Rate Issue - Quarterly vs Annual

## Problem
FMP's `income-statement-growth` endpoint appears to return **quarterly growth rates** instead of **annual growth rates** for some companies like NVDA.

**Symptoms:**
- EPS Growth showing 1.5% (should be ~60%)
- Sales Growth showing 1.1% (should be ~60%)
- ROE showing 1.0% (should be much higher)

## Root Cause
The `/stable/income-statement-growth` endpoint returns growth data for each reporting period. When we use `limit: 1`, we get the most recent period, which might be:
1. **Quarterly growth** (QoQ) instead of annual (YoY)
2. **An old period** if data is sorted differently
3. **TTM growth** which might be calculated differently

## Solution Options

### Option 1: Use Income Statements to Calculate Annual Growth (Recommended)
Calculate YoY growth from actual income statements:
- Get last 2 annual income statements
- Calculate: `(Current Year - Previous Year) / Previous Year * 100`

**Pros:**
- ✅ Most accurate
- ✅ True annual growth
- ✅ Works for all companies

**Cons:**
- ⚠️ Requires 2 API calls (or 1 with limit=2)
- ⚠️ Need to identify annual periods (not quarterly)

### Option 2: Use Multiple Growth Periods and Find Annual
- Fetch multiple periods (`limit: 10`)
- Find the most recent annual period (Q4 or full year)
- Use that period's growth rate

**Pros:**
- ✅ Uses existing endpoint
- ✅ Minimal code changes

**Cons:**
- ⚠️ Still might get quarterly data
- ⚠️ Need to identify which period is annual

### Option 3: Use Key Metrics TTM for Growth
Some FMP endpoints provide TTM (Trailing Twelve Months) growth rates directly.

**Pros:**
- ✅ Single endpoint
- ✅ TTM is more accurate than quarterly

**Cons:**
- ⚠️ May not be available on free tier
- ⚠️ Need to verify field names

## Current Fix
Updated code to:
1. Fetch more periods (`limit: 10`) to find annual data
2. Try to identify annual periods (Q4, full year)
3. Add warnings if growth rates seem unusually low (< 5%)

## Next Steps
1. Test with NVDA to see if we get better data
2. If still wrong, implement Option 1 (calculate from income statements)
3. Consider adding a fallback to calculate growth manually

## Testing
Run the calculator for NVDA and check:
- Browser console for growth warnings
- Actual growth values vs expected (~60%)
- If still wrong, implement income statement calculation
