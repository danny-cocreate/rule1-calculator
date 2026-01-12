# Netlify Environment Variables Checklist

## Required Variables for Your Site

You need to add these environment variables in Netlify:

### ✅ 1. VITE_STOCKDATA_API_KEY
- **Value**: `Tsdj7Z3d3OwzL1MO3UJW4uunrRGOABTzuEqQWOlj`
- **Purpose**: Stock price data
- **Status**: ⚠️ Check if set

### ✅ 2. VITE_FMP_API_KEY (CRITICAL - Currently Missing)
- **Value**: `6HhHKgYFoKOlDJqi4THx75eTc6w3N1xq`
- **Purpose**: Financial fundamentals (EPS, growth rates, ratios)
- **Status**: ❌ **Missing - This is causing the 403 error**

### ⏳ 3. VITE_SCUTTLEBUTT_API_URL (For Later)
- **Value**: `https://your-vps-api-url:8000`
- **Purpose**: Fisher research backend
- **Status**: ⏳ Set after backend is deployed

## How to Add Variables

1. **Go to**: https://app.netlify.com/projects/mos-calculator2/overview
2. **Click**: Site settings → Environment variables
3. **Add each variable**:
   - Click "Add a variable"
   - Enter key (exactly as shown above)
   - Enter value (copy-paste from above)
   - Click "Save"
4. **Trigger new deploy**:
   - Go to Deploys tab
   - Click "Trigger deploy" → "Deploy site"
   - Select "Clear cache and deploy site"

## Verification

After adding variables, check:

- [ ] Variables appear in the list
- [ ] Values match exactly (no extra spaces)
- [ ] New deploy triggered
- [ ] Build completed successfully
- [ ] Site tested and working

## Your Current Error

The console shows:
- Multiple 403 Forbidden errors from FMP API
- "Unable to retrieve Earnings Per Share (EPS) data"
- This confirms `VITE_FMP_API_KEY` is missing or incorrect

**Fix**: Add `VITE_FMP_API_KEY` with value `6HhHKgYFoKOlDJqi4THx75eTc6w3N1xq` and redeploy.
