# Netlify Functions Backend - No VPS Needed!

## Overview

Convert the FastAPI backend to Netlify Functions, eliminating the need for a VPS.

## Architecture

```
Frontend (Netlify)
  ↓
Netlify Function: /api/fisher-research
  ↓
Python script (Tavily + OpenRouter)
  ↓
Returns results to frontend
```

## Setup Steps

### 1. Create Netlify Functions Directory

```bash
mkdir -p netlify/functions
```

### 2. Create Function File

Create `netlify/functions/fisher-research.py`:

```python
import json
import os
import sys
from datetime import datetime

# Add execution directory to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '../../execution'))

from tavily_scuttlebutt import aggregate_stakeholder_signals
from openrouter_scuttlebutt_analysis import analyze_signals_with_openrouter


def handler(event, context):
    """Netlify Function handler for Fisher research."""
    try:
        # Parse request
        body = json.loads(event.get('body', '{}'))
        symbol = body.get('symbol')
        company_name = body.get('companyName')
        
        if not symbol or not company_name:
            return {
                'statusCode': 400,
                'body': json.dumps({'error': 'Missing symbol or companyName'})
            }
        
        # Step 1: Aggregate Tavily signals
        signals = aggregate_stakeholder_signals(
            company_name=company_name,
            ticker=symbol,
            max_results_per_bucket=5
        )
        
        # Step 2: Analyze with OpenRouter
        signals_data = {
            'signals': signals,
            'companyName': company_name,
            'ticker': symbol,
            'researchDate': datetime.now().isoformat()
        }
        
        result = analyze_signals_with_openrouter(signals_data)
        
        # Return response
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'symbol': symbol,
                'ratings': result['ratings'],
                'researchDate': result['researchDate'],
                'modelUsed': result['modelUsed']
            })
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'body': json.dumps({'error': str(e)})
        }
```

### 3. Update netlify.toml

Add functions configuration:

```toml
[build]
  functions = "netlify/functions"

[functions]
  node_bundler = "esbuild"
  included_files = ["execution/**", "directives/**"]
```

### 4. Install Python Runtime

Netlify Functions support Python via:
- **Option A**: Use Node.js wrapper (call Python via subprocess)
- **Option B**: Use Deno (supports Python)
- **Option C**: Use Go (call Python)

**Recommended: Node.js wrapper** (simplest)

Create `netlify/functions/fisher-research.js`:

```javascript
const { spawn } = require('child_process');
const path = require('path');

exports.handler = async (event, context) => {
  return new Promise((resolve, reject) => {
    const python = spawn('python3', [
      path.join(__dirname, 'fisher-research.py'),
      event.body
    ]);
    
    let output = '';
    let error = '';
    
    python.stdout.on('data', (data) => {
      output += data.toString();
    });
    
    python.stderr.on('data', (data) => {
      error += data.toString();
    });
    
    python.on('close', (code) => {
      if (code !== 0) {
        resolve({
          statusCode: 500,
          body: JSON.stringify({ error: error || 'Python script failed' })
        });
      } else {
        resolve({
          statusCode: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          },
          body: output
        });
      }
    });
  });
};
```

### 5. Environment Variables

Add to Netlify:
- `TAVILY_API_KEY`
- `OPENROUTER_API_KEY`
- `OPENROUTER_MODEL` (optional, defaults to gpt-4o-mini)

### 6. Update Frontend

Change `VITE_SCUTTLEBUTT_API_URL` to:
```
/.netlify/functions/fisher-research
```

Or use relative path (same domain):
```javascript
const SCUTTLEBUTT_API_URL = '/.netlify/functions/fisher-research';
```

## Timeout Handling

Netlify Functions have timeout limits:
- Free: 10 seconds
- Pro: 26 seconds

**Solution: Background Functions**

For longer operations, use Netlify Background Functions:

1. **Trigger function** - Starts job, returns immediately
2. **Background function** - Runs research (up to 15 min)
3. **Polling** - Frontend polls for results

Or use **Vercel** which has 60s timeout (might be enough).

## Alternative: Vercel Functions

If Netlify timeout is too short, use Vercel:

1. Create `api/fisher-research.py`
2. Deploy to Vercel
3. Update frontend to call Vercel URL

Vercel has 60s timeout (free tier), which might be enough for research.

## Next Steps

1. **Get OpenRouter API key** (https://openrouter.ai)
2. **Choose platform** (Netlify Functions or Vercel)
3. **Convert backend code**
4. **Deploy and test**
