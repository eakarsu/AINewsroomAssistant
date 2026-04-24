import React, { useState, useEffect } from 'react';
import { storyLeads, ai } from '../services/api';
import Modal from '../components/Modal';
import AIResponse from '../components/AIResponse';

const emptyForm = { title: '', source: '', category: '', priority: 'medium', status: 'new', summary: '', data_feed: '' };

export default function StoryLeads({ showToast }) {
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
    try { setItems(await storyLeads.getAll()); } catch (e) { console.error(e); }
  };

  const handleSave = async () => {
    try {
      if (editing) {
        await storyLeads.update(selected.id, form);
        showToast('Story lead updated');
      } else {
        await storyLeads.create(form);
        showToast('Story lead created');
      }
      setShowForm(false);
      setForm(emptyForm);
      setEditing(false);
      setSelected(null);
      load();
    } catch (e) { showToast(e.message, 'error'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this story lead?')) return;
    try {
      await storyLeads.delete(id);
      showToast('Story lead deleted');
      setSelected(null);
      load();
    } catch (e) { showToast(e.message, 'error'); }
  };

  const handleEdit = (item) => {
    setForm({ title: item.title, source: item.source || '', category: item.category || '', priority: item.priority, status: item.status, summary: item.summary || '', data_feed: item.data_feed || '' });
    setEditing(true);
    setSelected(item);
    setShowForm(true);
  };

  const handleAiAnalyze = async (item) => {
    setAiLoading(true);
    setAiError(null);
    setAiResult(null);
    try {
      const result = await ai.analyzeLead({ title: item.title, summary: item.summary, source: item.source });
      if (result.success) { setAiResult(result); } else { setAiError(result.error); }
    } catch (e) { setAiError(e.message); }
    setAiLoading(false);
  };

  if (selected && !showForm) {
    return (
      <div>
        <button className="back-btn" onClick={() => { setSelected(null); setAiResult(null); setAiError(null); }}>
          &larr; Back to Story Leads
        </button>
        <div className="detail-view">
          <div className="detail-header">
            <div>
              <h3>{selected.title}</h3>
              <div className="card-meta" style={{ marginTop: 8 }}>
                <span className={`badge badge-${selected.priority}`}>{selected.priority}</span>
                <span className={`badge badge-${selected.status}`}>{selected.status}</span>
                <span className="badge" style={{ background: 'rgba(59,130,246,0.15)', color: '#3b82f6' }}>{selected.category}</span>
              </div>
            </div>
            <div className="detail-actions">
              <button className="btn btn-ai" onClick={() => handleAiAnalyze(selected)}>AI Analyze</button>
              <button className="btn btn-secondary" onClick={() => handleEdit(selected)}>Edit</button>
              <button className="btn btn-danger" onClick={() => handleDelete(selected.id)}>Delete</button>
            </div>
          </div>
          <div className="detail-grid">
            <div className="detail-field">
              <div className="field-label">Source</div>
              <div className="field-value">{selected.source || 'N/A'}</div>
            </div>
            <div className="detail-field">
              <div className="field-label">Data Feed</div>
              <div className="field-value">{selected.data_feed || 'N/A'}</div>
            </div>
            <div className="detail-field">
              <div className="field-label">Created</div>
              <div className="field-value">{new Date(selected.created_at).toLocaleString()}</div>
            </div>
            <div className="detail-field">
              <div className="field-label">Updated</div>
              <div className="field-value">{new Date(selected.updated_at).toLocaleString()}</div>
            </div>
          </div>
          <div className="detail-field">
            <div className="field-label">Summary</div>
            <div className="field-value">{selected.summary || 'No summary available'}</div>
          </div>
          {selected.ai_analysis && (
            <div className="detail-field">
              <div className="field-label">Previous AI Analysis</div>
              <div className="field-value">{selected.ai_analysis}</div>
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
          <h2>Story Leads</h2>
          <p className="subtitle">AI-powered story lead identification from data feeds</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setForm(emptyForm); setEditing(false); setShowForm(true); }}>+ New Lead</button>
      </div>

      <div className="stats-row">
        <div className="stat-box"><div className="stat-number">{items.length}</div><div className="stat-label">Total Leads</div></div>
        <div className="stat-box"><div className="stat-number" style={{ color: '#ef4444' }}>{items.filter(i => i.priority === 'critical').length}</div><div className="stat-label">Critical</div></div>
        <div className="stat-box"><div className="stat-number" style={{ color: '#3b82f6' }}>{items.filter(i => i.status === 'new').length}</div><div className="stat-label">New</div></div>
        <div className="stat-box"><div className="stat-number" style={{ color: '#a855f7' }}>{items.filter(i => i.status === 'investigating').length}</div><div className="stat-label">Investigating</div></div>
      </div>

      <div className="card-grid">
        {items.map((item) => (
          <div key={item.id} className="card" onClick={() => setSelected(item)}>
            <div className="card-title">{item.title}</div>
            <div className="card-meta">
              <span className={`badge badge-${item.priority}`}>{item.priority}</span>
              <span className={`badge badge-${item.status}`}>{item.status}</span>
              {item.category && <span className="badge" style={{ background: 'rgba(59,130,246,0.15)', color: '#3b82f6' }}>{item.category}</span>}
            </div>
            <div className="card-summary">{item.summary}</div>
          </div>
        ))}
      </div>

      {showForm && (
        <Modal title={editing ? 'Edit Story Lead' : 'New Story Lead'} onClose={() => { setShowForm(false); setEditing(false); }}>
          <div className="form-group">
            <label>Title</label>
            <input className="form-control" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Story lead title" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="form-group">
              <label>Source</label>
              <input className="form-control" value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} placeholder="e.g. Reuters Wire" />
            </div>
            <div className="form-group">
              <label>Category</label>
              <input className="form-control" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="e.g. Technology" />
            </div>
            <div className="form-group">
              <label>Priority</label>
              <select className="form-control" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
            <div className="form-group">
              <label>Status</label>
              <select className="form-control" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                <option value="new">New</option>
                <option value="investigating">Investigating</option>
                <option value="assigned">Assigned</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label>Data Feed</label>
            <input className="form-control" value={form.data_feed} onChange={(e) => setForm({ ...form, data_feed: e.target.value })} placeholder="e.g. Reuters API" />
          </div>
          <div className="form-group">
            <label>Summary</label>
            <textarea className="form-control" value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} placeholder="Story lead summary..." />
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
