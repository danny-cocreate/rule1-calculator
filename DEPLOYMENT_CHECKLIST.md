# Deployment Checklist - Render + OpenRouter

## ✅ Code Updates Complete

1. ✅ **OpenRouter Integration**
   - Created `execution/openrouter_scuttlebutt_analysis.py`
   - Updated `execution/run_scuttlebutt_company.py` to use OpenRouter
   - Updated backend services to use OpenRouter model names
   - Added Ollama fallback for backward compatibility

2. ✅ **Render Configuration**
   - Created `render.yaml` configuration file
   - Updated CORS to allow Netlify frontend
   - Updated backend README with OpenRouter config

3. ✅ **Documentation**
   - Created `RENDER_QUICK_START.md` (5-minute guide)
   - Created `BACKEND_PLATFORM_COMPARISON.md` (detailed comparison)
   - Created `MIGRATION_TO_SERVERLESS.md` (migration guide)

## 🚀 Next Steps

### Step 1: Get OpenRouter API Key (2 minutes)

1. Go to https://openrouter.ai
2. Sign up / Log in
3. Go to **Keys** section
4. Click **"Create Key"**
5. Copy the API key

### Step 2: Deploy to Render (5 minutes)

1. Go to https://render.com
2. Sign up with GitHub
3. Click **"New +"** → **"Web Service"**
4. Connect repository: `danny-cocreate/rule1-calculator`
5. Configure:
   - **Name**: `fisher-research-api`
   - **Build Command**: `cd backend && pip install -r requirements.txt`
   - **Start Command**: `cd backend && uvicorn main:app --host 0.0.0.0 --port $PORT`
6. Add Environment Variables:
   - `TAVILY_API_KEY` = `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`
   - `OPENROUTER_API_KEY` = (your key from Step 1)
   - `OPENROUTER_MODEL` = `openai/gpt-4o-mini`
7. Click **"Create Web Service"**
8. Wait for deployment (~2-3 minutes)
9. Copy your service URL (e.g., `https://fisher-research-api.onrender.com`)

### Step 3: Test Backend

```bash
# Health check
curl https://fisher-research-api.onrender.com/health

# Should return: {"status":"healthy"}
```

### Step 4: Update Netlify (2 minutes)

1. Go to Netlify Dashboard
2. Site settings → Environment variables
3. Update `VITE_SCUTTLEBUTT_API_URL` to your Render URL:
   ```
   https://fisher-research-api.onrender.com
   ```
4. Trigger new deploy (or wait for auto-deploy)

### Step 5: Test End-to-End

1. Go to your Netlify site
2. Search for a stock (e.g., AAPL)
3. Check that:
   - ✅ FMP data loads (quantitative analysis)
   - ✅ Scuttlebutt research works (qualitative analysis)
   - ✅ No errors in console

## Environment Variables Summary

### Render (Backend)
- `TAVILY_API_KEY` = `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`
- `OPENROUTER_API_KEY` = (your OpenRouter key)
- `OPENROUTER_MODEL` = `openai/gpt-4o-mini` (optional, has default)

### Netlify (Frontend)
- `VITE_FMP_API_KEY` = `6HhHKgYFoKOlDJqi4THx75eTc6w3N1xq`
- `VITE_SCUTTLEBUTT_API_URL` = `https://fisher-research-api.onrender.com`

## Cost Estimate

- **Render**: Free tier (750 hours/month) or $7/month (always on)
- **OpenRouter**: ~$0.01-0.10 per research (very cheap)
- **Tavily**: Free tier
- **Total**: ~$1-10/month depending on usage

## Troubleshooting

### Backend won't start
- Check Render logs
- Verify environment variables are set
- Check build/start commands

### CORS errors
- Verify `VITE_SCUTTLEBUTT_API_URL` is correct
- Check Render service is running
- Check CORS_ORIGINS in backend (should include Netlify URL)

### Research fails
- Check OpenRouter API key is valid
- Check Tavily API key is valid
- Check Render logs for errors

## Success Criteria

✅ Backend health check returns `{"status":"healthy"}`  
✅ Frontend can connect to backend  
✅ Stock search works (FMP data)  
✅ Scuttlebutt research works (qualitative analysis)  
✅ No VPS needed!
