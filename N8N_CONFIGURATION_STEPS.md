# n8n Workflow Configuration Steps

## Your Tavily API Key
✅ **API Key:** `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`

## Required Information

Before we complete the setup, I need:

1. **Ollama URL**: What's your Ollama endpoint?
   - Local: `http://localhost:11434`
   - VPS: `http://your-vps-ip:11434` or `http://your-vps-domain:11434`
   
2. **Ollama Model**: Which model do you want to use?
   - Examples: `llama3.2`, `mistral`, `qwen2.5`, `llama3.1`, etc.

## Configuration Steps

### Option 1: Environment Variables (Recommended)

1. In n8n UI: **Settings** → **Environment Variables**
2. Add:
   - `TAVILY_API_KEY` = `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`
   - `OLLAMA_URL` = `http://localhost:11434` (or your VPS endpoint)
   - `OLLAMA_MODEL` = `llama3.2` (or your preferred model)

### Option 2: Direct in Workflow (Simpler for Testing)

1. Open workflow in n8n UI
2. Edit the nodes directly and use the API key in the HTTP Request node

## Next Steps

Once you provide the Ollama URL and model name, I can:
1. Update the workflow with the correct configuration
2. Test the workflow
3. Get the webhook URL for your frontend
