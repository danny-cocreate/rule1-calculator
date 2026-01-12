# Deployment Environment Variables Setup

## The Big Picture

Your app runs in 3 places, each needing different environment variables:

1. **Your Computer** (Local) → `.env` file ✅ **DONE**
2. **Netlify** (Frontend) → Dashboard settings ⚠️ **TODO**
3. **VPS** (Backend) → Server environment ⚠️ **TODO**

---

## Step 1: Netlify (Frontend) - DO THIS NOW

Your site is failing because Netlify doesn't have the API keys.

### How to Add Variables to Netlify:

1. **Go to Netlify Dashboard**:
   - Open: https://app.netlify.com/projects/mos-calculator2/overview

2. **Navigate to Environment Variables**:
   - Click: **Site settings** (top menu)
   - Click: **Environment variables** (left sidebar)

3. **Add These 3 Variables**:

   **Variable 1:**
   - Key: `VITE_STOCKDATA_API_KEY`
   - Value: `Tsdj7Z3d3OwzL1MO3UJW4uunrRGOABTzuEqQWOlj`
   - Click: **Add variable** → **Save**

   **Variable 2:**
   - Key: `VITE_FMP_API_KEY`
   - Value: `6HhHKgYFoKOlDJqi4THx75eTc6w3N1xq`
   - Click: **Add variable** → **Save**

   **Variable 3:**
   - Key: `VITE_SCUTTLEBUTT_API_URL`
   - Value: `https://your-vps-backend-url:8000` (replace with your actual VPS URL)
   - Click: **Add variable** → **Save**

4. **Trigger New Deploy**:
   - Go to **Deploys** tab
   - Click **"Trigger deploy"** → **"Deploy site"**
   - Select **"Clear cache and deploy site"**
   - Wait 2-3 minutes

5. **Test**: Visit your site - it should work now!

---

## Step 2: VPS (Backend) - DO THIS WHEN DEPLOYING BACKEND

When you're ready to deploy the FastAPI backend to your VPS:

### Option A: Create .env File on VPS (Recommended)

```bash
# 1. SSH into your VPS
ssh your-vps-username@your-vps-ip

# 2. Navigate to your project directory
cd /path/to/rule1-calculator

# 3. Create .env file
nano .env

# 4. Paste these lines:
TAVILY_API_KEY=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
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2

# 5. Save: Ctrl+O, Enter, Ctrl+X

# 6. Verify it was created
cat .env
```

### Option B: Export as System Environment Variables

```bash
# SSH into your VPS
ssh your-vps-username@your-vps-ip

# Add to your shell profile (for persistence)
echo 'export TAVILY_API_KEY=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' >> ~/.bashrc
echo 'export OLLAMA_BASE_URL=http://localhost:11434' >> ~/.bashrc
echo 'export OLLAMA_MODEL=llama3.2' >> ~/.bashrc

# Reload shell
source ~/.bashrc

# Verify
echo $TAVILY_API_KEY
```

---

## Complete Variable Reference

### Frontend Variables (for Netlify)

```
VITE_STOCKDATA_API_KEY=Tsdj7Z3d3OwzL1MO3UJW4uunrRGOABTzuEqQWOlj
VITE_FMP_API_KEY=6HhHKgYFoKOlDJqi4THx75eTc6w3N1xq
VITE_SCUTTLEBUTT_API_URL=https://your-vps-backend-url:8000
```

### Backend Variables (for VPS)

```
TAVILY_API_KEY=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
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2
```

---

## Why This Separation?

- **Security**: Each environment has its own credentials
- **Flexibility**: Can use different keys/configs for dev vs production
- **Best Practice**: Never commit API keys to git (that's why `.env` is in `.gitignore`)

---

## Checklist

- [x] Created local `.env` file (for development on your computer)
- [ ] Added frontend variables to Netlify dashboard (fixes current 403 errors)
- [ ] Will add backend variables to VPS when deploying backend

---

## Need Help?

- **Netlify Setup**: See `QUICK_FIX_NETLIFY.md`
- **VPS Setup**: See `VPS_SETUP.md` and `RUN_ON_VPS.md`
- **Local Development**: Your `.env` file is ready - just run `npm run dev`
