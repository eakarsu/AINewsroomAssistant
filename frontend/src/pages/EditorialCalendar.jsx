import React, { useState, useEffect } from 'react';
import { editorialCalendar, ai, extractData } from '../services/api';
import Modal from '../components/Modal';
import AIResponse from '../components/AIResponse';
import Pagination from '../components/Pagination';

const emptyForm = { title: '', section: '', publish_date: '', content_type: 'article', assigned_to: '', status: 'planned', priority: 'medium', description: '' };

export default function EditorialCalendar({ showToast }) {
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
      const r = await editorialCalendar.getAll(page, 20);
      setItems(extractData(r));
      if (r.pagination) setPagination(r.pagination);
    } catch (e) { console.error(e); }
  };

  const handleSave = async () => {
    try {
      if (editing) { await editorialCalendar.update(selected.id, form); showToast('Entry updated'); }
      else { await editorialCalendar.create(form); showToast('Entry created'); }
      setShowForm(false); setForm(emptyForm); setEditing(false); setSelected(null); load();
    } catch (e) { showToast(e.message, 'error'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this entry?')) return;
    try { await editorialCalendar.delete(id); showToast('Entry deleted'); setSelected(null); load(); } catch (e) { showToast(e.message, 'error'); }
  };

  const handleEdit = (item) => {
    setForm({ title: item.title, section: item.section || '', publish_date: item.publish_date ? new Date(item.publish_date).toISOString().slice(0, 16) : '', content_type: item.content_type || 'article', assigned_to: item.assigned_to || '', status: item.status, priority: item.priority, description: item.description || '' });
    setEditing(true); setSelected(item); setShowForm(true);
  };

  const handleAiStrategy = async () => {
    setAiLoading(true); setAiError(null); setAiResult(null);
    try {
      const result = await ai.contentStrategy({ entries: items.map(e => ({ title: e.title, section: e.section, publish_date: e.publish_date, content_type: e.content_type, status: e.status, priority: e.priority })) });
      if (result.success) { setAiResult(result); } else { setAiError(result.error); }
    } catch (e) { setAiError(e.message); }
    setAiLoading(false);
  };

  const typeIcon = { article: '\u{1F4DD}', feature: '\u2B50', opinion: '\u{1F4AC}', investigation: '\u{1F50D}', breaking: '\u26A1', multimedia: '\u{1F3AC}', podcast: '\u{1F3A7}', newsletter: '\u{1F4E7}' };

  if (selected && !showForm) {
    return (
      <div>
        <button className="back-btn" onClick={() => { setSelected(null); setAiResult(null); setAiError(null); }}>&larr; Back to Calendar</button>
        <div className="detail-view">
          <div className="detail-header">
            <div>
              <h3>{selected.title}</h3>
              <div className="card-meta" style={{ marginTop: 8 }}>
                <span className={`badge badge-${selected.priority}`}>{selected.priority}</span>
                <span className={`badge badge-${selected.status}`}>{selected.status}</span>
                <span className="badge" style={{ background: 'rgba(59,130,246,0.15)', color: '#3b82f6' }}>{selected.content_type}</span>
              </div>
            </div>
            <div className="detail-actions">
              <button className="btn btn-secondary" onClick={() => handleEdit(selected)}>Edit</button>
              <button className="btn btn-danger" onClick={() => handleDelete(selected.id)}>Delete</button>
            </div>
          </div>
          <div className="detail-grid">
            <div className="detail-field">
              <div className="field-label">Section</div>
              <div className="field-value">{selected.section || 'N/A'}</div>
            </div>
            <div className="detail-field">
              <div className="field-label">Content Type</div>
              <div className="field-value">{typeIcon[selected.content_type] || ''} {selected.content_type}</div>
            </div>
            <div className="detail-field">
              <div className="field-label">Publish Date</div>
              <div className="field-value">{selected.publish_date ? new Date(selected.publish_date).toLocaleString() : 'TBD'}</div>
            </div>
            <div className="detail-field">
              <div className="field-label">Assigned To</div>
              <div className="field-value">{selected.assigned_to || 'Unassigned'}</div>
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
          <h2>Editorial Calendar</h2>
          <p className="subtitle">Plan and schedule content with AI strategy recommendations</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-ai" onClick={handleAiStrategy}>AI Content Strategy</button>
          <button className="btn btn-primary" onClick={() => { setForm(emptyForm); setEditing(false); setShowForm(true); }}>+ New Entry</button>
        </div>
      </div>

      <div className="stats-row">
        <div className="stat-box"><div className="stat-number">{items.length}</div><div className="stat-label">Total Entries</div></div>
        <div className="stat-box"><div className="stat-number" style={{ color: '#3b82f6' }}>{items.filter(i => i.status === 'planned').length}</div><div className="stat-label">Planned</div></div>
        <div className="stat-box"><div className="stat-number" style={{ color: '#f59e0b' }}>{items.filter(i => i.status === 'in_production').length}</div><div className="stat-label">In Production</div></div>
        <div className="stat-box"><div className="stat-number" style={{ color: '#10b981' }}>{items.filter(i => i.status === 'published').length}</div><div className="stat-label">Published</div></div>
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
              <th>Section</th>
              <th>Type</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Publish Date</th>
              <th>Assigned To</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} onClick={() => setSelected(item)}>
                <td style={{ fontWeight: 600, color: 'var(--text-bright)' }}>{typeIcon[item.content_type] || ''} {item.title}</td>
                <td style={{ fontSize: 13 }}>{item.section || '-'}</td>
                <td><span className="badge" style={{ background: 'rgba(59,130,246,0.15)', color: '#3b82f6' }}>{item.content_type}</span></td>
                <td><span className={`badge badge-${item.priority}`}>{item.priority}</span></td>
                <td><span className={`badge badge-${item.status}`}>{item.status.replace('_', ' ')}</span></td>
                <td style={{ fontSize: 13 }}>{item.publish_date ? new Date(item.publish_date).toLocaleDateString() : '-'}</td>
                <td style={{ fontSize: 13 }}>{item.assigned_to || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showForm && (
        <Modal title={editing ? 'Edit Entry' : 'New Calendar Entry'} onClose={() => { setShowForm(false); setEditing(false); }}>
          <div className="form-group">
            <label>Title</label>
            <input className="form-control" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Content title" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="form-group">
              <label>Section</label>
              <input className="form-control" value={form.section} onChange={(e) => setForm({ ...form, section: e.target.value })} placeholder="e.g. Front Page, Tech, Sports" />
            </div>
            <div className="form-group">
              <label>Content Type</label>
              <select className="form-control" value={form.content_type} onChange={(e) => setForm({ ...form, content_type: e.target.value })}>
                <option value="article">Article</option>
                <option value="feature">Feature</option>
                <option value="opinion">Opinion</option>
                <option value="investigation">Investigation</option>
                <option value="breaking">Breaking</option>
                <option value="multimedia">Multimedia</option>
                <option value="podcast">Podcast</option>
                <option value="newsletter">Newsletter</option>
              </select>
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
                <option value="planned">Planned</option>
                <option value="in_production">In Production</option>
                <option value="ready">Ready</option>
                <option value="published">Published</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div className="form-group">
              <label>Publish Date</label>
              <input type="datetime-local" className="form-control" value={form.publish_date} onChange={(e) => setForm({ ...form, publish_date: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Assigned To</label>
              <input className="form-control" value={form.assigned_to} onChange={(e) => setForm({ ...form, assigned_to: e.target.value })} placeholder="Reporter name" />
            </div>
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea className="form-control" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Content description and notes..." />
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
