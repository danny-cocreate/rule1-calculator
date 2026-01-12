# Environment Variables Setup

## Quick Setup

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

Then edit `.env` with your API keys.

## Environment Variables

### Frontend Variables (VITE_*)

These are used by the React frontend:

```env
VITE_STOCKDATA_API_KEY=your_stockdata_api_key_here
VITE_FMP_API_KEY=your_fmp_api_key_here
VITE_SCUTTLEBUTT_API_URL=http://localhost:8000
```

**Note:** `VITE_GEMINI_API_KEY` is no longer used (replaced by Scuttlebutt backend).

### Backend Variables (for Python Scripts)

These are used by Python execution scripts:

```env
TAVILY_API_KEY=your_tavily_api_key_here
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2
```

## Ollama URL Configuration

### If Running Locally
- `OLLAMA_BASE_URL=http://localhost:11434`

### If FastAPI Runs on VPS Host (Ollama on same host)
- `OLLAMA_BASE_URL=http://localhost:11434`

### If FastAPI Runs in Docker (Ollama on host)
- `OLLAMA_BASE_URL=http://host.docker.internal:11434`

### If Ollama Runs in Docker (different container)
- `OLLAMA_BASE_URL=http://ollama-container:11434` (Docker network)
- Or expose port and use host IP

## Your Current Setup

Based on your n8n configuration:
- n8n uses: `http://host.docker.internal:11434` (n8n in Docker, Ollama on host)
- For FastAPI (running on host): Use `http://localhost:11434`
- For FastAPI (running in Docker): Use `http://host.docker.internal:11434`

## Testing

After setting up `.env`, test the scripts:

```bash
# Test Tavily script
python execution/tavily_scuttlebutt.py "Apple Inc." --ticker AAPL

# Test full orchestrator
python execution/run_scuttlebutt_company.py "Apple Inc." --ticker AAPL
```
