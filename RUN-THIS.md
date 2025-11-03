# 🚀 AUTOMATED DEPLOYMENT - RUN THIS!

## Simple 2-Step Process

### Step 1: Run the Deployment Script

Open your terminal and paste these commands:

```bash
cd /Users/dSetia/Dropbox/projects/rule1-calculator
chmod +x deploy.sh
./deploy.sh
```

### Step 2: Follow the Interactive Prompts

The script will:
- ✅ Initialize Git
- ✅ Add and commit all files
- ✅ Guide you to create GitHub repo
- ✅ Push to GitHub
- ✅ Provide Netlify deployment instructions

**That's it!** The script does everything automatically and guides you through authentication steps.

---

## What You'll Need

1. **GitHub account** (free) - Sign up at: https://github.com/signup
2. **Personal Access Token** - Create at: https://github.com/settings/tokens/new
   - Note: "Rule1 Deployment"
   - Scopes: Check "repo"
   - Copy the token!
3. **Netlify account** (free) - Sign up with GitHub at: https://app.netlify.com/signup

---

## Expected Flow

```
🚀 Running deploy.sh...

Step 1: Setting up Git... ✅
Step 2: Adding files... ✅
Step 3: Creating commit... ✅
Step 4: Create GitHub repo (opens browser) ⏸️
  → You create repo on GitHub
  → Press ENTER to continue
Step 5: Connecting to GitHub... ✅
Step 6: Pushing to GitHub... ⏸️
  → You authenticate with token
  → Push completes ✅
Step 7: Deploy on Netlify ⏸️
  → Instructions shown
  → You follow them on Netlify
  
🎉 Done! Site live in 3 minutes!
```

---

## Troubleshooting

### "Permission denied" when running script
```bash
chmod +x deploy.sh
./deploy.sh
```

### "Authentication failed" on git push
- Use your GitHub username
- Use Personal Access Token as password (NOT your GitHub password)
- Create token at: https://github.com/settings/tokens/new

### Script doesn't run
Run commands manually from `COMMANDS-TO-RUN.md`

---

## 🎯 Ready? Run This:

```bash
cd /Users/dSetia/Dropbox/projects/rule1-calculator && chmod +x deploy.sh && ./deploy.sh
```

**That's the only command you need!** Everything else is automated! 🚀

