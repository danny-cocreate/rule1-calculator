# n8n Workflow Fixes Needed

## Current Issue

The workflow structure has a problem with collecting Tavily search results before sending to Ollama.

### Current Flow:
```
Prepare Search Queries → Tavily Search → Format Research Data → Ollama API
```

**Problem:** 
- "Prepare Search Queries" outputs multiple items (one per criterion)
- "Tavily Search" processes them sequentially (one at a time)
- "Format Research Data" expects ALL results at once using `$input.all()`

### Solutions

#### Option 1: Add Aggregate Node (Best for n8n)

Add an "Aggregate" node after Tavily Search:

```
Prepare Search Queries → Tavily Search → Aggregate → Format Research Data → Ollama API
```

**Aggregate Node Configuration:**
- Mode: "Aggregate All Items"
- Aggregate: "All Items"
- Output: Single item with all results in an array

#### Option 2: Fix Function Node

Modify "Format Research Data" function to handle items as they come, but this is more complex.

#### Option 3: Use Split In Batches (Alternative)

Use "Split In Batches" node, but this might be overkill.

## Recommended Fix: Aggregate Node

I'll add an Aggregate node to collect all Tavily results before formatting.

## What I Need

1. **Ollama URL**: Where is Ollama running?
2. **Ollama Model**: Which model name to use?
3. **Confirm**: Should I fix the workflow structure now, or wait for Ollama config?
