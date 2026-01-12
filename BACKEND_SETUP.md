# Backend Setup Guide

## Overview

The Fisher Research backend uses FastAPI to expose an HTTP API that calls Python scripts following the AGENTS.md architecture. The Python scripts use Tavily for web search and Ollama for analysis.

## Architecture

```
React Frontend → FastAPI Backend → Python Scripts → Tavily + Ollama
```

## Setup

### 1. Install Python Dependencies

```bash
cd backend
pip install -r requirements.txt
```

Or use a virtual environment:

```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Edit `.env` and set:

```env
TAVILY_API_KEY=your_tavily_api_key_here
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2
```

**Note:** If running on VPS with Ollama in Docker:
- Use `http://host.docker.internal:11434` if FastAPI runs in Docker
- Use `http://localhost:11434` if FastAPI runs on host

### 3. Test Python Scripts Locally

Test the execution scripts:

```bash
# Test Tavily aggregation
python execution/tavily_scuttlebutt.py "Apple Inc." --ticker AAPL

# Test Ollama analysis (requires signals file)
python execution/ollama_scuttlebutt_analysis.py .tmp/scuttlebutt_signals_AAPL.json

# Test full orchestrator
python execution/run_scuttlebutt_company.py "Apple Inc." --ticker AAPL
```

### 4. Run FastAPI Backend

#### Development (with auto-reload):

```bash
cd backend
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Or using the main script:

```bash
python backend/main.py
```

#### Production (using uvicorn):

```bash
uvicorn backend.main:app --host 0.0.0.0 --port 8000
```

The API will be available at:
- API: `http://localhost:8000`
- Docs: `http://localhost:8000/docs`
- Health: `http://localhost:8000/health`

### 5. Test API

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

## Deployment

### Option 1: Systemd Service

Create `/etc/systemd/system/fisher-api.service`:

```ini
[Unit]
Description=Fisher Research API
After=network.target

[Service]
Type=simple
User=your-user
WorkingDirectory=/path/to/rule1-calculator/backend
Environment="PATH=/path/to/venv/bin"
ExecStart=/path/to/venv/bin/uvicorn main:app --host 0.0.0.0 --port 8000
Restart=always

[Install]
WantedBy=multi-user.target
```

Enable and start:

```bash
sudo systemctl enable fisher-api
sudo systemctl start fisher-api
```

### Option 2: PM2

```bash
pm2 start "uvicorn backend.main:app --host 0.0.0.0 --port 8000" --name fisher-api
pm2 save
```

### Option 3: Docker

Create `backend/Dockerfile`:

```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY backend/ ./backend/
COPY execution/ ./execution/
COPY directives/ ./directives/

EXPOSE 8000

CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

Build and run:

```bash
docker build -t fisher-api .
docker run -d -p 8000:8000 --env-file backend/.env fisher-api
```

## Frontend Integration

Update frontend `.env`:

```env
VITE_SCUTTLEBUTT_API_URL=http://localhost:8000
```

For production:

```env
VITE_SCUTTLEBUTT_API_URL=https://your-api-domain.com
```

## Troubleshooting

### Python Scripts Fail

- Check `TAVILY_API_KEY` is set
- Check `OLLAMA_BASE_URL` is correct (use `host.docker.internal` if Ollama in Docker)
- Test Ollama: `curl http://localhost:11434/api/tags`
- Check Python dependencies: `pip list`

### API Returns 500 Errors

- Check backend logs
- Verify Python scripts work independently
- Check environment variables in `.env`
- Test Ollama connectivity

### CORS Errors

- Update `CORS_ORIGINS` in `.env`
- Check frontend URL matches allowed origins

### Timeout Errors

- Research can take 1-3 minutes (Tavily + Ollama)
- Increase timeout in `scuttlebuttService.ts` if needed
- Consider async processing for production

## API Endpoints

### POST /fisher-research

Research Fisher criteria for a company.

**Request:**
```json
{
  "symbol": "AAPL",
  "companyName": "Apple Inc.",
  "criteriaToResearch": [2, 3, 4]
}
```

**Response:**
```json
{
  "symbol": "AAPL",
  "ratings": [
    {
      "criterionId": 2,
      "rating": 4,
      "justification": "...",
      "keyFindings": ["..."],
      "sources": ["..."],
      "confidence": "high"
    }
  ],
  "researchDate": "2026-01-12T...",
  "modelUsed": "ollama-llama3.2"
}
```

### GET /health

Health check endpoint.

**Response:**
```json
{
  "status": "healthy"
}
```

### GET /docs

Interactive API documentation (Swagger UI).
