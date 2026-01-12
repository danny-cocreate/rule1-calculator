# 🚀 Deployment Guide

## Option 1: Netlify (RECOMMENDED) ⭐

### Method A: Deploy from Git (Best)

**1. Push your code to GitHub:**
```bash
# Initialize git if you haven't
git init
git add .
git commit -m "Initial commit"

# Create a new repo on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/rule1-calculator.git
git branch -M main
git push -u origin main
```

**2. Deploy to Netlify:**
1. Go to https://app.netlify.com/
2. Click "Add new site" → "Import an existing project"
3. Choose "GitHub" and authorize
4. Select your `rule1-calculator` repository
5. Configure build settings:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
   - **Base directory:** (leave empty)

6. Add environment variables:
   - Go to "Site settings" → "Environment variables"
   - Add:
     - `VITE_STOCKDATA_API_KEY` = `your_stockdata_api_key_here`
     - `VITE_FMP_API_KEY` = `your_fmp_api_key_here`
     - `VITE_GEMINI_API_KEY` = `AIzaSyBhZ0zrHFX5VMEvwvxT2uDjqun0ne-O7-Q`

7. Click "Deploy site"

**3. Done!** 🎉
- Your site will be live at: `https://random-name-123.netlify.app`
- You can customize the domain in settings
- Auto-deploys on every git push!

---

### Method B: Deploy via Netlify CLI

**1. Install Netlify CLI:**
```bash
npm install -g netlify-cli
```

**2. Login:**
```bash
netlify login
```

**3. Initialize and deploy:**
```bash
cd /Users/dSetia/Dropbox/projects/rule1-calculator

# Build the app
npm run build

# Deploy
netlify deploy --prod
```

**4. Set environment variables:**
```bash
netlify env:set VITE_STOCKDATA_API_KEY your_stockdata_api_key_here
netlify env:set VITE_FMP_API_KEY your_fmp_api_key_here
netlify env:set VITE_GEMINI_API_KEY AIzaSyBhZ0zrHFX5VMEvwvxT2uDjqun0ne-O7-Q
```

---

### Method C: Drag & Drop (Quickest)

**1. Build the app:**
```bash
npm run build
```

**2. Deploy:**
1. Go to https://app.netlify.com/drop
2. Drag the `dist` folder onto the page
3. Done! (But no environment variables - keys will use hardcoded fallbacks)

⚠️ **Note:** This method doesn't set environment variables, so API keys will use the hardcoded fallbacks in the code.

---

## Option 2: Hostinger 🌐

Hostinger requires manual file upload.

**1. Build the app:**
```bash
cd /Users/dSetia/Dropbox/projects/rule1-calculator
npm run build
```

This creates a `dist` folder with all static files.

**2. Configure environment variables:**
Since Hostinger serves static files, you need to ensure the hardcoded API keys are set in the service files (they already are!).

**3. Upload to Hostinger:**

**Via File Manager:**
1. Login to Hostinger control panel
2. Go to "Files" → "File Manager"
3. Navigate to `public_html` (or your domain folder)
4. Upload ALL contents of the `dist` folder
5. Make sure `index.html` is in the root

**Via FTP:**
1. Use an FTP client (FileZilla, Cyberduck)
2. Connect to your Hostinger FTP:
   - Host: your-domain.com or FTP server from Hostinger
   - Username: from Hostinger panel
   - Password: from Hostinger panel
3. Upload all files from `dist` to `public_html`

**4. Configure .htaccess for SPA routing:**

Create a `.htaccess` file in `public_html`:
```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

**5. Done!**
Visit your domain: `https://your-domain.com`

---

## 🔄 Updating Your Deployment

### Netlify (Git method):
```bash
# Make changes, then:
git add .
git commit -m "Update"
git push
# Automatically deploys!
```

### Netlify (CLI method):
```bash
npm run build
netlify deploy --prod
```

### Hostinger:
```bash
npm run build
# Re-upload dist folder contents via File Manager or FTP
```

---

## 🔐 Security Notes

1. **API Keys in Frontend:**
   - Frontend apps expose API keys (unavoidable)
   - StockData.org & Gemini have rate limits (protection)
   - For production, consider:
     - Domain restrictions (in API console)
     - Backend proxy for API calls
     - Usage monitoring

2. **Environment Variables:**
   - On Netlify: Set in dashboard (secure)
   - On Hostinger: Hardcoded fallbacks work for static hosting

3. **Domain Restrictions:**
   - Configure in Google AI Studio (Gemini)
   - Configure in StockData.org dashboard (if available)
   - Configure in FMP dashboard (if available)
   - Restrict to your domain only

---

## 📊 Recommended: Netlify

| Feature | Netlify | Hostinger |
|---------|---------|-----------|
| **Ease of Setup** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| **Auto-Deploy** | ✅ Yes (from Git) | ❌ Manual |
| **Free Tier** | ✅ Generous | ❌ Paid |
| **HTTPS** | ✅ Auto | ✅ Available |
| **Environment Vars** | ✅ Secure | ⚠️ Hardcoded |
| **Custom Domain** | ✅ Easy | ✅ Included |
| **Best For** | Modern web apps | Traditional hosting |

**Winner:** Netlify for React/Vite apps! 🏆

---

## 🆘 Troubleshooting

### Netlify Issues:

**Build fails:**
```bash
# Check build logs in Netlify dashboard
# Common fix: Ensure node version
# Add to netlify.toml:
[build.environment]
  NODE_VERSION = "18"
```

**API keys not working:**
- Check environment variables in Netlify dashboard
- Ensure they start with `VITE_`
- Redeploy after adding env vars

**404 on refresh:**
- Ensure `netlify.toml` redirect rule is present
- Or add in Netlify dashboard: Redirects → `/* /index.html 200`

### Hostinger Issues:

**Blank page:**
- Check browser console for errors
- Ensure all files uploaded correctly
- Verify `.htaccess` exists

**API not working:**
- Check hardcoded fallback keys in service files
- Verify keys are valid

---

## 🎯 Quick Start (Netlify)

```bash
# 1. Install Netlify CLI
npm install -g netlify-cli

# 2. Login
netlify login

# 3. Build & Deploy
cd /Users/dSetia/Dropbox/projects/rule1-calculator
npm run build
netlify init
# Follow prompts, then:
netlify deploy --prod

# 4. Set env vars
netlify env:set VITE_STOCKDATA_API_KEY your_stockdata_api_key_here
netlify env:set VITE_FMP_API_KEY your_fmp_api_key_here
netlify env:set VITE_GEMINI_API_KEY AIzaSyBhZ0zrHFX5VMEvwvxT2uDjqun0ne-O7-Q

# Done! 🎉
```

---

**Need help?** Let me know which method you choose and I can guide you through the specific steps!

