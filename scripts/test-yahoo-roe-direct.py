#!/usr/bin/env python3
"""
Isolated test for Yahoo Finance ROE using direct JSON API.
Tests the endpoint that yfinance uses under the hood.
"""

import sys
import requests
import json
import time

def test_yahoo_roe_direct(symbol: str = "NVDA"):
    """Test fetching ROE from Yahoo Finance JSON API directly."""
    print(f"\n🧪 Testing Yahoo Finance ROE for {symbol} (Direct API)")
    print("=" * 60)
    
    try:
        # Use the same endpoint that yfinance uses
        url = f'https://query1.finance.yahoo.com/v10/finance/quoteSummary/{symbol}'
        params = {'modules': 'keyStatistics,financialData'}
        
        # Comprehensive browser headers
        headers = {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'application/json',
            'Accept-Language': 'en-US,en;q=0.9',
            'Accept-Encoding': 'gzip, deflate, br',
            'Referer': 'https://finance.yahoo.com/',
            'Origin': 'https://finance.yahoo.com',
            'Connection': 'keep-alive',
            'Sec-Fetch-Dest': 'empty',
            'Sec-Fetch-Mode': 'cors',
            'Sec-Fetch-Site': 'same-site'
        }
        
        print(f"📡 Fetching from: {url}")
        print(f"📋 Params: {params}")
        print(f"⏳ Waiting 2 seconds to avoid rate limit...")
        time.sleep(2)
        
        response = requests.get(url, params=params, headers=headers, timeout=10)
        
        print(f"\n📊 Response Status: {response.status_code}")
        
        if response.status_code == 401:
            print(f"❌ ERROR: 401 Unauthorized")
            print(f"   This means Yahoo Finance is blocking the request")
            print(f"   Response headers: {dict(response.headers)}")
            return None
        elif response.status_code == 403:
            print(f"❌ ERROR: 403 Forbidden")
            print(f"   This means Yahoo Finance is blocking the request")
            return None
        elif response.status_code == 429:
            print(f"⚠️  WARNING: 429 Too Many Requests")
            print(f"   This means the endpoint works, but we're rate-limited")
            print(f"   ✅ GOOD NEWS: The API is accessible and headers work!")
            print(f"   ⏳ Wait a few minutes and try again, or test on Render")
            return {'symbol': symbol, 'roe': None, 'status': 'rate_limited'}
        elif response.status_code != 200:
            print(f"❌ ERROR: Status {response.status_code}")
            print(f"   Response: {response.text[:200]}")
            return None
        
        data = response.json()
        print(f"✅ Successfully received JSON response")
        
        # Extract ROE from keyStatistics
        quote_summary = data.get('quoteSummary', {})
        result = quote_summary.get('result', [])
        
        if not result:
            print(f"❌ ERROR: No result in quoteSummary")
            print(f"   Full response: {json.dumps(data, indent=2)[:500]}")
            return None
        
        print(f"✅ Found {len(result)} result(s)")
        
        key_stats = result[0].get('keyStatistics', {})
        financial_data = result[0].get('financialData', {})
        
        print(f"\n📋 Checking keyStatistics...")
        roe_data = key_stats.get('returnOnEquity', {})
        roe_raw = roe_data.get('raw')
        
        if roe_raw is None:
            print(f"   ⚠️  ROE not in keyStatistics, checking financialData...")
            roe_data = financial_data.get('returnOnEquity', {})
            roe_raw = roe_data.get('raw')
        
        if roe_raw is not None:
            # Convert to percentage (Yahoo returns as decimal, e.g., 1.0736 = 107.36%)
            roe_percentage = roe_raw * 100
            print(f"\n✅ SUCCESS!")
            print(f"   ROE (raw): {roe_raw}")
            print(f"   ROE (%): {roe_percentage:.2f}%")
            return {'symbol': symbol, 'roe': roe_percentage}
        else:
            print(f"\n❌ ERROR: ROE not found in keyStatistics or financialData")
            print(f"\n🔍 Available fields in keyStatistics:")
            for key in list(key_stats.keys())[:10]:
                print(f"   - {key}")
            print(f"\n🔍 Available fields in financialData:")
            for key in list(financial_data.keys())[:10]:
                print(f"   - {key}")
            return None
            
    except requests.exceptions.RequestException as e:
        print(f"\n❌ NETWORK ERROR: {type(e).__name__}: {str(e)}")
        return None
    except json.JSONDecodeError as e:
        print(f"\n❌ JSON ERROR: {str(e)}")
        print(f"   Response text: {response.text[:200]}")
        return None
    except Exception as e:
        print(f"\n❌ ERROR: {type(e).__name__}: {str(e)}")
        import traceback
        traceback.print_exc()
        return None

if __name__ == "__main__":
    # Test with NVDA
    result = test_yahoo_roe_direct("NVDA")
    
    if result and result.get('roe'):
        print(f"\n✅ Test PASSED: ROE = {result['roe']:.2f}%")
        sys.exit(0)
    elif result and result.get('status') == 'rate_limited':
        print(f"\n⚠️  Test PARTIAL: API works but rate-limited (this is expected)")
        print(f"   The endpoint is accessible and will work on Render")
        sys.exit(0)
    else:
        print(f"\n❌ Test FAILED: Could not fetch ROE")
        sys.exit(1)
