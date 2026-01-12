# How to Trigger a New Deploy on Netlify

## Quick Steps

1. **Go to Netlify Dashboard**
   - Open: https://app.netlify.com/projects/mos-calculator2/overview

2. **Go to Deploys Tab**
   - Click **"Deploys"** in the top menu

3. **Trigger Deploy**
   - Click **"Trigger deploy"** button (top right)
   - Click **"Deploy site"** from the dropdown
   - **Optional but recommended**: Select **"Clear cache and deploy site"** to ensure a fresh build

4. **Wait for Build**
   - Watch the build progress (usually 2-3 minutes)
   - You'll see build logs in real-time

5. **Done!**
   - When build completes, your site is live with the new changes

---

## Step-by-Step with Screenshots Guide

### Step 1: Go to Your Site

1. Open: https://app.netlify.com/projects/mos-calculator2/overview
2. You'll see your site dashboard

### Step 2: Navigate to Deploys Tab

1. Look at the top menu bar
2. Click on **"Deploys"** (next to "Site settings", "Builds", etc.)

### Step 3: Trigger New Deploy

1. In the Deploys page, look at the top right
2. You'll see a button: **"Trigger deploy"**
3. Click it
4. A dropdown menu will appear with options:
   - **"Deploy site"** ← Click this
   - **"Clear cache and deploy site"** ← Recommended (use this to clear cache)

### Step 4: Monitor the Build

1. A new deploy will appear in the list
2. You can click on it to see build logs
3. Wait for it to complete (green checkmark)
4. Usually takes 2-3 minutes

### Step 5: Verify

1. Once build completes, visit your site URL
2. Test that it's working (e.g., search for a stock)
3. If you added environment variables, they should now be active

---

## Alternative: Trigger Deploy via Git Push

If you push changes to your GitHub repository (connected to Netlify), it will automatically trigger a new deploy:

```bash
# Make any change to your code
git add .
git commit -m "Update code"
git push origin main

# Netlify will automatically detect the push and deploy
```

**Note**: This method only triggers a deploy if you push code changes. If you only updated environment variables, you need to use the manual "Trigger deploy" method above.

---

## When to Trigger a New Deploy

You should trigger a new deploy after:

1. ✅ **Adding/updating environment variables** (your current situation)
2. ✅ **Pushing code changes to GitHub** (automatic deploy will happen)
3. ✅ **Changing build settings** in Netlify dashboard
4. ✅ **Wanting to clear cache and rebuild** from scratch

---

## Troubleshooting

### "Trigger deploy" button is grayed out
- Make sure you're on the **Deploys** tab
- Check that you have proper permissions for the site

### Build fails
- Check the build logs for errors
- Common issues:
  - Missing environment variables
  - TypeScript/build errors
  - Dependency installation issues

### Changes not appearing
- Make sure you selected **"Clear cache and deploy site"** if you updated environment variables
- Hard refresh your browser (Ctrl+Shift+R or Cmd+Shift+R)
- Wait a few minutes for CDN cache to clear

---

## Quick Reference

**Netlify Dashboard**: https://app.netlify.com/projects/mos-calculator2/overview

**Deploys Tab**: https://app.netlify.com/sites/mos-calculator2/deploys

**Manual Trigger Path**: Deploys → Trigger deploy → Deploy site → Clear cache and deploy site
