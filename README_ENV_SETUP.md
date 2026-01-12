# Environment Setup - Complete Guide

## Quick Setup

1. Copy `.env.example` to `.env`
2. Fill in your API keys
3. Done!

## Detailed Configuration

### Your Current API Keys

Based on your codebase, here are the keys you're using:

**Tavily API Key:**
```
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
```

**StockData.org API Key:**
```
Tsdj7Z3d3OwzL1MO3UJW4uunrRGOABTzuEqQWOlj
```

**FMP API Key:**
```
6HhHKgYFoKOlDJqi4THx75eTc6w3N1xq
```

### Ollama Configuration

**For FastAPI running on VPS host (same as Ollama):**
```
OLLAMA_BASE_URL=http://localhost:11434
```

**For FastAPI running in Docker (Ollama on host):**
```
OLLAMA_BASE_URL=http://host.docker.internal:11434
```

**Model:**
```
OLLAMA_MODEL=llama3.2
```

### Complete .env Template

Create `.env` file in project root:

```env
# Frontend Variables (VITE_*)
VITE_STOCKDATA_API_KEY=Tsdj7Z3d3OwzL1MO3UJW4uunrRGOABTzuEqQWOlj
VITE_FMP_API_KEY=6HhHKgYFoKOlDJqi4THx75eTc6w3N1xq
VITE_SCUTTLEBUTT_API_URL=http://localhost:8000

# Backend Variables (for Python scripts)
TAVILY_API_KEY=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
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2
```

## Where Variables Are Used

### Frontend (React)
- `VITE_STOCKDATA_API_KEY` → `src/services/stockDataService.ts`
- `VITE_FMP_API_KEY` → `src/services/fmpService.ts`
- `VITE_SCUTTLEBUTT_API_URL` → `src/services/scuttlebuttService.ts`

### Backend (Python)
- `TAVILY_API_KEY` → `execution/tavily_scuttlebutt.py`
- `OLLAMA_BASE_URL` → `execution/ollama_scuttlebutt_analysis.py`
- `OLLAMA_MODEL` → `execution/ollama_scuttlebutt_analysis.py`

Python scripts load `.env` from project root using `python-dotenv`.

## Testing Your Configuration

### Test Ollama Connection

```bash
curl http://localhost:11434/api/tags
```

Should return list of available models, including `llama3.2`.

### Test Tavily API

```bash
python execution/tavily_scuttlebutt.py "Apple Inc." --ticker AAPL
```

Should return JSON with stakeholder signals.

### Test Full Flow

```bash
python execution/run_scuttlebutt_company.py "Apple Inc." --ticker AAPL
```

Takes 1-3 minutes, should return complete research result.

## Production Configuration

For production deployment:

1. Set `VITE_SCUTTLEBUTT_API_URL` to your production API URL
2. Ensure `.env` file is secure (not in git)
3. Use environment variables or secrets manager on VPS
4. Consider using separate `.env.production` file
