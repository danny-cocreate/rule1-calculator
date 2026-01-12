# Backend Connection Diagnostic Report

## Test Results

### Connection Tests
- ❌ `https://srv999305.hstgr.cloud:8000` - **Connection timeout**
- ❌ `http://srv999305.hstgr.cloud:8000` - **Connection timeout**
- ⚠️ `https://srv999305.hstgr.cloud` - Server reachable but 404 (wrong endpoint)
- ⚠️ `http://srv999305.hstgr.cloud` - Server reachable but 404 (wrong endpoint)

## Problems Identified

### 1. **Backend Not Running** ⚠️ CRITICAL
**Issue:** Port 8000 is timing out, which means the FastAPI backend is not running on the VPS.

**Evidence:**
- Connection timeouts on both HTTP and HTTPS
- Base domain is reachable (proves server is up), but port 8000 is not

**Solution:**
SSH into your VPS and start the backend:

```bash
# SSH into VPS
ssh your-user@srv999305.hstgr.cloud

# Navigate to project directory
cd /path/to/rule1-calculator

# Start backend
python3 -m uvicorn backend.main:app --host 0.0.0.0 --port 8000
```

Or use the provided script:
```bash
./start-backend.sh
```

### 2. **Port 8000 May Be Blocked by Firewall** ⚠️ POSSIBLE
**Issue:** Even if backend is running, firewall might be blocking external access to port 8000.

**Check:**
```bash
# Check if port 8000 is listening
sudo netstat -tulpn | grep 8000
# Or
sudo lsof -i :8000

# Check firewall status
sudo ufw status
# Or
sudo firewall-cmd --list-all
```

**Solution:**
```bash
# Ubuntu/Debian
sudo ufw allow 8000/tcp
sudo ufw reload

# CentOS/RHEL
sudo firewall-cmd --add-port=8000/tcp --permanent
sudo firewall-cmd --reload
```

### 3. **Backend Not Set Up as Service** ⚠️ RECOMMENDED
**Issue:** Backend needs to run continuously, not just in a terminal session.

**Solution:** Set up as systemd service (see below)

### 4. **HTTPS vs HTTP** ⚠️ NOTE
**Issue:** Port 8000 typically uses HTTP, not HTTPS. The frontend might be configured with HTTPS.

**Check Netlify Environment Variable:**
- Go to Netlify Dashboard → Site settings → Environment variables
- Check `VITE_SCUTTLEBUTT_API_URL`
- Should be: `http://srv999305.hstgr.cloud:8000` (not HTTPS)

## Step-by-Step Fix

### Step 1: SSH into VPS
```bash
ssh your-user@srv999305.hstgr.cloud
```

### Step 2: Check if Backend is Running
```bash
# Check for uvicorn process
ps aux | grep uvicorn

# Check if port 8000 is in use
sudo lsof -i :8000
```

### Step 3: Navigate to Project
```bash
cd /path/to/rule1-calculator
# Or wherever your project is located
```

### Step 4: Check .env File
```bash
cat .env
```

Should contain:
```env
TAVILY_API_KEY=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
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2
```

### Step 5: Install Dependencies (if needed)
```bash
cd backend
pip3 install -r requirements.txt
cd ..
```

### Step 6: Test Ollama Connection
```bash
curl http://localhost:11434/api/tags
```

Should return JSON with available models.

### Step 7: Start Backend
```bash
# Option A: Direct start (for testing)
python3 -m uvicorn backend.main:app --host 0.0.0.0 --port 8000

# Option B: Use provided script
./start-backend.sh
```

### Step 8: Test Backend Locally on VPS
```bash
# In another terminal on VPS
curl http://localhost:8000/health
# Should return: {"status":"healthy"}

curl http://localhost:8000/
# Should return API info
```

### Step 9: Test from Outside (from your local machine)
```bash
curl http://srv999305.hstgr.cloud:8000/health
# Should return: {"status":"healthy"}
```

### Step 10: Set Up as Service (Production)

Create systemd service:

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

Enable and start:
```bash
sudo systemctl daemon-reload
sudo systemctl enable fisher-api
sudo systemctl start fisher-api
sudo systemctl status fisher-api
```

### Step 11: Configure Firewall
```bash
# Ubuntu/Debian
sudo ufw allow 8000/tcp
sudo ufw reload

# CentOS/RHEL
sudo firewall-cmd --add-port=8000/tcp --permanent
sudo firewall-cmd --reload
```

### Step 12: Update Netlify Environment Variable
1. Go to Netlify Dashboard
2. Site settings → Environment variables
3. Set `VITE_SCUTTLEBUTT_API_URL` = `http://srv999305.hstgr.cloud:8000`
4. Trigger a new deploy

## Verification Checklist

- [ ] Backend is running (`ps aux | grep uvicorn`)
- [ ] Port 8000 is listening (`sudo lsof -i :8000`)
- [ ] Health endpoint works locally (`curl http://localhost:8000/health`)
- [ ] Health endpoint works externally (`curl http://srv999305.hstgr.cloud:8000/health`)
- [ ] Firewall allows port 8000 (`sudo ufw status`)
- [ ] Backend is set up as service (if production)
- [ ] Netlify environment variable is set correctly
- [ ] Frontend can connect (test in browser)

## Quick Test Script

Run this on your VPS to check everything:

```bash
#!/bin/bash
echo "=== Backend Diagnostic ==="
echo ""
echo "1. Checking if backend is running..."
ps aux | grep uvicorn | grep -v grep || echo "❌ Backend not running"
echo ""
echo "2. Checking if port 8000 is listening..."
sudo lsof -i :8000 || echo "❌ Port 8000 not in use"
echo ""
echo "3. Testing health endpoint locally..."
curl -s http://localhost:8000/health || echo "❌ Health check failed"
echo ""
echo "4. Checking firewall..."
sudo ufw status | grep 8000 || echo "⚠️  Port 8000 not in firewall rules"
echo ""
echo "5. Checking .env file..."
[ -f .env ] && echo "✅ .env exists" || echo "❌ .env missing"
echo ""
echo "=== Diagnostic Complete ==="
```

## Next Steps

1. **Immediate:** Start the backend on VPS
2. **Short-term:** Set up as systemd service
3. **Long-term:** Consider reverse proxy (nginx) for HTTPS
