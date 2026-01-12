# ⚡ Quick Commands - Copy & Paste

## Step 1: Git Setup & Push to GitHub

```bash
# Navigate to project
cd /Users/dSetia/Dropbox/projects/rule1-calculator

# Initialize Git
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit: Rule #1 Calculator with Fisher Analysis"

# Add GitHub remote (REPLACE 'YOUR_USERNAME' with your actual GitHub username!)
git remote add origin https://github.com/YOUR_USERNAME/rule1-calculator.git

# Push to GitHub
git branch -M main
git push -u origin main
```

---

## Step 2: On GitHub Website

1. Go to: https://github.com/new
2. Repository name: `rule1-calculator`
3. Description: "Phil Town's Rule #1 Investment Calculator with Philip Fisher AI Analysis"
4. Click "Create repository" (don't add README, .gitignore, or license)
5. Copy the remote URL shown (looks like: `https://github.com/YOUR_USERNAME/rule1-calculator.git`)
6. Use that URL in the `git remote add origin` command above

---

## Step 3: On Netlify Website

1. Go to: https://app.netlify.com/signup (sign up with GitHub)
2. Click: **"Add new site"** → **"Import an existing project"**
3. Choose: **"GitHub"**
4. Select: `rule1-calculator` repository
5. Configure:
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Environment variables:
     - `VITE_STOCKDATA_API_KEY` = `your_stockdata_api_key_here`
     - `VITE_GEMINI_API_KEY` = `AIzaSyBhZ0zrHFX5VMEvwvxT2uDjqun0ne-O7-Q`
6. Click: **"Deploy site"**

---

## 🎉 Done!

Your site will be live in ~3 minutes at: `https://something-random-123.netlify.app`

---

## For Future Updates (Auto-Deploy!)

```bash
# Make changes to your code
# ...

# Commit and push
git add .
git commit -m "Description of changes"
git push

# Netlify automatically redeploys! 🚀
```

---

## Need the detailed guide?

See: `DEPLOY-NETLIFY-GIT.md`

