import React, { useState, useEffect } from 'react';
import { trendingTopics, ai, extractData } from '../services/api';
import Modal from '../components/Modal';
import AIResponse from '../components/AIResponse';
import Pagination from '../components/Pagination';

const emptyForm = { topic: '', category: '', trend_score: 50, volume: 0, sentiment: 'neutral', region: 'Global', keywords: '', status: 'active' };

export default function TrendingTopics({ showToast }) {
  const [items, setItems] = useState([]);
  const [selected, setSelected] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState(null);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  useEffect(() => { load(); }, [page]);

  const load = async () => {
    try {
      const r = await trendingTopics.getAll(page, 20);
      setItems(extractData(r));
      if (r.pagination) setPagination(r.pagination);
    } catch (e) { console.error(e); }
  };

  const handleSave = async () => {
    try {
      if (editing) { await trendingTopics.update(selected.id, form); showToast('Topic updated'); }
      else { await trendingTopics.create(form); showToast('Topic created'); }
      setShowForm(false); setForm(emptyForm); setEditing(false); setSelected(null); load();
    } catch (e) { showToast(e.message, 'error'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this topic?')) return;
    try { await trendingTopics.delete(id); showToast('Topic deleted'); setSelected(null); load(); } catch (e) { showToast(e.message, 'error'); }
  };

  const handleEdit = (item) => {
    setForm({ topic: item.topic, category: item.category || '', trend_score: item.trend_score, volume: item.volume || 0, sentiment: item.sentiment || 'neutral', region: item.region || 'Global', keywords: item.keywords || '', status: item.status });
    setEditing(true); setSelected(item); setShowForm(true);
  };

  const handleAiAnalyze = async (item) => {
    setAiLoading(true); setAiError(null); setAiResult(null);
    try {
      const result = await ai.analyzeTrend({ topic: item.topic, category: item.category, keywords: item.keywords, volume: item.volume });
      if (result.success) { setAiResult(result); } else { setAiError(result.error); }
    } catch (e) { setAiError(e.message); }
    setAiLoading(false);
  };

  const sentimentColor = { positive: '#10b981', neutral: '#f59e0b', negative: '#ef4444', mixed: '#a855f7' };
  const trendColor = (score) => score >= 80 ? '#ef4444' : score >= 60 ? '#f97316' : score >= 40 ? '#f59e0b' : '#10b981';

  if (selected && !showForm) {
    return (
      <div>
        <button className="back-btn" onClick={() => { setSelected(null); setAiResult(null); setAiError(null); }}>&larr; Back to Trending Topics</button>
        <div className="detail-view">
          <div className="detail-header">
            <div>
              <h3>{selected.topic}</h3>
              <div className="card-meta" style={{ marginTop: 8 }}>
                <span className={`badge badge-${selected.status}`}>{selected.status}</span>
                {selected.category && <span className="badge" style={{ background: 'rgba(59,130,246,0.15)', color: '#3b82f6' }}>{selected.category}</span>}
                <span className="badge" style={{ background: `${sentimentColor[selected.sentiment]}20`, color: sentimentColor[selected.sentiment] }}>{selected.sentiment}</span>
              </div>
            </div>
            <div className="detail-actions">
              <button className="btn btn-ai" onClick={() => handleAiAnalyze(selected)}>AI Analyze Trend</button>
              <button className="btn btn-secondary" onClick={() => handleEdit(selected)}>Edit</button>
              <button className="btn btn-danger" onClick={() => handleDelete(selected.id)}>Delete</button>
            </div>
          </div>
          <div className="detail-grid">
            <div className="detail-field">
              <div className="field-label">Trend Score</div>
              <div className="field-value" style={{ fontSize: 28, fontWeight: 800, color: trendColor(selected.trend_score) }}>{selected.trend_score}/100</div>
              <div className="credibility-bar"><div className="credibility-fill" style={{ width: `${selected.trend_score}%`, background: trendColor(selected.trend_score) }} /></div>
            </div>
            <div className="detail-field">
              <div className="field-label">Search Volume</div>
              <div className="field-value" style={{ fontSize: 22, fontWeight: 700 }}>{(selected.volume || 0).toLocaleString()}</div>
            </div>
            <div className="detail-field">
              <div className="field-label">Sentiment</div>
              <div className="field-value" style={{ fontSize: 18, fontWeight: 700, color: sentimentColor[selected.sentiment], textTransform: 'capitalize' }}>{selected.sentiment}</div>
            </div>
            <div className="detail-field">
              <div className="field-label">Region</div>
              <div className="field-value">{selected.region || 'Global'}</div>
            </div>
          </div>
          <div className="detail-field">
            <div className="field-label">Keywords</div>
            <div className="field-value" style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {(selected.keywords || '').split(',').filter(Boolean).map((kw, i) => (
                <span key={i} className="badge" style={{ background: 'rgba(59,130,246,0.15)', color: '#3b82f6' }}>{kw.trim()}</span>
              ))}
            </div>
          </div>
          <AIResponse result={aiResult} loading={aiLoading} error={aiError} />
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Trending Topics</h2>
          <p className="subtitle">Track and analyze trending news topics with AI insights</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setForm(emptyForm); setEditing(false); setShowForm(true); }}>+ New Topic</button>
      </div>

      <div className="stats-row">
        <div className="stat-box"><div className="stat-number">{items.length}</div><div className="stat-label">Total Topics</div></div>
        <div className="stat-box"><div className="stat-number" style={{ color: '#ef4444' }}>{items.filter(i => i.trend_score >= 80).length}</div><div className="stat-label">Hot</div></div>
        <div className="stat-box"><div className="stat-number" style={{ color: '#10b981' }}>{items.filter(i => i.sentiment === 'positive').length}</div><div className="stat-label">Positive</div></div>
        <div className="stat-box"><div className="stat-number" style={{ color: '#3b82f6' }}>{items.filter(i => i.status === 'active').length}</div><div className="stat-label">Active</div></div>
      </div>

      <div className="card-grid">
        {items.map((item) => (
          <div key={item.id} className="card" onClick={() => setSelected(item)}>
            <div className="card-title">{item.topic}</div>
            <div className="card-meta">
              <span className={`badge badge-${item.status}`}>{item.status}</span>
              {item.category && <span className="badge" style={{ background: 'rgba(59,130,246,0.15)', color: '#3b82f6' }}>{item.category}</span>}
              <span className="badge" style={{ background: `${sentimentColor[item.sentiment]}20`, color: sentimentColor[item.sentiment] }}>{item.sentiment}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
              <span style={{ fontSize: 13, color: 'var(--text-dim)' }}>Trend:</span>
              <span style={{ fontWeight: 700, color: trendColor(item.trend_score) }}>{item.trend_score}</span>
              <div className="credibility-bar" style={{ flex: 1 }}><div className="credibility-fill" style={{ width: `${item.trend_score}%`, background: trendColor(item.trend_score) }} /></div>
              <span style={{ fontSize: 12, color: 'var(--text-dim)' }}>{(item.volume || 0).toLocaleString()} vol</span>
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <Modal title={editing ? 'Edit Topic' : 'New Topic'} onClose={() => { setShowForm(false); setEditing(false); }}>
          <div className="form-group">
            <label>Topic</label>
            <input className="form-control" value={form.topic} onChange={(e) => setForm({ ...form, topic: e.target.value })} placeholder="Trending topic name" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="form-group">
              <label>Category</label>
              <input className="form-control" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="e.g. Politics" />
            </div>
            <div className="form-group">
              <label>Trend Score (0-100)</label>
              <input type="number" className="form-control" min="0" max="100" value={form.trend_score} onChange={(e) => setForm({ ...form, trend_score: parseInt(e.target.value) || 0 })} />
            </div>
            <div className="form-group">
              <label>Volume</label>
              <input type="number" className="form-control" value={form.volume} onChange={(e) => setForm({ ...form, volume: parseInt(e.target.value) || 0 })} />
            </div>
            <div className="form-group">
              <label>Sentiment</label>
              <select className="form-control" value={form.sentiment} onChange={(e) => setForm({ ...form, sentiment: e.target.value })}>
                <option value="positive">Positive</option>
                <option value="neutral">Neutral</option>
                <option value="negative">Negative</option>
                <option value="mixed">Mixed</option>
              </select>
            </div>
            <div className="form-group">
              <label>Region</label>
              <input className="form-control" value={form.region} onChange={(e) => setForm({ ...form, region: e.target.value })} placeholder="e.g. Global, US, EU" />
            </div>
            <div className="form-group">
              <label>Status</label>
              <select className="form-control" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                <option value="active">Active</option>
                <option value="declining">Declining</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label>Keywords (comma-separated)</label>
            <input className="form-control" value={form.keywords} onChange={(e) => setForm({ ...form, keywords: e.target.value })} placeholder="keyword1, keyword2, keyword3" />
          </div>
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={() => { setShowForm(false); setEditing(false); }}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSave}>{editing ? 'Update' : 'Create'}</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
