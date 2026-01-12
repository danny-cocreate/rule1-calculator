#!/usr/bin/env python3
"""
Tavily Scuttlebutt Aggregation Script

Aggregates Tavily searches by stakeholder groups (customers, employees, competitors, etc.)
as defined in directives/scuttlebutt_company.md
"""

import os
import sys
import json
import argparse
from typing import Dict, List, Optional
from dotenv import load_dotenv
import requests

# Load environment variables
load_dotenv()

TAVILY_API_KEY = os.getenv('TAVILY_API_KEY')
TAVILY_API_URL = 'https://api.tavily.com/search'

# Stakeholder query patterns
STAKEHOLDER_QUERIES = {
    'customers': [
        '{company} customer reviews product quality',
        '{company} customer satisfaction service complaints',
        '{company} customer testimonials user experience',
    ],
    'employees': [
        '{company} Glassdoor reviews management culture',
        'working at {company} employee reviews',
        '{company} employee satisfaction culture values',
    ],
    'competitors': [
        '{company} main competitors market share',
        '{company} competitive advantages weaknesses industry analysis',
        '{company} industry position market leadership',
    ],
    'suppliers': [
        '{company} suppliers supply chain issues partnerships',
        '{company} key suppliers vendor relationships',
        '{company} strategic partnerships alliances',
    ],
    'innovation': [
        '{company} product roadmap innovation R&D',
        '{company} research development new products',
        '{company} patents technology innovation',
    ],
    'risks': [
        '{company} controversies lawsuits regulatory investigations',
        '{company} legal issues regulatory compliance',
        '{company} ethical concerns corporate governance',
    ],
}


def search_tavily(query: str, max_results: int = 5) -> List[Dict]:
    """Search Tavily API with a query and return results."""
    if not TAVILY_API_KEY:
        raise ValueError('TAVILY_API_KEY not found in environment variables')
    
    try:
        response = requests.post(
            TAVILY_API_URL,
            json={
                'api_key': TAVILY_API_KEY,
                'query': query,
                'search_depth': 'advanced',
                'max_results': max_results,
            },
            headers={'Content-Type': 'application/json'},
            timeout=30
        )
        response.raise_for_status()
        data = response.json()
        
        # Extract results
        results = data.get('results', [])
        answer = data.get('answer', '')
        
        # Format results
        formatted_results = []
        for result in results:
            formatted_results.append({
                'source_url': result.get('url', ''),
                'snippet': result.get('content', result.get('snippet', '')),
                'title': result.get('title', ''),
                'score': result.get('score', 0),
            })
        
        # If there's an answer, add it as a summary
        if answer:
            formatted_results.insert(0, {
                'source_url': '',
                'snippet': answer,
                'title': 'Tavily Summary',
                'score': 1.0,
            })
        
        return formatted_results
        
    except requests.exceptions.RequestException as e:
        print(f'Error searching Tavily for query "{query}": {e}', file=sys.stderr)
        return []


def aggregate_stakeholder_signals(company_name: str, ticker: Optional[str] = None, max_results_per_bucket: int = 5) -> Dict:
    """
    Aggregate Tavily searches by stakeholder groups.
    
    Args:
        company_name: Company name (e.g., "Apple Inc.")
        ticker: Optional stock ticker (e.g., "AAPL")
        max_results_per_bucket: Maximum results per stakeholder bucket
    
    Returns:
        Dictionary with signals organized by stakeholder type
    """
    signals = {
        'customers': [],
        'employees': [],
        'competitors': [],
        'suppliers': [],
        'innovation': [],
        'risks': [],
    }
    
    # Use ticker if available for more specific searches
    search_term = f'{company_name} ({ticker})' if ticker else company_name
    
    print(f'Aggregating stakeholder signals for {search_term}...', file=sys.stderr)
    
    for stakeholder_type, query_patterns in STAKEHOLDER_QUERIES.items():
        print(f'  Searching {stakeholder_type}...', file=sys.stderr)
        
        all_results = []
        for pattern in query_patterns:
            query = pattern.format(company=company_name)
            results = search_tavily(query, max_results=max_results_per_bucket)
            
            # Tag results with stakeholder type
            for result in results:
                result['stakeholder_type'] = stakeholder_type
                result['tags'] = [stakeholder_type]  # Can add more specific tags later
            
            all_results.extend(results)
        
        # Deduplicate by URL (keep first occurrence)
        seen_urls = set()
        unique_results = []
        for result in all_results:
            url = result.get('source_url', '')
            if url and url not in seen_urls:
                seen_urls.add(url)
                unique_results.append(result)
            elif not url:  # Keep summary entries (no URL)
                unique_results.append(result)
        
        # Limit to max_results_per_bucket
        signals[stakeholder_type] = unique_results[:max_results_per_bucket]
    
    return signals


def main():
    """Main entry point for CLI usage."""
    parser = argparse.ArgumentParser(description='Aggregate Tavily searches by stakeholder groups')
    parser.add_argument('company_name', help='Company name (e.g., "Apple Inc.")')
    parser.add_argument('--ticker', help='Stock ticker symbol (e.g., "AAPL")')
    parser.add_argument('--max-results', type=int, default=5, help='Max results per stakeholder bucket (default: 5)')
    parser.add_argument('--output', help='Output file path (default: stdout or .tmp/scuttlebutt_signals_<company>.json)')
    
    args = parser.parse_args()
    
    # Aggregate signals
    signals = aggregate_stakeholder_signals(
        company_name=args.company_name,
        ticker=args.ticker,
        max_results_per_bucket=args.max_results
    )
    
    # Prepare output
    output = {
        'company': args.company_name,
        'ticker': args.ticker,
        'inputs': {
            'company_name': args.company_name,
            'ticker': args.ticker,
        },
        'signals': signals,
    }
    
    # Output JSON
    output_json = json.dumps(output, indent=2)
    
    if args.output:
        os.makedirs(os.path.dirname(args.output) or '.', exist_ok=True)
        with open(args.output, 'w') as f:
            f.write(output_json)
        print(f'Signals written to {args.output}', file=sys.stderr)
    else:
        # Try .tmp directory, fallback to stdout
        company_safe = (args.ticker or args.company_name).replace(' ', '_').replace('/', '_')
        tmp_file = f'.tmp/scuttlebutt_signals_{company_safe}.json'
        try:
            os.makedirs('.tmp', exist_ok=True)
            with open(tmp_file, 'w') as f:
                f.write(output_json)
            print(f'Signals written to {tmp_file}', file=sys.stderr)
            print(output_json)  # Also print to stdout for piping
        except Exception as e:
            print(f'Warning: Could not write to {tmp_file}: {e}', file=sys.stderr)
            print(output_json)  # Print to stdout


if __name__ == '__main__':
    main()
