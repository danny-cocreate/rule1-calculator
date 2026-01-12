#!/usr/bin/env python3
"""
OpenRouter Scuttlebutt Analysis

Replaces Ollama with OpenRouter API for Fisher criteria analysis.
No VPS needed - OpenRouter is a hosted service!
"""

import os
import json
import sys
import requests
from typing import Dict, List, Any

# OpenRouter API configuration
OPENROUTER_API_KEY = os.getenv('OPENROUTER_API_KEY')
OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions'
OPENROUTER_MODEL = os.getenv('OPENROUTER_MODEL', 'openai/gpt-4o-mini')  # Cheap and good

def analyze_signals_with_openrouter(signals_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Analyze stakeholder signals using OpenRouter API.
    
    Args:
        signals_data: Dictionary with stakeholder signals from Tavily
    
    Returns:
        Dictionary with Fisher criteria ratings (compatible with Ollama format)
    """
    if not OPENROUTER_API_KEY:
        raise ValueError('OPENROUTER_API_KEY environment variable not set. Please set it in your environment variables.')
    
    # Build prompt from signals
    prompt = build_analysis_prompt(signals_data)
    
    # Call OpenRouter API
    response = call_openrouter(prompt)
    
    # Parse response
    ratings = parse_openrouter_response(response, signals_data)
    
    return {
        'ratings': ratings,
        'modelUsed': f'openrouter-{OPENROUTER_MODEL}',
        'researchDate': signals_data.get('researchDate'),
    }


def build_analysis_prompt(signals_data: Dict[str, Any]) -> str:
    """Build analysis prompt from signals data."""
    # Extract stakeholder signals
    signals_text = json.dumps(signals_data.get('signals', {}), indent=2)
    
    prompt = f"""You are a professional investment analyst using Philip Fisher's "Scuttlebutt" methodology.

Analyze the following stakeholder signals for {signals_data.get('companyName', 'the company')} ({signals_data.get('ticker', 'N/A')}):

{signals_text}

Based on this information, evaluate the company against Philip Fisher's 15-Point Investment Criteria. For each criterion, provide:
1. Rating (1-5 scale)
2. Justification (2-3 sentences)
3. Key findings (bullet points)
4. Confidence level (high/medium/low)

Return your analysis as a JSON object with this structure:
{{
  "ratings": [
    {{
      "criterionId": 1,
      "rating": 4,
      "justification": "...",
      "keyFindings": ["...", "..."],
      "sources": ["..."],
      "confidence": "high"
    }},
    ...
  ]
}}

Focus on criteria 2, 3, 4, 6, 7, 8, 9, 11, 12, 13, 14, 15 (qualitative criteria).
Be thorough and objective in your analysis."""
    
    return prompt


def call_openrouter(prompt: str) -> Dict[str, Any]:
    """Call OpenRouter API."""
    headers = {
        'Authorization': f'Bearer {OPENROUTER_API_KEY}',
        'Content-Type': 'application/json',
    }
    
    payload = {
        'model': OPENROUTER_MODEL,
        'messages': [
            {
                'role': 'user',
                'content': prompt
            }
        ],
        'response_format': {'type': 'json_object'},
        'temperature': 0.7,
    }
    
    try:
        response = requests.post(
            OPENROUTER_API_URL,
            headers=headers,
            json=payload,
            timeout=120  # 2 minute timeout
        )
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        raise Exception(f'OpenRouter API error: {e}')


def parse_openrouter_response(response: Dict[str, Any], signals_data: Dict[str, Any]) -> List[Dict[str, Any]]:
    """Parse OpenRouter API response."""
    try:
        # OpenRouter returns: choices[0].message.content
        content = response['choices'][0]['message']['content']
        
        # Parse JSON from content
        result = json.loads(content)
        
        # Extract ratings
        ratings = result.get('ratings', [])
        
        # Add sources from signals
        for rating in ratings:
            if 'sources' not in rating:
                rating['sources'] = []
            # Add signal sources
            rating['sources'].extend(extract_sources_from_signals(signals_data))
        
        return ratings
    except (KeyError, json.JSONDecodeError) as e:
        raise Exception(f'Failed to parse OpenRouter response: {e}')


def extract_sources_from_signals(signals_data: Dict[str, Any]) -> List[str]:
    """Extract source URLs from signals data."""
    sources = []
    signals = signals_data.get('signals', {})
    
    for stakeholder_group, items in signals.items():
        if isinstance(items, list):
            for item in items:
                if isinstance(item, dict) and 'url' in item:
                    sources.append(item['url'])
    
    return sources[:10]  # Limit to 10 sources


if __name__ == '__main__':
    # Test with sample data
    if len(sys.argv) > 1:
        signals_file = sys.argv[1]
        with open(signals_file, 'r') as f:
            signals_data = json.load(f)
        
        result = analyze_signals_with_openrouter(signals_data)
        print(json.dumps(result, indent=2))
    else:
        print('Usage: python openrouter_scuttlebutt_analysis.py <signals_file.json>')
