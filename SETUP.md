# Rule #1 Calculator with Fisher Analysis - Setup Guide

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

This will install all required packages including:
- `@google/generative-ai` - For Gemini AI integration
- `axios` - For API calls
- `react` & `react-dom` - UI framework
- `typescript` & `vite` - Build tools

### 2. Configure API Keys

Create a `.env` file in the project root:

```env
VITE_STOCKDATA_API_KEY=your_stockdata_api_key_here
VITE_FMP_API_KEY=your_fmp_api_key_here
VITE_GEMINI_API_KEY=AIzaSyBhZ0zrHFX5VMEvwvxT2uDjqun0ne-O7-Q
```

**Note:** API keys are also hardcoded as fallbacks in the service files, so the app will work without the `.env` file.

### 3. Run Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

---

## 📋 Features

### Rule #1 Investment Analysis
- **Sticker Price Calculation** - Fair value based on growth rates
- **Margin of Safety (MOS)** - 50% discount to sticker price
- **BUY/WAIT Signals** - Clear investment recommendations
- **Growth Metrics** - EPS, Sales, Book Value growth rates
- **Financial Health** - ROE, Debt/Equity, Current Ratio, PE Ratio

### Philip Fisher's 15-Point Analysis (NEW! 🎉)
- **AI-Powered Research** - Uses Google Gemini to research qualitative criteria
- **Automated Calculations** - StockData.org data for quantitative metrics
- **15 Investment Criteria** - Complete "Scuttlebutt" methodology
- **Detailed Justifications** - Explanations for each rating
- **Overall Quality Score** - Aggregate 1-5 rating

---

## 🔑 API Information

### StockData.org (Free Tier)
- **Rate Limits:** 100 requests/day
- **Usage:** 1 request per stock search (Price data only)
- **Get Your Key:** https://www.stockdata.org (Sign up for free account)
- **Purpose:** Real-time stock price data

### Financial Modeling Prep (FMP) (Free Tier)
- **Rate Limits:** 250 requests/day
- **Usage:** 1-2 requests per stock search (Key Metrics + Growth data)
- **Get Your Key:** https://site.financialmodelingprep.com/developer/docs/ (Sign up for free account)
- **Purpose:** Financial fundamentals (EPS, PE, ROE, growth rates, ratios)

### Google Gemini AI (Free Tier)
- **Rate Limits:** 15 requests/minute, 1,500 requests/day
- **Model Used:** Gemini 1.5 Flash (fast & cost-effective)
- **Cost:** ~$0.01-0.05 per stock analysis
- **Get Your Key:** https://ai.google.dev/

---

## 🧪 Testing

Try these stocks to see the features in action:
- **AAPL** - Apple Inc. (Large cap, established)
- **MSFT** - Microsoft (Tech giant)
- **NVDA** - NVIDIA (High growth)
- **KO** - Coca-Cola (Dividend stock)
- **TSLA** - Tesla (Volatile growth)

---

## 🛠️ Technology Stack

- **Frontend:** React 18 + TypeScript
- **Build Tool:** Vite
- **APIs:** 
  - StockData.org (Price Data)
  - Financial Modeling Prep (Fundamentals Data)
  - Google Gemini AI (Qualitative Analysis)
- **Styling:** Custom CSS with responsive design

---

## 📊 How Fisher Analysis Works

The app automatically:
1. **Calculates 3 quantitative criteria** from FMP and StockData.org data
   - Market Potential (revenue growth from FMP)
   - Profit Margins (ROE from FMP)
   - Accounting Controls (debt ratios from FMP)

2. **Researches 12 qualitative criteria** using Gemini AI
   - Management quality & determination
   - R&D effectiveness
   - Sales organization strength
   - Labor relations
   - Competitive advantages
   - Communication & integrity
   - ...and more

3. **Combines into overall score** (1-5 rating)
4. **Caches results for 24 hours** to minimize API calls

---

## 🎨 UI Features

- **Dynamic Theming** - Background changes based on BUY/WAIT signal
- **Autocomplete Search** - Popular stocks suggested
- **Price Visualization** - Visual bars for Current, MOS, and Sticker prices
- **Interactive Scorecard** - Expandable Fisher criteria with details
- **Responsive Design** - Works on desktop and mobile

---

## 🐛 Troubleshooting

### API Rate Limit Errors
- **StockData.org:** Wait a few minutes between searches or try again tomorrow if daily limit reached (100 requests/day)
- **FMP:** Wait a few minutes between searches or try again tomorrow if daily limit reached (250 requests/day)
- **Gemini:** Very high limits, unlikely to hit on free tier

### Build Issues
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Type Errors
```bash
# Ensure TypeScript is working
npx tsc --noEmit
```

---

## 📚 References

- **Phil Town's Rule #1:** https://www.ruleoneinvesting.com/
- **Philip Fisher's Scuttlebutt Method:** "Common Stocks and Uncommon Profits"
- **StockData.org Docs:** https://www.stockdata.org/documentation
- **Gemini AI Docs:** https://ai.google.dev/docs

---

## 🤝 Contributing

This is a workshop project. Feel free to:
- Add more Fisher criteria
- Improve AI prompts for better analysis
- Add data visualization (charts, graphs)
- Integrate additional data sources
- Enhance UI/UX

---

**Happy Investing! 📈**

