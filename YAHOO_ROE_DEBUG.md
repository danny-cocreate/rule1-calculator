# Yahoo Finance ROE Debugging

## Issue
The Yahoo Finance ROE endpoint isn't being called. The log "FMP: Checking ROE for calculation - Current ROE:" is not appearing in the console.

## Possible Causes

1. **Netlify hasn't rebuilt** - The frontend code changes need to be deployed
2. **Browser cache** - Old JavaScript is being served
3. **Backend not deployed** - The backend endpoint might not be available on Render
4. **Environment variable missing** - `VITE_SCUTTLEBUTT_API_URL` might not be set in Netlify

## Steps to Debug

### 1. Check if Backend Endpoint Works

Test the backend endpoint directly:

```bash
# Replace with your Render backend URL
curl https://fisher-research-api.onrender.com/fisher-research/yahoo-roe/NVDA
```

Expected response:
```json
{"symbol":"NVDA","roe":107.36}
```

### 2. Check Netlify Deployment

1. Go to Netlify dashboard
2. Check if latest commit (87205b1) is deployed
3. If not, trigger a new deploy

### 3. Check Environment Variables

In Netlify dashboard, verify:
- `VITE_SCUTTLEBUTT_API_URL` is set to your Render backend URL
- Example: `https://fisher-research-api.onrender.com`

### 4. Clear Browser Cache

- Hard refresh: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)
- Or open in incognito/private window

### 5. Check Browser Console

Look for:
- "FMP: Checking ROE for calculation - Current ROE: 1.038..."
- "FMP: ROE seems unusually low (1.04%), fetching from Yahoo Finance..."
- Any errors related to the backend URL

## Quick Test

Open browser console and run:
```javascript
// Check if environment variable is set
console.log('Backend URL:', import.meta.env.VITE_SCUTTLEBUTT_API_URL);

// Test the endpoint directly
fetch('https://fisher-research-api.onrender.com/fisher-research/yahoo-roe/NVDA')
  .then(r => r.json())
  .then(data => console.log('Yahoo ROE:', data))
  .catch(e => console.error('Error:', e));
```

## Expected Flow

1. FMP returns ROE: 1.04%
2. Code detects: ROE < 5% → triggers Yahoo Finance fetch
3. Backend calls: `https://query1.finance.yahoo.com/v10/finance/quoteSummary/NVDA`
4. Backend returns: `{"symbol":"NVDA","roe":107.36}`
5. Frontend updates: ROE = 107.36%

If step 2 isn't happening, the code isn't deployed or there's a build issue.
