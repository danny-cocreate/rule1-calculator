# Serverless Backend Plan - No VPS Needed!

## The Goal
Eliminate VPS dependency by:
1. **Replace Ollama with OpenRouter** (hosted LLM service)
2. **Deploy backend as serverless functions** (Netlify Functions or Vercel)
3. **Keep everything on GitHub + Netlify**

## Why This Works

### Current Setup (Requires VPS)
- Ollama running on VPS
- FastAPI backend on VPS
- Frontend on Netlify

### New Setup (No VPS!)
- OpenRouter (hosted LLM service) ✅
- Serverless functions (Netlify/Vercel) ✅
- Frontend on Netlify ✅

## Option 1: Netlify Functions (Recommended)

### Pros
- ✅ Same platform as frontend (simpler)
- ✅ Free tier available
- ✅ Automatic deployments from GitHub
- ✅ Environment variables in one place

### Cons
- ⚠️ Timeout limits: 10s (free), 26s (pro)
- ⚠️ Research takes 1-3 minutes

### Solution: Background Jobs
Use Netlify Background Functions (longer timeout) or split into:
1. **Trigger function** - Starts research, returns job ID
2. **Polling** - Frontend polls for results
3. **Webhook** - Backend calls frontend when done

## Option 2: Vercel Serverless Functions

### Pros
- ✅ 60s timeout (free tier)
- ✅ Better for longer operations
- ✅ Easy GitHub integration
- ✅ Free tier available

### Cons
- ⚠️ Different platform from frontend
- ⚠️ Still might need background jobs for 1-3 min research

## Option 3: Cloudflare Workers

### Pros
- ✅ 30s timeout (free), 15min (paid)
- ✅ Very fast
- ✅ Free tier generous

### Cons
- ⚠️ Different platform
- ⚠️ Python support via Workers (limited)

## Recommended Approach: Netlify Functions + Background Jobs

### Architecture
```
Frontend (Netlify)
  ↓ POST /api/fisher-research
Netlify Function (starts job)
  ↓ Returns job ID immediately
Frontend polls /api/fisher-research/{jobId}
  ↓
Netlify Background Function (runs research)
  ↓ Calls OpenRouter + Tavily
  ↓ Stores results
Frontend gets results when polling
```

### Implementation Steps

1. **Replace Ollama with OpenRouter**
   - Update `execution/ollama_scuttlebutt_analysis.py` to use OpenRouter API
   - No VPS needed!

2. **Convert FastAPI to Netlify Functions**
   - Create `netlify/functions/fisher-research.js` (or Python)
   - Use Netlify's serverless function format

3. **Add Background Job Support**
   - Use Netlify Background Functions
   - Or use a simple queue (Redis/Upstash)

## Quick Start: OpenRouter First

Let's start by replacing Ollama with OpenRouter - this alone eliminates VPS!

### Step 1: Get OpenRouter API Key
1. Sign up at https://openrouter.ai
2. Get API key from dashboard
3. Add to Netlify environment variables

### Step 2: Update Code
- Replace Ollama calls with OpenRouter API
- Same interface, just different endpoint

### Step 3: Deploy Backend as Serverless
- Convert FastAPI routes to Netlify Functions
- Or use Vercel/Cloudflare

## Which Do You Prefer?

**A. Netlify Functions** (same platform, simpler)
- Need background jobs for long research
- Keep everything in one place

**B. Vercel Functions** (better timeouts)
- 60s timeout might be enough
- Separate platform but easy setup

**C. Keep VPS but simplify**
- Just deploy backend code to VPS
- Use GitHub Actions to deploy automatically

I recommend **Option A (Netlify Functions)** since your frontend is already there!
