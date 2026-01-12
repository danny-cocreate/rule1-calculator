# Migration to Serverless - Complete Plan

## Goal
Eliminate VPS dependency by moving to serverless architecture.

## Current vs New Architecture

### Current (Requires VPS)
```
Frontend (Netlify)
  ↓
Backend (VPS: FastAPI + Ollama)
  ↓
Tavily API + Ollama
```

### New (No VPS!)
```
Frontend (Netlify)
  ↓
Serverless Function (Netlify/Vercel)
  ↓
Tavily API + OpenRouter
```

## Migration Steps

### Phase 1: Replace Ollama with OpenRouter ✅

**Why:**
- OpenRouter is hosted (no VPS needed)
- Access to GPT-4, Claude, Llama, etc.
- Simple API (OpenAI-compatible)
- Very affordable

**Steps:**
1. Get OpenRouter API key
2. Create `execution/openrouter_scuttlebutt_analysis.py`
3. Update backend to use OpenRouter instead of Ollama
4. Test locally

**Files to create:**
- ✅ `execution/openrouter_scuttlebutt_analysis.py` (created)

**Files to update:**
- `backend/services/scuttlebutt.py` - Replace Ollama call with OpenRouter
- `execution/run_scuttlebutt_company.py` - Use OpenRouter analysis

### Phase 2: Convert to Serverless Functions

**Option A: Netlify Functions** (Recommended - same platform)

**Pros:**
- Same platform as frontend
- Automatic deployments
- Environment variables in one place

**Cons:**
- 10s timeout (free), 26s (pro)
- Research takes 1-3 minutes

**Solution:** Background Functions or polling

**Option B: Vercel Functions**

**Pros:**
- 60s timeout (free tier)
- Better for longer operations
- Easy GitHub integration

**Cons:**
- Different platform
- Still might need background jobs

**Option C: Keep FastAPI but deploy to Render/Railway**

**Pros:**
- No code changes needed
- Longer timeouts
- Easy deployment

**Cons:**
- Still need to manage backend
- Separate service

## Recommended Path

### Step 1: Replace Ollama with OpenRouter (Now)
- ✅ Created `openrouter_scuttlebutt_analysis.py`
- ⏳ Update backend to use it
- ⏳ Test locally

### Step 2: Deploy Backend to Render (Quick Win)
- Render has free tier
- Deploy FastAPI as-is
- No code changes needed
- 5-minute setup

### Step 3: Later - Convert to Netlify Functions (Optional)
- If you want everything on Netlify
- More complex but cleaner architecture

## Quick Start: Render Deployment

1. **Sign up at Render.com** (free tier available)
2. **Create new Web Service**
3. **Connect GitHub repo**
4. **Configure:**
   - Build Command: `cd backend && pip install -r requirements.txt`
   - Start Command: `cd backend && uvicorn main:app --host 0.0.0.0 --port $PORT`
   - Environment Variables:
     - `TAVILY_API_KEY`
     - `OPENROUTER_API_KEY`
     - `OPENROUTER_MODEL` (optional)
5. **Deploy!**

Backend will be at: `https://your-app.onrender.com`

Update `VITE_SCUTTLEBUTT_API_URL` in Netlify to this URL.

## Cost Comparison

### Current (VPS)
- VPS hosting: ~$5-10/month
- Ollama: Free (self-hosted)
- Tavily: Free tier

### New (Serverless)
- Render: Free tier (750 hours/month)
- OpenRouter: Pay per use (~$0.01-0.10 per research)
- Tavily: Free tier
- **Total: ~$1-5/month** (depending on usage)

## Next Steps

1. **Get OpenRouter API key** (https://openrouter.ai)
2. **Update code to use OpenRouter** (replace Ollama calls)
3. **Deploy to Render** (5 minutes, no code changes)
4. **Update Netlify environment variable**
5. **Test!**

Want me to proceed with updating the code to use OpenRouter?
