# Switch Workflow to OpenRouter

## Summary

Instead of using Ollama on your VPS, use OpenRouter for a simpler, more reliable setup.

## Benefits of OpenRouter

1. **No VPS Management**: No need to manage Ollama installation
2. **Better Models**: Access to GPT-4, Claude, etc.
3. **More Reliable**: Hosted service with better uptime
4. **Simpler Setup**: Standard API, easier configuration
5. **Flexible**: Easy to switch models

## What Needs to Change

### 1. Ollama API Node → OpenRouter API Node

**Current Configuration:**
- URL: `http://host.docker.internal:11434/api/generate`
- Body: `{ model: "llama3.2", prompt: "...", stream: false, format: "json" }`

**New Configuration:**
- URL: `https://openrouter.ai/api/v1/chat/completions`
- Headers: `Authorization: Bearer YOUR_API_KEY`
- Body: `{ model: "openai/gpt-4o-mini", messages: [{ role: "user", content: "..." }], response_format: { type: "json_object" } }`

### 2. Parse Response Function

**Current:** Expects `{ response: "..." }`  
**New:** Expects `{ choices: [{ message: { content: "..." } }] }`

## Next Steps

1. **Sign up for OpenRouter**: https://openrouter.ai
2. **Get API key** from dashboard
3. **I'll update the workflow** with OpenRouter configuration
4. **Test the workflow**
5. **Activate and get webhook URL**

## Cost Considerations

- OpenRouter charges per API call (very affordable)
- GPT-4o-mini is very cheap (~$0.15 per 1M input tokens)
- For this use case, cost should be minimal
- Free tier available for some models

## Would you like me to:

1. **Update the workflow now** (I'll need your OpenRouter API key)
2. **Wait** until you have the API key
3. **Show you the changes** first so you can do it manually

Let me know!
