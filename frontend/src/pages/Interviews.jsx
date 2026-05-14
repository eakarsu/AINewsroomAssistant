import React, { useState, useEffect } from 'react';
import { interviews, ai, extractData } from '../services/api';
import Modal from '../components/Modal';
import AIResponse from '../components/AIResponse';
import Pagination from '../components/Pagination';

const emptyForm = { subject_name: '', subject_role: '', topic: '', scheduled_date: '', duration_minutes: 30, location: '', status: 'scheduled', reporter: '', notes: '' };

export default function Interviews({ showToast }) {
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
      const r = await interviews.getAll(page, 20);
      setItems(extractData(r));
      if (r.pagination) setPagination(r.pagination);
    } catch (e) { console.error(e); }
  };

  const handleSave = async () => {
    try {
      if (editing) { await interviews.update(selected.id, form); showToast('Interview updated'); }
      else { await interviews.create(form); showToast('Interview created'); }
      setShowForm(false); setForm(emptyForm); setEditing(false); setSelected(null); load();
    } catch (e) { showToast(e.message, 'error'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this interview?')) return;
    try { await interviews.delete(id); showToast('Interview deleted'); setSelected(null); load(); } catch (e) { showToast(e.message, 'error'); }
  };

  const handleEdit = (item) => {
    setForm({ subject_name: item.subject_name, subject_role: item.subject_role || '', topic: item.topic || '', scheduled_date: item.scheduled_date ? new Date(item.scheduled_date).toISOString().slice(0, 16) : '', duration_minutes: item.duration_minutes || 30, location: item.location || '', status: item.status, reporter: item.reporter || '', notes: item.notes || '' });
    setEditing(true); setSelected(item); setShowForm(true);
  };

  const handleAiQuestions = async (item) => {
    setAiLoading(true); setAiError(null); setAiResult(null);
    try {
      const result = await ai.generateQuestions({ subject_name: item.subject_name, subject_role: item.subject_role, topic: item.topic, notes: item.notes });
      if (result.success) { setAiResult(result); } else { setAiError(result.error); }
    } catch (e) { setAiError(e.message); }
    setAiLoading(false);
  };

  const statusIcon = { scheduled: '\u{1F4C5}', confirmed: '\u2705', completed: '\u2714', cancelled: '\u274C', rescheduled: '\u{1F504}' };

  if (selected && !showForm) {
    return (
      <div>
        <button className="back-btn" onClick={() => { setSelected(null); setAiResult(null); setAiError(null); }}>&larr; Back to Interviews</button>
        <div className="detail-view">
          <div className="detail-header">
            <div>
              <h3>{selected.subject_name}</h3>
              <div className="card-meta" style={{ marginTop: 8 }}>
                <span className={`badge badge-${selected.status}`}>{selected.status}</span>
                {selected.subject_role && <span className="badge" style={{ background: 'rgba(59,130,246,0.15)', color: '#3b82f6' }}>{selected.subject_role}</span>}
              </div>
            </div>
            <div className="detail-actions">
              <button className="btn btn-ai" onClick={() => handleAiQuestions(selected)}>AI Generate Questions</button>
              <button className="btn btn-secondary" onClick={() => handleEdit(selected)}>Edit</button>
              <button className="btn btn-danger" onClick={() => handleDelete(selected.id)}>Delete</button>
            </div>
          </div>
          <div className="detail-grid">
            <div className="detail-field">
              <div className="field-label">Topic</div>
              <div className="field-value">{selected.topic || 'N/A'}</div>
            </div>
            <div className="detail-field">
              <div className="field-label">Scheduled Date</div>
              <div className="field-value">{selected.scheduled_date ? new Date(selected.scheduled_date).toLocaleString() : 'TBD'}</div>
            </div>
            <div className="detail-field">
              <div className="field-label">Duration</div>
              <div className="field-value">{selected.duration_minutes} minutes</div>
            </div>
            <div className="detail-field">
              <div className="field-label">Location</div>
              <div className="field-value">{selected.location || 'N/A'}</div>
            </div>
            <div className="detail-field">
              <div className="field-label">Reporter</div>
              <div className="field-value">{selected.reporter || 'Unassigned'}</div>
            </div>
            <div className="detail-field">
              <div className="field-label">Created</div>
              <div className="field-value">{new Date(selected.created_at).toLocaleString()}</div>
            </div>
          </div>
          <div className="detail-field">
            <div className="field-label">Notes</div>
            <div className="field-value">{selected.notes || 'No notes'}</div>
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
          <h2>Interview Scheduler</h2>
          <p className="subtitle">Manage interviews with AI-generated question preparation</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setForm(emptyForm); setEditing(false); setShowForm(true); }}>+ New Interview</button>
      </div>

      <div className="stats-row">
        <div className="stat-box"><div className="stat-number">{items.length}</div><div className="stat-label">Total</div></div>
        <div className="stat-box"><div className="stat-number" style={{ color: '#3b82f6' }}>{items.filter(i => i.status === 'scheduled').length}</div><div className="stat-label">Scheduled</div></div>
        <div className="stat-box"><div className="stat-number" style={{ color: '#10b981' }}>{items.filter(i => i.status === 'confirmed').length}</div><div className="stat-label">Confirmed</div></div>
        <div className="stat-box"><div className="stat-number" style={{ color: '#a855f7' }}>{items.filter(i => i.status === 'completed').length}</div><div className="stat-label">Completed</div></div>
      </div>

      <div style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', overflow: 'hidden' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Subject</th>
              <th>Role</th>
              <th>Topic</th>
              <th>Date</th>
              <th>Duration</th>
              <th>Status</th>
              <th>Reporter</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} onClick={() => setSelected(item)}>
                <td style={{ fontWeight: 600, color: 'var(--text-bright)' }}>{item.subject_name}</td>
                <td style={{ fontSize: 13, color: 'var(--text-dim)' }}>{item.subject_role || '-'}</td>
                <td style={{ fontSize: 13 }}>{item.topic || '-'}</td>
                <td style={{ fontSize: 13 }}>{item.scheduled_date ? new Date(item.scheduled_date).toLocaleDateString() : '-'}</td>
                <td style={{ fontSize: 13 }}>{item.duration_minutes}m</td>
                <td><span className={`badge badge-${item.status}`}>{item.status}</span></td>
                <td style={{ fontSize: 13 }}>{item.reporter || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showForm && (
        <Modal title={editing ? 'Edit Interview' : 'New Interview'} onClose={() => { setShowForm(false); setEditing(false); }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="form-group">
              <label>Subject Name</label>
              <input className="form-control" value={form.subject_name} onChange={(e) => setForm({ ...form, subject_name: e.target.value })} placeholder="Interviewee name" />
            </div>
            <div className="form-group">
              <label>Subject Role</label>
              <input className="form-control" value={form.subject_role} onChange={(e) => setForm({ ...form, subject_role: e.target.value })} placeholder="Title / Position" />
            </div>
          </div>
          <div className="form-group">
            <label>Topic</label>
            <input className="form-control" value={form.topic} onChange={(e) => setForm({ ...form, topic: e.target.value })} placeholder="Interview topic" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="form-group">
              <label>Scheduled Date</label>
              <input type="datetime-local" className="form-control" value={form.scheduled_date} onChange={(e) => setForm({ ...form, scheduled_date: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Duration (minutes)</label>
              <input type="number" className="form-control" value={form.duration_minutes} onChange={(e) => setForm({ ...form, duration_minutes: parseInt(e.target.value) || 30 })} />
            </div>
            <div className="form-group">
              <label>Location</label>
              <input className="form-control" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Office, Zoom, Phone..." />
            </div>
            <div className="form-group">
              <label>Status</label>
              <select className="form-control" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                <option value="scheduled">Scheduled</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
                <option value="rescheduled">Rescheduled</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label>Reporter</label>
            <input className="form-control" value={form.reporter} onChange={(e) => setForm({ ...form, reporter: e.target.value })} placeholder="Assigned reporter" />
          </div>
          <div className="form-group">
            <label>Notes</label>
            <textarea className="form-control" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Preparation notes..." />
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
