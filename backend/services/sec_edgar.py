"""
SEC EDGAR API Service

Fetches financial data from SEC EDGAR to calculate ROE.
Uses companyconcept API to get Net Income and Shareholders' Equity.
"""

import requests
import json
import os
from typing import Optional

SEC_BASE_URL = "https://data.sec.gov"
SEC_USER_AGENT = os.getenv("SEC_USER_AGENT", "Rule1Calculator contact@example.com")  # Update with your contact


def load_cik_mapping() -> dict:
    """Load CIK mapping from JSON file."""
    try:
        mapping_path = os.path.join(
            os.path.dirname(__file__),
            "..",
            "data",
            "cik_mapping.json"
        )
        with open(mapping_path, 'r') as f:
            return json.load(f)
    except Exception as e:
        print(f"Warning: Could not load CIK mapping file: {e}")
        return {}


def get_cik_from_symbol(symbol: str) -> str:
    """
    Get CIK (Central Index Key) from stock symbol.
    
    First tries hardcoded mapping, then falls back to SEC API.
    """
    symbol_upper = symbol.upper()
    cik_mapping = load_cik_mapping()
    
    # Try hardcoded/common list first
    if symbol_upper in cik_mapping:
        cik = cik_mapping[symbol_upper]
        # Ensure CIK is 10 digits (pad with zeros)
        return str(cik).zfill(10)
    
    # Fallback: fetch from SEC API (for new IPOs, less common stocks)
    try:
        print(f"CIK not in cache for {symbol}, fetching from SEC...")
        response = requests.get(
            f"{SEC_BASE_URL}/files/company_tickers.json",
            headers={"User-Agent": SEC_USER_AGENT},
            timeout=10
        )
        response.raise_for_status()
        tickers = response.json()
        
        # SEC returns dict with numeric keys, values are {cik_str, ticker, title}
        for entry in tickers.values():
            if entry.get("ticker") == symbol_upper:
                cik = str(entry.get("cik_str", "")).zfill(10)
                print(f"Found CIK for {symbol}: {cik}")
                return cik
                
    except requests.exceptions.RequestException as e:
        print(f"Failed to fetch CIK from SEC API: {e}")
    except Exception as e:
        print(f"Error processing SEC ticker data: {e}")
    
    raise ValueError(f"CIK not found for symbol {symbol}")


def extract_latest_value(concept_data: dict, preferred_unit: str = "USD") -> Optional[float]:
    """
    Extract the latest value from SEC companyconcept data.
    
    SEC returns data in units (USD, shares, etc.) with arrays of values.
    We want the most recent value in the preferred unit.
    """
    if not concept_data or "units" not in concept_data:
        return None
    
    units = concept_data["units"]
    
    # Try preferred unit first (usually USD)
    if preferred_unit in units:
        values = units[preferred_unit]
        if values and len(values) > 0:
            # Sort by end date (most recent first)
            sorted_values = sorted(
                values,
                key=lambda x: x.get("end", ""),
                reverse=True
            )
            latest = sorted_values[0]
            return latest.get("val")
    
    # Fallback: try any available unit
    for unit_name, values in units.items():
        if values and len(values) > 0:
            sorted_values = sorted(
                values,
                key=lambda x: x.get("end", ""),
                reverse=True
            )
            latest = sorted_values[0]
            val = latest.get("val")
            if val is not None:
                return val
    
    return None


def get_sec_roe(symbol: str) -> Optional[float]:
    """
    Get ROE from SEC EDGAR data.
    
    Calculates: ROE = (Net Income / Shareholders' Equity) * 100
    
    Returns ROE as a percentage, or None if data unavailable.
    """
    try:
        # Get CIK
        cik = get_cik_from_symbol(symbol)
        print(f"Fetching SEC data for {symbol} (CIK: {cik})")
        
        headers = {
            "User-Agent": SEC_USER_AGENT,
            "Accept": "application/json"
        }
        
        # Get Net Income (from Income Statement)
        # XBRL tag: us-gaap:NetIncomeLoss
        net_income_url = f"{SEC_BASE_URL}/api/xbrl/companyconcept/CIK{cik}/us-gaap/NetIncomeLoss.json"
        
        try:
            net_income_response = requests.get(net_income_url, headers=headers, timeout=10)
            net_income_response.raise_for_status()
            net_income_data = net_income_response.json()
            net_income = extract_latest_value(net_income_data, "USD")
            print(f"Net Income: {net_income}")
        except requests.exceptions.RequestException as e:
            print(f"Failed to fetch Net Income: {e}")
            return None
        
        # Get Shareholders' Equity (from Balance Sheet)
        # XBRL tag: us-gaap:StockholdersEquity
        equity_url = f"{SEC_BASE_URL}/api/xbrl/companyconcept/CIK{cik}/us-gaap/StockholdersEquity.json"
        
        try:
            equity_response = requests.get(equity_url, headers=headers, timeout=10)
            equity_response.raise_for_status()
            equity_data = equity_response.json()
            equity = extract_latest_value(equity_data, "USD")
            print(f"Shareholders' Equity: {equity}")
        except requests.exceptions.RequestException as e:
            print(f"Failed to fetch Shareholders' Equity: {e}")
            return None
        
        # Calculate ROE
        if net_income is not None and equity is not None and equity != 0:
            roe = (net_income / equity) * 100
            print(f"Calculated ROE: {roe:.2f}%")
            return roe
        else:
            print(f"Cannot calculate ROE: Net Income={net_income}, Equity={equity}")
            return None
            
    except ValueError as e:
        print(f"CIK lookup error: {e}")
        return None
    except Exception as e:
        print(f"Error calculating ROE from SEC data: {e}")
        import traceback
        traceback.print_exc()
        return None
