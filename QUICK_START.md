# Quick Start Guide - AGENTS.md + FastAPI

## Current Status

✅ All code implemented  
⚠️ Need to configure environment variables  
⚠️ Need to test scripts and backend

## Your Configuration

Based on your setup:

- **Tavily API Key**: `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`
- **Ollama URL**: `http://localhost:11434` (FastAPI runs on host, same as Ollama)
- **Ollama Model**: `llama3.2`
- **n8n URL**: `https://n8n.srv999305.hstgr.cloud/` (for reference)

## Step 1: Create .env File

Create `.env` file in project root:

```bash
cat > .env << 'EOF'
# Frontend Variables
VITE_STOCKDATA_API_KEY=Tsdj7Z3d3OwzL1MO3UJW4uunrRGOABTzuEqQWOlj
VITE_FMP_API_KEY=6HhHKgYFoKOlDJqi4THx75eTc6w3N1xq
VITE_SCUTTLEBUTT_API_URL=http://localhost:8000

# Backend Variables (for Python scripts)
TAVILY_API_KEY=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
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2
EOF
```

Or manually create `.env` with the above content.

## Step 2: Install Python Dependencies

```bash
cd backend
pip install -r requirements.txt
```

Or with virtual environment (recommended):

```bash
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

## Step 3: Test Python Scripts

Test Tavily script first:

```bash
python execution/tavily_scuttlebutt.py "Apple Inc." --ticker AAPL
```

Expected: JSON output with stakeholder signals.

If successful, test full orchestrator:

```bash
python execution/run_scuttlebutt_company.py "Apple Inc." --ticker AAPL
```

**Note:** This will take 1-3 minutes (Tavily + Ollama).

## Step 4: Run FastAPI Backend

```bash
cd backend
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Or from project root:

```bash
python -m uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at:
- **API**: `http://localhost:8000`
- **Docs**: `http://localhost:8000/docs`
- **Health**: `http://localhost:8000/health`

## Step 5: Test Backend API

Test the endpoint:

```bash
curl -X POST http://localhost:8000/fisher-research \
  -H "Content-Type: application/json" \
  -d '{
    "symbol": "AAPL",
    "companyName": "Apple Inc.",
    "criteriaToResearch": [2, 3, 4]
  }'
```

**Note:** First request will take 1-3 minutes (Tavily + Ollama).

## Step 6: Run Frontend

In a separate terminal:

```bash
npm run dev
```

Frontend will be at `http://localhost:5173`

## Step 7: Test Integration

1. Open `http://localhost:5173` in browser
2. Search for a stock (e.g., AAPL)
3. Verify Fisher analysis loads correctly
4. Check browser console for any errors

## Troubleshooting

### Python Scripts Fail

- Check `.env` file exists and has correct values
- Check Ollama is running: `curl http://localhost:11434/api/tags`
- Check Python dependencies: `pip list | grep -E "requests|dotenv"`

### Backend Fails to Start

- Check Python dependencies installed
- Check `.env` file exists
- Check port 8000 is not in use: `lsof -i :8000`

### Backend Returns 500 Errors

- Check backend logs
- Test Python scripts independently
- Check Ollama connectivity: `curl http://localhost:11434/api/tags`

### Frontend Can't Connect

- Check backend is running
- Check `VITE_SCUTTLEBUTT_API_URL` in `.env`
- Check CORS settings in backend
- Check browser console for errors

## Next Steps After Testing

1. If tests pass locally, deploy to VPS
2. Update `VITE_SCUTTLEBUTT_API_URL` for production
3. Set up process manager (systemd, PM2, or Docker)
4. Configure production environment variables
