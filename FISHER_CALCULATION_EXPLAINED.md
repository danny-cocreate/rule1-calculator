# How Fisher Analysis Works - Technical Explanation

## Overview

The Fisher Analysis combines **quantitative data** (from APIs) with **qualitative research** (from Gemini AI) to evaluate stocks using Philip Fisher's 15-Point Investment Criteria.

---

## Data Flow

### Step 1: Fetch Stock Data
**File:** `src/services/stockDataService.ts`

1. **StockData.org API** → Fetches real-time price data
2. **FMP API** → Fetches fundamentals (EPS, PE ratio, ROE, growth rates, financial ratios)
3. **Merge Data** → Combines price + fundamentals into `StockData` object

**If FMP fails:** App continues with defaults (EPS=1.0, Growth=8%, ratios=null)

---

### Step 2: Calculate Quantitative Criteria
**File:** `src/utils/fisherCalculations.ts`

**Automatically calculated from API data (3 criteria):**

1. **Criterion #1: Products/Services with Market Potential**
   - Uses: `salesGrowth` + `epsGrowth` from FMP/StockData
   - Rating: Based on average growth rate (5 = >20%, 4 = >15%, 3 = >10%, etc.)
   - Data Source: `stockdata` (from FMP/StockData.org)

2. **Criterion #5: Profit Margin**
   - Uses: `roe` (Return on Equity) from FMP
   - Rating: Based on ROE (5 = >20%, 4 = >15%, 3 = >10%, etc.)
   - Data Source: `stockdata` (from FMP)

3. **Criterion #10: Cost Analysis** (moved to Gemini for qualitative analysis)
   - Currently researched by Gemini (not auto-calculated)

---

### Step 3: Research Qualitative Criteria with Gemini AI
**File:** `src/services/geminiService.ts` + `src/components/FisherScorecard.tsx`

**How it works:**

1. **One Big Prompt** (NOT multiple calls)
   - Gemini receives **all 12 qualitative criteria** in a single prompt
   - This is more efficient and cheaper than 12 separate API calls
   - Cost: ~$0.01-0.05 per stock analysis

2. **Prompt Structure:**
   ```
   "Research AAPL (Apple Inc.) for these 12 criteria:
   
   2. Management determination and growth orientation
   3. R&D effectiveness
   4. Sales organization strength
   6. Operating margins
   7. Labor relations
   8. Executive relations
   9. Depth of management
   11. Industry-specific advantages
   12. Long-term outlook
   13. Equity financing
   14. Management communication
   15. Integrity"
   ```

3. **Gemini Response:**
   - Returns JSON with ratings (1-5), justifications, key findings, sources, confidence
   - Each criterion gets a detailed rating with explanation

4. **Caching:**
   - Results cached for 24 hours to avoid redundant API calls
   - Cache key: `${symbol}-${criteriaIds}`

**Criteria researched by Gemini (12 total):**

- Criterion #2: Management determination
- Criterion #3: R&D effectiveness  
- Criterion #4: Sales organization
- Criterion #6: Operating margins (qualitative assessment)
- Criterion #7: Labor relations
- Criterion #8: Executive relations
- Criterion #9: Management depth
- Criterion #10: Cost analysis (qualitative)
- Criterion #11: Competitive advantages
- Criterion #12: Long-term outlook
- Criterion #13: Equity financing
- Criterion #14: Management communication
- Criterion #15: Integrity

---

### Step 4: Combine All Criteria
**File:** `src/components/FisherScorecard.tsx`

1. **Merge quantitative + qualitative criteria**
   - 3 from calculations + 12 from Gemini = 15 total criteria

2. **Calculate Overall Score**
   - Average of all 15 ratings (1-5 scale)
   - Example: (5 + 4 + 3 + 4 + 5 + ...) / 15 = 3.8

3. **Display Results**
   - Shows all 15 criteria with ratings, justifications, sources
   - Color-coded (green = good, yellow = average, red = poor)
   - Expandable cards for details

---

## API Calls Summary

**Per Stock Search:**

1. **StockData.org:** 1 call (price data)
2. **FMP:** 1-3 calls (fundamentals - Key Metrics TTM, Ratios TTM, Income Growth)
3. **Gemini AI:** 1 call (all 12 qualitative criteria in one prompt)

**Total: 3-5 API calls per stock search**

---

## Cost Breakdown

- **StockData.org:** Free tier (100 calls/day)
- **FMP:** Free tier (250 calls/day)  
- **Gemini:** Free tier (15 requests/min, 1,500/day)
  - Cost: ~$0.01-0.05 per analysis on free tier

---

## Caching Strategy

- **Fisher Analysis Results:** 24 hours (in-memory cache)
- **Stock Price Data:** No cache (always fresh)
- **FMP Fundamentals:** No cache (always fresh)

**Why cache Fisher results?**
- Qualitative research doesn't change hourly
- Reduces API costs
- Faster subsequent loads

---

## Error Handling

### FMP API Fails:
- App continues with defaults (EPS=1.0, Growth=8%)
- Price data still works
- Quantitative criteria use defaults
- **User sees:** Some "N/A" values, but app doesn't crash

### Gemini AI Fails:
- Qualitative criteria get default rating (3 = Average)
- Justification: "Unable to complete research"
- **User sees:** Partial analysis (quantitative criteria still work)

### Both Fail:
- App still works!
- Shows price + default values
- User can manually adjust growth rates

---

## Code Locations

- **FMP Service:** `src/services/fmpService.ts`
- **Stock Data Service:** `src/services/stockDataService.ts`
- **Gemini Service:** `src/services/geminiService.ts`
- **Fisher Calculations:** `src/utils/fisherCalculations.ts`
- **Fisher Scorecard UI:** `src/components/FisherScorecard.tsx`
- **Fisher Types:** `src/types/fisher.ts`

---

## Summary

**Quantitative (3 criteria):** Auto-calculated from APIs  
**Qualitative (12 criteria):** Researched by Gemini in **ONE big prompt**  
**Result:** 15-point Fisher scorecard with detailed ratings

The system is designed to be **resilient** - if any API fails, the app continues with defaults rather than crashing.
