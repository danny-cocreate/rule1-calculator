# Rule #1 Calculator

A modern web application for analyzing stocks using Phil Town's Rule #1 investing methodology. This calculator helps investors determine the intrinsic value (Sticker Price) and Margin of Safety price for stocks.

## Features

- **Stock Search**: Search for any stock by symbol or company name
- **Sticker Price Calculation**: Calculate the intrinsic value based on growth rates
- **Margin of Safety**: Get the recommended buy price (50% of sticker price)
- **Growth Metrics**: View and adjust EPS, Sales, and Book Value growth rates
- **Financial Health**: Review key financial ratios (ROE, Debt/Equity, Current Ratio, PE Ratio)
- **Investment Signal**: Visual indicator showing whether to BUY or WAIT
- **Price Visualization**: Interactive slider showing the relationship between current price, sticker price, and MOS price

## Technology Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **APIs**: 
  - StockData.org (price data)
  - Financial Modeling Prep (fundamentals data)
- **Styling**: CSS3 with modern gradients and animations

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser and navigate to `http://localhost:5173`

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Rule #1 Investing Methodology

This calculator implements Phil Town's Rule #1 investing principles:

### The Four Ms:
1. **Meaning**: Invest in companies you understand
2. **Moat**: Companies with durable competitive advantages
3. **Management**: Competent and trustworthy leadership
4. **Margin of Safety**: Buy at 50% discount to intrinsic value

### Key Calculations:

**Sticker Price Formula:**
```
Future EPS = Current EPS × (1 + Growth Rate)^10
Future PE = 2 × Growth Rate
Future Price = Future EPS × Future PE
Sticker Price = Future Price / (1.15)^10
```

**Margin of Safety:**
```
MOS Price = Sticker Price × 0.5
```

## Usage

1. Enter a stock symbol (e.g., AAPL, MSFT, GOOGL)
2. Click "Analyze" to fetch data and calculate metrics
3. Review the investment signal (BUY/WAIT)
4. Adjust the custom growth rate slider to see how different assumptions affect the valuation
5. Compare current price against sticker price and MOS price

## API Keys

This application uses multiple APIs. API keys are configured via environment variables.

### StockData.org (Price Data)
1. Sign up at https://www.stockdata.org
2. Get your free API key (100 requests/day)
3. Add to `.env` as `VITE_STOCKDATA_API_KEY=your_api_key_here`

### Financial Modeling Prep (Fundamentals Data)
1. Sign up at https://site.financialmodelingprep.com/developer/docs/
2. Get your free API key (250 requests/day)
3. Add to `.env` as `VITE_FMP_API_KEY=your_api_key_here`

For production use, consider:
- Using environment variables for API keys
- Implementing rate limiting
- Upgrading to premium tiers for higher request limits if needed

## License

MIT

## Acknowledgments

- Phil Town for the Rule #1 investing methodology
- StockData.org for providing financial data API

