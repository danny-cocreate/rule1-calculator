// Fixed "Format Research Data" Function Node Code
// This goes in the "Format Research Data" function node

// Collect all Tavily results - HTTP Request preserves input in item.binary or we need to store it
// Actually, in n8n, HTTP Request outputs the response, but input data might be in item.binary
// Let's collect all items and reconstruct

const allItems = $input.all();

// Get original data from webhook - we need to store it earlier
// Actually, let's pass it through in the query data itself
// The Prepare Search Queries node already includes symbol, companyName, allCriteria in each query

// Map Tavily results back to criteria
// Each item from Tavily Search has: { json: { response: {...}, ... } }
const researchData = {};
let symbol, companyName, allCriteria;

allItems.forEach(item => {
  // Get Tavily response
  const tavilyResponse = item.json.body || item.json.response || item.json;
  
  // Try to get original query data
  // In n8n HTTP Request, original input might be preserved or we need to store it
  // Let's check if it's in the item
  const criterionId = item.json.criterionId || tavilyResponse.criterionId;
  symbol = item.json.symbol || symbol;
  companyName = item.json.companyName || companyName;
  allCriteria = item.json.allCriteria || allCriteria;
  
  researchData[criterionId] = {
    query: item.json.query || '',
    results: tavilyResponse.results || tavilyResponse.data?.results || [],
    answer: tavilyResponse.answer || tavilyResponse.data?.answer || ''
  };
});

// Fallback - if we don't have metadata, try to get from first item's original input
if (!symbol || !companyName || !allCriteria) {
  // This shouldn't happen if we pass data correctly, but handle it
  symbol = allItems[0]?.json?.symbol || 'UNKNOWN';
  companyName = allItems[0]?.json?.companyName || 'UNKNOWN';
  allCriteria = allItems[0]?.json?.allCriteria || [];
}

// Get Fisher criteria template
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
