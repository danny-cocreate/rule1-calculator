#!/usr/bin/env python3
"""
Ollama Scuttlebutt Analysis Script

Analyzes stakeholder signals using Ollama with Fisher's Scuttlebutt methodology.
Maps analysis back to Fisher's 15 criteria.
"""

import os
import sys
import json
import argparse
from typing import Dict, List, Optional
from dotenv import load_dotenv
import requests
import re

# Load environment variables
load_dotenv()

OLLAMA_BASE_URL = os.getenv('OLLAMA_BASE_URL', 'http://localhost:11434')
OLLAMA_MODEL = os.getenv('OLLAMA_MODEL', 'llama3.2')
OLLAMA_API_URL = f'{OLLAMA_BASE_URL}/api/chat'


def build_system_prompt() -> str:
    """Build system prompt encoding Fisher's Scuttlebutt methodology."""
    return """You are an equity analyst applying Philip Fisher's Scuttlebutt method.

You will receive web-derived "virtual scuttlebutt" about a company from customers, employees, competitors, suppliers, and industry observers.

Using this information only, analyze the company along these 15 dimensions (Fisher's criteria):

1. Products/Services with Market Potential
2. Management's Determination for Growth
3. R&D Effectiveness
4. Sales Organization
5. Profit Margin (qualitative assessment - no financial data provided)
6. Maintaining/Improving Profit Margins
7. Labor and Personnel Relations
8. Executive Relations
9. Management Depth
10. Cost Analysis and Accounting Controls
11. Industry-Specific Competitive Advantages
12. Long-Range Profit Outlook
13. Future Equity Financing
14. Management Communication
15. Management Integrity

For each criterion:
- Rating: 1-5 (1=Poor, 2=Below Average, 3=Average, 4=Good, 5=Excellent)
- Justification: 2-3 sentences explaining the rating
- Key Findings: 2-4 bullet points with specific evidence from the scuttlebutt
- Sources: List of URLs or information sources
- Confidence: high/medium/low based on data availability

Output ONLY valid JSON matching this exact structure:
{
  "ratings": [
    {
      "criterionId": 1,
      "rating": 4,
      "justification": "...",
      "keyFindings": ["..."],
      "sources": ["..."],
      "confidence": "high"
    }
  ]
}

Return ONLY the JSON object, no markdown, no code blocks, no explanation."""


def build_user_prompt(company_name: str, ticker: Optional[str], signals: Dict) -> str:
    """Build user prompt with stakeholder signals."""
    search_term = f'{company_name} ({ticker})' if ticker else company_name
    
    prompt_parts = [f'Company: {search_term}\n']
    
    for stakeholder_type, signal_list in signals.items():
        if signal_list:
            snippets = []
            sources = []
            for signal in signal_list:
                snippet = signal.get('snippet', '')
                url = signal.get('source_url', '')
                if snippet:
                    snippets.append(snippet)
                if url:
                    sources.append(url)
            
            if snippets:
                prompt_parts.append(f'{stakeholder_type.capitalize()}_signals:')
                prompt_parts.append('\n'.join(f'- {s}' for s in snippets[:10]))  # Limit snippets
                if sources:
                    prompt_parts.append(f'Sources: {", ".join(sources[:5])}')  # Limit sources
                prompt_parts.append('')
    
    return '\n'.join(prompt_parts)


def call_ollama(system_prompt: str, user_prompt: str) -> str:
    """Call Ollama API and return response."""
    try:
        response = requests.post(
            OLLAMA_API_URL,
            json={
                'model': OLLAMA_MODEL,
                'messages': [
                    {'role': 'system', 'content': system_prompt},
                    {'role': 'user', 'content': user_prompt}
                ],
                'stream': False,
                'format': 'json',
            },
            timeout=120  # Ollama can be slow
        )
        response.raise_for_status()
        data = response.json()
        
        # Extract message content
        message = data.get('message', {})
        content = message.get('content', '')
        
        return content
        
    except requests.exceptions.RequestException as e:
        raise Exception(f'Ollama API error: {e}')


