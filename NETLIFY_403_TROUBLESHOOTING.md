# Troubleshooting 403 Error on Netlify

## Current Status

You've added the environment variables to Netlify, but you're still getting 403 errors from FMP API.

## What to Check

### 1. Verify VITE_FMP_API_KEY Value

In your Netlify dashboard:

1. **Expand `VITE_FMP_API_KEY`** (click the arrow to expand it)
2. **Check the Production value** - it should be exactly:
   ```
   6HhHKgYFoKOlDJqi4THx75eTc6w3N1xq
   ```
3. **Common mistakes to check**:
   - Extra spaces before/after the key
   - Missing characters
   - Typos
   - Copy-paste errors

### 2. Verify You Triggered a New Deploy

After adding/updating environment variables, you **must** trigger a new deploy:

1. Go to **Deploys** tab
2. Click **"Trigger deploy"** → **"Clear cache and deploy site"**
3. Wait for build to complete (2-3 minutes)

**Important**: Environment variables only take effect on **new builds**. If you added variables but didn't trigger a new deploy, the old build (without variables) is still running.

### 3. Check Build Logs

1. Go to **Deploys** tab
2. Click on the **latest deploy**
3. Check the build logs for any errors
4. Look for messages about environment variables

### 4. Verify All 3 Variables Are Set

Make sure all three frontend variables are present:

- ✅ `VITE_STOCKDATA_API_KEY` (you have this)
- ⚠️ `VITE_FMP_API_KEY` (check the value)
- ⚠️ `VITE_SCUTTLEBUTT_API_URL` (check the value)

## Step-by-Step Fix

### Step 1: Verify FMP API Key Value

1. In Netlify dashboard → Environment variables
2. Expand `VITE_FMP_API_KEY`
3. Check Production value matches exactly:
   ```
   6HhHKgYFoKOlDJqi4THx75eTc6w3N1xq
   ```
4. If wrong, click **Options** → **Edit** → Fix the value → **Save**

### Step 2: Verify Deploy Context

Make sure the value is set for **Production** context (not just other contexts).

### Step 3: Trigger New Deploy

1. Go to **Deploys** tab
2. Click **"Trigger deploy"**
3. Select **"Clear cache and deploy site"** (important!)
4. Wait for build to complete

### Step 4: Test Again

1. Visit your site
2. Try searching for a stock (e.g., GOOGL)
3. Check browser console for errors

## Common Issues

### Issue 1: Value Not Set for Production

**Symptom**: Variable exists but only for "Deploy Previews" or other contexts

**Fix**: Make sure the value is set for **Production** context

### Issue 2: Wrong Value

**Symptom**: Value doesn't match `6HhHKgYFoKOlDJqi4THx75eTc6w3N1xq`

**Fix**: Edit the variable and set the correct value

### Issue 3: No New Deploy After Adding Variables

**Symptom**: Added variables but didn't trigger new deploy

**Fix**: Trigger a new deploy (Deploys → Trigger deploy → Clear cache and deploy site)

### Issue 4: API Key Expired or Invalid

**Symptom**: Value is correct but still getting 403

**Fix**: 
- Check FMP dashboard: https://site.financialmodelingprep.com/developer/docs/
- Verify the key is still active
- Check if you've hit rate limits (250/day free tier)

## Quick Checklist

- [ ] `VITE_FMP_API_KEY` value is exactly `6HhHKgYFoKOlDJqi4THx75eTc6w3N1xq`
- [ ] Value is set for **Production** context
- [ ] Triggered new deploy after adding/updating variable
- [ ] Used "Clear cache and deploy site" option
- [ ] Build completed successfully
- [ ] Tested the site after deploy

## Still Not Working?

If you've checked everything above and still getting 403:

1. **Check FMP API key status**:
   - Log into FMP dashboard
   - Verify key is active
   - Check usage/rate limits

2. **Test API key directly**:
   ```bash
   curl "https://financialmodelingprep.com/api/v3/profile/AAPL?apikey=6HhHKgYFoKOlDJqi4THx75eTc6w3N1xq"
   ```
   If this returns 403, the key itself is invalid/expired.

3. **Check Netlify build logs**:
   - Look for any errors during build
   - Check if environment variables are being read correctly

4. **Try a different stock symbol**:
   - Some symbols might not be available in FMP database
   - Try: AAPL, MSFT, GOOGL
