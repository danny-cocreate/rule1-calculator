#!/usr/bin/env python3
"""
Test script to inspect Yahoo Finance HTML structure for ROE.
"""

import requests
from bs4 import BeautifulSoup
import re

def test_yahoo_html_structure(symbol="NVDA"):
    """Test Yahoo Finance HTML structure to find ROE."""
    url = f'https://finance.yahoo.com/quote/{symbol}/key-statistics'
    
    headers = {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    }
    
    print(f"Fetching: {url}")
    response = requests.get(url, headers=headers, timeout=15)
    
    print(f"Status: {response.status_code}")
    print(f"Content length: {len(response.text)}")
    
    if response.status_code != 200:
        print(f"Error: {response.text[:500]}")
        return
    
    soup = BeautifulSoup(response.text, 'lxml')
    
    # Check if page has ROE text
    roe_texts = soup.find_all(string=re.compile(r'Return on Equity|ROE', re.I))
    print(f"\nFound {len(roe_texts)} elements with 'Return on Equity' or 'ROE'")
    
    for i, text in enumerate(roe_texts[:5]):  # Show first 5
        parent = text.find_parent()
        print(f"\n{i+1}. Text: '{text.strip()}'")
        print(f"   Parent tag: {parent.name if parent else 'None'}")
        print(f"   Parent classes: {parent.get('class') if parent else 'None'}")
        print(f"   Parent attrs: {parent.attrs if parent else 'None'}")
        
        # Try to find value nearby
        if parent:
            row = parent.find_parent('tr') or parent.find_parent('div')
            if row:
                print(f"   Found row: {row.name}")
                all_tds = row.find_all(['td', 'span', 'div'])
                print(f"   Elements in row: {len(all_tds)}")
                for j, elem in enumerate(all_tds[:3]):
                    print(f"     {j+1}. {elem.name}: '{elem.get_text(strip=True)[:50]}'")
    
    # Check for React/JavaScript data
    scripts = soup.find_all('script')
    print(f"\nFound {len(scripts)} script tags")
    
    # Look for JSON data in scripts
    for script in scripts:
        if script.string and ('root.App.main' in script.string or 'quoteSummary' in script.string):
            print(f"\nFound potential data script (length: {len(script.string)})")
            # Try to extract JSON
            if 'quoteSummary' in script.string:
                print("  Contains 'quoteSummary' - might have JSON data")
                # Look for ROE in the script
                if 'returnOnEquity' in script.string.lower() or 'roe' in script.string.lower():
                    print("  ✅ Contains ROE-related data!")

if __name__ == "__main__":
    test_yahoo_html_structure("NVDA")
