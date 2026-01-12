# VPS Quick Start

## ✅ Scripts Created

I've created 3 setup scripts for your VPS:

1. **setup-vps.sh** - Complete setup (creates .env, installs dependencies, tests Ollama)
2. **test-scripts.sh** - Tests Tavily + Ollama scripts
3. **start-backend.sh** - Starts FastAPI backend

## 📋 What to Run on VPS

Since your workspace is in Dropbox CloudStorage, the scripts should sync to your VPS automatically.

**SSH to your VPS and run:**

```bash
# Navigate to project directory (adjust path as needed)
cd /path/to/rule1-calculator

# 1. Run setup (this will create .env, install dependencies, test Ollama)
./setup-vps.sh

# 2. Test scripts (optional - takes 1-3 minutes)
./test-scripts.sh

# 3. Start backend
./start-backend.sh
```

## 🔧 What Each Script Does

### setup-vps.sh
- ✅ Creates `.env` file with your API keys
- ✅ Checks Python installation
- ✅ Installs Python dependencies (FastAPI, uvicorn, requests, dotenv, etc.)
- ✅ Tests Ollama connection
- ✅ Makes scripts executable
- ✅ Creates `.tmp` directory

### test-scripts.sh  
- ✅ Tests Tavily aggregation script
- ✅ Tests full orchestrator (Tavily + Ollama)
- ✅ Shows preview of results

### start-backend.sh
- ✅ Checks prerequisites (.env exists, dependencies installed)
- ✅ Tests Ollama connection
- ✅ Starts FastAPI backend on port 8000
- ✅ Shows API endpoints

## 📝 Manual Setup (if scripts don't work)

If you prefer to run commands manually:

```bash
# 1. Create .env file
cat > .env << 'EOF'
VITE_STOCKDATA_API_KEY=Tsdj7Z3d3OwzL1MO3UJW4uunrRGOABTzuEqQWOlj
VITE_FMP_API_KEY=6HhHKgYFoKOlDJqi4THx75eTc6w3N1xq
VITE_SCUTTLEBUTT_API_URL=http://localhost:8000
TAVILY_API_KEY=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
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2
EOF

# 2. Install dependencies
cd backend
pip3 install -r requirements.txt
cd ..

# 3. Test Ollama
curl http://localhost:11434/api/tags

# 4. Start backend
python3 -m uvicorn backend.main:app --host 0.0.0.0 --port 8000
```

## 🎯 After Backend Starts

The backend will be available at:
- **API**: `http://your-vps-ip:8000`
- **API Docs**: `http://your-vps-ip:8000/docs` (Swagger UI)
- **Health Check**: `http://your-vps-ip:8000/health`

## 🔍 Test the Backend

Once backend is running, test it:

```bash
# Health check
curl http://localhost:8000/health

# Test research endpoint (takes 1-3 minutes)
curl -X POST http://localhost:8000/fisher-research \
  -H "Content-Type: application/json" \
  -d '{"symbol": "AAPL", "companyName": "Apple Inc.", "criteriaToResearch": [2, 3, 4]}'
```

## 🚀 Production Deployment

After testing, set up as a systemd service (see `VPS_SETUP.md` for details):

1. Create `/etc/systemd/system/fisher-api.service`
2. Enable and start the service
3. Configure firewall (port 8000)
4. Set up reverse proxy (nginx) if needed

## 📚 Full Documentation

- `VPS_SETUP.md` - Complete VPS setup guide
- `RUN_ON_VPS.md` - Quick reference
- `BACKEND_SETUP.md` - Backend deployment details
- `TESTING_GUIDE.md` - Testing steps

## ⚠️ Important Notes

1. **Ollama URL**: Since n8n uses `http://host.docker.internal:11434`, Ollama runs on the host. Use `http://localhost:11434` for FastAPI.

2. **Port 8000**: Make sure port 8000 is open in your firewall.

3. **Python Path**: Scripts use `python3` - adjust if your system uses `python`.

4. **Dependencies**: Make sure `pip3` is installed and up to date.

5. **.env File**: The scripts create `.env` automatically, but you can edit it if needed.
