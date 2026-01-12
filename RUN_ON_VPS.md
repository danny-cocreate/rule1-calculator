# Run on VPS - Quick Commands

## Your VPS Setup

Since your workspace is in Dropbox CloudStorage, if it's synced to your VPS, the scripts are already there.

## Quick Start (3 Commands)

Run these commands on your VPS in the project directory:

```bash
# 1. Setup (creates .env, installs dependencies, tests Ollama)
./setup-vps.sh

# 2. Test scripts (optional but recommended - takes 1-3 minutes)
./test-scripts.sh

# 3. Start backend
./start-backend.sh
```

## What Each Script Does

### setup-vps.sh
- Creates `.env` file with your API keys
- Checks Python installation
- Installs Python dependencies (FastAPI, uvicorn, requests, etc.)
- Tests Ollama connection
- Makes scripts executable
- Creates `.tmp` directory

### test-scripts.sh
- Tests Tavily aggregation script
- Tests full orchestrator (Tavily + Ollama)
- Shows preview of results

### start-backend.sh
- Checks prerequisites
- Starts FastAPI backend on port 8000
- Shows API docs URL

## Manual Alternative

If scripts don't work, run manually:

```bash
# 1. Create .env
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

## After Backend Starts

The backend will be available at:
- **API**: `http://your-vps-ip:8000`
- **Docs**: `http://your-vps-ip:8000/docs`
- **Health**: `http://your-vps-ip:8000/health`

## Production Deployment

After testing, set up as a service:

### systemd (recommended)

```bash
sudo nano /etc/systemd/system/fisher-api.service
```

Paste:
```ini
[Unit]
Description=Fisher Research API
After=network.target

[Service]
Type=simple
User=your-username
WorkingDirectory=/path/to/rule1-calculator
Environment="PATH=/usr/bin:/usr/local/bin"
ExecStart=/usr/bin/python3 -m uvicorn backend.main:app --host 0.0.0.0 --port 8000
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Then:
```bash
sudo systemctl enable fisher-api
sudo systemctl start fisher-api
sudo systemctl status fisher-api
```

## Troubleshooting

### Scripts not executable
```bash
chmod +x setup-vps.sh test-scripts.sh start-backend.sh
```

### Python dependencies fail
```bash
pip3 install --upgrade pip
pip3 install -r backend/requirements.txt
```

### Ollama not accessible
```bash
# Check Ollama is running
curl http://localhost:11434/api/tags

# If Ollama in Docker, check Docker networking
docker ps | grep ollama
```

### Port 8000 already in use
```bash
# Find process using port 8000
lsof -i :8000

# Or use different port
python3 -m uvicorn backend.main:app --host 0.0.0.0 --port 8001
```
