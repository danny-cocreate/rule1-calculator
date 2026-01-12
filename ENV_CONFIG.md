# Environment Configuration Guide

## Your API Keys

Based on what you've provided and found in the codebase:

- **Tavily API Key**: `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`
- **StockData.org API Key**: `Tsdj7Z3d3OwzL1MO3UJW4uunrRGOABTzuEqQWOlj` (from codebase)
- **FMP API Key**: `6HhHKgYFoKOlDJqi4THx75eTc6w3N1xq` (from codebase)
- **Ollama URL**: `http://localhost:11434` (FastAPI on host, Ollama on host)
- **Ollama Model**: `llama3.2`

## Complete .env File

Create or update `.env` file in project root:

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

## Understanding Ollama URL

**Your n8n setup:**
- n8n uses: `http://host.docker.internal:11434`
- This means: n8n runs in Docker, Ollama runs on host

**For FastAPI (AGENTS.md approach):**
- FastAPI will run on host (same as Ollama)
- Use: `http://localhost:11434`
- No Docker networking needed

**If you deploy FastAPI in Docker later:**
- Use: `http://host.docker.internal:11434` (same as n8n)

## Quick Setup Command

If you want to add these to your existing `.env`:

```bash
# Add backend variables to .env
cat >> .env << 'EOF'

# Backend Variables (for Python scripts)
TAVILY_API_KEY=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
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2
EOF

# Add frontend variable if missing
if ! grep -q "VITE_SCUTTLEBUTT_API_URL" .env; then
  echo "VITE_SCUTTLEBUTT_API_URL=http://localhost:8000" >> .env
fi
```

## Verification

Verify your .env file:

```bash
# Check backend variables
echo "=== Backend Variables ==="
grep -E "TAVILY|OLLAMA" .env || echo "Missing backend variables"

# Check frontend variables
echo "=== Frontend Variables ==="
grep -E "VITE_SCUTTLEBUTT|VITE_STOCKDATA|VITE_FMP" .env || echo "Missing frontend variables"
```
