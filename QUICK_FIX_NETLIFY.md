# Quick Fix: Netlify Environment Variables

## The Problem

Your site is showing 403 Forbidden errors from FMP API because the environment variables are not set in Netlify.

## The Fix (5 Minutes)

### 1. Go to Netlify Dashboard

Open: https://app.netlify.com/projects/mos-calculator2/overview

### 2. Go to Environment Variables

Click: **Site settings** → **Environment variables**

### 3. Add These 2 Variables (Required)

**Variable 1:**
- Key: `VITE_STOCKDATA_API_KEY`
- Value: `Tsdj7Z3d3OwzL1MO3UJW4uunrRGOABTzuEqQWOlj`

**Variable 2:**
- Key: `VITE_FMP_API_KEY`
- Value: `6HhHKgYFoKOlDJqi4THx75eTc6w3N1xq`
- ⚠️ **This one is missing and causing the 403 error**

### 4. Trigger New Deploy

1. Go to **Deploys** tab
2. Click **"Trigger deploy"** → **"Deploy site"**
3. Select **"Clear cache and deploy site"**
4. Wait 2-3 minutes

### 5. Test

Visit your site and search for a stock. It should work now!

## Why This Happens

- Netlify environment variables are separate from your local `.env` file
- If variables aren't set in Netlify, the code can't access them during build
- Even if code has fallback values, they may not work in production

## After Backend is Deployed

Add this third variable:
- Key: `VITE_SCUTTLEBUTT_API_URL`
- Value: `https://your-vps-api-url:8000`
