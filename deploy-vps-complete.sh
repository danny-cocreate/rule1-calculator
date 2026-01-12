#!/bin/bash
# Complete VPS Deployment - Run this on your VPS
# This script does everything: pull code, install, configure, deploy

set -e

echo "🚀 Complete VPS Deployment for Fisher Research API"
echo "=================================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

# Get script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# Check if running as root
if [ "$EUID" -eq 0 ]; then 
   echo -e "${RED}❌ Don't run as root. Run as your user.${NC}"
   exit 1
fi

echo -e "${BLUE}📥 Step 1: Pulling latest code from GitHub...${NC}"
if git pull origin main; then
    echo -e "${GREEN}✅ Code updated${NC}"
else
    echo -e "${YELLOW}⚠️  Git pull failed (might be first time or not a git repo)${NC}"
    echo "   Continuing anyway..."
fi
echo ""

echo -e "${BLUE}📋 Step 2: Checking prerequisites...${NC}"

# Check Python
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}❌ Python 3 not found. Please install Python 3.8+${NC}"
    exit 1
fi
PYTHON_VERSION=$(python3 --version)
echo -e "${GREEN}✅ $PYTHON_VERSION${NC}"

# Check pip
if ! command -v pip3 &> /dev/null; then
    echo -e "${YELLOW}⚠️  pip3 not found. Installing...${NC}"
    sudo apt-get update && sudo apt-get install -y python3-pip || {
        echo -e "${RED}❌ Failed to install pip3${NC}"
        exit 1
    }
fi
echo -e "${GREEN}✅ pip3 available${NC}"
echo ""

echo -e "${BLUE}📦 Step 3: Installing Python dependencies...${NC}"
cd backend
pip3 install --user -r requirements.txt
cd ..
echo -e "${GREEN}✅ Dependencies installed${NC}"
echo ""

echo -e "${BLUE}📝 Step 4: Setting up environment variables...${NC}"
if [ ! -f .env ]; then
    echo "Creating .env file..."
    cat > .env << 'EOF'
# OpenRouter (for Scuttlebutt research)
OPENROUTER_API_KEY=your_openrouter_api_key_here
OPENROUTER_MODEL=openai/gpt-4o-mini

# Tavily (for web search)
TAVILY_API_KEY=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

# SEC EDGAR (for ROE calculation)
SEC_USER_AGENT=Rule1Calculator your@email.com

# Backend settings
PORT=8000
EOF
    echo -e "${YELLOW}⚠️  Created .env file. Please update it with your API keys!${NC}"
    echo ""
    echo "Press Enter to open .env in nano editor, or Ctrl+C to exit and edit manually..."
    read
    nano .env
else
    echo -e "${GREEN}✅ .env file exists${NC}"
    echo -e "${YELLOW}⚠️  Make sure it has: OPENROUTER_API_KEY, TAVILY_API_KEY, SEC_USER_AGENT${NC}"
    echo ""
    read -p "Press Enter to continue or Ctrl+C to edit .env first..."
fi
echo ""

echo -e "${BLUE}🔧 Step 5: Creating systemd service...${NC}"

# Get current user and paths
CURRENT_USER=$(whoami)
WORK_DIR=$(pwd)
PYTHON_PATH=$(which python3)

# Create systemd service file
SERVICE_FILE="/tmp/fisher-api.service"
cat > "$SERVICE_FILE" << EOF
[Unit]
Description=Fisher Research API
After=network.target

[Service]
Type=simple
User=$CURRENT_USER
WorkingDirectory=$WORK_DIR
Environment="PATH=/usr/bin:/usr/local/bin"
EnvironmentFile=$WORK_DIR/.env
ExecStart=$PYTHON_PATH -m uvicorn backend.main:app --host 0.0.0.0 --port 8000
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
EOF

echo "Installing systemd service..."
sudo cp "$SERVICE_FILE" /etc/systemd/system/fisher-api.service
sudo systemctl daemon-reload
sudo systemctl enable fisher-api
echo -e "${GREEN}✅ Systemd service created and enabled${NC}"
echo ""

echo -e "${BLUE}🔥 Step 6: Configuring firewall...${NC}"
if command -v ufw &> /dev/null; then
    sudo ufw allow 8000/tcp 2>/dev/null || echo "Port 8000 already allowed"
    echo -e "${GREEN}✅ Firewall configured${NC}"
else
    echo -e "${YELLOW}⚠️  ufw not found. Please manually allow port 8000${NC}"
fi
echo ""

echo -e "${BLUE}🚀 Step 7: Starting service...${NC}"
sudo systemctl restart fisher-api
sleep 3

# Check status
if sudo systemctl is-active --quiet fisher-api; then
    echo -e "${GREEN}✅ Service is running!${NC}"
else
    echo -e "${RED}❌ Service failed to start. Check logs:${NC}"
    echo "   sudo journalctl -u fisher-api -n 50"
    exit 1
fi
echo ""

# Get IP address
VPS_IP=$(hostname -I | awk '{print $1}' || echo "your-vps-ip")

echo "=========================================="
echo -e "${GREEN}✅ Deployment Complete!${NC}"
echo "=========================================="
echo ""
echo "📊 Service Status:"
echo "   sudo systemctl status fisher-api"
echo ""
echo "📋 View Logs:"
echo "   sudo journalctl -u fisher-api -f"
echo ""
echo "🌐 API Endpoints:"
echo "   Health: http://$VPS_IP:8000/health"
echo "   Docs:   http://$VPS_IP:8000/docs"
echo "   ROE:    http://$VPS_IP:8000/fisher-research/yahoo-roe/NVDA"
echo ""
echo "🧪 Test Commands:"
echo "   curl http://localhost:8000/health"
echo "   curl http://localhost:8000/fisher-research/yahoo-roe/NVDA"
echo ""
echo "📝 Next Step - Update Netlify:"
echo "   1. Go to: https://app.netlify.com/projects/mos-calculator2/settings/env"
echo "   2. Set VITE_SCUTTLEBUTT_API_URL = http://$VPS_IP:8000"
echo "   3. Trigger new deploy"
echo ""
