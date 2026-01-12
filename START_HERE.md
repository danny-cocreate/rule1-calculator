# Start Here - Quick Setup

## Your Configuration

- **Tavily API Key**: `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`
- **Ollama URL**: `http://localhost:11434` (FastAPI runs on host, same as Ollama)
- **Ollama Model**: `llama3.2`

## Quick Setup (3 Steps)

### Step 1: Update .env File

Add these to your `.env` file (or create it):

```env
# Backend Variables (for Python scripts)
TAVILY_API_KEY=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
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2

# Frontend Variable (if not already present)
VITE_SCUTTLEBUTT_API_URL=http://localhost:8000
```

### Step 2: Install Python Dependencies

```bash
cd backend
pip3 install -r requirements.txt
```

### Step 3: Test Ollama Connection

```bash
curl http://localhost:11434/api/tags
```

Should return JSON with available models.

## Next: Test Python Scripts

```bash
# Test Tavily script
python3 execution/tavily_scuttlebutt.py "Apple Inc." --ticker AAPL

# Test full orchestrator (takes 1-3 minutes)
python3 execution/run_scuttlebutt_company.py "Apple Inc." --ticker AAPL
```

## Then: Start Backend

```bash
python3 -m uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
```

## Finally: Start Frontend

```bash
npm run dev
```

## Full Documentation

- `TESTING_GUIDE.md` - Detailed testing steps
- `NEXT_STEPS.md` - Complete setup guide
- `BACKEND_SETUP.md` - Backend deployment guide
- `AGENTS_SETUP.md` - Python scripts documentation
