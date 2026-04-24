import React, { useState, useEffect } from 'react';
import { biasReports, ai } from '../services/api';
import Modal from '../components/Modal';
import AIResponse from '../components/AIResponse';

const emptyForm = { article_title: '', article_content: '', bias_type: '', severity: 'low', suggestions: '', status: 'pending' };

export default function BiasReports({ showToast }) {
  const [items, setItems] = useState([]);
  const [selected, setSelected] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState(null);

  useEffect(() => { load(); }, []);

  const load = async () => {
    try { setItems(await biasReports.getAll()); } catch (e) { console.error(e); }
  };

  const handleSave = async () => {
    try {
      if (editing) { await biasReports.update(selected.id, form); showToast('Bias report updated'); }
      else { await biasReports.create(form); showToast('Bias report created'); }
      setShowForm(false); setForm(emptyForm); setEditing(false); setSelected(null); load();
    } catch (e) { showToast(e.message, 'error'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this bias report?')) return;
    try { await biasReports.delete(id); showToast('Bias report deleted'); setSelected(null); load(); } catch (e) { showToast(e.message, 'error'); }
  };

  const handleEdit = (item) => {
    setForm({ article_title: item.article_title, article_content: item.article_content || '', bias_type: item.bias_type || '', severity: item.severity, suggestions: item.suggestions || '', status: item.status });
    setEditing(true); setSelected(item); setShowForm(true);
  };

  const handleAiAnalyze = async (item) => {
    setAiLoading(true); setAiError(null); setAiResult(null);
    try {
      const result = await ai.analyzeBias({ article_title: item.article_title, article_content: item.article_content });
      if (result.success) { setAiResult(result); } else { setAiError(result.error); }
    } catch (e) { setAiError(e.message); }
    setAiLoading(false);
  };

  const severityColor = { low: '#10b981', medium: '#f59e0b', high: '#f97316', critical: '#ef4444' };

  if (selected && !showForm) {
    return (
      <div>
        <button className="back-btn" onClick={() => { setSelected(null); setAiResult(null); setAiError(null); }}>&larr; Back to Bias Reports</button>
        <div className="detail-view">
          <div className="detail-header">
            <div>
              <h3>{selected.article_title}</h3>
              <div className="card-meta" style={{ marginTop: 8 }}>
                <span className={`badge badge-${selected.severity}`}>{selected.severity} severity</span>
                <span className={`badge badge-${selected.status}`}>{selected.status}</span>
                {selected.bias_type && <span className="badge" style={{ background: 'rgba(168,85,247,0.15)', color: '#a855f7' }}>{selected.bias_type}</span>}
              </div>
            </div>
            <div className="detail-actions">
              <button className="btn btn-ai" onClick={() => handleAiAnalyze(selected)}>AI Analyze Bias</button>
              <button className="btn btn-secondary" onClick={() => handleEdit(selected)}>Edit</button>
              <button className="btn btn-danger" onClick={() => handleDelete(selected.id)}>Delete</button>
            </div>
          </div>
          <div className="detail-grid">
            <div className="detail-field">
              <div className="field-label">Bias Type</div>
              <div className="field-value" style={{ textTransform: 'capitalize' }}>{selected.bias_type || 'N/A'}</div>
            </div>
            <div className="detail-field">
              <div className="field-label">Severity</div>
              <div className="field-value" style={{ fontSize: 22, fontWeight: 800, color: severityColor[selected.severity], textTransform: 'uppercase' }}>{selected.severity}</div>
            </div>
            <div className="detail-field">
              <div className="field-label">Status</div>
              <div className="field-value" style={{ textTransform: 'capitalize' }}>{selected.status}</div>
            </div>
            <div className="detail-field">
              <div className="field-label">Created</div>
              <div className="field-value">{new Date(selected.created_at).toLocaleString()}</div>
            </div>
          </div>
          <div className="detail-field">
            <div className="field-label">Article Content</div>
            <div className="field-value" style={{ fontStyle: 'italic', borderLeft: '3px solid var(--border-light)', paddingLeft: 16 }}>{selected.article_content || 'No content available'}</div>
          </div>
          <div className="detail-field" style={{ marginTop: 20 }}>
            <div className="field-label">Suggestions</div>
            <div className="field-value">{selected.suggestions || 'No suggestions'}</div>
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
          <h2>Bias Detection</h2>
          <p className="subtitle">AI-powered bias analysis and detection in articles</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setForm(emptyForm); setEditing(false); setShowForm(true); }}>+ New Report</button>
      </div>

      <div className="stats-row">
        <div className="stat-box"><div className="stat-number">{items.length}</div><div className="stat-label">Total Reports</div></div>
        <div className="stat-box"><div className="stat-number" style={{ color: '#ef4444' }}>{items.filter(i => i.status === 'flagged').length}</div><div className="stat-label">Flagged</div></div>
        <div className="stat-box"><div className="stat-number" style={{ color: '#10b981' }}>{items.filter(i => i.status === 'reviewed').length}</div><div className="stat-label">Reviewed</div></div>
        <div className="stat-box"><div className="stat-number" style={{ color: '#f97316' }}>{items.filter(i => i.severity === 'high' || i.severity === 'critical').length}</div><div className="stat-label">High/Critical</div></div>
      </div>

      <div className="card-grid">
        {items.map((item) => (
          <div key={item.id} className="card" onClick={() => setSelected(item)}>
            <div className="card-title">{item.article_title}</div>
            <div className="card-meta">
              <span className={`badge badge-${item.severity}`}>{item.severity}</span>
              <span className={`badge badge-${item.status}`}>{item.status}</span>
              {item.bias_type && <span className="badge" style={{ background: 'rgba(168,85,247,0.15)', color: '#a855f7' }}>{item.bias_type}</span>}
            </div>
            <div className="card-summary">{item.article_content}</div>
            {item.suggestions && <div style={{ marginTop: 8, fontSize: 12, color: '#f59e0b' }}>Suggestion: {item.suggestions.substring(0, 80)}...</div>}
          </div>
        ))}
      </div>

      {showForm && (
        <Modal title={editing ? 'Edit Bias Report' : 'New Bias Report'} onClose={() => { setShowForm(false); setEditing(false); }}>
          <div className="form-group">
            <label>Article Title</label>
            <input className="form-control" value={form.article_title} onChange={(e) => setForm({ ...form, article_title: e.target.value })} placeholder="Title of the article to analyze" />
          </div>
          <div className="form-group">
            <label>Article Content</label>
            <textarea className="form-control" style={{ minHeight: 150 }} value={form.article_content} onChange={(e) => setForm({ ...form, article_content: e.target.value })} placeholder="Paste the article content here..." />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
            <div className="form-group">
              <label>Bias Type</label>
              <select className="form-control" value={form.bias_type} onChange={(e) => setForm({ ...form, bias_type: e.target.value })}>
                <option value="">Select type</option>
                <option value="framing">Framing</option>
                <option value="selection">Selection</option>
                <option value="confirmation">Confirmation</option>
                <option value="political">Political</option>
                <option value="sensationalism">Sensationalism</option>
                <option value="nationalism">Nationalism</option>
              </select>
            </div>
            <div className="form-group">
              <label>Severity</label>
              <select className="form-control" value={form.severity} onChange={(e) => setForm({ ...form, severity: e.target.value })}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
            <div className="form-group">
              <label>Status</label>
              <select className="form-control" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                <option value="pending">Pending</option>
                <option value="reviewed">Reviewed</option>
                <option value="flagged">Flagged</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label>Suggestions</label>
            <textarea className="form-control" value={form.suggestions} onChange={(e) => setForm({ ...form, suggestions: e.target.value })} placeholder="Improvement suggestions..." />
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
