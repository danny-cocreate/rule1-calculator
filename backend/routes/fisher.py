"""
Fisher Research Routes

API routes for Fisher research using Scuttlebutt methodology.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import requests
import time

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
    Get ROE from Yahoo Finance JSON API directly.
    Falls back to Yahoo Finance when FMP data is incorrect.
    """
    max_retries = 3
    retry_delay = 2  # seconds
    initial_delay = 1  # seconds - small delay before first request to avoid immediate rate limits
    
    # Small initial delay to avoid hitting rate limits immediately
    if max_retries > 0:
        time.sleep(initial_delay)
    
    for attempt in range(max_retries):
        try:
            # Use the same endpoint that yfinance uses
            url = f'https://query1.finance.yahoo.com/v10/finance/quoteSummary/{symbol}'
            params = {'modules': 'keyStatistics,financialData'}
            
            # Comprehensive browser headers to avoid 401/403
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
            
            # Log response for debugging
            print(f"Yahoo Finance API response for {symbol}: Status {response.status_code} (attempt {attempt + 1}/{max_retries})")
            
            # Handle rate limiting with retry
            if response.status_code == 429:
                wait_time = retry_delay * (attempt + 1)  # Exponential backoff
                print(f"Yahoo Finance rate limited (429). Waiting {wait_time}s before retry...")
                if attempt < max_retries - 1:
                    time.sleep(wait_time)
                    continue
                else:
                    print(f"Yahoo Finance rate limit exceeded after {max_retries} attempts")
                    raise HTTPException(
                        status_code=503, 
                        detail=f'Yahoo Finance rate limit exceeded. Please try again in a few minutes.'
                    )
            
            # Handle auth errors
            if response.status_code == 401 or response.status_code == 403:
                print(f"Yahoo Finance API access denied: {response.status_code}")
                raise HTTPException(
                    status_code=500,
                    detail=f'Yahoo Finance API access denied. Status: {response.status_code}'
                )
            
            # Handle other errors
            if response.status_code != 200:
                print(f"Yahoo Finance API error: Status {response.status_code}, Response: {response.text[:200]}")
                # For 5xx errors, retry
                if response.status_code >= 500 and attempt < max_retries - 1:
                    wait_time = retry_delay * (attempt + 1)
                    print(f"Yahoo Finance server error. Waiting {wait_time}s before retry...")
                    time.sleep(wait_time)
                    continue
                raise HTTPException(
                    status_code=500,
                    detail=f'Yahoo Finance API error. Status: {response.status_code}'
                )
            
            data = response.json()
            
            # Extract ROE from keyStatistics
            quote_summary = data.get('quoteSummary', {})
            result = quote_summary.get('result', [])
            
            if not result:
                raise HTTPException(status_code=404, detail=f'No data found for symbol {symbol}')
            
            key_stats = result[0].get('keyStatistics', {})
            financial_data = result[0].get('financialData', {})
            
            # Try keyStatistics first
            roe_data = key_stats.get('returnOnEquity', {})
            roe_raw = roe_data.get('raw')
            
            # Fallback to financialData
            if roe_raw is None:
                roe_data = financial_data.get('returnOnEquity', {})
                roe_raw = roe_data.get('raw')
            
            if roe_raw is not None:
                # Convert to percentage (Yahoo returns as decimal, e.g., 1.0736 = 107.36%)
                roe_percentage = roe_raw * 100
                return {'symbol': symbol, 'roe': roe_percentage}
            else:
                raise HTTPException(status_code=404, detail=f'ROE not found for symbol {symbol}')
                
        except HTTPException:
            raise
        except requests.exceptions.Timeout:
            if attempt < max_retries - 1:
                time.sleep(retry_delay)
                continue
            raise HTTPException(status_code=504, detail='Yahoo Finance API timeout')
        except requests.exceptions.RequestException as e:
            if attempt < max_retries - 1:
                time.sleep(retry_delay)
                continue
            raise HTTPException(status_code=500, detail=f'Network error: {str(e)}')
        except Exception as e:
            raise HTTPException(status_code=500, detail=f'Error fetching ROE: {str(e)}')
    
    # Should never reach here, but just in case
    raise HTTPException(status_code=500, detail='Failed to fetch ROE after retries')