def parse_ollama_response(response_text: str) -> List[Dict]:
    """Parse Ollama JSON response, with fallback JSON extraction."""
    # Try to parse as-is
    try:
        parsed = json.loads(response_text)
        if 'ratings' in parsed and isinstance(parsed['ratings'], list):
            return parsed['ratings']
    except json.JSONDecodeError:
        pass
    
    # Try to extract JSON from markdown code blocks
    json_match = re.search(r'```(?:json)?\s*(\{.*\})\s*```', response_text, re.DOTALL)
    if json_match:
        try:
            parsed = json.loads(json_match.group(1))
            if 'ratings' in parsed and isinstance(parsed['ratings'], list):
                return parsed['ratings']
        except json.JSONDecodeError:
            pass
    
    # Try to find JSON object in text
    json_match = re.search(r'\{[\s\S]*"ratings"[\s\S]*\}', response_text)
    if json_match:
        try:
            parsed = json.loads(json_match.group(0))
            if 'ratings' in parsed and isinstance(parsed['ratings'], list):
                return parsed['ratings']
        except json.JSONDecodeError:
            pass
    
    raise ValueError(f'Could not parse valid JSON from Ollama response: {response_text[:500]}')


def analyze_signals(signals: Dict, company_name: str, ticker: Optional[str] = None) -> Dict:
    """
    Analyze stakeholder signals using Ollama.
    
    Args:
        signals: Dictionary with signals organized by stakeholder type
        company_name: Company name
        ticker: Optional stock ticker
    
    Returns:
        Dictionary with analysis mapped to Fisher's 15 criteria
    """
    print(f'Analyzing signals for {company_name}...', file=sys.stderr)
    
    # Build prompts
    system_prompt = build_system_prompt()
    user_prompt = build_user_prompt(company_name, ticker, signals)
    
    # Call Ollama
    print(f'Calling Ollama ({OLLAMA_MODEL})...', file=sys.stderr)
    response_text = call_ollama(system_prompt, user_prompt)
    
    # Parse response
    print('Parsing Ollama response...', file=sys.stderr)
    ratings = parse_ollama_response(response_text)
    
    # Validate structure
    if not isinstance(ratings, list):
        raise ValueError('Invalid response: ratings must be a list')
    
    # Validate each rating has required fields
    for rating in ratings:
        required_fields = ['criterionId', 'rating', 'justification', 'keyFindings', 'sources', 'confidence']
        for field in required_fields:
            if field not in rating:
                raise ValueError(f'Invalid rating: missing field "{field}"')
    
    return {
        'ratings': ratings,
        'modelUsed': f'ollama-{OLLAMA_MODEL}',
    }


def main():
    """Main entry point for CLI usage."""
    parser = argparse.ArgumentParser(description='Analyze stakeholder signals with Ollama')
    parser.add_argument('signals_file', help='Path to signals JSON file (or - for stdin)')
    parser.add_argument('--company-name', help='Company name (if not in signals file)')
    parser.add_argument('--ticker', help='Stock ticker (if not in signals file)')
    parser.add_argument('--output', help='Output file path (default: stdout or .tmp/scuttlebutt_analysis_<company>.json)')
    
    args = parser.parse_args()
    
    # Read signals
    if args.signals_file == '-':
        signals_data = json.load(sys.stdin)
    else:
        with open(args.signals_file, 'r') as f:
            signals_data = json.load(f)
    
    company_name = args.company_name or signals_data.get('company', '')
    ticker = args.ticker or signals_data.get('ticker')
    signals = signals_data.get('signals', {})
    
    if not company_name:
        raise ValueError('Company name is required')
    
    # Analyze signals
    analysis = analyze_signals(signals, company_name, ticker)
    
    # Prepare output
    output = {
        'company': company_name,
        'ticker': ticker,
        'analysis': analysis,
        'researchDate': None,  # Will be set by orchestrator or API
        'modelUsed': f'ollama-{OLLAMA_MODEL}',
    }
    
    # Output JSON
    output_json = json.dumps(output, indent=2, default=str)
    
    if args.output:
        os.makedirs(os.path.dirname(args.output) or '.', exist_ok=True)
        with open(args.output, 'w') as f:
            f.write(output_json)
        print(f'Analysis written to {args.output}', file=sys.stderr)
    else:
        # Try .tmp directory, fallback to stdout
        company_safe = (ticker or company_name).replace(' ', '_').replace('/', '_')
        tmp_file = f'.tmp/scuttlebutt_analysis_{company_safe}.json'
        try:
            os.makedirs('.tmp', exist_ok=True)
            with open(tmp_file, 'w') as f:
                f.write(output_json)
            print(f'Analysis written to {tmp_file}', file=sys.stderr)
            print(output_json)  # Also print to stdout for piping
        except Exception as e:
            print(f'Warning: Could not write to {tmp_file}: {e}', file=sys.stderr)
            print(output_json)  # Print to stdout


if __name__ == '__main__':
    main()
