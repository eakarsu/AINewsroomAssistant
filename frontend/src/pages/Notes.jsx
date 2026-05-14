import React, { useState, useEffect } from 'react';
import { notes, extractData } from '../services/api';
import Modal from '../components/Modal';
import Pagination from '../components/Pagination';

const emptyForm = { title: '', content: '', category: 'general', related_story: '', pinned: false };

export default function Notes({ showToast }) {
  const [items, setItems] = useState([]);
  const [selected, setSelected] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState(false);
  const [filterCategory, setFilterCategory] = useState('all');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  useEffect(() => { load(); }, [page]);

  const load = async () => {
    try {
      const r = await notes.getAll(page, 20);
      setItems(extractData(r));
      if (r.pagination) setPagination(r.pagination);
    } catch (e) { console.error(e); }
  };

  const handleSave = async () => {
    try {
      if (editing) { await notes.update(selected.id, form); showToast('Note updated'); }
      else { await notes.create(form); showToast('Note created'); }
      setShowForm(false); setForm(emptyForm); setEditing(false); setSelected(null); load();
    } catch (e) { showToast(e.message, 'error'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this note?')) return;
    try { await notes.delete(id); showToast('Note deleted'); setSelected(null); load(); } catch (e) { showToast(e.message, 'error'); }
  };

  const handleEdit = (item) => {
    setForm({ title: item.title, content: item.content || '', category: item.category || 'general', related_story: item.related_story || '', pinned: item.pinned || false });
    setEditing(true); setSelected(item); setShowForm(true);
  };

  const togglePin = async (item) => {
    try {
      await notes.update(item.id, { ...item, pinned: !item.pinned });
      showToast(item.pinned ? 'Note unpinned' : 'Note pinned');
      load();
    } catch (e) { showToast(e.message, 'error'); }
  };

  const filtered = filterCategory === 'all' ? items : items.filter(i => i.category === filterCategory);
  const categoryColor = { general: '#6b7280', research: '#3b82f6', interview: '#a855f7', tip: '#10b981', idea: '#f59e0b', todo: '#ef4444' };

  if (selected && !showForm) {
    return (
      <div>
        <button className="back-btn" onClick={() => setSelected(null)}>&larr; Back to Notes</button>
        <div className="detail-view">
          <div className="detail-header">
            <div>
              <h3>{selected.pinned ? '\u{1F4CC} ' : ''}{selected.title}</h3>
              <div className="card-meta" style={{ marginTop: 8 }}>
                <span className="badge" style={{ background: `${categoryColor[selected.category] || '#6b7280'}20`, color: categoryColor[selected.category] || '#6b7280' }}>{selected.category}</span>
                {selected.related_story && <span className="badge" style={{ background: 'rgba(59,130,246,0.15)', color: '#3b82f6' }}>{selected.related_story}</span>}
              </div>
            </div>
            <div className="detail-actions">
              <button className="btn btn-secondary" onClick={() => togglePin(selected)}>{selected.pinned ? 'Unpin' : 'Pin'}</button>
              <button className="btn btn-secondary" onClick={() => handleEdit(selected)}>Edit</button>
              <button className="btn btn-danger" onClick={() => handleDelete(selected.id)}>Delete</button>
            </div>
          </div>
          <div className="detail-grid">
            <div className="detail-field">
              <div className="field-label">Author</div>
              <div className="field-value">{selected.author || 'N/A'}</div>
            </div>
            <div className="detail-field">
              <div className="field-label">Created</div>
              <div className="field-value">{new Date(selected.created_at).toLocaleString()}</div>
            </div>
            <div className="detail-field">
              <div className="field-label">Updated</div>
              <div className="field-value">{new Date(selected.updated_at).toLocaleString()}</div>
            </div>
            <div className="detail-field">
              <div className="field-label">Related Story</div>
              <div className="field-value">{selected.related_story || 'None'}</div>
            </div>
          </div>
          <div className="detail-field">
            <div className="field-label">Content</div>
            <div className="field-value" style={{ whiteSpace: 'pre-wrap' }}>{selected.content || 'No content'}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Reporter Notes</h2>
          <p className="subtitle">Quick notes, research, and story ideas</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setForm(emptyForm); setEditing(false); setShowForm(true); }}>+ New Note</button>
      </div>

      <div className="stats-row">
        <div className="stat-box"><div className="stat-number">{items.length}</div><div className="stat-label">Total</div></div>
        <div className="stat-box"><div className="stat-number" style={{ color: '#f59e0b' }}>{items.filter(i => i.pinned).length}</div><div className="stat-label">Pinned</div></div>
        <div className="stat-box"><div className="stat-number" style={{ color: '#10b981' }}>{items.filter(i => i.category === 'tip').length}</div><div className="stat-label">Tips</div></div>
        <div className="stat-box"><div className="stat-number" style={{ color: '#3b82f6' }}>{items.filter(i => i.category === 'research').length}</div><div className="stat-label">Research</div></div>
      </div>

      <div style={{ marginBottom: 16, display: 'flex', gap: 8 }}>
        {['all', 'general', 'research', 'interview', 'tip', 'idea', 'todo'].map(cat => (
          <button key={cat} className={`btn btn-sm ${filterCategory === cat ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setFilterCategory(cat)} style={{ textTransform: 'capitalize' }}>{cat}</button>
        ))}
      </div>

      <div className="card-grid">
        {filtered.map((item) => (
          <div key={item.id} className="card" onClick={() => setSelected(item)} style={{ borderLeft: item.pinned ? '3px solid #f59e0b' : undefined }}>
            <div className="card-title">{item.pinned ? '\u{1F4CC} ' : ''}{item.title}</div>
            <div className="card-meta">
              <span className="badge" style={{ background: `${categoryColor[item.category] || '#6b7280'}20`, color: categoryColor[item.category] || '#6b7280' }}>{item.category}</span>
              {item.related_story && <span className="badge" style={{ background: 'rgba(59,130,246,0.15)', color: '#3b82f6' }}>{item.related_story}</span>}
              <span style={{ fontSize: 11, color: 'var(--text-dim)' }}>{new Date(item.updated_at).toLocaleDateString()}</span>
            </div>
            <div className="card-summary">{item.content}</div>
          </div>
        ))}
      </div>

      {showForm && (
        <Modal title={editing ? 'Edit Note' : 'New Note'} onClose={() => { setShowForm(false); setEditing(false); }}>
          <div className="form-group">
            <label>Title</label>
            <input className="form-control" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Note title" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="form-group">
              <label>Category</label>
              <select className="form-control" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                <option value="general">General</option>
                <option value="research">Research</option>
                <option value="interview">Interview</option>
                <option value="tip">Tip</option>
                <option value="idea">Idea</option>
                <option value="todo">To-Do</option>
              </select>
            </div>
            <div className="form-group">
              <label>Related Story</label>
              <input className="form-control" value={form.related_story} onChange={(e) => setForm({ ...form, related_story: e.target.value })} placeholder="Story title (optional)" />
            </div>
          </div>
          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input type="checkbox" checked={form.pinned} onChange={(e) => setForm({ ...form, pinned: e.target.checked })} />
              Pin this note
            </label>
          </div>
          <div className="form-group">
            <label>Content</label>
            <textarea className="form-control" value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} placeholder="Write your note..." style={{ minHeight: 150 }} />
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
