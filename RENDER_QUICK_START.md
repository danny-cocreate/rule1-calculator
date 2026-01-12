# Render Quick Start - 5 Minutes

## Prerequisites

1. **OpenRouter API Key**: Get from https://openrouter.ai
2. **GitHub Account**: Your code is already on GitHub
3. **Render Account**: Sign up at https://render.com (free)

## Step-by-Step

### 1. Sign Up for Render (1 minute)

1. Go to https://render.com
2. Click "Get Started for Free"
3. Sign up with GitHub (recommended)
4. Verify email

### 2. Create Web Service (2 minutes)

1. Click **"New +"** → **"Web Service"**
2. **Connect GitHub**: Select `danny-cocreate/rule1-calculator`
3. **Configure**:
   - **Name**: `fisher-research-api`
   - **Region**: Choose closest to you
   - **Branch**: `main`
   - **Root Directory**: Leave empty
   - **Environment**: `Python 3`
   - **Build Command**: `cd backend && pip install -r requirements.txt`
   - **Start Command**: `cd backend && uvicorn main:app --host 0.0.0.0 --port $PORT`

### 3. Add Environment Variables (1 minute)

Click **"Environment"** tab, add:

```
TAVILY_API_KEY=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
OPENROUTER_API_KEY=your-openrouter-api-key-here
OPENROUTER_MODEL=openai/gpt-4o-mini
```

**Get OpenRouter API Key:**
1. Go to https://openrouter.ai
2. Sign up / Log in
3. Go to Keys section
4. Create new key
5. Copy and paste into Render

### 4. Deploy (Automatic)

1. Click **"Create Web Service"**
2. Render will automatically:
   - Clone your repo
   - Install dependencies
   - Start the service
   - Give you a URL

**Your backend URL will be:**
```
https://fisher-research-api.onrender.com
```

### 5. Test Backend (1 minute)

```bash
# Health check
curl https://fisher-research-api.onrender.com/health

# Should return: {"status":"healthy"}
```

### 6. Update Netlify

1. Go to Netlify Dashboard
2. Site settings → Environment variables
3. Update `VITE_SCUTTLEBUTT_API_URL` to:
   ```
   https://fisher-research-api.onrender.com
   ```
4. Trigger new deploy (or wait for auto-deploy)

## Auto-Deploy

Render automatically deploys when you push to GitHub:
- ✅ Push to `main` branch → Auto-deploy
- ✅ Zero configuration needed
- ✅ Zero-downtime deployments

## Free Tier

- **750 hours/month** (enough for ~24/7 for 1 month)
- **512 MB RAM** (plenty for FastAPI)
- **Auto-sleep** after 15 min inactivity (wakes on first request)

**For production**: Upgrade to $7/month (always on, more resources)

## Troubleshooting

### Service won't start
- Check logs in Render dashboard
- Verify environment variables are set
- Check start command is correct

### Health check fails
- Wait a few minutes for first deploy
- Check logs for errors
- Verify PORT environment variable

### Environment variables not working
- Make sure they're set in Render dashboard
- Restart service after adding variables
- Check variable names match exactly

## Next Steps

1. ✅ Deploy to Render
2. ✅ Update Netlify environment variable
3. ✅ Test end-to-end
4. ✅ Enjoy no VPS management!
