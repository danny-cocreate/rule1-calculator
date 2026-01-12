# n8n Workflow Fix Instructions - Tavily + Ollama

## Current Workflow

**Workflow ID:** `AQ0CNKyDPJUPFlWA`  
**URL:** https://n8n.srv999305.hstgr.cloud/

## Configuration Status

✅ **Tavily API Key:** `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`  
✅ **Ollama URL:** `http://host.docker.internal:11434`  
✅ **Ollama Model:** `llama3.2`

## Data Flow Issue

**Problem:**  
The "Format Research Data" function needs to collect ALL Tavily search results, but HTTP Request nodes in n8n process items sequentially. We need to ensure all results are collected before formatting.

## Solution: Fix "Format Research Data" Function

The function needs to:
1. Collect all items from Tavily Search (using `$input.all()`)
2. Extract Tavily response data (may be in `item.json.body` or `item.json`)
3. Preserve original query metadata (criterionId, symbol, companyName, allCriteria)
4. Map Tavily results back to criteria
5. Build comprehensive prompt for Ollama

## Updated Function Code

Open the "Format Research Data" function node and replace with this code:

```javascript
// Collect all Tavily results
const allItems = $input.all();

// Get original metadata from first item
// In n8n HTTP Request, original data might be preserved or in item.binary
const firstItem = allItems[0];
let symbol, companyName, allCriteria;

// Try to get metadata - HTTP Request may preserve it or we need to pass it differently
if (firstItem.json.symbol) {
  symbol = firstItem.json.symbol;
  companyName = firstItem.json.companyName;
  allCriteria = firstItem.json.allCriteria;
} else {
  // If not preserved, we need to get from webhook - this shouldn't happen if structure is right
  symbol = 'UNKNOWN';
  companyName = 'UNKNOWN';
  allCriteria = [];
}

// Map Tavily results back to criteria
const researchData = {};

allItems.forEach(item => {
  // Tavily response structure depends on HTTP Request node settings
  // Try different locations where response might be
  const tavilyResponse = item.json.body || item.json.response || item.json;
  
  // Get criterionId from original query data (should be preserved)
  const criterionId = item.json.criterionId;
  
  if (criterionId && tavilyResponse) {
    researchData[criterionId] = {
      query: item.json.query || '',
      results: tavilyResponse.results || tavilyResponse.data?.results || [],
      answer: tavilyResponse.answer || tavilyResponse.data?.answer || ''
    };
  }
  
  // Also try to get metadata if we don't have it yet
  if (!symbol && item.json.symbol) {
    symbol = item.json.symbol;
    companyName = item.json.companyName;
    allCriteria = item.json.allCriteria;
  }
});

// Fisher criteria details
const criteriaDetails = {
  2: { title: "Management's Determination for Growth", description: "Does the management have a determination to continue to develop products or processes?" },
  3: { title: 'R&D Effectiveness', description: "How effective are the company's research and development efforts?" },
  4: { title: 'Sales Organization', description: 'Does the company have an above-average sales organization?' },
  6: { title: 'Maintaining/Improving Profit Margins', description: 'What is the company doing to maintain or improve profit margins?' },
  7: { title: 'Labor and Personnel Relations', description: 'Does the company have outstanding labor and personnel relations?' },
  8: { title: 'Executive Relations', description: 'Does the company have outstanding executive relations?' },
  9: { title: 'Management Depth', description: 'Does the company have depth to its management?' },
  10: { title: 'Cost Analysis and Accounting Controls', description: "How good are the company's cost analysis and accounting controls?" },
  11: { title: 'Industry-Specific Competitive Advantages', description: 'Are there other aspects of the business that give important clues?' },
  12: { title: 'Long-Range Profit Outlook', description: 'Does the company have a short-range or long-range outlook in regard to profits?' },
  13: { title: 'Equity Financing', description: 'What about the outstanding equity financing?' },
  14: { title: 'Management Communication', description: 'Is the management reasonably accessible?' },
  15: { title: 'Integrity', description: 'Are there any red flags regarding integrity?' }
};

// Build prompt for Ollama
const criteriaPrompts = allCriteria.map(id => {
  const detail = criteriaDetails[id];
  const research = researchData[id] || { results: [], answer: '' };
  const researchText = research.answer || research.results.map(r => (r.content || r.snippet || '')).join('\n');
  const sources = research.results.map(r => r.url || '').filter(url => url).join(', ');
  
  return `
${id}. **${detail.title}**
   Question: ${detail.description}
   Research: ${researchText}
   Sources: ${sources}
   
   Provide:
   - Rating: 1-5 (1=Poor, 2=Below Average, 3=Average, 4=Good, 5=Excellent)
   - Justification: 2-3 sentences
   - Key Findings: 2-4 bullet points
   - Sources: List of URLs
   - Confidence: high/medium/low
`;
}).join('\n---\n');

const prompt = `You are a professional investment analyst researching ${companyName} (${symbol}) using Philip Fisher's methodology.

Research the following investment criteria and provide STRUCTURED, DATA-DRIVEN analysis:
${criteriaPrompts}

OUTPUT FORMAT (JSON only, no markdown):
{
  "ratings": [
    {
      "criterionId": 2,
      "rating": 4,
      "justification": "Management shows strong determination...",
      "keyFindings": ["CEO has 10+ years tenure", "Launched 3 new products"],
      "sources": ["https://example.com/report"],
      "confidence": "high"
    }
  ]
}

Return ONLY valid JSON.`;

return [{ json: { symbol, companyName, prompt, allCriteria } }];
```

## Alternative: Use Set Node (If Function Doesn't Work)

If the function approach doesn't work, use a "Set" node:

1. **Add Set Node** after "Prepare Search Queries"
   - Store: `symbol`, `companyName`, `allCriteria` in separate fields
   
2. **Add Set Node** after "Tavily Search"  
   - Map Tavily response to `tavilyResults`
   - Preserve original query data

3. **Update Format Research Data**
   - Use data from Set nodes

## Testing Steps

1. Open workflow in n8n UI
2. Update "Format Research Data" function with code above
3. Test with sample data:
   ```json
   {
     "symbol": "AAPL",
     "companyName": "Apple Inc.",
     "criteriaToResearch": [2, 3, 4]
   }
   ```
4. Check execution logs to see data flow
5. Activate workflow
6. Get webhook URL
