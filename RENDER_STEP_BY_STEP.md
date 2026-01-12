# Render Step-by-Step: Create Python Backend Service

## Current Situation

You have:
- ✅ `rule1-calculator` service (Node.js) - This is your frontend, not needed on Render
- ❌ Missing: Python backend service

You need to create a **new Python service** for the backend.

## Step-by-Step Instructions

### Step 1: Create New Service

1. In Render dashboard, look for **"+ New"** button (usually top right)
2. Click it
3. Select **"Web Service"** from dropdown

### Step 2: Connect GitHub

1. You'll see "Connect a repository" section
2. Click **"Connect GitHub"** or **"Connect account"**
3. Authorize Render to access your GitHub
4. Select repository: **`danny-cocreate/rule1-calculator`**
5. Click **"Connect"**

### Step 3: Configure Service

Fill in these fields:

**Basic Settings:**
- **Name**: `fisher-research-api`
- **Region**: `Oregon` (or closest to you)
- **Branch**: `main`
- **Root Directory**: Leave **empty** (or `.`)

**Runtime:**
- **Environment**: Select **"Python 3"** (IMPORTANT!)
  - Don't select Node.js
  - Don't let it auto-detect

**Build & Deploy:**
- **Build Command**: 
  ```
  cd backend && pip install -r requirements.txt
  ```
- **Start Command**: 
  ```
  cd backend && python -m uvicorn main:app --host 0.0.0.0 --port $PORT
  ```

### Step 4: Environment Variables

1. Scroll down to **"Environment Variables"** section
2. Click **"Add Environment Variable"** for each:

   **Variable 1:**
   - Key: `TAVILY_API_KEY`
   - Value: `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`

   **Variable 2:**
   - Key: `OPENROUTER_API_KEY`
   - Value: (your OpenRouter API key from https://openrouter.ai)

   **Variable 3 (Optional):**
   - Key: `OPENROUTER_MODEL`
   - Value: `openai/gpt-4o-mini`

### Step 5: Create Service

1. Scroll to bottom
2. Click **"Create Web Service"**
3. Render will start deploying

### Step 6: Wait for Deployment

- Build takes ~2-3 minutes
- You'll see logs in real-time
- Look for "Build successful 🎉"
- Then "Deploying..."
- Finally "Your service is live"

### Step 7: Get Your URL

Once deployed, you'll see:
- **Service URL**: `https://fisher-research-api.onrender.com`
- Copy this URL

### Step 8: Test

```bash
curl https://fisher-research-api.onrender.com/health
```

Should return: `{"status":"healthy"}`

### Step 9: Update Netlify

1. Go to Netlify Dashboard
2. Site settings → Environment variables
3. Update `VITE_SCUTTLEBUTT_API_URL` to your Render URL:
   ```
   https://fisher-research-api.onrender.com
   ```
4. Trigger new deploy

## Common Mistakes to Avoid

❌ **Don't** select Node.js environment  
✅ **Do** select Python 3

❌ **Don't** use the existing "rule1-calculator" service  
✅ **Do** create a new service

❌ **Don't** forget the `python -m` prefix in start command  
✅ **Do** use `python -m uvicorn`

## Troubleshooting

### Service shows "Node" runtime
- You selected wrong environment
- Delete service and create new one with Python 3

### Build fails
- Check logs in Render dashboard
- Verify `backend/requirements.txt` exists
- Check build command is correct

### Start command fails
- Make sure you use `python -m uvicorn` (not just `uvicorn`)
- Check start command is exactly as shown above

## Success!

Once deployed, you'll have:
- ✅ Backend running on Render (Python)
- ✅ Frontend running on Netlify (already done)
- ✅ No VPS needed!
