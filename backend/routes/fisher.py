"""
Fisher Research Routes

API routes for Fisher research using Scuttlebutt methodology.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import requests

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
    Get ROE from Yahoo Finance JSON API.
    Falls back to Yahoo Finance when FMP data is incorrect.
    """
    try:
        url = f'https://query1.finance.yahoo.com/v10/finance/quoteSummary/{symbol}'
        params = {'modules': 'keyStatistics,financialData'}
        headers = {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'application/json',
            'Accept-Language': 'en-US,en;q=0.9',
            'Accept-Encoding': 'gzip, deflate, br',
            'Referer': 'https://finance.yahoo.com/',
            'Origin': 'https://finance.yahoo.com',
            'Connection': 'keep-alive',
            'Sec-Fetch-Dest': 'empty',
            'Sec-Fetch-Mode': 'cors',
            'Sec-Fetch-Site': 'same-site'
        }
        
        response = requests.get(url, params=params, headers=headers, timeout=10)
        response.raise_for_status()
        data = response.json()
        
        # Extract ROE from keyStatistics
        quote_summary = data.get('quoteSummary', {})
        result = quote_summary.get('result', [])
        
        if not result:
            raise HTTPException(status_code=404, detail=f'No data found for symbol {symbol}')
        
        key_stats = result[0].get('keyStatistics', {})
        roe_data = key_stats.get('returnOnEquity', {})
        roe_raw = roe_data.get('raw')
        
        if roe_raw is None:
            # Try financialData as fallback
            financial_data = result[0].get('financialData', {})
            roe_data = financial_data.get('returnOnEquity', {})
            roe_raw = roe_data.get('raw')
        
        if roe_raw is not None:
            # Convert to percentage (Yahoo returns as decimal, e.g., 1.0736 = 107.36%)
            roe_percentage = roe_raw * 100
            return {'symbol': symbol, 'roe': roe_percentage}
        else:
            raise HTTPException(status_code=404, detail='ROE not found in Yahoo Finance data')
            
    except requests.exceptions.RequestException as e:
        raise HTTPException(status_code=500, detail=f'Failed to fetch ROE from Yahoo Finance: {str(e)}')
    except Exception as e:
        raise HTTPException(status_code=500, detail=f'Error processing Yahoo Finance data: {str(e)}')
