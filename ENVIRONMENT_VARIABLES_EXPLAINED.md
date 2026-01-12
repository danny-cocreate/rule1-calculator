# Environment Variables - Complete Explanation

## Understanding the Architecture

Your application has **two separate parts** that run in **different places**:

1. **Frontend (React)** → Runs on **Netlify** (hosted service)
2. **Backend (FastAPI)** → Runs on **VPS** (your server)

Each part needs its own environment variables in its respective location.

---

## Where Each File Runs

```
┌─────────────────────────────────────────────────────────────┐
│  YOUR COMPUTER (Local Development)                          │
│                                                              │
│  .env file ← You just created this                          │
│  ├─ Frontend variables (used by npm run dev)                │
│  └─ Backend variables (used by Python scripts)              │
└─────────────────────────────────────────────────────────────┘

                          ↓ Deploy ↓

┌─────────────────────────────────────────────────────────────┐
│  NETLIFY (Frontend Production)                              │
│                                                              │
│  Frontend React App                                          │
│  Needs: VITE_STOCKDATA_API_KEY                              │
│         VITE_FMP_API_KEY                                     │
│         VITE_SCUTTLEBUTT_API_URL                            │
│                                                              │
│  ⚠️ You must manually add these in Netlify dashboard        │
│     (The .env file doesn't automatically transfer)          │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  YOUR VPS (Backend Production)                              │
│                                                              │
│  FastAPI Backend                                             │
│  Needs: TAVILY_API_KEY                                      │
│         OLLAMA_BASE_URL                                     │
│         OLLAMA_MODEL                                        │
│                                                              │
│  ⚠️ You must manually add these on your VPS                 │
│     (Copy from .env file or create new .env on VPS)        │
└─────────────────────────────────────────────────────────────┘
```

---

## 1. Local Development (.env file)

**Location**: The `.env` file in your project root (you just created this)

**Purpose**: Used when running the app locally on your computer

**What it contains**:
- All frontend variables (for `npm run dev`)
- All backend variables (for running Python scripts locally)

**Status**: ✅ **Already done!** Your `.env` file is ready.

---

## 2. Netlify (Frontend Production)

**Location**: Netlify dashboard → Your site → Site settings → Environment variables

**Purpose**: Used when Netlify builds and serves your React app

**What needs to be added** (manually in Netlify dashboard):

```
VITE_STOCKDATA_API_KEY=Tsdj7Z3d3OwzL1MO3UJW4uunrRGOABTzuEqQWOlj
VITE_FMP_API_KEY=6HhHKgYFoKOlDJqi4THx75eTc6w3N1xq
VITE_SCUTTLEBUTT_API_URL=https://your-vps-backend-url:8000
```

**Why**: The `.env` file doesn't automatically go to Netlify. You must manually add variables in the Netlify dashboard.

**How to add**:
1. Go to: https://app.netlify.com/projects/mos-calculator2/overview
2. Click: **Site settings** → **Environment variables**
3. Click: **Add a variable**
4. Enter each variable name and value
5. Click: **Save**
6. Trigger a new deploy (Deploys tab → Trigger deploy)

---

## 3. VPS (Backend Production)

**Location**: Your VPS server (where FastAPI backend runs)

**Purpose**: Used when your FastAPI backend runs on the VPS

**What needs to be added** (on your VPS server):

```
TAVILY_API_KEY=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
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2
```

**Options**:

### Option A: Create .env file on VPS
```bash
# SSH into your VPS
ssh your-vps

# Navigate to your project directory
cd /path/to/rule1-calculator

# Create .env file
nano .env
# Paste the backend variables above
# Save and exit
```

### Option B: Export as environment variables
```bash
# SSH into your VPS
ssh your-vps

# Export variables (add to ~/.bashrc for persistence)
export TAVILY_API_KEY=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
export OLLAMA_BASE_URL=http://localhost:11434
export OLLAMA_MODEL=llama3.2
```

---

## Quick Reference Table

| Variable | Used By | Where to Set | Status |
|----------|---------|--------------|--------|
| `VITE_STOCKDATA_API_KEY` | Frontend | ✅ Local `.env`<br>⚠️ Netlify dashboard | Local done, Netlify pending |
| `VITE_FMP_API_KEY` | Frontend | ✅ Local `.env`<br>⚠️ Netlify dashboard | Local done, Netlify pending |
| `VITE_SCUTTLEBUTT_API_URL` | Frontend | ✅ Local `.env`<br>⚠️ Netlify dashboard | Local done, Netlify pending |
| `TAVILY_API_KEY` | Backend | ✅ Local `.env`<br>⚠️ VPS server | Local done, VPS pending |
| `OLLAMA_BASE_URL` | Backend | ✅ Local `.env`<br>⚠️ VPS server | Local done, VPS pending |
| `OLLAMA_MODEL` | Backend | ✅ Local `.env`<br>⚠️ VPS server | Local done, VPS pending |

---

## Summary

**What you've done**:
- ✅ Created `.env` file for local development (all variables included)

**What you still need to do**:

1. **For Netlify (frontend)**:
   - Go to Netlify dashboard
   - Add the 3 `VITE_*` variables manually
   - This is why your site is currently showing 403 errors

2. **For VPS (backend)**:
   - SSH into your VPS
   - Create `.env` file or export environment variables
   - Add the 3 backend variables (`TAVILY_API_KEY`, `OLLAMA_BASE_URL`, `OLLAMA_MODEL`)

---

## Why Can't the .env File Be Used Automatically?

- **Git**: `.env` is in `.gitignore` (for security), so it's not pushed to GitHub
- **Netlify**: Even if pushed, Netlify requires variables to be set in their dashboard for security and control
- **VPS**: The `.env` file on your local computer doesn't automatically copy to your VPS - you need to set it up there separately

This separation is **intentional for security** - API keys should be managed separately for each environment.
