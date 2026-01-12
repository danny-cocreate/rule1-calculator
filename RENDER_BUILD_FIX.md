# Render Build Fix - Metadata Generation Failed

## Problem
Error: `metadata-generation-failed` during pip install

This usually happens when:
1. Pip version is outdated
2. Missing build dependencies
3. Python version incompatibility

## Solution 1: Update Build Command (Recommended)

Update your **Build Command** in Render to:

```bash
cd backend && pip install --upgrade pip setuptools wheel && pip install -r requirements.txt
```

This ensures:
- ✅ Latest pip version
- ✅ Build tools (setuptools, wheel) are available
- ✅ Better package installation

## Solution 2: Specify Python Version

In Render settings, you can also specify Python version:

1. Go to your service settings
2. Look for **"Python Version"** or **"Runtime"**
3. Set to **Python 3.11** or **Python 3.12** (if available)

## Solution 3: Alternative Build Command

If Solution 1 doesn't work, try:

```bash
cd backend && python -m pip install --upgrade pip && python -m pip install -r requirements.txt
```

## Solution 4: Check Requirements.txt

Make sure `backend/requirements.txt` has all dependencies:

```
fastapi==0.104.1
uvicorn[standard]==0.24.0
pydantic==2.5.0
python-dotenv==1.0.0
requests==2.31.0
httpx==0.25.0
```

## How to Update in Render

1. Go to your service in Render dashboard
2. Click **"Settings"** tab
3. Scroll to **"Build Command"**
4. Update to:
   ```
   cd backend && pip install --upgrade pip setuptools wheel && pip install -r requirements.txt
   ```
5. Click **"Save Changes"**
6. Render will automatically redeploy

## If Still Failing

Check the full error logs in Render to see which package is failing. Common issues:

- **httpx**: Might need Rust compiler (Render should have it)
- **uvicorn[standard]**: Should work, but try `uvicorn` without `[standard]` if needed

## Alternative: Simplify Requirements

If build keeps failing, try installing without extras:

```bash
cd backend && pip install --upgrade pip && pip install fastapi uvicorn pydantic python-dotenv requests httpx
```

But the requirements.txt should work fine.
