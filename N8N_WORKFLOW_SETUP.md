# n8n Workflow Setup - Fisher Research (Tavily + Ollama)

## Before Creating the Workflow

You'll need:
1. **Tavily API Key**: Get from https://tavily.com (free tier: 1,000 searches/month)
2. **Ollama URL**: Your Ollama endpoint (default: `http://localhost:11434` or `http://your-vps-ip:11434`)
3. **Ollama Model**: The model name you want to use (e.g., `llama3.2`, `mistral`, `qwen2.5`)

## Workflow Structure

```
Webhook Trigger (POST /fisher-research)
  ↓
Function: Prepare Search Queries
  ↓
HTTP Request: Tavily Search (Loop over queries)
  ↓
Function: Format Research Data
  ↓
HTTP Request: Ollama API (/api/generate)
  ↓
Function: Parse Response
  ↓
Respond to Webhook
```

## Workflow Details

### Input Format (from Frontend)
```json
{
  "symbol": "AAPL",
  "companyName": "Apple Inc.",
  "criteriaToResearch": [2, 3, 4, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]
}
```

### Output Format (to Frontend)
```json
{
  "symbol": "AAPL",
  "ratings": [
    {
      "criterionId": 2,
      "rating": 4,
      "justification": "Management shows strong determination...",
      "keyFindings": ["CEO has 10+ years tenure", ...],
      "sources": ["2024 Annual Report", ...],
      "confidence": "high"
    }
  ],
  "researchDate": "2026-01-12T...",
  "modelUsed": "ollama"
}
```

## Next Steps

1. Get Tavily API key from https://tavily.com
2. Note your Ollama endpoint and model name
3. Create the workflow in n8n (I'll do this next)
