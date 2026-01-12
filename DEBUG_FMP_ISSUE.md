# Debugging FMP API Issue

## Problem

- API key is set correctly in Netlify
- FMP dashboard shows **zero API calls**
- Still getting 403 errors

This suggests the API calls aren't even reaching FMP, or the environment variable isn't being read.

## What I've Added

I've added debug logging to `src/services/fmpService.ts` that will show:
1. Whether the API key is set
2. Whether it's coming from environment variable or fallback
3. A preview of the key (first 8 + last 4 characters)

## Next Steps

### Step 1: Check Browser Console

After deploying the updated code:

1. Open your Netlify site
2. Open browser DevTools (F12)
3. Go to **Console** tab
4. Search for a stock (e.g., GOOGL)
5. Look for these log messages:
   - `FMP API Key Status: Set (6HhHKgY...1xq)` or `NOT SET`
   - `FMP API Key Source: Environment variable` or `Fallback/default`

**What to look for:**
- If it says "NOT SET" → Environment variable isn't being read
- If it says "Fallback/default" → Environment variable isn't being read (using hardcoded fallback)
- If it says "Environment variable" → Variable is being read correctly

### Step 2: Check Network Tab

1. In DevTools, go to **Network** tab
2. Search for a stock
3. Look for requests to `financialmodelingprep.com`
4. Check:
   - Are requests being made?
   - What's the status code?
   - What's in the request URL? (check if `apikey` parameter is present)

### Step 3: Verify Environment Variable in Netlify

1. Go to Netlify → Environment variables
2. Verify `VITE_FMP_API_KEY` exists
3. Check the value is exactly: `6HhHKgYFoKOlDJqi4THx75eTc6w3N1xq`
4. Make sure it's set for **Production** context

### Step 4: Trigger New Deploy

**Critical**: After adding/updating environment variables, you MUST trigger a new deploy:

1. Go to **Deploys** tab
2. Click **"Trigger deploy"**
3. Select **"Clear cache and deploy site"**
4. Wait for build to complete

## Common Issues

### Issue 1: Environment Variable Not Read

**Symptom**: Console shows "Fallback/default" or "NOT SET"

**Fix**: 
- Verify variable name is exactly `VITE_FMP_API_KEY` (case-sensitive)
- Verify it's set for Production context
- Trigger new deploy after adding/updating

### Issue 2: Variable Read But Still 403

**Symptom**: Console shows "Environment variable" but still 403

**Possible causes**:
- API key is expired/invalid
- Rate limit reached (250/day)
- Wrong API key value

**Fix**: Check FMP dashboard to verify key is active

### Issue 3: No Network Requests

**Symptom**: Network tab shows no requests to financialmodelingprep.com

**Possible causes**:
- Code error preventing execution
- CORS blocking requests
- Request failing before reaching network

**Fix**: Check browser console for JavaScript errors

## Testing Locally

To test if the API key works locally:

1. Make sure `.env` file has `VITE_FMP_API_KEY=6HhHKgYFoKOlDJqi4THx75eTc6w3N1xq`
2. Run `npm run dev`
3. Open browser console
4. Search for a stock
5. Check the debug logs

If it works locally but not on Netlify, the issue is with Netlify environment variables.

## What to Report Back

After checking the above, please share:

1. What does the console show for "FMP API Key Status"?
2. What does it show for "FMP API Key Source"?
3. Are there any requests to financialmodelingprep.com in Network tab?
4. What's the status code of those requests?
5. Did you trigger a new deploy after adding the environment variable?
