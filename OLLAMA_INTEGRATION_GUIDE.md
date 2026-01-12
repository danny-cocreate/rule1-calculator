# Ollama Integration Guide for Fisher Analysis

## Overview

This guide explains how to replace Gemini AI with Ollama (running on your VPS) for Fisher qualitative criteria research, including web browsing capability.

---

## Recommended Solutions for Web Browsing

### Option 1: Tavily API + Ollama (RECOMMENDED) ⭐

**Best for:** Simple, reliable web research integration

**How it works:**
1. Tavily API provides web search/research capability
2. Your frontend calls your VPS endpoint (n8n or custom API)
3. n8n workflow searches Tavily, then sends results to Ollama
4. Ollama analyzes the research and returns Fisher ratings

**Advantages:**
- ✅ Tavily is designed for LLMs (structured data, citations)
- ✅ Free tier: 1,000 searches/month
- ✅ Fast and reliable
- ✅ Works great with Ollama function calling
- ✅ No complex browser automation needed

**Setup Steps:**

1. **Get Tavily API Key:**
   - Sign up: https://tavily.com
   - Free tier: 1,000 searches/month
   - Get API key from dashboard

2. **Create n8n Workflow:**
   ```
   Trigger: Webhook (POST /ollama-fisher-research)
   ↓
   HTTP Request: Tavily Search API
   - Query: "AAPL management determination growth strategy"
   - Returns: Structured search results with citations
   ↓
   HTTP Request: Ollama API (your VPS)
   - Model: llama3.2, mistral, or similar
   - Prompt: Research findings + Fisher criteria
   - Returns: JSON with ratings
   ↓
   Respond: Return structured Fisher ratings
   ```

3. **Integration in Your App:**
   - Point `geminiService.ts` to your n8n webhook URL
   - Same interface, different backend

---

### Option 2: n8n Browser Automation + Ollama

**Best for:** Direct web scraping when you need full page content

**How it works:**
1. n8n uses Playwright/Puppeteer to scrape websites
2. Searches Google/company websites for Fisher criteria
3. Extracts and formats relevant content
4. Sends to Ollama for analysis

**Advantages:**
- ✅ Full control over what to scrape
- ✅ Can access any website
- ✅ Good for specific company sites

**Disadvantages:**
- ⚠️ More complex to set up
- ⚠️ Slower than Tavily
- ⚠️ May hit rate limits or be blocked

**Setup Steps:**

1. **Install Playwright in n8n:**
   ```bash
   # On your VPS
   npm install -g playwright
   playwright install chromium
   ```

2. **Create n8n Workflow:**
   ```
   Trigger: Webhook
   ↓
   Google Search (or direct URLs)
   ↓
   Browser Automation: Playwright
   - Navigate to search results
   - Extract page content
   - Follow links to company sites
   ↓
   Text Processing: Extract relevant sections
   ↓
   HTTP Request: Ollama API
   - Send scraped content + Fisher criteria
   ↓
   Respond: Return Fisher ratings
   ```

---

### Option 3: Ollama Function Calling + Tavily

**Best for:** Letting Ollama decide what to search

**How it works:**
1. Configure Ollama with function calling
2. Define Tavily search as a function
3. Ollama calls Tavily when it needs information
4. All orchestration happens in Ollama

**Advantages:**
- ✅ Very clean integration
- ✅ Ollama decides what to research
- ✅ Self-contained

**Disadvantages:**
- ⚠️ Requires Ollama with function calling support
- ⚠️ More complex setup

**Setup Steps:**

1. **Create Tavily Function Wrapper:**
   ```python
   # wrapper.py on your VPS
   from tavily import TavilyClient
   import json
   
   tavily = TavilyClient(api_key="your_key")
   
   def search_web(query: str) -> str:
       results = tavily.search(query, max_results=5)
       return json.dumps(results)
   ```

2. **Configure Ollama with Function:**
   ```json
   {
     "functions": [
       {
         "name": "search_web",
         "description": "Search the web for information",
         "parameters": {
           "type": "object",
           "properties": {
             "query": {"type": "string"}
           }
         }
       }
     ]
   }
   ```

3. **Call from Frontend:**
   - Same as Option 1, but Ollama orchestrates searches internally

---

## Recommended Setup: Option 1 (Tavily + n8n + Ollama)

### Architecture

```
Frontend (React App)
  ↓ HTTP POST
n8n Webhook (your-vps.com/webhook/fisher-research)
  ↓
n8n HTTP Request → Tavily API (web search)
  ↓ Research Results
n8n HTTP Request → Ollama API (your-vps.com:11434)
  ↓ Analysis
n8n Response → Frontend
```

### Step-by-Step Implementation

#### 1. Set Up Tavily API

```bash
# Get API key from https://tavily.com
# No installation needed - REST API
```

#### 2. Create n8n Workflow

**Workflow Structure:**

