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
import re
from bs4 import BeautifulSoup

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
    Get ROE from Yahoo Finance key statistics page using BeautifulSoup.
    More reliable than JSON API which has strict rate limits.
    """
    max_retries = 3
    retry_delay = 2  # seconds
    
    for attempt in range(max_retries):
        try:
            # Scrape the key statistics page
            url = f'https://finance.yahoo.com/quote/{symbol}/key-statistics'
            
            headers = {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.9',
                'Accept-Encoding': 'gzip, deflate, br',
                'Referer': 'https://finance.yahoo.com/',
                'Connection': 'keep-alive',
            }
            
            response = requests.get(url, headers=headers, timeout=15)
            
            print(f"Yahoo Finance HTML response for {symbol}: Status {response.status_code} (attempt {attempt + 1}/{max_retries})")
            
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
                        detail='Yahoo Finance rate limit exceeded. Please try again in a few minutes.'
                    )
            
            # Handle other HTTP errors
            if response.status_code != 200:
                print(f"Yahoo Finance error: Status {response.status_code}")
                if response.status_code >= 500 and attempt < max_retries - 1:
                    wait_time = retry_delay * (attempt + 1)
                    print(f"Server error. Waiting {wait_time}s before retry...")
                    time.sleep(wait_time)
                    continue
                raise HTTPException(
                    status_code=500,
                    detail=f'Yahoo Finance error: {response.status_code}'
                )
            
            # Parse HTML
            soup = BeautifulSoup(response.text, 'lxml')
            
            # Find ROE - Yahoo Finance uses various structures
            # Method 1: Look for "Return on Equity" text in spans/divs
            roe_value = None
            
            # Try finding by text content
            roe_elements = soup.find_all(string=re.compile(r'Return on Equity', re.I))
            
            for roe_text in roe_elements:
                # Find the parent element
                parent = roe_text.find_parent()
                if parent:
                    # Look for the value in the same row/container
                    # Yahoo Finance often uses <td> or <span> with data-test attributes
                    row = parent.find_parent('tr') or parent.find_parent('div')
                    if row:
                        # Find value cell - usually next sibling or specific data-test attribute
                        value_cell = (
                            row.find('td', {'data-test': re.compile(r'fin-col|value', re.I)}) or
                            row.find('span', {'data-test': re.compile(r'fin-col|value', re.I)}) or
                            row.find_all('td')[1] if len(row.find_all('td')) > 1 else None
                        )
                        
                        if value_cell:
                            value_text = value_cell.get_text(strip=True)
                            # Extract percentage (e.g., "107.36%")
                            match = re.search(r'([\d,]+\.?\d*)%', value_text)
                            if match:
                                roe_value = float(match.group(1).replace(',', ''))
                                print(f"✅ Found ROE via text search: {roe_value}%")
                                break
            
            # Method 2: Search in all table cells for "Return on Equity"
            if roe_value is None:
                for cell in soup.find_all(['td', 'span', 'div']):
                    cell_text = cell.get_text(strip=True)
                    if 'Return on Equity' in cell_text or 'ROE' in cell_text:
                        # Get the value - could be in next sibling, parent's next child, or data attribute
                        parent = cell.find_parent()
                        if parent:
                            # Try to find value in same container
                            siblings = parent.find_all(['td', 'span', 'div'])
                            for sibling in siblings:
                                sibling_text = sibling.get_text(strip=True)
                                # Check if this looks like a percentage value
                                if re.match(r'^[\d,]+\.?\d*%$', sibling_text):
                                    match = re.search(r'([\d,]+\.?\d*)%', sibling_text)
                                    if match:
                                        roe_value = float(match.group(1).replace(',', ''))
                                        print(f"✅ Found ROE via sibling search: {roe_value}%")
                                        break
                        if roe_value:
                            break
            
            # Method 3: Look for data-reactid or specific Yahoo Finance attributes
            if roe_value is None:
                # Yahoo Finance sometimes uses specific data attributes
                for element in soup.find_all(attrs={'data-test': True}):
                    text = element.get_text(strip=True)
                    if 'Return on Equity' in text or ('ROE' in text and '%' in text):
                        # Try to find the value nearby
                        parent = element.find_parent()
                        if parent:
                            value_elem = parent.find(string=re.compile(r'[\d,]+\.?\d*%'))
                            if value_elem:
                                match = re.search(r'([\d,]+\.?\d*)%', value_elem)
                                if match:
                                    roe_value = float(match.group(1).replace(',', ''))
                                    print(f"✅ Found ROE via data attribute: {roe_value}%")
                                    break
            
            if roe_value is not None:
                return {'symbol': symbol, 'roe': roe_value}
            else:
                # Log for debugging
                print(f"⚠️ ROE not found. Page title: {soup.title.string if soup.title else 'N/A'}")
                raise HTTPException(status_code=404, detail=f'ROE not found on Yahoo Finance page for {symbol}')
                
        except HTTPException:
            raise
        except requests.exceptions.Timeout:
            if attempt < max_retries - 1:
                time.sleep(retry_delay)
                continue
            raise HTTPException(status_code=504, detail='Yahoo Finance request timeout')
        except requests.exceptions.RequestException as e:
            if attempt < max_retries - 1:
                time.sleep(retry_delay)
                continue
            raise HTTPException(status_code=500, detail=f'Network error: {str(e)}')
        except Exception as e:
            print(f"Error parsing HTML: {str(e)}")
            if attempt < max_retries - 1:
                time.sleep(retry_delay)
                continue
            raise HTTPException(status_code=500, detail=f'Error scraping ROE: {str(e)}')
    
    raise HTTPException(status_code=500, detail='Failed to fetch ROE after retries')
