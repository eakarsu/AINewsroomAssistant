import React, { useState } from 'react';

const SAMPLE = `The President met with Senator smith on January 5 to discuss reform.
Over 75% of voters polled said they support apples, oranges, and pears.
The mayor will speak March. 15 about the new budget proposal.`;

const RULE_COLOR = {
  'oxford-comma': '#f59e0b',
  'percent-symbol': '#6366f1',
  'date-format': '#22c55e',
  'title-case': '#ef4444',
  'over-vs-more-than': '#a855f7',
};

export default function APStyleChecker() {
  const [text, setText] = useState(SAMPLE);
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const check = async () => {
    setBusy(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/custom-views/ap-style-check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ text }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || `Status ${res.status}`);
      setResult(j);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <h3 style={{ margin: '0 0 12px 0', color: '#e2e8f0' }}>AP Style Checker</h3>
      <div
        style={{
          background: '#0f172a',
          border: '1px solid #1e293b',
          borderRadius: 8,
          padding: 16,
          color: '#e2e8f0',
        }}
      >
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={8}
          placeholder="Paste copy here..."
          style={{
            width: '100%',
            background: '#1e293b',
            color: '#e2e8f0',
            border: '1px solid #334155',
            borderRadius: 4,
            padding: 10,
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
            fontSize: 13,
            resize: 'vertical',
          }}
        />
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginTop: 10 }}>
          <button
            onClick={check}
            disabled={busy}
            style={{
              padding: '10px 18px',
              background: busy ? '#475569' : '#6366f1',
              color: '#fff',
              border: 'none',
              borderRadius: 4,
              cursor: busy ? 'wait' : 'pointer',
              fontWeight: 600,
            }}
          >
            {busy ? 'Checking...' : 'Check'}
          </button>
          {result && (
            <span style={{ color: '#94a3b8', fontSize: 13 }}>
              {result.issue_count} issues across {result.line_count} lines
            </span>
          )}
        </div>
        {error && <p style={{ color: '#ef4444', marginTop: 12 }}>{error}</p>}
        {result && (
          <div style={{ marginTop: 16 }}>
            {result.issues.length === 0 ? (
              <p style={{ color: '#22c55e' }}>No AP-style violations detected.</p>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ color: '#94a3b8', textAlign: 'left' }}>
                    <th style={{ padding: '6px 8px', borderBottom: '1px solid #334155' }}>Line:Col</th>
                    <th style={{ padding: '6px 8px', borderBottom: '1px solid #334155' }}>Rule</th>
                    <th style={{ padding: '6px 8px', borderBottom: '1px solid #334155' }}>Snippet</th>
                    <th style={{ padding: '6px 8px', borderBottom: '1px solid #334155' }}>Suggestion</th>
                  </tr>
                </thead>
                <tbody>
                  {result.issues.map((iss, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #1e293b' }}>
                      <td style={{ padding: '6px 8px', color: '#94a3b8', fontFamily: 'monospace' }}>
                        {iss.line}:{iss.col}
                      </td>
                      <td style={{ padding: '6px 8px' }}>
                        <span
                          style={{
                            background: RULE_COLOR[iss.rule] || '#475569',
                            color: '#fff',
                            padding: '2px 8px',
                            borderRadius: 12,
                            fontSize: 11,
                            fontWeight: 600,
                          }}
                        >
                          {iss.rule}
                        </span>
                      </td>
                      <td style={{ padding: '6px 8px', fontFamily: 'monospace', color: '#fbbf24' }}>
                        {iss.snippet}
                      </td>
                      <td style={{ padding: '6px 8px', color: '#e2e8f0' }}>{iss.suggestion}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
