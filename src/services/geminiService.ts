import { GoogleGenerativeAI } from '@google/generative-ai';
import { 
  GeminiResearchRequest, 
  GeminiResearchResponse, 
  GeminiCriterionRating,
  FISHER_CRITERIA_TEMPLATE 
} from '../types/fisher';

// Initialize Gemini API
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || 'AIzaSyBhZ0zrHFX5VMEvwvxT2uDjqun0ne-O7-Q';
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

/**
 * Research Philip Fisher criteria using Gemini AI with web grounding
 */
export const researchFisherCriteria = async (
  request: GeminiResearchRequest
): Promise<GeminiResearchResponse> => {
  try {
    console.log(`Researching Fisher criteria for ${request.symbol}...`);
    
    // Use Gemini 2.0 Flash for speed and cost-effectiveness
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.0-flash-exp',
    });

    // Build the research prompt
    const prompt = buildResearchPrompt(request);
    
    console.log('Sending prompt to Gemini...');
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    
    console.log('Received response from Gemini');
    
    // Parse the JSON response
    const parsedData = parseGeminiResponse(text, request);
    
    return {
      symbol: request.symbol,
      ratings: parsedData,
      researchDate: new Date(),
      modelUsed: 'gemini-2.0-flash-exp',
    };
    
  } catch (error) {
    console.error('Error in Gemini research:', error);
    throw new Error(`Failed to research Fisher criteria: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Build a comprehensive research prompt for Gemini
 */
function buildResearchPrompt(request: GeminiResearchRequest): string {
  const { symbol, companyName, criteriaToResearch } = request;
  
  // Get the criteria details
  const criteriaDetails = criteriaToResearch
    .map(id => FISHER_CRITERIA_TEMPLATE.find(c => c.id === id))
    .filter(c => c !== undefined);
  
  const criteriaPrompts = criteriaDetails.map((criterion, index) => `
${index + 1}. **${criterion!.title}** (ID: ${criterion!.id})
   Question: ${criterion!.description}
   
   Research Requirements:
   ${getResearchGuidance(criterion!.id)}
   
   Provide:
   - Rating: 1-5 (1=Poor, 2=Below Average, 3=Average, 4=Good, 5=Excellent)
   - Justification: 2-3 sentences explaining the rating
   - Key Findings: 2-4 bullet points with specific data/facts
   - Sources: List of information sources (URLs, reports, etc.)
   - Confidence: high/medium/low based on data availability
`).join('\n---\n');

  return `You are a professional investment analyst researching ${companyName} (${symbol}) using Philip Fisher's "Scuttlebutt" methodology.

Please research the following investment criteria and provide STRUCTURED, DATA-DRIVEN analysis:

${criteriaPrompts}

IMPORTANT INSTRUCTIONS:
1. Use recent information (last 2-3 years preferred)
2. Compare against industry peers when possible
3. Be objective - acknowledge both strengths and weaknesses
4. Cite specific data points, numbers, and facts
5. If information is limited, state this clearly and lower confidence

OUTPUT FORMAT (JSON):
Return ONLY valid JSON in this exact structure:
{
  "ratings": [
    {
      "criterionId": 2,
      "rating": 4,
      "justification": "Management shows strong determination...",
      "keyFindings": [
        "CEO has 10+ years tenure",
        "Launched 3 new product lines in 2 years",
        "R&D budget increased 25% YoY"
      ],
      "sources": [
        "2024 Annual Report",
        "Q3 2024 Earnings Call"
      ],
      "confidence": "high"
    }
  ]
}

Research ${companyName} (${symbol}) NOW and return the JSON.`;
}

/**
 * Get specific research guidance for each criterion
 */
function getResearchGuidance(criterionId: number): string {
  const guidance: Record<number, string> = {
    2: `- Review CEO/executive statements about growth strategy
   - Check number of new products/markets entered recently
   - Look for R&D investments and innovation initiatives
   - Assess strategic acquisitions or partnerships`,
    
    3: `- Find R&D spending as percentage of revenue
   - Count patents filed or products launched
   - Compare R&D efficiency to competitors
   - Review innovation track record`,
    
    4: `- Check revenue growth vs industry average
   - Look for customer satisfaction scores/reviews
   - Find market share changes
   - Review sales team size and structure`,
    
    6: `- Analyze operating margin trends (3-5 years)
   - Check for cost reduction initiatives
   - Look for pricing power or premium positioning
   - Review operational efficiency improvements`,
    
    7: `- Search Glassdoor ratings and employee reviews
   - Look for labor disputes or unionization efforts
   - Check employee retention/turnover data
   - Review company culture awards or recognition`,
    
    8: `- Research executive tenure and stability
   - Check for succession planning mentions
   - Look for insider trading patterns
   - Review executive compensation alignment`,
    
    9: `- Count number of C-suite and VP-level executives
   - Check backgrounds and experience depth
   - Look for management bench strength
   - Review organizational structure`,
    
    10: `- Review financial reporting quality and transparency
   - Check for accounting restatements or irregularities
   - Look for detailed cost breakdowns in reports
   - Assess auditor opinions and internal controls
   - Review operating expense management trends`,
    
    11: `- Identify industry-specific competitive advantages
   - Look for patents, licenses, or regulatory moats
   - Check brand strength or market position
   - Review unique assets or capabilities`,
    
    12: `- Analyze management statements about long-term goals
   - Check capital allocation priorities
   - Review investment in future vs short-term profits
   - Look for guidance and planning horizons`,
    
    13: `- Review historical equity dilution patterns
   - Check debt-to-equity ratio and financing strategy
   - Look for recent stock issuances or buybacks
   - Assess cash flow adequacy for growth`,
    
    14: `- Review transparency in earnings calls and reports
   - Check how management handled past setbacks
   - Look for clarity in guidance and communication
   - Assess investor relations accessibility`,
    
    15: `- Search for any legal or regulatory issues
   - Check for accounting restatements or auditor changes
   - Review executive conduct and ethics
   - Look for related-party transactions or conflicts`,
  };
  
  return guidance[criterionId] || '- Research thoroughly using public sources';
}

/**
 * Parse Gemini's JSON response
 */
function parseGeminiResponse(text: string, request: GeminiResearchRequest): GeminiCriterionRating[] {
  try {
    // Extract JSON from response (Gemini might wrap it in markdown)
    let jsonText = text.trim();
    
    // Remove markdown code blocks if present
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/```\n?/g, '');
    }
    
    const parsed = JSON.parse(jsonText);
    
    if (!parsed.ratings || !Array.isArray(parsed.ratings)) {
      throw new Error('Invalid response format');
    }
    
    return parsed.ratings as GeminiCriterionRating[];
    
  } catch (error) {
    console.error('Failed to parse Gemini response:', text);
    console.error('Parse error:', error);
    
    // Return fallback ratings
    return request.criteriaToResearch.map(id => ({
      criterionId: id,
      rating: 3,
      justification: 'Unable to complete research. Please try again or research manually.',
      keyFindings: ['Research failed - data unavailable'],
      sources: [],
      confidence: 'low' as const,
    }));
  }
}

/**
 * Cache mechanism to avoid redundant API calls
 */
const CACHE_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours
const cache = new Map<string, { data: GeminiResearchResponse; timestamp: number }>();

export const getCachedOrFetchFisherData = async (
  request: GeminiResearchRequest
): Promise<GeminiResearchResponse> => {
  const cacheKey = `${request.symbol}-${request.criteriaToResearch.join(',')}`;
  const cached = cache.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION_MS) {
    console.log('Using cached Fisher data for', request.symbol);
    return cached.data;
  }
  
  const data = await researchFisherCriteria(request);
  cache.set(cacheKey, { data, timestamp: Date.now() });
  
  return data;
};

