import React, { useState, useEffect } from 'react';
import { ai } from '../services/api';
import Pagination from '../components/Pagination';

export default function AIHistory() {
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => { load(); }, [page]);

  const load = async () => {
    setLoading(true);
    try {
      const response = await ai.getHistory(page, 20);
      setItems(response.data || []);
      setPagination(response.pagination);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const formatResult = (result) => {
    if (!result) return '';
    try {
      const parsed = JSON.parse(result);
      return JSON.stringify(parsed, null, 2);
    } catch {
      return result;
    }
  };

  const endpointBadgeColor = (ep) => {
    const map = {
      'analyze-lead': '#3b82f6',
      'verify-source': '#10b981',
      'fact-check': '#f59e0b',
      'analyze-bias': '#a855f7',
      'prioritize-deadlines': '#ef4444',
      'generate-draft': '#06b6d4',
      'analyze-trend': '#f97316',
      'generate-questions': '#84cc16',
      'analyze-media': '#ec4899',
      'content-strategy': '#6366f1',
    };
    return map[ep] || '#6b7280';
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>AI History</h2>
          <p className="subtitle">Past AI analysis results and model interactions</p>
        </div>
        <button className="btn btn-secondary" onClick={load}>Refresh</button>
      </div>

      <div className="stats-row">
        <div className="stat-box">
          <div className="stat-number">{pagination ? pagination.total : items.length}</div>
          <div className="stat-label">Total AI Calls</div>
        </div>
        <div className="stat-box">
          <div className="stat-number" style={{ color: '#3b82f6' }}>{items.filter(i => i.endpoint === 'analyze-lead').length}</div>
          <div className="stat-label">Lead Analyses</div>
        </div>
        <div className="stat-box">
          <div className="stat-number" style={{ color: '#f59e0b' }}>{items.filter(i => i.endpoint === 'fact-check').length}</div>
          <div className="stat-label">Fact Checks</div>
        </div>
        <div className="stat-box">
          <div className="stat-number" style={{ color: '#a855f7' }}>{items.filter(i => i.endpoint === 'analyze-bias').length}</div>
          <div className="stat-label">Bias Analyses</div>
        </div>
      </div>

      {loading && <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-dim)' }}>Loading...</div>}

      {!loading && items.length === 0 && (
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-dim)' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>&#128065;</div>
          <div>No AI analyses yet. Run some AI tools to see history here.</div>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 16 }}>
        {items.map((item) => (
          <div
            key={item.id}
            style={{
              background: 'var(--card-bg)',
              border: '1px solid var(--border-light)',
              borderRadius: 10,
              padding: 16,
              cursor: 'pointer',
            }}
            onClick={() => setExpanded(expanded === item.id ? null : item.id)}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{
                  background: endpointBadgeColor(item.endpoint) + '22',
                  color: endpointBadgeColor(item.endpoint),
                  border: `1px solid ${endpointBadgeColor(item.endpoint)}55`,
                  borderRadius: 6,
                  padding: '2px 8px',
                  fontSize: 12,
                  fontWeight: 600,
                  fontFamily: 'monospace',
                }}>
                  {item.endpoint}
                </span>
                {item.entity_id && (
                  <span style={{ fontSize: 12, color: 'var(--text-dim)' }}>Entity #{item.entity_id}</span>
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 12, color: 'var(--text-dim)' }}>
                  {new Date(item.created_at).toLocaleString()}
                </span>
                <span style={{ color: 'var(--text-dim)', fontSize: 14 }}>
                  {expanded === item.id ? '▲' : '▼'}
                </span>
              </div>
            </div>
            {expanded === item.id && (
              <div style={{ marginTop: 12, borderTop: '1px solid var(--border-light)', paddingTop: 12 }}>
                <pre style={{
                  margin: 0,
                  fontSize: 12,
                  color: 'var(--text-dim)',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  maxHeight: 400,
                  overflowY: 'auto',
                  fontFamily: 'monospace',
                  background: 'rgba(0,0,0,0.1)',
                  padding: 12,
                  borderRadius: 6,
                }}>
                  {formatResult(item.result)}
                </pre>
              </div>
            )}
          </div>
        ))}
      </div>

      {pagination && (
        <Pagination page={page} totalPages={pagination.totalPages} onPageChange={setPage} />
      )}
    </div>
  );
}
