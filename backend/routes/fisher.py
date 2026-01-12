"""
Fisher Research Routes

API routes for Fisher research using Scuttlebutt methodology.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import requests

from backend.services.scuttlebutt import research_company
from backend.services.sec_edgar import get_sec_roe

router = APIRouter(prefix='/fisher-research', tags=['fisher'])


class FisherResearchRequest(BaseModel):
    symbol: str
    companyName: str
    criteriaToResearch: List[int]  # IDs of criteria to research (for compatibility, but we research all)


class CriterionRating(BaseModel):
    criterionId: int
    rating: int  # 1-5
    justification: str
    keyFindings: List[str]
    sources: List[str]
    confidence: str  # 'high' | 'medium' | 'low'


class FisherResearchResponse(BaseModel):
    symbol: str
    ratings: List[CriterionRating]
    researchDate: str
    modelUsed: str


@router.post('', response_model=FisherResearchResponse)
async def research_fisher_criteria(request: FisherResearchRequest):
    """
    Research Fisher criteria for a company using Scuttlebutt methodology.
    
    Note: criteriaToResearch is accepted for compatibility but we research all 15 criteria.
    """
    try:
        # Run Scuttlebutt research
        result = research_company(
            company_name=request.companyName,
            ticker=request.symbol,
            max_results_per_bucket=5
        )
        
        # Filter ratings if specific criteria requested (for compatibility)
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


@router.get('/roe/{symbol}')
async def get_roe(symbol: str):
    """
    Get ROE from SEC EDGAR API.
    
    SEC EDGAR is the official, free, and reliable source for financial data.
    """
    try:
        print(f"Attempting to fetch ROE from SEC EDGAR for {symbol}...")
        roe = get_sec_roe(symbol)
        if roe is not None:
            print(f"✅ SEC EDGAR ROE: {roe:.2f}%")
            return {'symbol': symbol, 'roe': roe, 'source': 'sec'}
        else:
            raise HTTPException(
                status_code=404,
                detail=f'ROE not available from SEC EDGAR for {symbol}. The company may not have filed the required financial statements.'
            )
    except HTTPException:
        raise
    except Exception as e:
        print(f"SEC EDGAR failed: {e}")
        raise HTTPException(
            status_code=500,
            detail=f'Failed to fetch ROE from SEC EDGAR for {symbol}: {str(e)}'
        )


