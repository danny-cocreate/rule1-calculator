"""
Simple Single-File FastAPI Backend for Fisher Research

This is a simplified version with everything in one file to avoid import issues.
Use this if the multi-file structure causes problems.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict
from datetime import datetime
import os
import sys
import json
import subprocess
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize FastAPI app
app = FastAPI(
    title='Fisher Research API',
    description='API for Fisher research using Scuttlebutt methodology',
    version='1.0.0'
)

# CORS configuration
cors_origins_env = os.getenv('CORS_ORIGINS', 'http://localhost:5173,http://localhost:3000,https://mos-calculator2.netlify.app')
cors_origins = [origin.strip() for origin in cors_origins_env.split(',')]
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)


# Request/Response Models
class FisherResearchRequest(BaseModel):
    symbol: str
    companyName: str
    criteriaToResearch: List[int]


class CriterionRating(BaseModel):
    criterionId: int
    rating: int
    justification: str
    keyFindings: List[str]
    sources: List[str]
    confidence: str


class FisherResearchResponse(BaseModel):
    symbol: str
    ratings: List[CriterionRating]
    researchDate: str
    modelUsed: str


# Helper function to run research
def run_research(company_name: str, ticker: Optional[str] = None, max_results: int = 5) -> Dict:
    """Run Scuttlebutt research using subprocess (simplest, most reliable)."""
    # Get project root (parent of backend)
    backend_dir = os.path.dirname(__file__)
    project_root = os.path.dirname(backend_dir)
    script_path = os.path.join(project_root, 'execution', 'run_scuttlebutt_company.py')
    
    cmd = [sys.executable, script_path, company_name]
    if ticker:
        cmd.extend(['--ticker', ticker])
    cmd.extend(['--max-results', str(max_results)])
    
    process = subprocess.run(
        cmd,
        capture_output=True,
        text=True,
        timeout=300,
        cwd=project_root  # Run from project root
    )
    
    if process.returncode != 0:
        raise Exception(f'Research failed: {process.stderr}')
    
    return json.loads(process.stdout)


# Routes
@app.get('/')
async def root():
    return {
        'message': 'Fisher Research API',
        'version': '1.0.0',
        'docs': '/docs'
    }


@app.get('/health')
async def health():
    return {'status': 'healthy'}


@app.post('/fisher-research', response_model=FisherResearchResponse)
async def research_fisher_criteria(request: FisherResearchRequest):
    """Research Fisher criteria for a company using Scuttlebutt methodology."""
    try:
        result = run_research(
            company_name=request.companyName,
            ticker=request.symbol,
            max_results=5
        )
        
        ratings = result.get('ratings', [])
        if request.criteriaToResearch:
            requested_ids = set(request.criteriaToResearch)
            ratings = [r for r in ratings if r.get('criterionId') in requested_ids]
        
        return FisherResearchResponse(
            symbol=result.get('symbol', request.symbol),
            ratings=[CriterionRating(**r) for r in ratings],
            researchDate=result.get('researchDate', datetime.now().isoformat()),
            modelUsed=result.get('modelUsed', 'openrouter-gpt-4o-mini'),
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == '__main__':
    import uvicorn
    host = os.getenv('HOST', '0.0.0.0')
    port = int(os.getenv('PORT', 8000))
    uvicorn.run('app_simple:app', host=host, port=port, reload=True)
