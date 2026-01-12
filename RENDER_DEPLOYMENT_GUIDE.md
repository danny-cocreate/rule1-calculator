# Render Deployment Guide - 5 Minute Setup

## Why Render?

✅ **Most Robust**: Dedicated service, no timeout limits, auto-restart  
✅ **Simplest**: Zero code changes, 5-minute setup  
✅ **Perfect Fit**: Handles 1-3 minute operations perfectly  
✅ **Free Tier**: 750 hours/month (enough for development)

## Step-by-Step Deployment

### Step 1: Sign Up (1 minute)

1. Go to https://render.com
2. Sign up with GitHub (recommended)
3. Verify email

### Step 2: Create Web Service (2 minutes)

1. Click **"New +"** → **"Web Service"**
2. Connect your GitHub repository: `danny-cocreate/rule1-calculator`
3. Select the repository

### Step 3: Configure Service (1 minute)

**Settings:**
- **Name**: `fisher-research-api` (or any name)
- **Region**: Choose closest to you
- **Branch**: `main`
- **Root Directory**: Leave empty (or `backend` if you want)

**Build Command:**
```bash
cd backend && pip install -r requirements.txt
```

**Start Command:**
```bash
cd backend && uvicorn main:app --host 0.0.0.0 --port $PORT
```

**Environment:**
- **Python 3**: Auto-detected

### Step 4: Add Environment Variables (1 minute)

Click **"Environment"** tab and add:

```
TAVILY_API_KEY=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
OPENROUTER_API_KEY=your-openrouter-api-key-here
OPENROUTER_MODEL=openai/gpt-4o-mini
```

**Note**: Get OpenRouter API key from https://openrouter.ai

### Step 5: Deploy (Automatic)

1. Click **"Create Web Service"**
2. Render will:
   - Clone your repo
   - Install dependencies
   - Start the service
   - Give you a URL

**Your backend will be at:**
```
https://fisher-research-api.onrender.com
```

### Step 6: Test

```bash
# Health check
curl https://fisher-research-api.onrender.com/health

# Should return: {"status":"healthy"}
```

### Step 7: Update Netlify

1. Go to Netlify Dashboard
2. Site settings → Environment variables
3. Update `VITE_SCUTTLEBUTT_API_URL` to:
   ```
   https://fisher-research-api.onrender.com
   ```
4. Trigger new deploy

## Auto-Deploy

Render automatically deploys when you push to GitHub:
- ✅ Push to `main` branch → Auto-deploy
- ✅ Zero configuration needed
- ✅ Zero-downtime deployments

## Free Tier Limits

- **750 hours/month** (enough for ~24/7 for 1 month)
- **512 MB RAM** (plenty for FastAPI)
- **Auto-sleep** after 15 min inactivity (wakes on first request)

**For production**: Upgrade to $7/month (always on, more resources)

## Monitoring

Render provides:
- ✅ **Logs**: Real-time logs in dashboard
- ✅ **Metrics**: CPU, memory, requests
- ✅ **Health checks**: Automatic
- ✅ **Alerts**: Email on failures

## Troubleshooting

### Service won't start
- Check logs in Render dashboard
- Verify `requirements.txt` has all dependencies
- Check start command is correct

### Timeout errors
- Render has no timeout limits (unlike serverless)
- If you see timeouts, check your code, not Render

### Environment variables not working
- Make sure they're set in Render dashboard
- Restart service after adding variables

## Next Steps

1. ✅ Deploy to Render (5 minutes)
2. ⏳ Update code to use OpenRouter (I'll do this)
3. ⏳ Update Netlify environment variable
4. ⏳ Test end-to-end

## Cost

**Free Tier:**
- 750 hours/month
- Perfect for development/testing

**Paid ($7/month):**
- Always on (no sleep)
- More resources
- Better for production

**Total Cost:**
- Render: $0-7/month
- OpenRouter: ~$0.01-0.10 per research (very cheap)
- **Total: ~$1-10/month** depending on usage

## Why This is Better Than VPS

✅ **No SSH needed**  
✅ **No server management**  
✅ **Auto-deployments**  
✅ **Auto-restart on crashes**  
✅ **Health monitoring**  
✅ **Scales automatically**  
✅ **Free tier available**
