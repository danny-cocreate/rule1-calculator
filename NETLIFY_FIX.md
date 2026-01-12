# Netlify Environment Variables Fix

## Current Error

The application is failing with:
- **403 Forbidden** errors from FMP API
- **"Unable to retrieve Earnings Per Share (EPS) data"**
- This indicates `VITE_FMP_API_KEY` is missing or incorrect in Netlify

## Solution

### Step 1: Check Netlify Environment Variables

1. Go to: https://app.netlify.com/projects/mos-calculator2/overview
2. Click: **Site settings** → **Environment variables**
3. Verify these variables exist:
   - ✅ `VITE_STOCKDATA_API_KEY` = `Tsdj7Z3d3OwzL1MO3UJW4uunrRGOABTzuEqQWOlj`
   - ✅ `VITE_FMP_API_KEY` = `6HhHKgYFoKOlDJqi4THx75eTc6w3N1xq`
   - ✅ `VITE_SCUTTLEBUTT_API_URL` = `https://your-vps-api-url:8000`

### Step 2: Add Missing Variables

If `VITE_FMP_API_KEY` is missing:

1. Click **"Add a variable"**
2. Key: `VITE_FMP_API_KEY`
3. Value: `6HhHKgYFoKOlDJqi4THx75eTc6w3N1xq`
4. Click **"Save"**

### Step 3: Trigger New Deploy

After adding/updating variables:

1. Go to **Deploys** tab
2. Click **"Trigger deploy"** → **"Deploy site"**
3. Wait for build to complete (~2-3 minutes)
4. Test the site again

## Why This Happens

- Environment variables in Netlify are separate from your local `.env` file
- Netlify builds use variables set in the dashboard
- If variables aren't set, the code falls back to hardcoded values or throws errors
- FMP API key hardcoded fallback: `6HhHKgYFoKOlDJqi4THx75eTc6w3N1xq` (from code)
- But if it's getting 403, it might be expired or rate-limited

## Alternative: Check API Key Status

If you continue getting 403 errors after setting the variable:

1. **Check API key is valid**: Test at https://site.financialmodelingprep.com/developer/docs/
2. **Check rate limits**: Free tier is 250 requests/day
3. **Verify key format**: Should be exactly `6HhHKgYFoKOlDJqi4THx75eTc6w3N1xq`

## Verification

After fixing, test:
1. Search for a stock (e.g., GOOGL)
2. Check browser console for errors
3. Verify stock data loads correctly
4. Verify Fisher analysis loads (after backend is set up)
