import axios from 'axios';
import { 
  GeminiResearchRequest, 
  GeminiResearchResponse, 
  GeminiCriterionRating
} from '../types/fisher';

// Backend API URL
const SCUTTLEBUTT_API_URL = import.meta.env.VITE_SCUTTLEBUTT_API_URL || 'http://localhost:8000';

/**
 * Research Philip Fisher criteria using Scuttlebutt methodology (Tavily + Ollama)
 */
export const researchFisherCriteria = async (
  request: GeminiResearchRequest
): Promise<GeminiResearchResponse> => {
  try {
    console.log(`Researching Fisher criteria for ${request.symbol} using Scuttlebutt...`);
    
    const response = await axios.post(
      `${SCUTTLEBUTT_API_URL}/fisher-research`,
      {
        symbol: request.symbol,
        companyName: request.companyName,
        criteriaToResearch: request.criteriaToResearch, // For compatibility, but we research all
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 180000, // 3 minute timeout (research can take a while)
      }
    );
    
    const data = response.data;
    
    // Convert response to GeminiResearchResponse format
    return {
      symbol: data.symbol || request.symbol,
      ratings: data.ratings || [],
      researchDate: new Date(data.researchDate || new Date().toISOString()),
      modelUsed: data.modelUsed || 'ollama-llama3.2',
    };
    
  } catch (error) {
    console.error('Error in Scuttlebutt research:', error);
    
    if (axios.isAxiosError(error)) {
      const errorMessage = error.response?.data?.detail || error.message;
      throw new Error(`Failed to research Fisher criteria: ${errorMessage}`);
    }
    
    throw new Error(`Failed to research Fisher criteria: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

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
