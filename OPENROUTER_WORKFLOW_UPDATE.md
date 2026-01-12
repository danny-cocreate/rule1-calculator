# OpenRouter Workflow Update Guide

## Changes Needed

**Current Setup:**
- Ollama API: `http://host.docker.internal:11434/api/generate`
- Request format: `{ model: "llama3.2", prompt: "...", stream: false, format: "json" }`
- Response format: `{ response: "..." }`

**New Setup (OpenRouter):**
- OpenRouter API: `https://openrouter.ai/api/v1/chat/completions`
- Request format: `{ model: "openai/gpt-4o-mini", messages: [{ role: "user", content: "..." }], response_format: { type: "json_object" } }`
- Response format: `{ choices: [{ message: { content: "..." } }] }`

## Step-by-Step Update

### 1. Update Ollama API Node → OpenRouter API Node

**Node Name:** Change from "Ollama API" to "OpenRouter API"

**URL:**
```
https://openrouter.ai/api/v1/chat/completions
```

**Method:** POST

**Authentication:**
- Header: `Authorization: Bearer YOUR_OPENROUTER_API_KEY`

**Headers:**
```
Authorization: Bearer YOUR_OPENROUTER_API_KEY
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "model": "openai/gpt-4o-mini",
  "messages": [
    {
      "role": "user",
      "content": "{{ $json.prompt }}"
    }
  ],
  "response_format": {
    "type": "json_object"
  }
}
```

### 2. Update Parse Response Function

**Current code** expects Ollama format:
```javascript
const ollamaResponse = $input.item.json.body || $input.item.json.response || $input.item.json;
const responseText = ollamaResponse.response || ollamaResponse.text || JSON.stringify(ollamaResponse);
```

**New code** expects OpenRouter format:
```javascript
// Parse OpenRouter response
const openrouterResponse = $input.item.json.body || $input.item.json;
const content = openrouterResponse.choices?.[0]?.message?.content || JSON.stringify(openrouterResponse);

let parsed;
try {
  parsed = typeof content === 'string' ? JSON.parse(content) : content;
} catch (e) {
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    parsed = JSON.parse(jsonMatch[0]);
  } else {
    throw new Error('No valid JSON found in response');
  }
}

const inputData = $input.item.json;
const { symbol } = inputData;

// Validate structure
if (!parsed.ratings || !Array.isArray(parsed.ratings)) {
  throw new Error('Invalid response format: ratings array not found');
}

// Format response to match Gemini format
const response = {
  symbol: symbol,
  ratings: parsed.ratings,
  researchDate: new Date().toISOString(),
  modelUsed: 'openrouter'
};

return [{ json: response }];
```

### 3. Update Format Research Data Function (Optional)

The prompt building doesn't need to change, but you might want to update the model reference in comments.

## Testing

1. **Get OpenRouter API Key:**
   - Sign up: https://openrouter.ai
   - Get key from dashboard

2. **Update workflow in n8n UI:**
   - Change Ollama API node to OpenRouter
   - Update URL and body format
   - Add API key in headers
   - Update Parse Response function

3. **Test with sample data:**
   ```json
   {
     "symbol": "AAPL",
     "companyName": "Apple Inc.",
     "criteriaToResearch": [2, 3, 4]
   }
   ```

4. **Check execution logs:**
   - Verify OpenRouter call succeeds
   - Verify response parsing works
   - Verify ratings structure

## Recommended Model

**For this use case:**
- `openai/gpt-4o-mini` - Cheapest GPT-4, great quality
- `anthropic/claude-3-haiku` - Fast and cheap
- `meta-llama/llama-3.1-70b-instruct` - Free tier available, good quality

**Best starting point:** `openai/gpt-4o-mini`
