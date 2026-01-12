# Render Deployment Fix

## Problem
Error: `uvicorn: command not found`

This happens because `uvicorn` isn't in the PATH. Use `python -m uvicorn` instead.

## Solution

### Update Start Command

Change the **Start Command** in Render from:
```bash
cd backend && uvicorn main:app --host 0.0.0.0 --port $PORT
```

To:
```bash
cd backend && python -m uvicorn main:app --host 0.0.0.0 --port $PORT
```

The `python -m` prefix ensures Python can find uvicorn in the installed packages.

## Complete Configuration

**Build Command**:
```bash
cd backend && pip install -r requirements.txt
```

**Start Command** (FIXED):
```bash
cd backend && python -m uvicorn main:app --host 0.0.0.0 --port $PORT
```

## How to Fix in Render

1. Go to your Render dashboard
2. Click on your service
3. Go to **Settings** tab
4. Scroll to **Start Command**
5. Update to: `cd backend && python -m uvicorn main:app --host 0.0.0.0 --port $PORT`
6. Click **Save Changes**
7. Render will automatically redeploy

## Alternative: Use Full Python Path

If that doesn't work, try:
```bash
cd backend && /usr/bin/python3 -m uvicorn main:app --host 0.0.0.0 --port $PORT
```

But `python -m uvicorn` should work on Render.
