# AGENTS.md Setup Guide

## Overview

This project uses the AGENTS.md architecture for Fisher Scuttlebutt research:

- **Layer 1: Directives** - Define purpose, inputs, outputs (`directives/`)
- **Layer 2: Execution** - Python scripts that do the work (`execution/`)
- **Layer 3: Orchestration** - CLI scripts that tie everything together

## Directory Structure

```
directives/
  └── scuttlebutt_company.md     # Defines stakeholder queries and output schema

execution/
  ├── tavily_scuttlebutt.py      # Aggregates Tavily searches by stakeholder
  ├── ollama_scuttlebutt_analysis.py  # Analyzes signals with Ollama
  └── run_scuttlebutt_company.py # Orchestrator script

backend/
  ├── main.py                    # FastAPI application
  ├── routes/
  │   └── fisher.py             # Research endpoint
  └── services/
      └── scuttlebutt.py        # Calls Python scripts

.tmp/                            # Temporary output files (gitignored)
```

## Python Scripts

### 1. tavily_scuttlebutt.py

Aggregates Tavily searches by stakeholder groups (customers, employees, competitors, etc.).

**Usage:**
```bash
python execution/tavily_scuttlebutt.py "Apple Inc." --ticker AAPL
```

**Output:** JSON signals structure to `.tmp/scuttlebutt_signals_AAPL.json` or stdout

### 2. ollama_scuttlebutt_analysis.py

Analyzes stakeholder signals using Ollama with Fisher's Scuttlebutt methodology.

**Usage:**
```bash
python execution/ollama_scuttlebutt_analysis.py .tmp/scuttlebutt_signals_AAPL.json
```

**Output:** Analysis JSON mapped to Fisher's 15 criteria

### 3. run_scuttlebutt_company.py

Orchestrator that runs Tavily aggregation + Ollama analysis.

**Usage:**
```bash
python execution/run_scuttlebutt_company.py "Apple Inc." --ticker AAPL
```

**Output:** Complete research result with signals + analysis

## Environment Variables

Create `.env` file in project root:

```env
# Tavily API
TAVILY_API_KEY=your_tavily_api_key_here

# Ollama Configuration
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2
```

## Testing Scripts

### Test Tavily Script

```bash
python execution/tavily_scuttlebutt.py "Apple Inc." --ticker AAPL
```

Expected: JSON with signals organized by stakeholder type

### Test Ollama Script

First, generate signals:

```bash
python execution/tavily_scuttlebutt.py "Apple Inc." --ticker AAPL
```

Then analyze:

```bash
python execution/ollama_scuttlebutt_analysis.py .tmp/scuttlebutt_signals_AAPL.json
```

Expected: JSON with analysis mapped to Fisher's 15 criteria

### Test Full Orchestrator

```bash
python execution/run_scuttlebutt_company.py "Apple Inc." --ticker AAPL
```

Expected: Complete research result (signals + analysis)

## Integration with Backend

The FastAPI backend (`backend/services/scuttlebutt.py`) calls `run_scuttlebutt_company.py` to perform research. The backend handles:

- HTTP endpoint (`/fisher-research`)
- Request validation
- Response formatting
- Error handling

See `BACKEND_SETUP.md` for backend setup details.

## Stakeholder Query Patterns

The scripts search for information from these stakeholder perspectives:

1. **Customers** - Reviews, satisfaction, testimonials
2. **Employees** - Glassdoor, culture, satisfaction
3. **Competitors** - Market share, competitive analysis
4. **Suppliers** - Supply chain, partnerships
5. **Innovation** - R&D, product roadmap, patents
6. **Risks** - Controversies, lawsuits, regulatory issues

These are defined in `directives/scuttlebutt_company.md`.

## Output Format

The final output maps stakeholder analysis back to Fisher's 15 criteria:

```json
{
  "symbol": "AAPL",
  "ratings": [
    {
      "criterionId": 1,
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

## Troubleshooting

### Scripts Fail to Import

Make sure you're in the project root directory and Python path is correct.

### Ollama Connection Errors

- Check `OLLAMA_BASE_URL` is correct
- Test Ollama: `curl http://localhost:11434/api/tags`
- If Ollama in Docker: use `http://host.docker.internal:11434`

### Tavily API Errors

- Check `TAVILY_API_KEY` is set
- Verify API key is valid
- Check rate limits (free tier: 1,000 searches/month)

### JSON Parsing Errors

Ollama may not always return perfect JSON. The scripts include fallback JSON extraction. If issues persist:

- Try a different model (e.g., `llama3.1`)
- Check Ollama JSON mode support for your model
- Consider using OpenRouter instead (simpler API)
