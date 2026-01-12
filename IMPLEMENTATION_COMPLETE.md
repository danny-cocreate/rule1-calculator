# AGENTS.md + FastAPI Implementation Complete

## Summary

Successfully implemented Fisher Scuttlebutt research using AGENTS.md architecture with FastAPI backend. The implementation follows Perplexity's recommendation for stakeholder-based research.

## What Was Built

### 1. Directives Layer
- ✅ `directives/scuttlebutt_company.md` - Defines stakeholder queries and output schema

### 2. Execution Layer (Python Scripts)
- ✅ `execution/tavily_scuttlebutt.py` - Aggregates Tavily searches by stakeholder groups
- ✅ `execution/ollama_scuttlebutt_analysis.py` - Analyzes signals with Ollama using Fisher methodology
- ✅ `execution/run_scuttlebutt_company.py` - Orchestrator script

### 3. Backend Layer (FastAPI)
- ✅ `backend/main.py` - FastAPI application with CORS
- ✅ `backend/routes/fisher.py` - POST /fisher-research endpoint
- ✅ `backend/services/scuttlebutt.py` - Service layer calling Python scripts
- ✅ `backend/requirements.txt` - Python dependencies

### 4. Frontend Integration
- ✅ `src/services/scuttlebuttService.ts` - New service calling FastAPI backend
- ✅ Updated `src/components/FisherScorecard.tsx` - Now uses scuttlebuttService
- ✅ Updated `src/vite-env.d.ts` - Added VITE_SCUTTLEBUTT_API_URL

### 5. Documentation
- ✅ `BACKEND_SETUP.md` - Backend setup and deployment guide
- ✅ `AGENTS_SETUP.md` - AGENTS.md architecture documentation
- ✅ `.gitignore` - Updated for Python/backend files

## Architecture

```
React Frontend
  ↓ HTTP POST
FastAPI Backend (/fisher-research)
  ↓ Python function call
Python Scripts (AGENTS.md)
  ↓ API calls
Tavily API (web search) + Ollama API (analysis)
  ↓ JSON response
FastAPI Backend
  ↓ JSON response
React Frontend
```

## Next Steps

### 1. Install Python Dependencies

```bash
cd backend
pip install -r requirements.txt
```

Or use virtual environment:

```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Configure Environment Variables

Create `backend/.env`:

```env
TAVILY_API_KEY=your_tavily_api_key_here
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2
```

**Note:** For VPS with Ollama in Docker:
- If FastAPI runs in Docker: `OLLAMA_BASE_URL=http://host.docker.internal:11434`
- If FastAPI runs on host: `OLLAMA_BASE_URL=http://localhost:11434`

### 3. Test Python Scripts

Test scripts independently:

```bash
# Test Tavily aggregation
python execution/tavily_scuttlebutt.py "Apple Inc." --ticker AAPL

# Test full orchestrator
python execution/run_scuttlebutt_company.py "Apple Inc." --ticker AAPL
```

### 4. Run FastAPI Backend

```bash
cd backend
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Or using the main script:

```bash
python backend/main.py
```

### 5. Configure Frontend

Update `.env` (or create it):

```env
VITE_SCUTTLEBUTT_API_URL=http://localhost:8000
```

### 6. Test Integration

1. Start FastAPI backend
2. Start React frontend (`npm run dev`)
3. Search for a stock (e.g., AAPL)
4. Verify Fisher analysis loads correctly

## Key Features

1. **Stakeholder-Based Research** - Uses customer, employee, competitor, supplier, innovation, and risk signals
2. **Fisher's 15 Criteria** - Maps stakeholder analysis back to Fisher's 15 criteria structure
3. **FastAPI Backend** - Clean REST API with automatic docs
4. **Frontend Compatible** - Maintains existing interface, no UI changes needed
5. **Caching** - Frontend-level caching (24 hours)

## Documentation

- `BACKEND_SETUP.md` - Backend setup, deployment, troubleshooting
- `AGENTS_SETUP.md` - AGENTS.md architecture, Python scripts, testing
- `directives/scuttlebutt_company.md` - Directive definition

## Notes

- The frontend still uses `GeminiResearchRequest` and `GeminiResearchResponse` types for compatibility
- Python scripts can be run independently for CLI usage
- FastAPI backend can be deployed separately from frontend
- Output format matches existing Fisher criteria structure
