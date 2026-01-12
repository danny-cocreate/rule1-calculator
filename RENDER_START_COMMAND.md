# Render Start Command

## Start Command

Put this in the **Start Command** field:

```bash
cd backend && uvicorn main:app --host 0.0.0.0 --port $PORT
```

## Explanation

- `cd backend` - Navigate to the backend directory
- `uvicorn main:app` - Start FastAPI using uvicorn
- `--host 0.0.0.0` - Listen on all interfaces (required for Render)
- `--port $PORT` - Use Render's PORT environment variable (automatically set)

## Build Command

Also set the **Build Command**:

```bash
cd backend && pip install -r requirements.txt
```

## Complete Configuration

**Name**: `fisher-research-api` (or any name you prefer)

**Environment**: `Python 3`

**Build Command**:
```bash
cd backend && pip install -r requirements.txt
```

**Start Command**:
```bash
cd backend && uvicorn main:app --host 0.0.0.0 --port $PORT
```

**Root Directory**: Leave empty (or set to `.` if needed)

## Environment Variables

Add these in the Environment tab:

- `TAVILY_API_KEY` = `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`
- `OPENROUTER_API_KEY` = (your OpenRouter API key)
- `OPENROUTER_MODEL` = `openai/gpt-4o-mini` (optional, has default)

## That's It!

After setting these, click "Create Web Service" and Render will deploy your backend!
