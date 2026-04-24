import React from 'react';

function formatMarkdown(text) {
  if (!text) return '';
  // Convert markdown-like syntax to HTML
  let html = text
    // Headers
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    // Bold with **
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    // Bullet points
    .replace(/^[-*] (.+)$/gm, '<li>$1</li>')
    // Numbered lists
    .replace(/^\d+\. (.+)$/gm, '<li>$1</li>')
    // Paragraphs (double newline)
    .replace(/\n\n/g, '</p><p>')
    // Single newlines
    .replace(/\n/g, '<br/>');

  // Wrap consecutive <li> items in <ul>
  html = html.replace(/((?:<li>.*?<\/li><br\/>?)+)/g, '<ul>$1</ul>');
  html = html.replace(/<br\/><\/ul>/g, '</ul>');
  html = html.replace(/<ul><br\/>/g, '<ul>');

  return `<p>${html}</p>`;
}

export default function AIResponse({ result, loading, error }) {
  if (loading) {
    return (
      <div className="ai-response">
        <div className="ai-loading">
          <div className="spinner"></div>
          <span>AI is analyzing... This may take a moment.</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="ai-response">
        <div className="error-msg">{error}</div>
      </div>
    );
  }

  if (!result) return null;

  return (
    <div className="ai-response">
      <div className="ai-response-header">
        <div className="ai-icon">AI</div>
        <h4>AI Analysis</h4>
        {result.model && <span className="model-tag">{result.model}</span>}
      </div>
      <div
        className="ai-response-body"
        dangerouslySetInnerHTML={{ __html: formatMarkdown(result.result) }}
      />
      {result.usage && (
        <div style={{ marginTop: 12, fontSize: 11, color: 'var(--text-dim)' }}>
          Tokens: {result.usage.prompt_tokens} prompt + {result.usage.completion_tokens} completion = {result.usage.total_tokens} total
        </div>
      )}
    </div>
  );
}
