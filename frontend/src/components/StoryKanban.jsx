import React, { useEffect, useState } from 'react';

const COL_LABEL = {
  pitch: 'Pitch',
  assigned: 'Assigned',
  drafting: 'Drafting',
  review: 'Review',
  published: 'Published',
};

const COL_COLOR = {
  pitch: '#6366f1',
  assigned: '#0ea5e9',
  drafting: '#f59e0b',
  review: '#a855f7',
  published: '#22c55e',
};

const PRIORITY_COLOR = {
  high: '#ef4444',
  medium: '#f59e0b',
  low: '#94a3b8',
};

export default function StoryKanban() {
  const [data, setData] = useState({ columns: [], lanes: {}, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch('/api/custom-views/story-kanban', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((j) => {
        if (j.error) throw new Error(j.error);
        setData(j);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p style={{ color: '#94a3b8' }}>Loading story queue...</p>;
  if (error) return <p style={{ color: '#ef4444' }}>Error: {error}</p>;

  return (
    <div>
      <h3 style={{ margin: '0 0 12px 0', color: '#e2e8f0' }}>
        Story Queue Kanban <span style={{ color: '#94a3b8', fontSize: 14 }}>({data.total} leads)</span>
      </h3>
      <div
        style={{
          display: 'flex',
          gap: 12,
          alignItems: 'flex-start',
          overflowX: 'auto',
          paddingBottom: 8,
        }}
      >
        {data.columns.map((col) => (
          <div
            key={col}
            style={{
              flex: '1 1 0',
              minWidth: 200,
              background: '#0f172a',
              border: '1px solid #1e293b',
              borderRadius: 8,
              padding: 10,
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 8,
                paddingBottom: 6,
                borderBottom: `2px solid ${COL_COLOR[col] || '#475569'}`,
              }}
            >
              <strong style={{ color: '#e2e8f0' }}>{COL_LABEL[col] || col}</strong>
              <span
                style={{
                  background: COL_COLOR[col] || '#475569',
                  color: '#fff',
                  fontSize: 11,
                  fontWeight: 600,
                  padding: '2px 8px',
                  borderRadius: 12,
                }}
              >
                {(data.lanes[col] || []).length}
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {(data.lanes[col] || []).map((card) => (
                <div
                  key={card.id}
                  style={{
                    background: '#1e293b',
                    borderLeft: `3px solid ${PRIORITY_COLOR[card.priority] || '#475569'}`,
                    padding: '8px 10px',
                    borderRadius: 4,
                    color: '#e2e8f0',
                  }}
                >
                  <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 4 }}>
                    {card.title}
                  </div>
                  <div style={{ fontSize: 11, color: '#94a3b8' }}>
                    {card.source || 'no-source'} - {card.category || 'general'}
                  </div>
                </div>
              ))}
              {(data.lanes[col] || []).length === 0 && (
                <div style={{ color: '#475569', fontSize: 12, fontStyle: 'italic' }}>
                  empty
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
