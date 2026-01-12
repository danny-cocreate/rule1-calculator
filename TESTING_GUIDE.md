# Testing Guide - Step by Step

## Prerequisites Checklist

Before testing, ensure:

- [ ] Python 3.8+ installed (`python3 --version`)
- [ ] `.env` file exists with all variables
- [ ] Ollama is running and accessible
- [ ] Port 8000 is available

## Step 1: Verify Environment Variables

Check your `.env` file has all required variables:

```bash
cat .env | grep -E "TAVILY_API_KEY|OLLAMA_BASE_URL|OLLAMA_MODEL|VITE_SCUTTLEBUTT_API_URL"
```

Should show:
```
TAVILY_API_KEY=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
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2
VITE_SCUTTLEBUTT_API_URL=http://localhost:8000
```

## Step 2: Install Python Dependencies

```bash
cd backend
pip3 install -r requirements.txt
```

**Verify installation:**
```bash
python3 -c "import fastapi, uvicorn, requests, dotenv; print('✅ All dependencies installed')"
```

## Step 3: Test Ollama Connection

```bash
curl http://localhost:11434/api/tags
```

**Expected:** JSON response with models list, including `llama3.2`.

**If error:** 
- Check Ollama is running
- Check firewall allows port 11434
- On VPS: Make sure Ollama service is running

## Step 4: Test Tavily Script

```bash
python3 execution/tavily_scuttlebutt.py "Apple Inc." --ticker AAPL
```

**Expected:**
- Prints progress to stderr
- Outputs JSON to stdout
- Saves to `.tmp/scuttlebutt_signals_AAPL.json`
- Takes 10-30 seconds

**Check output:**
```bash
cat .tmp/scuttlebutt_signals_AAPL.json | head -50
```

Should show signals organized by stakeholder type (customers, employees, etc.).

## Step 5: Test Ollama Script

First, make sure you have signals file from Step 4, then:

```bash
python3 execution/ollama_scuttlebutt_analysis.py .tmp/scuttlebutt_signals_AAPL.json
```

**Expected:**
- Calls Ollama API
- Takes 30-120 seconds
- Outputs JSON with ratings array
- Saves to `.tmp/scuttlebutt_analysis_AAPL.json`

**Check output:**
```bash
cat .tmp/scuttlebutt_analysis_AAPL.json | python3 -m json.tool | head -100
```

Should show analysis with ratings mapped to Fisher's 15 criteria.

## Step 6: Test Full Orchestrator

```bash
python3 execution/run_scuttlebutt_company.py "Apple Inc." --ticker AAPL
```

**Expected:**
- Runs Tavily aggregation (Step 1)
- Runs Ollama analysis (Step 2)
- Outputs complete research result
- Takes 1-3 minutes total
- Saves to `.tmp/scuttlebutt_AAPL.json`

## Step 7: Test FastAPI Backend

### Start Backend

```bash
python3 -m uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
```

**Expected:** Server starts, shows:
```
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
INFO:     Started reloader process
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

### Test Health Endpoint

In another terminal:

```bash
curl http://localhost:8000/health
```

**Expected:** `{"status":"healthy"}`

### Test Research Endpoint

```bash
curl -X POST http://localhost:8000/fisher-research \
  -H "Content-Type: application/json" \
  -d '{
    "symbol": "AAPL",
    "companyName": "Apple Inc.",
    "criteriaToResearch": [2, 3, 4]
  }'
```

**Expected:**
- Takes 1-3 minutes (first request)
- Returns JSON with ratings array
- Each rating has: criterionId, rating, justification, keyFindings, sources, confidence

**Pretty print:**
```bash
curl -X POST http://localhost:8000/fisher-research \
  -H "Content-Type: application/json" \
  -d '{"symbol": "AAPL", "companyName": "Apple Inc.", "criteriaToResearch": [2, 3, 4]}' \
  | python3 -m json.tool
```

## Step 8: Test Frontend Integration

### Start Backend (Terminal 1)

```bash
python3 -m uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
```

### Start Frontend (Terminal 2)

```bash
npm run dev
```

**Expected:** Frontend starts at `http://localhost:5173`

### Test in Browser

1. Open `http://localhost:5173`
2. Search for "AAPL"
3. Wait for stock data to load
4. Wait for Fisher analysis (1-3 minutes)
5. Verify ratings are displayed

**Check browser console:**
- Should see: "Researching Fisher criteria for AAPL using Scuttlebutt..."
- Should see: API call to `http://localhost:8000/fisher-research`
- Should see: Ratings loaded

## Common Issues

### Issue: "Module not found" errors

**Solution:**
```bash
cd backend
pip3 install -r requirements.txt
```

### Issue: Ollama connection timeout

**Solution:**
- Check Ollama is running: `curl http://localhost:11434/api/tags`
- Check firewall
- Increase timeout in `execution/ollama_scuttlebutt_analysis.py` (currently 120s)

### Issue: Tavily API errors

**Solution:**
- Check API key in `.env`
- Check rate limits (free tier: 1,000/month)
- Check network connectivity

### Issue: JSON parsing errors from Ollama

**Solution:**
- Check Ollama model supports JSON mode
- Check response in `.tmp/scuttlebutt_analysis_*.json`
- Try different model if needed

### Issue: Backend import errors

**Solution:**
- Make sure you're in project root
- Use: `python3 -m uvicorn backend.main:app` (from project root)
- Check Python path

### Issue: Frontend CORS errors

**Solution:**
- Backend allows `http://localhost:5173` by default
- Check `CORS_ORIGINS` in `.env` if needed
- Check backend logs for CORS errors

## Success Criteria

All tests pass if:

1. ✅ Tavily script returns stakeholder signals
2. ✅ Ollama script returns analysis with ratings
3. ✅ Full orchestrator completes successfully
4. ✅ FastAPI backend starts without errors
5. ✅ Health endpoint returns healthy status
6. ✅ Research endpoint returns ratings
7. ✅ Frontend loads and displays Fisher analysis

## Next Steps After Testing

Once all tests pass:

1. Deploy FastAPI backend to VPS
2. Update `VITE_SCUTTLEBUTT_API_URL` for production
3. Set up process manager (systemd, PM2, or Docker)
4. Configure production environment variables
