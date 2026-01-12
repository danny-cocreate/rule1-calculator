# 🚀 Deploy to Netlify via Git - Step by Step

## Prerequisites
- GitHub account (free): https://github.com/signup
- Netlify account (free): https://app.netlify.com/signup

---

## 📝 Step 1: Initialize Git & Commit Your Code

Open your terminal and run:

```bash
# Navigate to project
cd /Users/dSetia/Dropbox/projects/rule1-calculator

# Initialize Git (if not already done)
git init

# Add all files
git add .

# Create first commit
git commit -m "Initial commit: Rule #1 Calculator with Fisher Analysis"
```

---

## 🌐 Step 2: Create GitHub Repository

**Option A: Via GitHub Website (Easier)**

1. Go to: https://github.com/new
2. Fill in:
   - **Repository name:** `rule1-calculator` (or your preferred name)
   - **Description:** "Phil Town's Rule #1 Investment Calculator with Philip Fisher AI Analysis"
   - **Visibility:** Public or Private (your choice)
   - **Do NOT** initialize with README, .gitignore, or license (we already have these)
3. Click "Create repository"

**Option B: Via GitHub CLI** (if installed)
```bash
gh repo create rule1-calculator --public --source=. --remote=origin --push
```

---

## 🔗 Step 3: Connect & Push to GitHub

After creating the repo on GitHub, you'll see instructions. Run:

```bash
# Add GitHub as remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/rule1-calculator.git

# Rename branch to main (if needed)
git branch -M main

# Push code to GitHub
git push -u origin main
```

**Example:**
```bash
git remote add origin https://github.com/johnsmith/rule1-calculator.git
git branch -M main
git push -u origin main
```

You'll be asked to authenticate. Use your GitHub username and a **Personal Access Token** (not password).

**To create a token:**
1. Go to: https://github.com/settings/tokens
2. Click "Generate new token (classic)"
3. Select scopes: `repo` (full control)
4. Copy the token and use it as your password

---

## 🚀 Step 4: Deploy on Netlify

### A. Create Netlify Account
1. Go to: https://app.netlify.com/signup
2. Sign up with GitHub (recommended for easy integration)

### B. Import Your Repository

1. **In Netlify dashboard**, click: **"Add new site"** → **"Import an existing project"**

2. **Choose Git provider:** Click **"GitHub"**
   - Authorize Netlify to access your GitHub

3. **Select repository:** 
   - Search for and select `rule1-calculator`

4. **Configure build settings:**
   
   **Site name:** (optional, you can customize or use auto-generated)
   
   **Branch to deploy:** `main`
   
   **Build settings:**
   - **Base directory:** (leave empty)
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
   - **Functions directory:** (leave empty)

5. **Advanced build settings** (click "Show advanced"):
   
   Add environment variables:
   
   | Key | Value |
   |-----|-------|
   | `VITE_STOCKDATA_API_KEY` | `your_stockdata_api_key_here` |
   | `VITE_GEMINI_API_KEY` | `AIzaSyBhZ0zrHFX5VMEvwvxT2uDjqun0ne-O7-Q` |

6. **Click "Deploy site"** 🎉

---

## ⏱️ Step 5: Wait for Build

- Netlify will now:
  1. Clone your repo
  2. Run `npm install`
  3. Run `npm run build`
  4. Deploy the `dist` folder

- **Build time:** 2-3 minutes
- **Watch progress:** In the "Deploys" tab

---

## ✅ Step 6: Test Your Live Site!

Once deployed:

1. **Your site URL** will be something like: `https://magical-unicorn-123abc.netlify.app`

2. **Test it:**
   - Search for a stock (e.g., "AAPL")
   - Verify Rule #1 calculations work
   - Verify Fisher AI analysis loads (wait ~15 seconds)
   - Check all features work

3. **Optional: Customize domain**
   - In Netlify: **Site settings** → **Domain management**
   - Click **"Edit site name"** to change the subdomain
   - Or add a **custom domain** you own

---

