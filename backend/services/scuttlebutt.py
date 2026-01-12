"""
Scuttlebutt Service

Service layer that calls Python execution scripts for Scuttlebutt research.
"""

import os
import sys
import json
import subprocess
from typing import Dict, Optional
from datetime import datetime

# Add project root and execution directory to path
project_root = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
execution_dir = os.path.join(project_root, 'execution')
sys.path.insert(0, project_root)
sys.path.insert(0, execution_dir)

try:
    from execution.run_scuttlebutt_company import run_scuttlebutt_research
except ImportError:
    try:
        # Try direct import if execution is in path
        from run_scuttlebutt_company import run_scuttlebutt_research
    except ImportError:
        # Fallback: use subprocess if import fails
        run_scuttlebutt_research = None


def research_company(
    company_name: str,
    ticker: Optional[str] = None,
    max_results_per_bucket: int = 5
) -> Dict:
    """
    Run Scuttlebutt research for a company.
    
    Args:
        company_name: Company name (e.g., "Apple Inc.")
        ticker: Optional stock ticker (e.g., "AAPL")
        max_results_per_bucket: Maximum Tavily results per stakeholder bucket
    
    Returns:
        Complete research result dictionary with analysis mapped to Fisher's 15 criteria
    """
    try:
        # Try direct import first (faster)
        if run_scuttlebutt_research:
            result = run_scuttlebutt_research(
                company_name=company_name,
                ticker=ticker,
                max_results_per_bucket=max_results_per_bucket
            )
        else:
            # Fallback: use subprocess
            script_path = os.path.join(project_root, 'execution', 'run_scuttlebutt_company.py')
            cmd = [
                sys.executable,
                script_path,
                company_name,
            ]
            if ticker:
                cmd.extend(['--ticker', ticker])
            cmd.extend(['--max-results', str(max_results_per_bucket)])
            
            process = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                timeout=300  # 5 minute timeout
            )
            
            if process.returncode != 0:
                raise Exception(f'Script failed: {process.stderr}')
            
            # Parse JSON from stdout
            result = json.loads(process.stdout)
        
        # Map to API response format
        analysis = result.get('analysis', {})
        ratings = analysis.get('ratings', [])
        # OpenRouter returns ratings directly, Ollama returns in analysis
        if not ratings and 'ratings' in result:
            ratings = result['ratings']
        model_used = result.get('modelUsed', 'openrouter-gpt-4o-mini')
        
        # Format response to match GeminiResearchResponse structure
        return {
            'symbol': ticker or company_name,
            'ratings': ratings,
            'researchDate': datetime.now().isoformat(),
            'modelUsed': model_used,
        }
        
    except Exception as e:
        raise Exception(f'Scuttlebutt research failed: {str(e)}')
