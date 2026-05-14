import React, { useState, useEffect } from 'react';
import { deadlines, ai, extractData } from '../services/api';
import Modal from '../components/Modal';
import AIResponse from '../components/AIResponse';
import Pagination from '../components/Pagination';

const emptyForm = { title: '', description: '', article_title: '', priority: 'medium', due_date: '', status: 'pending', assigned_to: '' };

export default function Deadlines({ showToast }) {
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
      const r = await deadlines.getAll(page, 20);
      setItems(extractData(r));
      if (r.pagination) setPagination(r.pagination);
    } catch (e) { console.error(e); }
  };

  const handleSave = async () => {
    try {
      if (editing) { await deadlines.update(selected.id, form); showToast('Deadline updated'); }
      else { await deadlines.create(form); showToast('Deadline created'); }
      setShowForm(false); setForm(emptyForm); setEditing(false); setSelected(null); load();
    } catch (e) { showToast(e.message, 'error'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this deadline?')) return;
    try { await deadlines.delete(id); showToast('Deadline deleted'); setSelected(null); load(); } catch (e) { showToast(e.message, 'error'); }
  };

  const handleEdit = (item) => {
    setForm({
      title: item.title, description: item.description || '', article_title: item.article_title || '',
      priority: item.priority, due_date: item.due_date ? new Date(item.due_date).toISOString().slice(0, 16) : '',
      status: item.status, assigned_to: item.assigned_to || ''
    });
    setEditing(true); setSelected(item); setShowForm(true);
  };

  const handleAiPrioritize = async () => {
    setAiLoading(true); setAiError(null); setAiResult(null);
    try {
      const result = await ai.prioritizeDeadlines({ deadlines: items.map(d => ({ title: d.title, priority: d.priority, due_date: d.due_date, status: d.status, assigned_to: d.assigned_to })) });
      if (result.success) { setAiResult(result); } else { setAiError(result.error); }
    } catch (e) { setAiError(e.message); }
    setAiLoading(false);
  };

  const getTimeStatus = (dueDate) => {
    if (!dueDate) return { text: 'No date', color: 'var(--text-dim)' };
    const now = new Date();
    const due = new Date(dueDate);
    const diff = due - now;
    const hours = diff / (1000 * 60 * 60);
    if (hours < 0) return { text: 'OVERDUE', color: '#ef4444' };
    if (hours < 6) return { text: `${Math.round(hours)}h left`, color: '#ef4444' };
    if (hours < 24) return { text: `${Math.round(hours)}h left`, color: '#f59e0b' };
    const days = Math.round(hours / 24);
    return { text: `${days}d left`, color: '#10b981' };
  };

  if (selected && !showForm) {
    const ts = getTimeStatus(selected.due_date);
    return (
      <div>
        <button className="back-btn" onClick={() => { setSelected(null); setAiResult(null); setAiError(null); }}>&larr; Back to Deadlines</button>
        <div className="detail-view">
          <div className="detail-header">
            <div>
              <h3>{selected.title}</h3>
              <div className="card-meta" style={{ marginTop: 8 }}>
                <span className={`badge badge-${selected.priority}`}>{selected.priority}</span>
                <span className={`badge badge-${selected.status}`}>{selected.status.replace('_', ' ')}</span>
                <span style={{ fontWeight: 700, color: ts.color }}>{ts.text}</span>
              </div>
            </div>
            <div className="detail-actions">
              <button className="btn btn-secondary" onClick={() => handleEdit(selected)}>Edit</button>
              <button className="btn btn-danger" onClick={() => handleDelete(selected.id)}>Delete</button>
            </div>
          </div>
          <div className="detail-grid">
            <div className="detail-field">
              <div className="field-label">Article</div>
              <div className="field-value">{selected.article_title || 'N/A'}</div>
            </div>
            <div className="detail-field">
              <div className="field-label">Assigned To</div>
              <div className="field-value">{selected.assigned_to || 'Unassigned'}</div>
            </div>
            <div className="detail-field">
              <div className="field-label">Due Date</div>
              <div className="field-value" style={{ color: ts.color, fontWeight: 600 }}>{selected.due_date ? new Date(selected.due_date).toLocaleString() : 'N/A'}</div>
            </div>
            <div className="detail-field">
              <div className="field-label">Created</div>
              <div className="field-value">{new Date(selected.created_at).toLocaleString()}</div>
            </div>
          </div>
          <div className="detail-field">
            <div className="field-label">Description</div>
            <div className="field-value">{selected.description || 'No description'}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Deadline Management</h2>
          <p className="subtitle">Track and manage editorial deadlines with AI prioritization</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-ai" onClick={handleAiPrioritize}>AI Prioritize All</button>
          <button className="btn btn-primary" onClick={() => { setForm(emptyForm); setEditing(false); setShowForm(true); }}>+ New Deadline</button>
        </div>
      </div>

      <div className="stats-row">
        <div className="stat-box"><div className="stat-number">{items.length}</div><div className="stat-label">Total</div></div>
        <div className="stat-box"><div className="stat-number" style={{ color: '#ef4444' }}>{items.filter(i => i.priority === 'critical').length}</div><div className="stat-label">Critical</div></div>
        <div className="stat-box"><div className="stat-number" style={{ color: '#3b82f6' }}>{items.filter(i => i.status === 'in_progress').length}</div><div className="stat-label">In Progress</div></div>
        <div className="stat-box"><div className="stat-number" style={{ color: '#ef4444' }}>{items.filter(i => { const d = new Date(i.due_date); return d < new Date(); }).length}</div><div className="stat-label">Overdue</div></div>
      </div>

      {(aiResult || aiLoading || aiError) && (
        <div style={{ marginBottom: 24 }}>
          <AIResponse result={aiResult} loading={aiLoading} error={aiError} />
        </div>
      )}

      <div style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', overflow: 'hidden' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Article</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Due Date</th>
              <th>Assigned To</th>
              <th>Time Left</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => {
              const ts = getTimeStatus(item.due_date);
              return (
                <tr key={item.id} onClick={() => setSelected(item)}>
                  <td style={{ fontWeight: 600, color: 'var(--text-bright)' }}>{item.title}</td>
                  <td style={{ color: 'var(--text-dim)', fontSize: 13 }}>{item.article_title || '-'}</td>
                  <td><span className={`badge badge-${item.priority}`}>{item.priority}</span></td>
                  <td><span className={`badge badge-${item.status}`}>{item.status.replace('_', ' ')}</span></td>
                  <td style={{ fontSize: 13 }}>{item.due_date ? new Date(item.due_date).toLocaleString() : '-'}</td>
                  <td style={{ fontSize: 13 }}>{item.assigned_to || '-'}</td>
                  <td style={{ fontWeight: 700, color: ts.color }}>{ts.text}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {showForm && (
        <Modal title={editing ? 'Edit Deadline' : 'New Deadline'} onClose={() => { setShowForm(false); setEditing(false); }}>
          <div className="form-group">
            <label>Title</label>
            <input className="form-control" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Deadline title" />
          </div>
          <div className="form-group">
            <label>Article Title</label>
            <input className="form-control" value={form.article_title} onChange={(e) => setForm({ ...form, article_title: e.target.value })} placeholder="Related article" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
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
                <option value="not_started">Not Started</option>
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            <div className="form-group">
              <label>Due Date</label>
              <input type="datetime-local" className="form-control" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Assigned To</label>
              <input className="form-control" value={form.assigned_to} onChange={(e) => setForm({ ...form, assigned_to: e.target.value })} placeholder="Reporter name" />
            </div>
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea className="form-control" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Deadline description..." />
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
