# Quick VPS Deployment - Copy & Paste

## Step 1: SSH into your VPS

```bash
ssh your-user@srv999305.hstgr.cloud
```

## Step 2: Navigate to project and pull latest

```bash
cd /path/to/rule1-calculator
git pull origin main
```

## Step 3: Run deployment script

```bash
chmod +x deploy-vps.sh
./deploy-vps.sh
```

The script will:
- ✅ Check prerequisites
- ✅ Install dependencies
- ✅ Create .env file (you'll need to edit it)
- ✅ Set up systemd service
- ✅ Configure firewall
- ✅ Start the service

## Step 4: Edit .env file

When prompted, edit the .env file with your API keys:

```bash
nano .env
```

Update these values:
- `OPENROUTER_API_KEY` - Your OpenRouter API key
- `TAVILY_API_KEY` - Already set to: `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`
- `SEC_USER_AGENT` - Update email: `Rule1Calculator your@email.com`

Save and exit (Ctrl+X, then Y, then Enter)

## Step 5: Verify deployment

```bash
# Check service status
sudo systemctl status fisher-api

# Test health endpoint
curl http://localhost:8000/health

# Test ROE endpoint
curl http://localhost:8000/fisher-research/yahoo-roe/NVDA
```

## Step 6: Update Netlify

1. Go to: https://app.netlify.com/projects/mos-calculator2/settings/env
2. Update `VITE_SCUTTLEBUTT_API_URL` to: `http://srv999305.hstgr.cloud:8000`
3. Trigger new deploy

## All-in-One Command (if you're already in the project directory)

```bash
git pull origin main && chmod +x deploy-vps.sh && ./deploy-vps.sh
```

## Troubleshooting

If something fails:

```bash
# Check logs
sudo journalctl -u fisher-api -n 50

# Restart service
sudo systemctl restart fisher-api

# Check if port is open
sudo ufw status
```
