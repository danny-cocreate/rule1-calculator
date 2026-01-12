# OpenRouter Integration Guide

## Why OpenRouter Instead of Ollama?

**Benefits:**
- ✅ **No VPS Management**: Hosted service, no need to manage Ollama
- ✅ **Multiple Models**: Access to GPT-4, Claude, Llama, Mistral, etc.
- ✅ **Simple API**: Standard OpenAI-compatible API
- ✅ **Better Reliability**: Hosted with better uptime
- ✅ **Easy Model Switching**: Just change model ID
- ✅ **Unified Interface**: One API for all models

**Trade-offs:**
- ⚠️ **Cost**: Pay per use (but very affordable)
- ⚠️ **Internet Required**: Needs internet connection (not local)

## OpenRouter API Structure

**Endpoint:** `https://openrouter.ai/api/v1/chat/completions`

**Headers:**
```
Authorization: Bearer YOUR_API_KEY
Content-Type: application/json
```

**Request Body:**
```json
{
  "model": "openai/gpt-4o-mini",
  "messages": [
    {
      "role": "user",
      "content": "Your prompt here"
    }
  ],
  "response_format": { "type": "json_object" }
}
```

**Response:**
```json
{
  "choices": [
    {
      "message": {
        "content": "{\"ratings\": [...]}"
      }
    }
  ]
}
```

## Available Models

Popular models you can use:
- `openai/gpt-4o-mini` (cheapest GPT-4)
- `openai/gpt-4o`
- `anthropic/claude-3.5-sonnet`
- `meta-llama/llama-3.1-70b-instruct`
- `google/gemini-pro-1.5`
- `mistralai/mistral-large`
- And many more...

## Pricing

- Very affordable (pays for model provider's costs)
- Check pricing at: https://openrouter.ai/models
- GPT-4o-mini is very cheap (great for this use case)

## Setup Steps

1. **Get OpenRouter API Key:**
   - Sign up at: https://openrouter.ai
   - Get API key from dashboard

2. **Update n8n Workflow:**
   - Change Ollama API node to OpenRouter API
   - Update URL: `https://openrouter.ai/api/v1/chat/completions`
   - Update request body format
   - Add API key in headers

3. **Update Parse Response Function:**
   - OpenRouter returns `choices[0].message.content`
   - Adjust parsing accordingly

## Next Steps

1. **Get OpenRouter API key**
2. **Update workflow configuration**
3. **Test with sample data**
4. **Activate workflow**
