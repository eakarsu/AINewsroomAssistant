const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../../.env') });

async function callOpenRouter(systemPrompt, userMessage) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  const model = process.env.OPENROUTER_MODEL || 'anthropic/claude-3-5-sonnet-20241022';

  if (!apiKey || apiKey === 'your_openrouter_api_key_here') {
    throw new Error('OPENROUTER_API_KEY is not configured');
  }

  try {
    const baseUrl = (process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1').replace(/\/$/, '');
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost:5173',
        'X-Title': 'AI Newsroom Assistant',
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok || data.error) throw new Error(data.error?.message || `OpenRouter HTTP ${response.status}`);

    const content = data.choices?.[0]?.message?.content;
    if (!content || !String(content).trim()) throw new Error('OpenRouter returned empty content');
    return {
      success: true,
      error: null,
      result: content,
      model: data.model,
      usage: data.usage,
    };
  } catch (err) {
    throw new Error(`OpenRouter request failed: ${err.message}`);
  }
}

module.exports = { callOpenRouter };
