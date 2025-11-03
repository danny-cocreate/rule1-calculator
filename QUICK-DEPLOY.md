# ⚡ Quick Deploy Guide

## 🚀 Fastest: Netlify CLI (5 minutes)

```bash
# 1. Install CLI
npm install -g netlify-cli

# 2. Go to project
cd /Users/dSetia/Dropbox/projects/rule1-calculator

# 3. Build
npm run build

# 4. Login & Deploy
netlify login
netlify init
netlify deploy --prod

# 5. Set API Keys
netlify env:set VITE_ALPHA_VANTAGE_API_KEY LH82CXE5Y5HTVXA4
netlify env:set VITE_GEMINI_API_KEY AIzaSyBhZ0zrHFX5VMEvwvxT2uDjqun0ne-O7-Q

# Done! Your site is live 🎉
```

---

## 🌐 Hostinger (10 minutes)

```bash
# 1. Build
cd /Users/dSetia/Dropbox/projects/rule1-calculator
npm run build

# 2. Upload via FTP or File Manager
# - Connect to Hostinger
# - Upload ALL files from 'dist' folder to 'public_html'
# - Upload '.htaccess' file (in project root)

# 3. Visit your domain
# https://your-domain.com
```

---

## 🎯 Netlify Drag & Drop (2 minutes)

```bash
# 1. Build
npm run build

# 2. Go to https://app.netlify.com/drop
# 3. Drag the 'dist' folder
# Done! (Uses hardcoded API keys)
```

---

## 📝 After Deployment

✅ **Test the live site:**
- Search for a stock (AAPL, MSFT)
- Verify Rule #1 calculations work
- Verify Fisher AI analysis loads
- Check that all data displays correctly

✅ **Monitor API usage:**
- Alpha Vantage: 25 requests/day limit
- Gemini: Very high limits

✅ **Optional: Custom domain:**
- Netlify: Settings → Domain management
- Hostinger: Already on your domain

---

## 🔐 Production Checklist

- [ ] Environment variables set (Netlify)
- [ ] API keys restricted to domain (Google AI Studio, Alpha Vantage)
- [ ] HTTPS enabled (auto on both)
- [ ] Test all features on live site
- [ ] Monitor API quotas
- [ ] Set up domain (if custom)
- [ ] Add Google Analytics (optional)

---

**Questions?** See `DEPLOYMENT.md` for full details!

