#!/usr/bin/env python3
"""
Scuttlebutt Company Research Orchestrator

Top-level orchestrator that ties together Tavily + OpenRouter scripts.
"""

import os
import sys
import json
import argparse
from datetime import datetime
from typing import Optional

# Add execution directory to path for imports
execution_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, execution_dir)

from tavily_scuttlebutt import aggregate_stakeholder_signals

# Use OpenRouter instead of Ollama (no VPS needed!)
try:
    from openrouter_scuttlebutt_analysis import analyze_signals_with_openrouter
    USE_OPENROUTER = True
except ImportError:
    # Fallback to Ollama if OpenRouter not available
    from ollama_scuttlebutt_analysis import analyze_signals
    USE_OPENROUTER = False


def run_scuttlebutt_research(
    company_name: str,
    ticker: Optional[str] = None,
    max_results_per_bucket: int = 5,
    output_dir: str = '.tmp'
) -> dict:
    """
    Run complete Scuttlebutt research for a company.
    
    Args:
        company_name: Company name (e.g., "Apple Inc.")
        ticker: Optional stock ticker (e.g., "AAPL")
        max_results_per_bucket: Maximum Tavily results per stakeholder bucket
        output_dir: Directory for temporary files
    
    Returns:
        Complete research result dictionary
    """
    # Step 1: Aggregate Tavily signals
    print(f'Step 1: Aggregating Tavily signals for {company_name}...', file=sys.stderr)
    signals = aggregate_stakeholder_signals(
        company_name=company_name,
        ticker=ticker,
        max_results_per_bucket=max_results_per_bucket
    )
    
    # Prepare signals data structure
    signals_data = {
        'company': company_name,
        'ticker': ticker,
        'inputs': {
            'company_name': company_name,
            'ticker': ticker,
        },
        'signals': signals,
    }
    
    # Step 2: Analyze signals with OpenRouter (or Ollama fallback)
    if USE_OPENROUTER:
        print(f'Step 2: Analyzing signals with OpenRouter...', file=sys.stderr)
        signals_data = {
            'signals': signals,
            'companyName': company_name,
            'ticker': ticker,
            'researchDate': datetime.now().isoformat()
        }
        analysis_result = analyze_signals_with_openrouter(signals_data)
    else:
        print(f'Step 2: Analyzing signals with Ollama...', file=sys.stderr)
        analysis_result = analyze_signals(
            signals=signals,
            company_name=company_name,
            ticker=ticker
        )
    
    # Step 3: Combine results
    model_used = analysis_result.get('modelUsed', 'openrouter-gpt-4o-mini' if USE_OPENROUTER else 'ollama-llama3.2')
    result = {
        'company': company_name,
        'ticker': ticker,
        'inputs': signals_data['inputs'],
        'signals': signals,
        'analysis': analysis_result,
        'researchDate': datetime.now().isoformat(),
        'modelUsed': model_used,
    }
    
    return result


def main():
    """Main entry point for CLI usage."""
    parser = argparse.ArgumentParser(description='Run Scuttlebutt research for a company')
    parser.add_argument('company_name', help='Company name (e.g., "Apple Inc.")')
    parser.add_argument('--ticker', help='Stock ticker symbol (e.g., "AAPL")')
    parser.add_argument('--max-results', type=int, default=5, help='Max results per stakeholder bucket (default: 5)')
    parser.add_argument('--output', help='Output file path (default: stdout or .tmp/scuttlebutt_<company>.json)')
    parser.add_argument('--out-format', choices=['json', 'markdown'], default='json', help='Output format (default: json)')
    
    args = parser.parse_args()
    
    try:
        # Run research
        result = run_scuttlebutt_research(
            company_name=args.company_name,
            ticker=args.ticker,
            max_results_per_bucket=args.max_results
        )
        
        # Format output
        if args.out_format == 'json':
            output_json = json.dumps(result, indent=2, default=str)
            
            if args.output:
                os.makedirs(os.path.dirname(args.output) or '.', exist_ok=True)
                with open(args.output, 'w') as f:
                    f.write(output_json)
                print(f'Research written to {args.output}', file=sys.stderr)
            else:
                # Try .tmp directory, fallback to stdout
                company_safe = (args.ticker or args.company_name).replace(' ', '_').replace('/', '_')
                tmp_file = f'.tmp/scuttlebutt_{company_safe}.json'
                try:
                    os.makedirs('.tmp', exist_ok=True)
                    with open(tmp_file, 'w') as f:
                        f.write(output_json)
                    print(f'Research written to {tmp_file}', file=sys.stderr)
                    print(output_json)  # Also print to stdout for piping
                except Exception as e:
                    print(f'Warning: Could not write to {tmp_file}: {e}', file=sys.stderr)
                    print(output_json)  # Print to stdout
        else:
            # Markdown format (basic implementation)
            print('Markdown format not yet implemented', file=sys.stderr)
            sys.exit(1)
        
    except Exception as e:
        print(f'Error: {e}', file=sys.stderr)
        sys.exit(1)


if __name__ == '__main__':
    main()
