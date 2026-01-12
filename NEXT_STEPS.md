# Next Steps - Setup and Testing

## Your Configuration

Based on your setup:

- **Tavily API Key**: `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`
- **Ollama URL**: `http://localhost:11434` (FastAPI runs on host, same as Ollama)
- **Ollama Model**: `llama3.2`
- **n8n URL**: `https://n8n.srv999305.hstgr.cloud/` (for reference)

**Note:** Since n8n uses `http://host.docker.internal:11434`, this means:
- n8n runs in Docker → uses `host.docker.internal` to reach host
- Ollama runs on host → accessible at `localhost:11434` from host
- FastAPI will run on host → use `http://localhost:11434`

## Step 1: Update .env File

Your `.env` file already exists. Add or update these variables:

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

**Quick command to check your .env:**
```bash
cat .env | grep -E "TAVILY|OLLAMA|SCUTTLEBUTT" || echo "Variables not found - need to add them"
```

## Step 2: Install Python Dependencies

```bash
cd backend
pip install -r requirements.txt
```

Or with virtual environment (recommended):

```bash
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

**Check installation:**
```bash
python3 -c "import fastapi, uvicorn, requests, dotenv; print('Dependencies OK')"
```

## Step 3: Test Ollama Connection

Before testing scripts, verify Ollama is accessible:

```bash
curl http://localhost:11434/api/tags
```

Expected: JSON response with available models (should include `llama3.2`).

**If running on VPS (SSH):**
```bash
ssh your-vps
curl http://localhost:11434/api/tags
```

## Step 4: Test Tavily Script

Test the Tavily aggregation script:

```bash
python3 execution/tavily_scuttlebutt.py "Apple Inc." --ticker AAPL
```

Expected: JSON output with stakeholder signals (customers, employees, competitors, etc.).

**Check output:**
- Should save to `.tmp/scuttlebutt_signals_AAPL.json`
- Should print JSON to stdout
- Should take 10-30 seconds (6 stakeholder queries)

## Step 5: Test Full Orchestrator

Test the complete flow (Tavily + Ollama):

```bash
python3 execution/run_scuttlebutt_company.py "Apple Inc." --ticker AAPL
```

**Note:** This takes 1-3 minutes (Tavily + Ollama).

Expected:
- Tavily searches (10-30 seconds)
- Ollama analysis (30-120 seconds)
- Complete research result with ratings mapped to Fisher's 15 criteria

## Step 6: Test FastAPI Backend

Start the backend:

```bash
python3 -m uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
```

Or from backend directory:

```bash
cd backend
python3 -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

**Test health endpoint:**
```bash
curl http://localhost:8000/health
```

Expected: `{"status": "healthy"}`

**Test research endpoint:**
```bash
curl -X POST http://localhost:8000/fisher-research \
  -H "Content-Type: application/json" \
  -d '{
    "symbol": "AAPL",
    "companyName": "Apple Inc.",
    "criteriaToResearch": [2, 3, 4]
  }'
```

**Note:** First request takes 1-3 minutes.

Expected: JSON response with ratings array.

## Step 7: Test Frontend Integration

1. **Start backend** (in one terminal):
   ```bash
   python3 -m uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
   ```

2. **Start frontend** (in another terminal):
   ```bash
   npm run dev
   ```

3. **Open browser**: `http://localhost:5173`

4. **Search for stock**: AAPL

5. **Wait for Fisher analysis**: 1-3 minutes (first time)

6. **Verify results**: Check that ratings are displayed

## Troubleshooting

### Issue: Ollama Connection Fails

**Check Ollama is running:**
```bash
curl http://localhost:11434/api/tags
```

**If running on VPS:**
- Make sure Ollama service is running
- Check firewall allows port 11434
- If FastAPI in Docker, use `http://host.docker.internal:11434`

### Issue: Tavily API Errors

**Check API key:**
```bash
cat .env | grep TAVILY_API_KEY
```

**Check rate limits:**
- Free tier: 1,000 searches/month
- Check Tavily dashboard for usage

### Issue: Python Scripts Fail

**Check dependencies:**
```bash
python3 -c "import requests, dotenv; print('OK')"
```

**Check .env is loaded:**
- Make sure `.env` is in project root
- Scripts use `python-dotenv` to load it

### Issue: Backend Import Errors

**Check you're in project root:**
```bash
pwd  # Should be /path/to/rule1-calculator
```

**Use correct import path:**
```bash
python3 -m uvicorn backend.main:app  # From project root
```

### Issue: Frontend Can't Connect

**Check backend is running:**
```bash
curl http://localhost:8000/health
```

**Check CORS:**
- Backend allows `http://localhost:5173` by default
- Check browser console for CORS errors

## What I Need From You

To proceed with testing, please:

1. **Confirm .env file** has the variables above (or tell me what's missing)
2. **Test Ollama connection**: `curl http://localhost:11434/api/tags`
3. **Let me know if you're running locally or on VPS**
4. **Tell me any errors** you encounter

## Next Steps After Testing

Once everything works locally:

1. Deploy FastAPI backend to VPS
2. Update `VITE_SCUTTLEBUTT_API_URL` for production
3. Set up process manager (systemd, PM2, or Docker)
4. Configure production environment variables
