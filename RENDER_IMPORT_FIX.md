# Render Import Error Fix

## Problem
`ImportError: attempted relative import with no known parent package`

This happens because relative imports (`from .routes import fisher`) don't work when uvicorn runs the module directly.

## Solution 1: Fixed Imports (Current)

Changed relative imports to absolute imports:
- `from .routes import fisher` → `from routes import fisher`
- `from ..services.scuttlebutt` → `from services.scuttlebutt`

**Updated start command** to set PYTHONPATH:
```bash
cd backend && PYTHONPATH=/opt/render/project/src:$PYTHONPATH python -m uvicorn main:app --host 0.0.0.0 --port $PORT
```

## Solution 2: Single-File Backend (Simpler Alternative)

Created `backend/app_simple.py` - everything in one file:
- ✅ No import issues
- ✅ Easier to deploy
- ✅ Easier to understand

**To use it**, change Render start command to:
```bash
cd backend && python -m uvicorn app_simple:app --host 0.0.0.0 --port $PORT
```

## Recommendation

Try **Solution 1** first (already applied). If it still fails, switch to **Solution 2** (single-file) - it's guaranteed to work and much simpler.
