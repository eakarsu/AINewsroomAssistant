const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../../.env') });

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

async function callOpenRouter(systemPrompt, userMessage) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  const model = process.env.OPENROUTER_MODEL || 'anthropic/claude-haiku-4.5';

  if (!apiKey || apiKey === 'your_openrouter_api_key_here') {
    return {
      success: false,
      error: 'OpenRouter API key not configured. Please set OPENROUTER_API_KEY in .env file.',
      result: null,
    };
  }

  try {
    const response = await fetch(OPENROUTER_API_URL, {
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

    const data = await response.json();

    if (data.error) {
      return {
        success: false,
        error: data.error.message || 'OpenRouter API error',
        result: null,
      };
    }

    const content = data.choices?.[0]?.message?.content || '';
    return {
      success: true,
      error: null,
      result: content,
      model: data.model,
      usage: data.usage,
    };
  } catch (err) {
    return {
      success: false,
      error: err.message,
      result: null,
    };
  }
}

module.exports = { callOpenRouter };
