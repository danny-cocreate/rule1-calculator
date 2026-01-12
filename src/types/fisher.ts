/**
 * Philip Fisher's 15-Point Investment Criteria
 * Based on "Common Stocks and Uncommon Profits"
 */

export interface FisherCriterion {
  id: number;
  title: string;
  description: string;
  category: 'quantitative' | 'qualitative';
  rating: number | null; // 1-5 scale
  justification: string;
  dataSource: 'stockdata' | 'gemini' | 'manual';
  confidence: 'high' | 'medium' | 'low' | null;
  sources: string[];
  lastUpdated: Date | null;
}

export interface FisherScorecard {
  symbol: string;
  companyName: string;
  overallScore: number; // Average of all 15 criteria
  criteria: FisherCriterion[];
  createdAt: Date;
  lastUpdated: Date;
}

export interface GeminiResearchRequest {
  symbol: string;
  companyName: string;
  criteriaToResearch: number[]; // IDs of criteria to research
}

export interface GeminiCriterionRating {
  criterionId: number;
  rating: number; // 1-5
  justification: string;
  keyFindings: string[];
  sources: string[];
  confidence: 'high' | 'medium' | 'low';
}

export interface GeminiResearchResponse {
  symbol: string;
  ratings: GeminiCriterionRating[];
  researchDate: Date;
  modelUsed: string;
}

/**
 * The 15 Fisher Criteria Template
 */
export const FISHER_CRITERIA_TEMPLATE: Omit<FisherCriterion, 'rating' | 'justification' | 'sources' | 'lastUpdated'>[] = [
  {
    id: 1,
    title: "Products/Services with Market Potential",
    description: "Does the company have products or services with sufficient market potential to make possible a sizable increase in sales for at least several years?",
    category: 'quantitative',
    dataSource: 'stockdata',
    confidence: null,
  },
  {
    id: 2,
    title: "Management's Determination for Growth",
    description: "Does the management have a determination to continue to develop products or processes that will still further increase total sales potentials when the growth potentials of currently attractive product lines have largely been exploited?",
    category: 'qualitative',
    dataSource: 'gemini',
    confidence: null,
  },
  {
    id: 3,
    title: "R&D Effectiveness",
    description: "How effective are the company's research and development efforts in relation to its size?",
    category: 'qualitative',
    dataSource: 'gemini',
    confidence: null,
  },
  {
    id: 4,
    title: "Sales Organization",
    description: "Does the company have an above-average sales organization?",
    category: 'qualitative',
    dataSource: 'gemini',
    confidence: null,
  },
  {
    id: 5,
    title: "Profit Margin",
    description: "Does the company have a worthwhile profit margin?",
    category: 'quantitative',
    dataSource: 'stockdata',
    confidence: null,
  },
  {
    id: 6,
    title: "Maintaining/Improving Profit Margins",
    description: "What is the company doing to maintain or improve profit margins?",
    category: 'qualitative',
    dataSource: 'gemini',
    confidence: null,
  },
  {
    id: 7,
    title: "Labor and Personnel Relations",
    description: "Does the company have outstanding labor and personnel relations?",
    category: 'qualitative',
    dataSource: 'gemini',
    confidence: null,
  },
  {
    id: 8,
    title: "Executive Relations",
    description: "Does the company have outstanding executive relations?",
    category: 'qualitative',
    dataSource: 'gemini',
    confidence: null,
  },
  {
    id: 9,
    title: "Management Depth",
    description: "Does the company have depth to its management?",
    category: 'qualitative',
    dataSource: 'gemini',
    confidence: null,
  },
  {
    id: 10,
    title: "Cost Analysis and Accounting Controls",
    description: "How good are the company's cost analysis and accounting controls?",
    category: 'qualitative',
    dataSource: 'gemini',
    confidence: null,
  },
  {
    id: 11,
    title: "Industry-Specific Competitive Advantages",
    description: "Are there other aspects of the business, somewhat peculiar to the industry involved, which will give the investor important clues as to how outstanding the company may be in relation to its competition?",
    category: 'qualitative',
    dataSource: 'gemini',
    confidence: null,
  },
  {
    id: 12,
    title: "Long-Range Profit Outlook",
    description: "Does the company have a short-range or long-range outlook in regard to profits?",
    category: 'qualitative',
    dataSource: 'gemini',
    confidence: null,
  },
  {
    id: 13,
    title: "Future Equity Financing",
    description: "In the foreseeable future will the growth of the company require sufficient equity financing so that the larger number of shares then outstanding will largely cancel the existing stockholders' benefit from this anticipated growth?",
    category: 'qualitative',
    dataSource: 'gemini',
    confidence: null,
  },
  {
    id: 14,
    title: "Management Communication",
    description: "Does the management talk freely to investors about its affairs when things are going well but 'clam up' when troubles and disappointments occur?",
    category: 'qualitative',
    dataSource: 'gemini',
    confidence: null,
  },
  {
    id: 15,
    title: "Management Integrity",
    description: "Does the company have a management of unquestionable integrity?",
    category: 'qualitative',
    dataSource: 'gemini',
    confidence: null,
  },
];

