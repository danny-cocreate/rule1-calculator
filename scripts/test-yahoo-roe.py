#!/usr/bin/env python3
"""
Isolated test for Yahoo Finance ROE using yfinance library.
Tests the same logic used in the backend endpoint.
"""

import sys
import os

# Add backend to path so we can import if needed
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))

try:
    import yfinance as yf
except ImportError:
    print("❌ ERROR: yfinance not installed")
    print("Install with: pip install yfinance")
    sys.exit(1)

def test_yahoo_roe(symbol: str = "NVDA"):
    """Test fetching ROE from Yahoo Finance using yfinance."""
    print(f"\n🧪 Testing Yahoo Finance ROE for {symbol}")
    print("=" * 60)
    
    try:
        # Use yfinance library (same as backend)
        print(f"📡 Fetching data for {symbol}...")
        ticker = yf.Ticker(symbol)
        info = ticker.info
        
        print(f"\n✅ Successfully fetched ticker info")
        print(f"📊 Available keys in info: {len(info)} fields")
        
        # Try multiple field names for ROE
        print(f"\n🔍 Searching for ROE in info...")
        roe_raw = (
            info.get('returnOnEquity') or
            info.get('roe') or
            info.get('returnOnEquityTTM')
        )
        
        # Show what we found
        print(f"\n📋 ROE field values:")
        print(f"  - returnOnEquity: {info.get('returnOnEquity')}")
        print(f"  - roe: {info.get('roe')}")
        print(f"  - returnOnEquityTTM: {info.get('returnOnEquityTTM')}")
        
        if roe_raw is not None:
            # Convert to percentage
            roe_percentage = roe_raw * 100
            print(f"\n✅ SUCCESS!")
            print(f"   ROE (raw): {roe_raw}")
            print(f"   ROE (%): {roe_percentage:.2f}%")
            return {'symbol': symbol, 'roe': roe_percentage}
        else:
            print(f"\n❌ ERROR: ROE not found in any expected field")
            print(f"\n🔍 Available fields containing 'roe' or 'equity':")
            roe_fields = [k for k in info.keys() if 'roe' in k.lower() or 'equity' in k.lower()]
            for field in roe_fields[:10]:  # Show first 10
                print(f"  - {field}: {info.get(field)}")
            return None
            
    except Exception as e:
        print(f"\n❌ ERROR: {type(e).__name__}: {str(e)}")
        import traceback
        traceback.print_exc()
        return None

if __name__ == "__main__":
    # Test with NVDA
    result = test_yahoo_roe("NVDA")
    
    if result:
        print(f"\n✅ Test PASSED: ROE = {result['roe']:.2f}%")
        sys.exit(0)
    else:
        print(f"\n❌ Test FAILED: Could not fetch ROE")
        sys.exit(1)
