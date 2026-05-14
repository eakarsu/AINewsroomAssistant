import React, { useState, useEffect } from 'react';
import { factChecks, ai } from '../services/api';
import { extractData } from '../services/api';
import Modal from '../components/Modal';
import AIResponse from '../components/AIResponse';
import Pagination from '../components/Pagination';

const emptyForm = { claim: '', source_article: '', status: 'pending', verdict: 'unverified', evidence: '', checked_by: '' };

export default function FactChecks({ showToast }) {
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
      const response = await factChecks.getAll(page, 20);
      setItems(extractData(response));
      if (response.pagination) setPagination(response.pagination);
    } catch (e) { console.error(e); }
  };

  const handleSave = async () => {
    try {
      if (editing) { await factChecks.update(selected.id, form); showToast('Fact check updated'); }
      else { await factChecks.create(form); showToast('Fact check created'); }
      setShowForm(false); setForm(emptyForm); setEditing(false); setSelected(null); load();
    } catch (e) { showToast(e.message, 'error'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this fact check?')) return;
    try { await factChecks.delete(id); showToast('Fact check deleted'); setSelected(null); load(); } catch (e) { showToast(e.message, 'error'); }
  };

  const handleEdit = (item) => {
    setForm({ claim: item.claim, source_article: item.source_article || '', status: item.status, verdict: item.verdict, evidence: item.evidence || '', checked_by: item.checked_by || '' });
    setEditing(true); setSelected(item); setShowForm(true);
  };

  const handleAiCheck = async (item) => {
    setAiLoading(true); setAiError(null); setAiResult(null);
    try {
      const result = await ai.factCheck({ claim: item.claim, source_article: item.source_article, evidence: item.evidence, id: item.id });
      if (result.success) { setAiResult(result); } else { setAiError(result.error); }
    } catch (e) { setAiError(e.message); }
    setAiLoading(false);
  };

  const verdictColor = (v) => {
    const map = { true: '#10b981', mostly_true: '#34d399', mixed: '#f59e0b', mostly_false: '#f87171', false: '#ef4444', unverified: '#6b7280' };
    return map[v] || '#6b7280';
  };

  if (selected && !showForm) {
    return (
      <div>
        <button className="back-btn" onClick={() => { setSelected(null); setAiResult(null); setAiError(null); }}>&larr; Back to Fact Checks</button>
        <div className="detail-view">
          <div className="detail-header">
            <div>
              <h3 style={{ maxWidth: 600 }}>{selected.claim}</h3>
              <div className="card-meta" style={{ marginTop: 8 }}>
                <span className={`badge badge-${selected.verdict}`}>{selected.verdict.replace('_', ' ')}</span>
                <span className={`badge badge-${selected.status}`}>{selected.status}</span>
              </div>
            </div>
            <div className="detail-actions">
              <button className="btn btn-ai" onClick={() => handleAiCheck(selected)}>AI Fact Check</button>
              <button className="btn btn-secondary" onClick={() => handleEdit(selected)}>Edit</button>
              <button className="btn btn-danger" onClick={() => handleDelete(selected.id)}>Delete</button>
            </div>
          </div>
          <div className="detail-grid">
            <div className="detail-field">
              <div className="field-label">Verdict</div>
              <div className="field-value" style={{ fontSize: 22, fontWeight: 800, color: verdictColor(selected.verdict), textTransform: 'uppercase' }}>{selected.verdict.replace('_', ' ')}</div>
            </div>
            <div className="detail-field">
              <div className="field-label">Source Article</div>
              <div className="field-value">{selected.source_article || 'N/A'}</div>
            </div>
            <div className="detail-field">
              <div className="field-label">Checked By</div>
              <div className="field-value">{selected.checked_by || 'N/A'}</div>
            </div>
            <div className="detail-field">
              <div className="field-label">Created</div>
              <div className="field-value">{new Date(selected.created_at).toLocaleString()}</div>
            </div>
          </div>
          <div className="detail-field">
            <div className="field-label">Evidence</div>
            <div className="field-value">{selected.evidence || 'No evidence recorded'}</div>
          </div>
          {selected.ai_analysis && (
            <div className="detail-field" style={{ marginTop: 16 }}>
              <div className="field-label">AI Analysis</div>
              <div style={{ background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.25)', borderRadius: 8, padding: 16, marginTop: 8 }}>
                <pre style={{ margin: 0, fontSize: 12, color: 'var(--text-dim)', whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>
                  {(() => { try { return JSON.stringify(JSON.parse(selected.ai_analysis), null, 2); } catch { return selected.ai_analysis; } })()}
                </pre>
              </div>
            </div>
          )}
          <AIResponse result={aiResult} loading={aiLoading} error={aiError} />
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Fact Checking</h2>
          <p className="subtitle">Automated fact-checking and claim verification</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setForm(emptyForm); setEditing(false); setShowForm(true); }}>+ New Fact Check</button>
      </div>

      <div className="stats-row">
        <div className="stat-box"><div className="stat-number">{pagination ? pagination.total : items.length}</div><div className="stat-label">Total Claims</div></div>
        <div className="stat-box"><div className="stat-number" style={{ color: '#10b981' }}>{items.filter(i => i.verdict === 'true' || i.verdict === 'mostly_true').length}</div><div className="stat-label">True/Mostly True</div></div>
        <div className="stat-box"><div className="stat-number" style={{ color: '#ef4444' }}>{items.filter(i => i.verdict === 'false' || i.verdict === 'mostly_false').length}</div><div className="stat-label">False/Mostly False</div></div>
        <div className="stat-box"><div className="stat-number" style={{ color: '#3b82f6' }}>{items.filter(i => i.status === 'in_progress').length}</div><div className="stat-label">In Progress</div></div>
      </div>

      <div className="card-grid">
        {items.map((item) => (
          <div key={item.id} className="card" onClick={() => setSelected(item)}>
            <div className="card-title">{item.claim}</div>
            <div className="card-meta">
              <span className={`badge badge-${item.verdict}`}>{item.verdict.replace('_', ' ')}</span>
              <span className={`badge badge-${item.status}`}>{item.status}</span>
            </div>
            <div className="card-summary">{item.evidence}</div>
            {item.ai_analysis && (
              <div style={{ marginTop: 8, fontSize: 12, color: '#a855f7' }}>AI analysis available</div>
            )}
            {item.checked_by && <div style={{ marginTop: 4, fontSize: 12, color: 'var(--text-dim)' }}>Checked by: {item.checked_by}</div>}
          </div>
        ))}
      </div>

      {pagination && (
        <Pagination page={page} totalPages={pagination.totalPages} onPageChange={setPage} />
      )}

      {showForm && (
        <Modal title={editing ? 'Edit Fact Check' : 'New Fact Check'} onClose={() => { setShowForm(false); setEditing(false); }}>
          <div className="form-group">
            <label>Claim</label>
            <textarea className="form-control" value={form.claim} onChange={(e) => setForm({ ...form, claim: e.target.value })} placeholder="The claim to fact-check..." />
          </div>
          <div className="form-group">
            <label>Source Article</label>
            <input className="form-control" value={form.source_article} onChange={(e) => setForm({ ...form, source_article: e.target.value })} placeholder="Where was this claimed?" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="form-group">
              <label>Status</label>
              <select className="form-control" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            <div className="form-group">
              <label>Verdict</label>
              <select className="form-control" value={form.verdict} onChange={(e) => setForm({ ...form, verdict: e.target.value })}>
                <option value="unverified">Unverified</option>
                <option value="true">True</option>
                <option value="mostly_true">Mostly True</option>
                <option value="mixed">Mixed</option>
                <option value="mostly_false">Mostly False</option>
                <option value="false">False</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label>Checked By</label>
            <input className="form-control" value={form.checked_by} onChange={(e) => setForm({ ...form, checked_by: e.target.value })} placeholder="Reviewer name" />
          </div>
          <div className="form-group">
            <label>Evidence</label>
            <textarea className="form-control" value={form.evidence} onChange={(e) => setForm({ ...form, evidence: e.target.value })} placeholder="Supporting evidence..." />
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
