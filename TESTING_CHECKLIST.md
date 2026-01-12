# Testing Checklist

## Prerequisites

- [ ] Python 3.8+ installed
- [ ] `.env` file created with API keys
- [ ] Ollama running on VPS (or locally)
- [ ] Port 8000 available

## Step 1: Verify Environment Setup

- [ ] `.env` file exists in project root
- [ ] `TAVILY_API_KEY` is set
- [ ] `OLLAMA_BASE_URL` is set (http://localhost:11434 for host, http://host.docker.internal:11434 for Docker)
- [ ] `OLLAMA_MODEL=llama3.2` is set
- [ ] `VITE_SCUTTLEBUTT_API_URL=http://localhost:8000` is set

## Step 2: Install Python Dependencies

```bash
cd backend
pip install -r requirements.txt
```

Or with venv:

```bash
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

- [ ] Dependencies installed successfully
- [ ] Can import: `python -c "import fastapi, uvicorn, requests, dotenv"`

## Step 3: Test Ollama Connection

```bash
curl http://localhost:11434/api/tags
```

- [ ] Ollama responds
- [ ] `llama3.2` model is available

## Step 4: Test Tavily Script

```bash
python execution/tavily_scuttlebutt.py "Apple Inc." --ticker AAPL
```

Expected: JSON output with signals organized by stakeholder type.

- [ ] Script runs without errors
- [ ] Output contains signals for customers, employees, competitors, etc.
- [ ] Output saved to `.tmp/scuttlebutt_signals_AAPL.json`

## Step 5: Test Ollama Script (Requires Signals File)

First generate signals (Step 4), then:

```bash
python execution/ollama_scuttlebutt_analysis.py .tmp/scuttlebutt_signals_AAPL.json
```

Expected: JSON output with analysis mapped to Fisher's 15 criteria.

- [ ] Script runs without errors
- [ ] Output contains ratings array
- [ ] Each rating has: criterionId, rating, justification, keyFindings, sources, confidence

## Step 6: Test Full Orchestrator

```bash
python execution/run_scuttlebutt_company.py "Apple Inc." --ticker AAPL
```

**Note:** This takes 1-3 minutes.

- [ ] Script runs successfully
- [ ] Complete research result returned
- [ ] Output saved to `.tmp/scuttlebutt_AAPL.json`

## Step 7: Test FastAPI Backend

Start backend:

```bash
python -m uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
```

Test health endpoint:

```bash
curl http://localhost:8000/health
```

- [ ] Backend starts without errors
- [ ] Health endpoint returns `{"status": "healthy"}`
- [ ] Docs available at `http://localhost:8000/docs`

## Step 8: Test Research Endpoint

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

- [ ] Request succeeds (200 status)
- [ ] Response contains ratings array
- [ ] Ratings match requested criteriaIds
- [ ] Response structure matches frontend expectations

## Step 9: Test Frontend Integration

Start frontend:

```bash
npm run dev
```

- [ ] Frontend starts without errors
- [ ] Search for stock (AAPL)
- [ ] Fisher analysis loads
- [ ] No console errors
- [ ] Ratings displayed correctly

## Step 10: End-to-End Test

1. Start backend: `python -m uvicorn backend.main:app --reload`
2. Start frontend: `npm run dev`
3. Search for stock: AAPL
4. Wait for Fisher analysis (1-3 minutes)
5. Verify results displayed

- [ ] Complete flow works
- [ ] Results cached (second search is faster)
- [ ] Error handling works (try invalid symbol)

## Common Issues

### Issue: Python scripts can't find .env

**Solution:** `.env` must be in project root. Python scripts load it via `python-dotenv`.

### Issue: Ollama connection fails

**Solution:** 
- If FastAPI runs on host: Use `http://localhost:11434`
- If FastAPI runs in Docker: Use `http://host.docker.internal:11434`
- Test Ollama: `curl http://localhost:11434/api/tags`

### Issue: Tavily API errors

**Solution:**
- Check API key is correct
- Check rate limits (free tier: 1,000 searches/month)
- Check network connectivity

### Issue: Ollama JSON parsing fails

**Solution:**
- Check Ollama model supports JSON mode (`llama3.2` should work)
- Check response in `.tmp/scuttlebutt_analysis_*.json`
- Try a different model if needed

### Issue: Backend import errors

**Solution:**
- Make sure you're in project root when running
- Use: `python -m uvicorn backend.main:app` (from project root)
- Or: `cd backend && python -m uvicorn main:app`

### Issue: CORS errors

**Solution:**
- Check `CORS_ORIGINS` in `.env` includes frontend URL
- Default includes `http://localhost:5173`
- Check backend logs for CORS errors
