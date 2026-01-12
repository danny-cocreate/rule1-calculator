# Netlify Environment Variables Checklist

## Required Environment Variables

To fix the stock data fetching error, ensure these environment variables are set in Netlify:

### 1. VITE_STOCKDATA_API_KEY
- **Required for**: Stock price data
- **Your key**: `Tsdj7Z3d3OwzL1MO3UJW4uunrRGOABTzuEqQWOlj`
- **Status**: ⚠️ **Check if set in Netlify**

### 2. VITE_FMP_API_KEY
- **Required for**: Financial fundamentals (EPS, growth rates, ratios)
- **Your key**: `6HhHKgYFoKOlDJqi4THx75eTc6w3N1xq`
- **Status**: ⚠️ **Check if set in Netlify**
- **Error**: Currently getting 403 Forbidden - likely missing or incorrect

### 3. VITE_SCUTTLEBUTT_API_URL (NEW)
- **Required for**: Fisher research (Scuttlebutt backend)
- **Value**: `https://your-vps-api-url:8000` (your backend URL)
- **Status**: ✅ **You mentioned you added this**

## How to Check/Add Environment Variables in Netlify

1. Go to: https://app.netlify.com/projects/mos-calculator2/overview
2. Click: **Site settings** → **Environment variables**
3. Check if these are set:
   - `VITE_STOCKDATA_API_KEY`
   - `VITE_FMP_API_KEY`
   - `VITE_SCUTTLEBUTT_API_URL`
4. If missing, click **"Add a variable"** and add them
5. **After adding/updating**, trigger a new deploy:
   - Go to **Deploys** tab
   - Click **"Trigger deploy"** → **"Deploy site"**

## Current Error

The error shows:
- FMP API returning 403 Forbidden
- "Unable to retrieve Earnings Per Share (EPS) data"
- This means `VITE_FMP_API_KEY` is either:
  - Not set in Netlify
  - Set incorrectly
  - Expired/invalid
  - Rate limit reached (250/day free tier)

## Quick Fix

1. **Verify API key is correct**: `6HhHKgYFoKOlDJqi4THx75eTc6w3N1xq`
2. **Add to Netlify** (if not already set):
   - Variable: `VITE_FMP_API_KEY`
   - Value: `6HhHKgYFoKOlDJqi4THx75eTc6w3N1xq`
3. **Trigger new deploy**
4. **Test again**

## Complete Environment Variables List

For your Netlify site, you should have:

| Variable | Value | Required For |
|----------|-------|--------------|
| `VITE_STOCKDATA_API_KEY` | `Tsdj7Z3d3OwzL1MO3UJW4uunrRGOABTzuEqQWOlj` | Stock prices |
| `VITE_FMP_API_KEY` | `6HhHKgYFoKOlDJqi4THx75eTc6w3N1xq` | Financial fundamentals |
| `VITE_SCUTTLEBUTT_API_URL` | `https://your-vps-api-url:8000` | Fisher research |
