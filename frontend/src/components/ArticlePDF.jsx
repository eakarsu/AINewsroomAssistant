import React, { useEffect, useState } from 'react';

export default function ArticlePDF() {
  const [articles, setArticles] = useState([]);
  const [selected, setSelected] = useState('');
  const [masthead, setMasthead] = useState('THE NEWSROOM HERALD');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [lastFile, setLastFile] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch('/api/custom-views/articles', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((j) => {
        setArticles(j.data || []);
        if (j.data && j.data.length) setSelected(String(j.data[0].id));
      })
      .catch((e) => setError(e.message));
  }, []);

  const generate = async () => {
    if (!selected) {
      setError('Pick an article first');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/custom-views/article-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ article_id: Number(selected), masthead }),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Status ${res.status}`);
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `article-${selected}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      setLastFile(`article-${selected}.pdf (${(blob.size / 1024).toFixed(1)} KB)`);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <h3 style={{ margin: '0 0 12px 0', color: '#e2e8f0' }}>Article PDF Export</h3>
      <div
        style={{
          background: '#0f172a',
          border: '1px solid #1e293b',
          borderRadius: 8,
          padding: 16,
          color: '#e2e8f0',
        }}
      >
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr auto', gap: 12, alignItems: 'end' }}>
          <label style={{ display: 'flex', flexDirection: 'column', fontSize: 12, color: '#94a3b8' }}>
            Article
            <select
              value={selected}
              onChange={(e) => setSelected(e.target.value)}
              style={{
                marginTop: 4,
                padding: '8px 10px',
                background: '#1e293b',
                color: '#e2e8f0',
                border: '1px solid #334155',
                borderRadius: 4,
              }}
            >
              {articles.length === 0 && <option value="">(no articles)</option>}
              {articles.map((a) => (
                <option key={a.id} value={a.id}>
                  #{a.id} - {a.title} ({a.author || 'staff'})
                </option>
              ))}
            </select>
          </label>
          <label style={{ display: 'flex', flexDirection: 'column', fontSize: 12, color: '#94a3b8' }}>
            Masthead
            <input
              value={masthead}
              onChange={(e) => setMasthead(e.target.value)}
              style={{
                marginTop: 4,
                padding: '8px 10px',
                background: '#1e293b',
                color: '#e2e8f0',
                border: '1px solid #334155',
                borderRadius: 4,
              }}
            />
          </label>
          <button
            onClick={generate}
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
            {busy ? 'Generating...' : 'Generate PDF'}
          </button>
        </div>
        {error && <p style={{ color: '#ef4444', marginTop: 12 }}>{error}</p>}
        {lastFile && (
          <p style={{ color: '#22c55e', marginTop: 12, fontSize: 13 }}>
            Downloaded: {lastFile}
          </p>
        )}
        <p style={{ marginTop: 16, fontSize: 12, color: '#64748b' }}>
          Print-style layout includes masthead, headline, byline, dateline and justified body copy.
        </p>
      </div>
    </div>
  );
}
