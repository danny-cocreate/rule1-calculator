# Fix Netlify Environment Variables - Quick Guide

## Problem

The app is showing:
- **403 Forbidden** errors from FMP API
- **"Unable to retrieve Earnings Per Share (EPS) data"**
- This means `VITE_FMP_API_KEY` is missing or incorrect in Netlify

## Solution: Add Environment Variables to Netlify

### Step 1: Go to Netlify Environment Variables

1. Open: https://app.netlify.com/projects/mos-calculator2/overview
2. Click: **Site settings** (top menu)
3. Click: **Environment variables** (left sidebar)

### Step 2: Add Required Variables

Add these 3 environment variables:

#### 1. VITE_STOCKDATA_API_KEY
- **Key**: `VITE_STOCKDATA_API_KEY`
- **Value**: `Tsdj7Z3d3OwzL1MO3UJW4uunrRGOABTzuEqQWOlj`
- **Required for**: Stock price data

#### 2. VITE_FMP_API_KEY
- **Key**: `VITE_FMP_API_KEY`
- **Value**: `6HhHKgYFoKOlDJqi4THx75eTc6w3N1xq`
- **Required for**: Financial fundamentals (EPS, growth rates, ratios)
- **⚠️ This is the one causing the 403 error**

#### 3. VITE_SCUTTLEBUTT_API_URL
- **Key**: `VITE_SCUTTLEBUTT_API_URL`
- **Value**: `https://your-vps-api-url:8000` (your backend URL)
- **Required for**: Fisher research (Scuttlebutt backend)
- **Note**: Set this after backend is deployed to VPS

### Step 3: How to Add Variables

For each variable:

1. Click **"Add a variable"** button
2. Enter the **Key** (e.g., `VITE_FMP_API_KEY`)
3. Enter the **Value** (e.g., `6HhHKgYFoKOlDJqi4THx75eTc6w3N1xq`)
4. Click **"Save"**

**Important**: Make sure the key names match exactly (case-sensitive):
- `VITE_FMP_API_KEY` (not `VITE_FMP_API_KEY` or `vite_fmp_api_key`)
- `VITE_STOCKDATA_API_KEY`
- `VITE_SCUTTLEBUTT_API_URL`

### Step 4: Trigger New Deploy

After adding/updating variables:

1. Go to **Deploys** tab (top menu)
2. Click **"Trigger deploy"** → **"Deploy site"**
3. Select **"Clear cache and deploy site"** (recommended)
4. Wait for build to complete (~2-3 minutes)

### Step 5: Test

After deployment completes:

1. Visit your Netlify site URL
2. Search for a stock (e.g., GOOGL)
3. Check browser console for errors
4. Verify stock data loads correctly

## Verification Checklist

After adding variables, verify:

- [ ] `VITE_STOCKDATA_API_KEY` is set
- [ ] `VITE_FMP_API_KEY` is set (exact value: `6HhHKgYFoKOlDJqi4THx75eTc6w3N1xq`)
- [ ] `VITE_SCUTTLEBUTT_API_URL` is set (if backend is deployed)
- [ ] Variables are saved (refresh page to confirm)
- [ ] New deploy triggered
- [ ] Build completed successfully
- [ ] Site tested and working

## Troubleshooting

### Still Getting 403 Errors?

1. **Verify API key is correct**:
   - Should be: `6HhHKgYFoKOlDJqi4THx75eTc6w3N1xq`
   - Check for typos or extra spaces
   - Copy-paste directly from here

2. **Check API key is valid**:
   - Test at: https://site.financialmodelingprep.com/developer/docs/
   - Log in to FMP dashboard
   - Verify key is active

3. **Check rate limits**:
   - Free tier: 250 requests/day
   - Check FMP dashboard for usage
   - Wait 24 hours if limit reached

4. **Verify variable name**:
   - Must be exactly: `VITE_FMP_API_KEY`
   - Case-sensitive
   - No spaces

5. **Redeploy after adding**:
   - Variables only take effect on new builds
   - Trigger new deploy after adding variables

### Build Fails After Adding Variables?

- Check variable names match exactly
- Check for special characters or quotes in values
- Check build logs in Netlify dashboard
- Remove and re-add variables if needed

## Quick Reference

**Netlify Dashboard**: https://app.netlify.com/projects/mos-calculator2/overview

**Environment Variables**: Site settings → Environment variables

**Required Variables**:
```
VITE_STOCKDATA_API_KEY=Tsdj7Z3d3OwzL1MO3UJW4uunrRGOABTzuEqQWOlj
VITE_FMP_API_KEY=6HhHKgYFoKOlDJqi4THx75eTc6w3N1xq
VITE_SCUTTLEBUTT_API_URL=https://your-vps-api-url:8000
```
