# Final Workflow Fix - Tavily + Ollama

## The Real Issue

**HTTP Request nodes in n8n REPLACE the input data with the response.**

When "Tavily Search" HTTP Request node processes items:
- Input: `{criterionId: 2, symbol: "AAPL", query: "...", ...}`
- Output: `{body: {results: [...], answer: "..."}}` (original data is LOST)

## Solution: Fix "Format Research Data" Function

We need to reconstruct the metadata from the Tavily responses. However, since HTTP Request replaces data, we have two options:

### Option 1: Use Get Previous Node Data (Recommended)

n8n has a function `$('NodeName')` to get data from previous nodes. We can use this to get the original webhook data.

### Option 2: Pass Metadata Differently

Actually, wait - the "Prepare Search Queries" function outputs multiple items, each with the metadata. When HTTP Request processes each item, it replaces it. But `$input.all()` in the next function should still work - it collects ALL items from the previous node.

The issue is that each item from Tavily Search will have:
- `item.json.body` = Tavily response (if fullResponse: true)
- OR `item.json` = Tavily response directly (if fullResponse: false)

But the original query metadata is lost.

### Option 3: Use Get Previous Node (Best Solution)

In "Format Research Data" function, use:
```javascript
const webhookData = $('Webhook').item.json;
const { symbol, companyName, criteriaToResearch: allCriteria } = webhookData;
```

This gets the original webhook data, then we can reconstruct everything.

## Updated Function Code

Here's the corrected "Format Research Data" function code:

```javascript
// Get original webhook data
const webhookData = $('Webhook').item.json;
const { symbol, companyName, criteriaToResearch: allCriteria } = webhookData;

// Collect all Tavily results
const allItems = $input.all();

// Map Tavily results back to criteria
const researchData = {};

allItems.forEach((item, index) => {
  // Tavily response structure (with fullResponse: true, it's in body)
  const tavilyResponse = item.json.body || item.json.response || item.json;
  
  // Get criterionId - we need to match by index since original data is lost
  // The items come in the same order as allCriteria
  const criterionId = allCriteria[index];
  
  if (criterionId && tavilyResponse) {
    researchData[criterionId] = {
      results: tavilyResponse.results || tavilyResponse.data?.results || [],
      answer: tavilyResponse.answer || tavilyResponse.data?.answer || ''
    };
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

## Next Steps

1. Open workflow in n8n UI
2. Click on "Format Research Data" function node
3. Replace the function code with the code above
4. Test the workflow
5. Activate and get webhook URL
