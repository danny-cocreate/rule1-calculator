# Create Python Service on Render

## The Issue

You see "rule1-calculator" with runtime "Node" - that's your frontend. You need to create a **separate Python service** for the backend.

## Solution: Create New Python Web Service

### Step 1: Create New Service

1. In Render dashboard, click **"+ New"** button (top right)
2. Select **"Web Service"**

### Step 2: Connect Repository

1. **Connect GitHub**: Select `danny-cocreate/rule1-calculator`
2. Click **"Connect"**

### Step 3: Configure as Python Service

**Important Settings:**

- **Name**: `fisher-research-api` (or any name you prefer)
- **Region**: Choose closest to you (Oregon is fine)
- **Branch**: `main`
- **Root Directory**: Leave **empty** (or set to `.`)
- **Environment**: **Python 3** (IMPORTANT - not Node!)
- **Build Command**: 
  ```
  cd backend && pip install -r requirements.txt
  ```
- **Start Command**: 
  ```
  cd backend && python -m uvicorn main:app --host 0.0.0.0 --port $PORT
  ```

### Step 4: Add Environment Variables

Click **"Environment"** tab, add:

```
TAVILY_API_KEY=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
OPENROUTER_API_KEY=your-openrouter-api-key-here
OPENROUTER_MODEL=openai/gpt-4o-mini
```

### Step 5: Create Service

1. Click **"Create Web Service"**
2. Wait for deployment (~2-3 minutes)
3. Your backend URL will be: `https://fisher-research-api.onrender.com`

## Why Two Services?

- **rule1-calculator** (Node) = Frontend (if you want to deploy frontend to Render)
- **fisher-research-api** (Python) = Backend API (what you need now)

For now, you only need the **Python backend service**. Your frontend is already on Netlify, so you don't need to deploy the frontend to Render.

## Quick Checklist

- [ ] Click "+ New" → "Web Service"
- [ ] Connect GitHub repo
- [ ] Set Environment to **Python 3** (not Node!)
- [ ] Set Build Command: `cd backend && pip install -r requirements.txt`
- [ ] Set Start Command: `cd backend && python -m uvicorn main:app --host 0.0.0.0 --port $PORT`
- [ ] Add environment variables
- [ ] Create service
- [ ] Wait for deployment
- [ ] Test: `curl https://fisher-research-api.onrender.com/health`
