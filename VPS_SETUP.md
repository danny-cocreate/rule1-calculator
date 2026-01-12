# VPS Setup Guide

## Quick Setup (3 Commands)

Run these commands on your VPS:

```bash
# 1. Run setup script
./setup-vps.sh

# 2. Test scripts (optional but recommended)
./test-scripts.sh

# 3. Start backend
./start-backend.sh
```

## Manual Setup

If you prefer manual setup:

### Step 1: Create .env File

```bash
cat > .env << 'EOF'
# Frontend Variables (VITE_*)
VITE_STOCKDATA_API_KEY=Tsdj7Z3d3OwzL1MO3UJW4uunrRGOABTzuEqQWOlj
VITE_FMP_API_KEY=6HhHKgYFoKOlDJqi4THx75eTc6w3N1xq
VITE_SCUTTLEBUTT_API_URL=http://localhost:8000

# Backend Variables (for Python scripts)
TAVILY_API_KEY=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
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2
EOF
```

### Step 2: Install Python Dependencies

```bash
cd backend
pip3 install -r requirements.txt
cd ..
```

### Step 3: Test Ollama Connection

```bash
curl http://localhost:11434/api/tags
```

Should return JSON with available models.

### Step 4: Test Scripts

```bash
# Test Tavily script
python3 execution/tavily_scuttlebutt.py "Apple Inc." --ticker AAPL

# Test full orchestrator (takes 1-3 minutes)
python3 execution/run_scuttlebutt_company.py "Apple Inc." --ticker AAPL
```

### Step 5: Start Backend

```bash
python3 -m uvicorn backend.main:app --host 0.0.0.0 --port 8000
```

## Production Deployment

### Option 1: systemd Service

Create `/etc/systemd/system/fisher-api.service`:

```ini
[Unit]
Description=Fisher Research API
After=network.target

[Service]
Type=simple
User=your-user
WorkingDirectory=/path/to/rule1-calculator
Environment="PATH=/usr/bin:/usr/local/bin"
ExecStart=/usr/bin/python3 -m uvicorn backend.main:app --host 0.0.0.0 --port 8000
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Enable and start:

```bash
sudo systemctl enable fisher-api
sudo systemctl start fisher-api
sudo systemctl status fisher-api
```

### Option 2: PM2

```bash
npm install -g pm2
pm2 start "python3 -m uvicorn backend.main:app --host 0.0.0.0 --port 8000" --name fisher-api
pm2 save
pm2 startup
```

### Option 3: Docker (if using Docker)

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  fisher-api:
    build: .
    ports:
      - "8000:8000"
    env_file:
      - .env
    volumes:
      - ./execution:/app/execution
      - ./directives:/app/directives
    restart: unless-stopped
```

## Environment Variables

Make sure your `.env` file has:

- `TAVILY_API_KEY` - Your Tavily API key
- `OLLAMA_BASE_URL` - `http://localhost:11434` (if Ollama on same host)
- `OLLAMA_MODEL` - `llama3.2`
- `VITE_SCUTTLEBUTT_API_URL` - Your production API URL (e.g., `https://api.yourdomain.com`)

## Firewall Configuration

Make sure port 8000 is open:

```bash
# Ubuntu/Debian
sudo ufw allow 8000/tcp

# CentOS/RHEL
sudo firewall-cmd --add-port=8000/tcp --permanent
sudo firewall-cmd --reload
```

## Reverse Proxy (nginx)

If using nginx:

```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## Monitoring

Check logs:

```bash
# systemd
sudo journalctl -u fisher-api -f

# PM2
pm2 logs fisher-api

# Direct
# (logs appear in terminal where you started the server)
```

## Troubleshooting

### Ollama Connection Fails

- Check Ollama is running: `curl http://localhost:11434/api/tags`
- Check firewall: `sudo ufw status`
- If Ollama in Docker, use `http://host.docker.internal:11434`

### Backend Won't Start

- Check Python dependencies: `pip3 list | grep fastapi`
- Check port is available: `lsof -i :8000`
- Check .env file exists: `cat .env`

### Scripts Fail

- Check .env file has correct variables
- Check Python path: `python3 --version`
- Check dependencies: `pip3 list | grep -E "requests|dotenv"`

## Next Steps

After backend is running:

1. Update frontend `.env` with production API URL
2. Deploy frontend (Netlify, Vercel, etc.)
3. Test integration from production frontend
