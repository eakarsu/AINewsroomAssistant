import React, { useState, useEffect } from 'react';
import { mediaAssets, ai, extractData } from '../services/api';
import Modal from '../components/Modal';
import AIResponse from '../components/AIResponse';
import Pagination from '../components/Pagination';

const emptyForm = { title: '', type: 'photo', source: '', description: '', article_title: '', photographer: '', location: '', license: 'unknown', status: 'available' };

export default function MediaAssets({ showToast }) {
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
      const r = await mediaAssets.getAll(page, 20);
      setItems(extractData(r));
      if (r.pagination) setPagination(r.pagination);
    } catch (e) { console.error(e); }
  };

  const handleSave = async () => {
    try {
      if (editing) { await mediaAssets.update(selected.id, form); showToast('Asset updated'); }
      else { await mediaAssets.create(form); showToast('Asset created'); }
      setShowForm(false); setForm(emptyForm); setEditing(false); setSelected(null); load();
    } catch (e) { showToast(e.message, 'error'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this asset?')) return;
    try { await mediaAssets.delete(id); showToast('Asset deleted'); setSelected(null); load(); } catch (e) { showToast(e.message, 'error'); }
  };

  const handleEdit = (item) => {
    setForm({ title: item.title, type: item.type || 'photo', source: item.source || '', description: item.description || '', article_title: item.article_title || '', photographer: item.photographer || '', location: item.location || '', license: item.license || 'unknown', status: item.status });
    setEditing(true); setSelected(item); setShowForm(true);
  };

  const handleAiAnalyze = async (item) => {
    setAiLoading(true); setAiError(null); setAiResult(null);
    try {
      const result = await ai.analyzeMedia({ title: item.title, type: item.type, description: item.description, source: item.source, article_title: item.article_title });
      if (result.success) { setAiResult(result); } else { setAiError(result.error); }
    } catch (e) { setAiError(e.message); }
    setAiLoading(false);
  };

  const typeIcon = { photo: '\u{1F4F7}', video: '\u{1F3AC}', audio: '\u{1F3A4}', document: '\u{1F4C4}', infographic: '\u{1F4CA}', illustration: '\u{1F3A8}' };

  if (selected && !showForm) {
    return (
      <div>
        <button className="back-btn" onClick={() => { setSelected(null); setAiResult(null); setAiError(null); }}>&larr; Back to Media Assets</button>
        <div className="detail-view">
          <div className="detail-header">
            <div>
              <h3>{typeIcon[selected.type] || '\u{1F4CE}'} {selected.title}</h3>
              <div className="card-meta" style={{ marginTop: 8 }}>
                <span className={`badge badge-${selected.status === 'available' ? 'verified' : selected.status === 'in_use' ? 'in_progress' : 'pending'}`}>{selected.status}</span>
                <span className="badge" style={{ background: 'rgba(59,130,246,0.15)', color: '#3b82f6' }}>{selected.type}</span>
                <span className="badge" style={{ background: 'rgba(245,158,11,0.15)', color: '#f59e0b' }}>{selected.license}</span>
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
              <div className="field-label">Photographer/Creator</div>
              <div className="field-value">{selected.photographer || 'N/A'}</div>
            </div>
            <div className="detail-field">
              <div className="field-label">Location</div>
              <div className="field-value">{selected.location || 'N/A'}</div>
            </div>
            <div className="detail-field">
              <div className="field-label">For Article</div>
              <div className="field-value">{selected.article_title || 'N/A'}</div>
            </div>
          </div>
          <div className="detail-field">
            <div className="field-label">Description</div>
            <div className="field-value">{selected.description || 'No description'}</div>
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
          <h2>Media Assets</h2>
          <p className="subtitle">Manage photos, videos, and documents with AI analysis</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setForm(emptyForm); setEditing(false); setShowForm(true); }}>+ New Asset</button>
      </div>

      <div className="stats-row">
        <div className="stat-box"><div className="stat-number">{items.length}</div><div className="stat-label">Total Assets</div></div>
        <div className="stat-box"><div className="stat-number" style={{ color: '#3b82f6' }}>{items.filter(i => i.type === 'photo').length}</div><div className="stat-label">Photos</div></div>
        <div className="stat-box"><div className="stat-number" style={{ color: '#a855f7' }}>{items.filter(i => i.type === 'video').length}</div><div className="stat-label">Videos</div></div>
        <div className="stat-box"><div className="stat-number" style={{ color: '#10b981' }}>{items.filter(i => i.status === 'available').length}</div><div className="stat-label">Available</div></div>
      </div>

      <div className="card-grid">
        {items.map((item) => (
          <div key={item.id} className="card" onClick={() => setSelected(item)}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>{typeIcon[item.type] || '\u{1F4CE}'}</div>
            <div className="card-title">{item.title}</div>
            <div className="card-meta">
              <span className="badge" style={{ background: 'rgba(59,130,246,0.15)', color: '#3b82f6' }}>{item.type}</span>
              <span className={`badge badge-${item.status === 'available' ? 'verified' : item.status === 'in_use' ? 'in_progress' : 'pending'}`}>{item.status}</span>
              <span className="badge" style={{ background: 'rgba(245,158,11,0.15)', color: '#f59e0b' }}>{item.license}</span>
            </div>
            <div className="card-summary" style={{ marginTop: 8 }}>{item.description}</div>
          </div>
        ))}
      </div>

      {showForm && (
        <Modal title={editing ? 'Edit Asset' : 'New Asset'} onClose={() => { setShowForm(false); setEditing(false); }}>
          <div className="form-group">
            <label>Title</label>
            <input className="form-control" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Asset title" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="form-group">
              <label>Type</label>
              <select className="form-control" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                <option value="photo">Photo</option>
                <option value="video">Video</option>
                <option value="audio">Audio</option>
                <option value="document">Document</option>
                <option value="infographic">Infographic</option>
                <option value="illustration">Illustration</option>
              </select>
            </div>
            <div className="form-group">
              <label>Source</label>
              <input className="form-control" value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} placeholder="AP, Getty, Staff..." />
            </div>
            <div className="form-group">
              <label>Photographer/Creator</label>
              <input className="form-control" value={form.photographer} onChange={(e) => setForm({ ...form, photographer: e.target.value })} placeholder="Creator name" />
            </div>
            <div className="form-group">
              <label>Location</label>
              <input className="form-control" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Where was this captured?" />
            </div>
            <div className="form-group">
              <label>License</label>
              <select className="form-control" value={form.license} onChange={(e) => setForm({ ...form, license: e.target.value })}>
                <option value="owned">Owned</option>
                <option value="licensed">Licensed</option>
                <option value="creative_commons">Creative Commons</option>
                <option value="public_domain">Public Domain</option>
                <option value="fair_use">Fair Use</option>
                <option value="unknown">Unknown</option>
              </select>
            </div>
            <div className="form-group">
              <label>Status</label>
              <select className="form-control" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                <option value="available">Available</option>
                <option value="in_use">In Use</option>
                <option value="archived">Archived</option>
                <option value="restricted">Restricted</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label>For Article</label>
            <input className="form-control" value={form.article_title} onChange={(e) => setForm({ ...form, article_title: e.target.value })} placeholder="Associated article title" />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea className="form-control" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Describe the asset..." />
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
