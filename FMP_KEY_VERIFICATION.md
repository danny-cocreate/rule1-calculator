# FMP API Key Verification

## Current Status

Your `VITE_FMP_API_KEY` is set in Netlify. Let's verify everything is correct.

## Critical Check: Key Value

From your screenshot, the Production value shows:
```
6HhHKgYFoK0lDJqi4THx75eTc6w3N1xq
```

**⚠️ IMPORTANT**: Check if that's a **zero (0)** or **letter O** in `FoK0l`:

- **Correct**: `6HhHKgYFoKOlDJqi4THx75eTc6w3N1xq` (letter O)
- **Wrong**: `6HhHKgYFoK0lDJqi4THx75eTc6w3N1xq` (zero 0)

The correct key should have **letter O**, not zero.

## Next Steps

### Step 1: Verify the Exact Value

1. In Netlify, look at the Production value for `VITE_FMP_API_KEY`
2. Copy it exactly (use the clipboard icon)
3. Compare it character-by-character with the correct key:
   ```
   6HhHKgYFoKOlDJqi4THx75eTc6w3N1xq
   ```

### Step 2: If Value is Wrong

1. Click **Options** → **Edit** on `VITE_FMP_API_KEY`
2. Set the value to exactly:
   ```
   6HhHKgYFoKOlDJqi4THx75eTc6w3N1xq
   ```
3. Make sure it's **letter O**, not zero
4. Click **Save**

### Step 3: Trigger New Deploy

**This is critical!** Even if the value is correct, you must trigger a new deploy:

1. Go to **Deploys** tab
2. Click **"Trigger deploy"**
3. Select **"Clear cache and deploy site"**
4. Wait for build to complete (2-3 minutes)

### Step 4: Check Other Variables

While you're in the Environment Variables page, verify:

- ✅ `VITE_STOCKDATA_API_KEY` is set
- ✅ `VITE_FMP_API_KEY` is set (checking now)
- ⚠️ `VITE_SCUTTLEBUTT_API_URL` - Is this set? (needed for Fisher research)

## Common Issues

### Issue 1: Typo in API Key
- **Symptom**: Key looks right but has a typo (O vs 0, I vs 1, etc.)
- **Fix**: Copy-paste the exact key from your `.env` file

### Issue 2: No New Deploy
- **Symptom**: Variable is correct but site still uses old build
- **Fix**: Trigger new deploy with "Clear cache and deploy site"

### Issue 3: API Key Expired
- **Symptom**: Key is correct but FMP returns 403
- **Fix**: Check FMP dashboard to verify key is active

### Issue 4: Rate Limit
- **Symptom**: Key works but hits 250/day limit
- **Fix**: Wait 24 hours or upgrade FMP plan

## Quick Test

After fixing and deploying, test with a simple stock:
- Try: AAPL, MSFT, GOOGL
- Check browser console for errors
- If still 403, the key itself might be invalid/expired
