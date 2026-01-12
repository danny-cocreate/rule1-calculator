#!/bin/bash
# VPS Setup Script for AGENTS.md + FastAPI
# Run this on your VPS

set -e  # Exit on error

echo "🚀 Setting up Fisher Research Backend on VPS..."
echo ""

# Step 1: Create .env file
echo "📝 Step 1: Creating .env file..."
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
echo "✅ .env file created"
echo ""

# Step 2: Check Python
echo "🐍 Step 2: Checking Python..."
if command -v python3 &> /dev/null; then
    PYTHON_VERSION=$(python3 --version)
    echo "✅ Python found: $PYTHON_VERSION"
else
    echo "❌ Python 3 not found. Please install Python 3.8+"
    exit 1
fi
echo ""

# Step 3: Install Python dependencies
echo "📦 Step 3: Installing Python dependencies..."
cd backend
if [ -f "requirements.txt" ]; then
    pip3 install -r requirements.txt
    echo "✅ Python dependencies installed"
else
    echo "❌ requirements.txt not found in backend/"
    exit 1
fi
cd ..
echo ""

# Step 4: Test Ollama connection
echo "🦙 Step 4: Testing Ollama connection..."
if curl -s http://localhost:11434/api/tags > /dev/null; then
    echo "✅ Ollama is accessible"
    echo "   Available models:"
    curl -s http://localhost:11434/api/tags | python3 -m json.tool 2>/dev/null | grep -E '"name"' | head -5 || echo "   (Could not parse models list)"
else
    echo "⚠️  Warning: Ollama not accessible at http://localhost:11434"
    echo "   Make sure Ollama is running: curl http://localhost:11434/api/tags"
fi
echo ""

# Step 5: Make scripts executable
echo "🔧 Step 5: Making scripts executable..."
chmod +x execution/*.py 2>/dev/null || true
echo "✅ Scripts are executable"
echo ""

# Step 6: Create .tmp directory
echo "📁 Step 6: Creating .tmp directory..."
mkdir -p .tmp
echo "✅ .tmp directory created"
echo ""

echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Test Tavily script: python3 execution/tavily_scuttlebutt.py 'Apple Inc.' --ticker AAPL"
echo "2. Test full orchestrator: python3 execution/run_scuttlebutt_company.py 'Apple Inc.' --ticker AAPL"
echo "3. Start FastAPI backend: python3 -m uvicorn backend.main:app --host 0.0.0.0 --port 8000"
echo ""
