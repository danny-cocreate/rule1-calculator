# Scuttlebutt Company Research Directive

## Purpose

Run Philip Fisher–style Scuttlebutt research on a single company using web data (Tavily) and local LLM (Ollama). This directive defines the stakeholder-based query patterns, output schema, and execution tools for gathering "virtual scuttlebutt" from multiple stakeholder perspectives.

## Inputs

- `company_name` (string, required): Company name (e.g., "Apple Inc.")
- `ticker` (string, optional): Stock ticker symbol (e.g., "AAPL")
- `max_results_per_bucket` (integer, optional, default: 5): Maximum Tavily results per stakeholder bucket
- `language` (string, optional, default: "en"): Language for searches
- `date_cutoff` (string, optional): Date cutoff for results (ISO format)

## Stakeholder Query Patterns

### Customers
- `<company> customer reviews product quality`
- `<company> customer satisfaction service complaints`
- `<company> customer testimonials user experience`

### Employees
- `<company> Glassdoor reviews management culture`
- `working at <company> employee reviews`
- `<company> employee satisfaction culture values`

### Competitors/Industry
- `<company> main competitors market share`
- `<company> competitive advantages weaknesses industry analysis`
- `<company> industry position market leadership`

### Suppliers/Partners
- `<company> suppliers supply chain issues partnerships`
- `<company> key suppliers vendor relationships`
- `<company> strategic partnerships alliances`

### Innovation/R&D
- `<company> product roadmap innovation R&D`
- `<company> research development new products`
- `<company> patents technology innovation`

### Risks/Controversies
- `<company> controversies lawsuits regulatory investigations`
- `<company> legal issues regulatory compliance`
- `<company> ethical concerns corporate governance`

## Output Schema (JSON)

The output should map to Fisher's 15 criteria structure:

```json
{
  "company": "Apple Inc.",
  "ticker": "AAPL",
  "inputs": {
    "company_name": "Apple Inc.",
    "ticker": "AAPL"
  },
  "signals": {
    "customers": [
      {
        "source_url": "https://...",
        "snippet": "...",
        "stakeholder_type": "customers",
        "tags": ["product_quality", "satisfaction"]
      }
    ],
    "employees": [...],
    "competitors": [...],
    "suppliers": [...],
    "innovation": [...],
    "risks": [...]
  },
  "analysis": {
    "ratings": [
      {
        "criterionId": 1,
        "rating": 4,
        "justification": "...",
        "keyFindings": ["..."],
        "sources": ["..."],
        "confidence": "high"
      }
    ]
  },
  "researchDate": "2026-01-12T...",
  "modelUsed": "ollama-llama3.2"
}
```

### Mapping Stakeholder Signals to Fisher Criteria

**Customer Signals** → Criteria 1 (Market Potential), 4 (Sales Organization), 7 (Customer Reputation)
**Employee Signals** → Criteria 7 (Labor Relations), 9 (Management Depth), 8 (Executive Relations)
**Competitor Signals** → Criteria 11 (Competitive Advantages), 1 (Market Potential)
**Supplier Signals** → Criteria 12 (Long-term Outlook), 8 (Executive Relations)
**Innovation Signals** → Criteria 2 (Growth Determination), 3 (R&D Effectiveness), 11 (Competitive Advantages)
**Risk Signals** → Criteria 15 (Integrity), 14 (Communication), 9 (Management Depth)

## Execution Tools

1. **execution/tavily_scuttlebutt.py**
   - Accepts company_name (and optional inputs)
   - Constructs stakeholder-specific Tavily queries
   - Calls Tavily API with TAVILY_API_KEY from .env
   - Normalizes responses into signals structure
   - Outputs JSON to stdout or .tmp/scuttlebutt_signals_<company>.json

2. **execution/ollama_scuttlebutt_analysis.py**
   - Reads signals JSON (from file or stdin)
   - Builds Fisher-style system prompt encoding Scuttlebutt methodology
   - Builds user prompt with stakeholder signals
   - Calls Ollama API (http://localhost:11434/api/chat)
   - Validates and emits analysis JSON
   - Maps to Fisher's 15 criteria structure

3. **execution/run_scuttlebutt_company.py**
   - Top-level orchestrator
   - Parses CLI args: company_name, ticker, options
   - Calls tavily_scuttlebutt.py
   - Calls ollama_scuttlebutt_analysis.py with signals
   - Handles errors and logging
   - Generates final JSON output

## Edge Cases

- **Very little data**: Return low-confidence scores and populate open_questions
- **Private companies / subsidiaries**: Handle mixed signals, note data limitations
- **News dominated by one event**: Note skew in analysis, highlight temporary vs permanent factors
- **API failures**: Graceful degradation, descriptive error messages
- **Invalid responses**: JSON validation and repair attempts

## Fisher's 15 Criteria Mapping

The analysis should map stakeholder signals to these 15 criteria:

1. Products/Services with Market Potential
2. Management's Determination for Growth
3. R&D Effectiveness
4. Sales Organization
5. Profit Margin (qualitative assessment)
6. Maintaining/Improving Profit Margins
7. Labor and Personnel Relations
8. Executive Relations
9. Management Depth
10. Cost Analysis and Accounting Controls
11. Industry-Specific Competitive Advantages
12. Long-Range Profit Outlook
13. Future Equity Financing
14. Management Communication
15. Management Integrity

## System Prompt for Ollama

The system prompt should encode Fisher's Scuttlebutt methodology:

> You are an equity analyst applying Philip Fisher's Scuttlebutt method.  
> You receive web-derived "virtual scuttlebutt" from customers, employees, competitors, suppliers, and industry observers about a company.  
> Using only this information, assess the company on these 15 dimensions (Fisher's criteria).  
> For each criterion, provide: rating (1-5), justification (2-3 sentences), key findings (2-4 bullets), sources (URLs), confidence (high/medium/low).  
> Respond as strict JSON matching the provided schema.