## 🔄 Step 7: Future Updates (Auto-Deploy!)

From now on, any changes you make will auto-deploy:

```bash
# Make your changes to code
# ...

# Commit changes
git add .
git commit -m "Updated Fisher prompts"

# Push to GitHub
git push

# 🎉 Netlify automatically detects the push and redeploys!
```

**No manual deployment needed!** Every `git push` triggers a new build.

---

## 🎨 Optional: Customize Netlify Settings

### Change Site Name
1. **Site settings** → **General** → **Site details**
2. Click **"Change site name"**
3. Enter: `rule1-calculator` (or your preferred name)
4. Your URL becomes: `https://rule1-calculator.netlify.app`

### Add Custom Domain
1. **Site settings** → **Domain management**
2. Click **"Add custom domain"**
3. Follow DNS configuration instructions

### Deploy Notifications
1. **Site settings** → **Build & deploy** → **Deploy notifications**
2. Add Slack, email, or webhook notifications

### Deploy Previews (Cool!)
- Every **Pull Request** gets its own preview URL
- Test changes before merging to main

---

## 🐛 Troubleshooting

### Build Fails

**Check the build log:**
1. Go to **Deploys** tab
2. Click the failed deploy
3. Read the error message

**Common issues:**

**❌ "npm command not found"**
- Netlify should auto-detect, but you can specify Node version
- Add to `netlify.toml`:
```toml
[build.environment]
  NODE_VERSION = "18"
```

**❌ "Build script not found"**
- Verify `package.json` has `"build": "tsc && vite build"` in scripts

**❌ API keys not working**
- Go to **Site settings** → **Environment variables**
- Verify both keys are set correctly
- **Redeploy** after adding env vars (click "Trigger deploy" → "Deploy site")

### 404 on Page Refresh

Should be handled by `netlify.toml`, but if not:
1. **Site settings** → **Build & deploy** → **Post processing**
2. Scroll to **Asset optimization**
3. Enable **"Pretty URLs"**
4. Or add redirect rule in UI:
   - `/*` → `/index.html` → `200`

### Fisher Analysis Not Loading

- Check browser console for errors
- Verify Gemini API key is correct in environment variables
- Check API quota limits

---

## 📊 Monitoring

### Deploy Status Badge (Optional)

Add to your GitHub README:
```markdown
[![Netlify Status](https://api.netlify.com/api/v1/badges/YOUR_SITE_ID/deploy-status)](https://app.netlify.com/sites/YOUR_SITE_NAME/deploys)
```

### Analytics

Netlify provides basic analytics:
- **Site overview** → See visitor stats
- Or integrate Google Analytics (add tracking code to `index.html`)

---

## 🎉 Success Checklist

- [ ] Code pushed to GitHub
- [ ] Netlify connected to GitHub repo
- [ ] Build successful (check Deploys tab)
- [ ] Environment variables set
- [ ] Live site tested with a stock search
- [ ] Rule #1 calculations working
- [ ] Fisher AI analysis loading
- [ ] Site name customized (optional)
- [ ] Custom domain added (optional)

---

## 🚀 Your Site is Live!

**URL:** `https://your-site-name.netlify.app`

**Features:**
- ✅ Auto-deploys on every `git push`
- ✅ HTTPS enabled
- ✅ Global CDN (fast worldwide)
- ✅ Automatic SSL certificates
- ✅ Deploy previews for branches
- ✅ Rollback to previous deploys anytime

**Need help?** Netlify has excellent docs: https://docs.netlify.com/

---

## 💡 Pro Tips

1. **Branch deploys:** Create a `dev` branch for testing
   - Pushes to `dev` get their own preview URL
   - Merge to `main` when ready for production

2. **Build time optimization:**
   - Netlify caches `node_modules` between builds
   - Builds after the first are faster

3. **Split testing:** Test two versions of your site with Netlify's A/B testing

4. **Forms:** Add Netlify Forms if you want user feedback forms

---

**Happy Deploying! 🎊**

