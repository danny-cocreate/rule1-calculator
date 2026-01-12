"""
Fisher Research Routes

API routes for Fisher research using Scuttlebutt methodology.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import requests
import yfinance as yf

from services.scuttlebutt import research_company

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


@router.get('/yahoo-roe/{symbol}')
async def get_yahoo_roe(symbol: str):
    """
    Get ROE from Yahoo Finance using yfinance library.
    Falls back to Yahoo Finance when FMP data is incorrect.
    """
    try:
        # Use yfinance library which handles headers, cookies, and rate limiting automatically
        ticker = yf.Ticker(symbol)
        info = ticker.info
        
        # Try multiple field names for ROE
        roe_raw = (
            info.get('returnOnEquity') or
            info.get('roe') or
            info.get('returnOnEquityTTM')
        )
        
        if roe_raw is not None:
            # yfinance returns ROE as a decimal (e.g., 1.0736 = 107.36%)
            # Convert to percentage
            roe_percentage = roe_raw * 100
            return {'symbol': symbol, 'roe': roe_percentage}
        else:
            raise HTTPException(status_code=404, detail=f'ROE not found for symbol {symbol}')
            
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f'Error fetching ROE from Yahoo Finance: {str(e)}')