1. **Webhook Trigger:**
   - Method: POST
   - Path: `/fisher-research`
   - Accept: JSON body with `{symbol, companyName, criteriaToResearch: [2,3,4,...]}`

2. **Function Node (Prepare Queries):**
   ```javascript
   // Create search queries for each criterion
   const criteria = {
     2: "management determination growth strategy",
     3: "R&D research development effectiveness",
     4: "sales organization strength",
     // ... etc
   };
   
   const queries = $input.item.json.criteriaToResearch.map(id => ({
     criterionId: id,
     query: `${$input.item.json.companyName} ${criteria[id]}`
   }));
   
   return queries.map(q => ({ json: q }));
   ```

3. **HTTP Request: Tavily Search** (Loop over queries)
   ```javascript
   // For each query
   POST https://api.tavily.com/search
   {
     "api_key": "your_tavily_key",
     "query": "{{ $json.query }}",
     "search_depth": "advanced",
     "max_results": 5
   }
   ```

4. **Code Node: Format Research Data**
   ```javascript
   // Combine all search results
   const research = {
     symbol: $('Webhook').item.json.symbol,
     criteria: /* combine Tavily results */
   };
   ```

5. **HTTP Request: Ollama**
   ```javascript
   POST http://localhost:11434/api/generate
   {
     "model": "llama3.2",
     "prompt": `Research ${companyName} (${symbol}) for Fisher criteria:\n${research}\n\nReturn JSON with ratings...`,
     "stream": false,
     "format": "json"
   }
   ```

6. **Function Node: Parse Ollama Response**
   ```javascript
   // Parse JSON from Ollama
   // Validate structure
   // Return in Gemini format
   ```

7. **Respond to Webhook:**
   ```javascript
   return {
     symbol: "...",
     ratings: [...],
     researchDate: new Date()
   };
   ```

#### 3. Update Frontend Service

Replace `src/services/geminiService.ts` with `ollamaService.ts`:

```typescript
const OLLAMA_WEBHOOK_URL = import.meta.env.VITE_OLLAMA_WEBHOOK_URL || 'http://your-vps.com/webhook/fisher-research';

export const researchFisherCriteria = async (
  request: GeminiResearchRequest
): Promise<GeminiResearchResponse> => {
  const response = await axios.post(OLLAMA_WEBHOOK_URL, {
    symbol: request.symbol,
    companyName: request.companyName,
    criteriaToResearch: request.criteriaToResearch
  });
  
  return response.data;
};
```

#### 4. Environment Variables

```env
VITE_OLLAMA_WEBHOOK_URL=http://your-vps.com/webhook/fisher-research
# Or if using n8n cloud webhook:
VITE_OLLAMA_WEBHOOK_URL=https://your-n8n-instance.com/webhook/fisher-research
```

---

## Comparison of Options

| Feature | Tavily + Ollama | Browser Automation | Function Calling |
|---------|----------------|-------------------|------------------|
| **Setup Complexity** | ⭐⭐⭐ Easy | ⭐⭐ Medium | ⭐ Hard |
| **Speed** | ⭐⭐⭐ Fast | ⭐⭐ Medium | ⭐⭐⭐ Fast |
| **Reliability** | ⭐⭐⭐ High | ⭐⭐ Medium | ⭐⭐⭐ High |
| **Cost** | Free tier available | Free | Free |
| **Maintenance** | Low | Medium | Low |
| **Best For** | Most use cases | Specific scraping | Advanced setups |

---

## Recommendation: Use Option 1 (Tavily + n8n + Ollama)

**Why:**
1. ✅ Simplest to implement
2. ✅ Reliable and fast
3. ✅ Free tier sufficient for testing
4. ✅ Works great with n8n
5. ✅ Easy to maintain

**Next Steps:**
1. Sign up for Tavily (free tier)
2. Create the n8n workflow as described
3. Test with a single stock symbol
4. Replace `geminiService.ts` with `ollamaService.ts`
5. Update environment variables

---

## Alternative: Direct Ollama + Custom Scraper

If you prefer a simpler setup without n8n:

**Python FastAPI Service on VPS:**
```python
from fastapi import FastAPI
import requests
from ollama import Client

app = FastAPI()
ollama = Client(host='http://localhost:11434')

@app.post("/fisher-research")
async def research(symbol: str, company_name: str, criteria: list):
    # 1. Search Tavily
    tavily_results = search_tavily(company_name, criteria)
    
    # 2. Send to Ollama
    prompt = build_fisher_prompt(symbol, company_name, criteria, tavily_results)
    response = ollama.generate(model='llama3.2', prompt=prompt)
    
    # 3. Parse and return
    return parse_fisher_response(response)
```

Point your frontend to this endpoint instead of n8n.

---

## Questions?

- **Tavily Docs:** https://docs.tavily.com
- **Ollama API:** https://github.com/ollama/ollama/blob/main/docs/api.md
- **n8n Docs:** https://docs.n8n.io
