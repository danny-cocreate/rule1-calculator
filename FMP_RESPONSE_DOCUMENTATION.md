# Financial Modeling Prep API Response Documentation

## Purpose

This document records the actual response structures from Financial Modeling Prep API endpoints after testing.

**Status:** ⏳ Pending Verification - Run `scripts/test-fmp-endpoints.js` to populate

---

## Testing Instructions

1. Get FMP API key from: https://site.financialmodelingprep.com/developer/docs/
2. Run: `node scripts/test-fmp-endpoints.js YOUR_API_KEY`
3. Review output and saved JSON files in `docs/` folder
4. Update this document with actual findings

---

## Endpoints Tested

### 1. Profile Endpoint
**URL:** `https://financialmodelingprep.com/api/v3/profile/{symbol}?apikey={API_KEY}`

**Status:** ⏳ Not yet tested

**Expected Fields:**
- `eps` - Earnings per share
- `peRatio` - Price-to-earnings ratio
- `returnOnEquity` - ROE
- Company information

**Actual Response Structure:** *(To be documented)*

**Field Mapping:** *(To be documented)*

---

### 2. Key Metrics TTM
**URL:** `https://financialmodelingprep.com/api/v3/key-metrics-ttm/{symbol}?apikey={API_KEY}`

**Status:** ⏳ Not yet tested

**Expected Fields:**
- `peRatio` - PE ratio
- `returnOnEquity` - ROE
- `eps` - Earnings per share
- `debtEquityRatio` - Debt-to-equity ratio

**Actual Response Structure:** *(To be documented)*

**Field Mapping:** *(To be documented)*

---

### 3. Ratios TTM
**URL:** `https://financialmodelingprep.com/api/v3/ratios-ttm/{symbol}?apikey={API_KEY}`

**Status:** ⏳ Not yet tested

**Expected Fields:**
- `currentRatio` - Current ratio
- `debtEquityRatio` - Debt-to-equity
- `returnOnEquity` - ROE
- `priceToEarningsRatio` - PE ratio

**Actual Response Structure:** *(To be documented)*

**Field Mapping:** *(To be documented)*

---

### 4. Income Statement Growth
**URL:** `https://financialmodelingprep.com/api/v3/income-statement-growth/{symbol}?apikey={API_KEY}&limit=1`

**Status:** ⏳ Not yet tested

**Expected Fields:**
- `growthRevenue` - Revenue growth (%)
- `growthEps` - EPS growth (%)
- Growth metrics

**Actual Response Structure:** *(To be documented)*

**Field Mapping:** *(To be documented)*

---

### 5. Income Statement
**URL:** `https://financialmodelingprep.com/api/v3/income-statement/{symbol}?apikey={API_KEY}&limit=1`

**Status:** ⏳ Not yet tested

**Expected Fields:**
- `eps` - Earnings per share
- `revenue` - Total revenue
- Income statement data

**Actual Response Structure:** *(To be documented)*

**Field Mapping:** *(To be documented)*

---

## Field Mapping Summary

*(To be completed after testing)*

| StockData Field | FMP Endpoint | FMP Field Name | Data Format | Notes |
|-----------------|--------------|----------------|-------------|-------|
| `eps` | ⏳ | ⏳ | ⏳ | ⏳ |
| `peRatio` | ⏳ | ⏳ | ⏳ | ⏳ |
| `roe` | ⏳ | ⏳ | ⏳ | ⏳ |
| `debtToEquity` | ⏳ | ⏳ | ⏳ | ⏳ |
| `currentRatio` | ⏳ | ⏳ | ⏳ | ⏳ |
| `epsGrowth` | ⏳ | ⏳ | ⏳ | ⏳ |
| `salesGrowth` | ⏳ | ⏳ | ⏳ | ⏳ |
| `bookValueGrowth` | ⏳ | ⏳ | ⏳ | ⏳ |

---

## Optimal Endpoint Strategy

*(To be determined after testing)*

**Goal:** Minimize API calls while getting all required data

**Current Plan:**
- ⏳ To be determined based on verification results

---

## Notes

- Free tier: 250 API calls/day
- Response structures may vary
- Field names may be camelCase or snake_case
- Percentages may be decimals (0.15) or actual percentages (15)

---

**Last Updated:** ⏳ Pending verification
