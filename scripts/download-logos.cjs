#!/usr/bin/env node

/**
 * Script to download company logos from Clearbit
 * Stores them locally in public/logos/
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// Top 50 companies to download logos for
const TOP_COMPANIES = [
  { symbol: 'AAPL', domain: 'apple.com' },
  { symbol: 'MSFT', domain: 'microsoft.com' },
  { symbol: 'GOOGL', domain: 'google.com' },
  { symbol: 'AMZN', domain: 'amazon.com' },
  { symbol: 'TSLA', domain: 'tesla.com' },
  { symbol: 'META', domain: 'meta.com' },
  { symbol: 'NVDA', domain: 'nvidia.com' },
  { symbol: 'NFLX', domain: 'netflix.com' },
  { symbol: 'JPM', domain: 'jpmorganchase.com' },
  { symbol: 'V', domain: 'visa.com' },
  { symbol: 'MA', domain: 'mastercard.com' },
  { symbol: 'BAC', domain: 'bankofamerica.com' },
  { symbol: 'WFC', domain: 'wellsfargo.com' },
  { symbol: 'GS', domain: 'goldmansachs.com' },
  { symbol: 'MS', domain: 'morganstanley.com' },
  { symbol: 'C', domain: 'citigroup.com' },
  { symbol: 'BRK.B', domain: 'berkshirehathaway.com' },
  { symbol: 'WMT', domain: 'walmart.com' },
  { symbol: 'HD', domain: 'homedepot.com' },
  { symbol: 'MCD', domain: 'mcdonalds.com' },
  { symbol: 'NKE', domain: 'nike.com' },
  { symbol: 'SBUX', domain: 'starbucks.com' },
  { symbol: 'TGT', domain: 'target.com' },
  { symbol: 'COST', domain: 'costco.com' },
  { symbol: 'DIS', domain: 'disney.com' },
  { symbol: 'KO', domain: 'coca-cola.com' },
  { symbol: 'PEP', domain: 'pepsi.com' },
  { symbol: 'JNJ', domain: 'jnj.com' },
  { symbol: 'UNH', domain: 'unitedhealthgroup.com' },
  { symbol: 'PFE', domain: 'pfizer.com' },
  { symbol: 'ABBV', domain: 'abbvie.com' },
  { symbol: 'TMO', domain: 'thermofisher.com' },
  { symbol: 'MRK', domain: 'merck.com' },
  { symbol: 'ABT', domain: 'abbott.com' },
  { symbol: 'BA', domain: 'boeing.com' },
  { symbol: 'CAT', domain: 'caterpillar.com' },
  { symbol: 'GE', domain: 'ge.com' },
  { symbol: 'MMM', domain: '3m.com' },
  { symbol: 'HON', domain: 'honeywell.com' },
  { symbol: 'LMT', domain: 'lockheedmartin.com' },
  { symbol: 'T', domain: 'att.com' },
  { symbol: 'VZ', domain: 'verizon.com' },
  { symbol: 'CMCSA', domain: 'comcastcorporation.com' },
  { symbol: 'XOM', domain: 'exxonmobil.com' },
  { symbol: 'CVX', domain: 'chevron.com' },
  { symbol: 'COP', domain: 'conocophillips.com' },
  { symbol: 'F', domain: 'ford.com' },
  { symbol: 'GM', domain: 'gm.com' },
  { symbol: 'INTC', domain: 'intel.com' },
  { symbol: 'AMD', domain: 'amd.com' },
];

const LOGOS_DIR = path.join(__dirname, '..', 'public', 'logos');

// Ensure logos directory exists
if (!fs.existsSync(LOGOS_DIR)) {
  fs.mkdirSync(LOGOS_DIR, { recursive: true });
}

/**
 * Download a logo from Clearbit
 */
function downloadLogo(symbol, domain) {
  return new Promise((resolve, reject) => {
    const url = `https://logo.clearbit.com/${domain}`;
    const filename = `${symbol.replace('.', '_')}.png`;
    const filepath = path.join(LOGOS_DIR, filename);

    // Skip if already exists
    if (fs.existsSync(filepath)) {
      console.log(`✓ ${symbol} - already exists`);
      resolve();
      return;
    }

    const file = fs.createWriteStream(filepath);

    https.get(url, (response) => {
      if (response.statusCode === 200) {
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          console.log(`✓ ${symbol} - downloaded`);
          resolve();
        });
      } else if (response.statusCode === 404) {
        // Try Google favicon as fallback
        const fallbackUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
        
        https.get(fallbackUrl, (fallbackResponse) => {
          if (fallbackResponse.statusCode === 200) {
            fallbackResponse.pipe(file);
            file.on('finish', () => {
              file.close();
              console.log(`✓ ${symbol} - downloaded (fallback)`);
              resolve();
            });
          } else {
            fs.unlinkSync(filepath);
            console.log(`✗ ${symbol} - not found`);
            resolve();
          }
        }).on('error', (err) => {
          fs.unlinkSync(filepath);
          console.log(`✗ ${symbol} - error: ${err.message}`);
          resolve();
        });
      } else {
        fs.unlinkSync(filepath);
        console.log(`✗ ${symbol} - error: ${response.statusCode}`);
        resolve();
      }
    }).on('error', (err) => {
      if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath);
      }
      console.log(`✗ ${symbol} - error: ${err.message}`);
      resolve();
    });
  });
}

/**
 * Download all logos with delay to avoid rate limiting
 */
async function downloadAllLogos() {
  console.log(`📥 Downloading logos for ${TOP_COMPANIES.length} companies...\n`);

  for (let i = 0; i < TOP_COMPANIES.length; i++) {
    const company = TOP_COMPANIES[i];
    await downloadLogo(company.symbol, company.domain);
    
    // Add a small delay to avoid overwhelming the servers
    if (i < TOP_COMPANIES.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }

  console.log('\n✅ Logo download complete!');
  console.log(`📁 Logos saved to: ${LOGOS_DIR}`);
}

// Run the script
downloadAllLogos().catch(console.error);

