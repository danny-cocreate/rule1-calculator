#!/bin/bash
# Test Scripts on VPS
# Run this after setup-vps.sh

set -e

echo "🧪 Testing Fisher Research Scripts..."
echo ""

# Test 1: Tavily script
echo "📊 Test 1: Testing Tavily aggregation script..."
python3 execution/tavily_scuttlebutt.py "Apple Inc." --ticker AAPL
echo ""
echo "✅ Tavily script completed"
echo ""

# Test 2: Check if signals file was created
if [ -f ".tmp/scuttlebutt_signals_AAPL.json" ]; then
    echo "✅ Signals file created: .tmp/scuttlebutt_signals_AAPL.json"
    echo "   File size: $(wc -l < .tmp/scuttlebutt_signals_AAPL.json) lines"
else
    echo "⚠️  Signals file not found"
fi
echo ""

# Test 3: Full orchestrator (takes 1-3 minutes)
echo "🔄 Test 2: Testing full orchestrator (Tavily + Ollama)..."
echo "   This will take 1-3 minutes..."
python3 execution/run_scuttlebutt_company.py "Apple Inc." --ticker AAPL
echo ""
echo "✅ Full orchestrator completed"
echo ""

# Test 4: Check if result file was created
if [ -f ".tmp/scuttlebutt_AAPL.json" ]; then
    echo "✅ Research result file created: .tmp/scuttlebutt_AAPL.json"
    echo "   File size: $(wc -l < .tmp/scuttlebutt_AAPL.json) lines"
    echo "   Preview (first 30 lines):"
    head -30 .tmp/scuttlebutt_AAPL.json
else
    echo "⚠️  Result file not found"
fi
echo ""

echo "✅ All tests completed!"
echo ""
