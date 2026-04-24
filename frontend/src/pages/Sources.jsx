import React, { useState, useEffect } from 'react';
import { sources, ai } from '../services/api';
import Modal from '../components/Modal';
import AIResponse from '../components/AIResponse';

const emptyForm = { name: '', type: '', credibility_score: 50, url: '', contact_info: '', verification_status: 'pending', notes: '' };

export default function Sources({ showToast }) {
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
    try { setItems(await sources.getAll()); } catch (e) { console.error(e); }
  };

  const handleSave = async () => {
    try {
      if (editing) {
        await sources.update(selected.id, form);
        showToast('Source updated');
      } else {
        await sources.create(form);
        showToast('Source created');
      }
      setShowForm(false); setForm(emptyForm); setEditing(false); setSelected(null); load();
    } catch (e) { showToast(e.message, 'error'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this source?')) return;
    try { await sources.delete(id); showToast('Source deleted'); setSelected(null); load(); } catch (e) { showToast(e.message, 'error'); }
  };

  const handleEdit = (item) => {
    setForm({ name: item.name, type: item.type || '', credibility_score: item.credibility_score, url: item.url || '', contact_info: item.contact_info || '', verification_status: item.verification_status, notes: item.notes || '' });
    setEditing(true); setSelected(item); setShowForm(true);
  };

  const handleAiVerify = async (item) => {
    setAiLoading(true); setAiError(null); setAiResult(null);
    try {
      const result = await ai.verifySource({ name: item.name, type: item.type, url: item.url, notes: item.notes });
      if (result.success) { setAiResult(result); } else { setAiError(result.error); }
    } catch (e) { setAiError(e.message); }
    setAiLoading(false);
  };

  const getCredColor = (score) => {
    if (score >= 80) return '#10b981';
    if (score >= 60) return '#f59e0b';
    if (score >= 40) return '#f97316';
    return '#ef4444';
  };

  if (selected && !showForm) {
    return (
      <div>
        <button className="back-btn" onClick={() => { setSelected(null); setAiResult(null); setAiError(null); }}>&larr; Back to Sources</button>
        <div className="detail-view">
          <div className="detail-header">
            <div>
              <h3>{selected.name}</h3>
              <div className="card-meta" style={{ marginTop: 8 }}>
                <span className={`badge badge-${selected.verification_status}`}>{selected.verification_status}</span>
                {selected.type && <span className="badge" style={{ background: 'rgba(59,130,246,0.15)', color: '#3b82f6' }}>{selected.type}</span>}
              </div>
            </div>
            <div className="detail-actions">
              <button className="btn btn-ai" onClick={() => handleAiVerify(selected)}>AI Verify</button>
              <button className="btn btn-secondary" onClick={() => handleEdit(selected)}>Edit</button>
              <button className="btn btn-danger" onClick={() => handleDelete(selected.id)}>Delete</button>
            </div>
          </div>
          <div className="detail-grid">
            <div className="detail-field">
              <div className="field-label">Credibility Score</div>
              <div className="field-value" style={{ fontSize: 28, fontWeight: 800, color: getCredColor(selected.credibility_score) }}>{selected.credibility_score}/100</div>
              <div className="credibility-bar"><div className="credibility-fill" style={{ width: `${selected.credibility_score}%`, background: getCredColor(selected.credibility_score) }} /></div>
            </div>
            <div className="detail-field">
              <div className="field-label">Type</div>
              <div className="field-value">{selected.type || 'N/A'}</div>
            </div>
            <div className="detail-field">
              <div className="field-label">URL</div>
              <div className="field-value">{selected.url ? <a href={selected.url} target="_blank" rel="noreferrer">{selected.url}</a> : 'N/A'}</div>
            </div>
            <div className="detail-field">
              <div className="field-label">Contact</div>
              <div className="field-value">{selected.contact_info || 'N/A'}</div>
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
          <h2>Source Verification</h2>
          <p className="subtitle">Verify source credibility and reliability with AI assistance</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setForm(emptyForm); setEditing(false); setShowForm(true); }}>+ New Source</button>
      </div>

      <div className="stats-row">
        <div className="stat-box"><div className="stat-number">{items.length}</div><div className="stat-label">Total Sources</div></div>
        <div className="stat-box"><div className="stat-number" style={{ color: '#10b981' }}>{items.filter(i => i.verification_status === 'verified').length}</div><div className="stat-label">Verified</div></div>
        <div className="stat-box"><div className="stat-number" style={{ color: '#a855f7' }}>{items.filter(i => i.verification_status === 'pending').length}</div><div className="stat-label">Pending</div></div>
        <div className="stat-box"><div className="stat-number" style={{ color: '#ef4444' }}>{items.filter(i => i.verification_status === 'unverified').length}</div><div className="stat-label">Unverified</div></div>
      </div>

      <div className="card-grid">
        {items.map((item) => (
          <div key={item.id} className="card" onClick={() => setSelected(item)}>
            <div className="card-title">{item.name}</div>
            <div className="card-meta">
              <span className={`badge badge-${item.verification_status}`}>{item.verification_status}</span>
              {item.type && <span className="badge" style={{ background: 'rgba(59,130,246,0.15)', color: '#3b82f6' }}>{item.type}</span>}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
              <span style={{ fontSize: 13, color: 'var(--text-dim)' }}>Credibility:</span>
              <span style={{ fontWeight: 700, color: getCredColor(item.credibility_score) }}>{item.credibility_score}</span>
              <div className="credibility-bar" style={{ flex: 1 }}><div className="credibility-fill" style={{ width: `${item.credibility_score}%`, background: getCredColor(item.credibility_score) }} /></div>
            </div>
            <div className="card-summary" style={{ marginTop: 8 }}>{item.notes}</div>
          </div>
        ))}
      </div>

      {showForm && (
        <Modal title={editing ? 'Edit Source' : 'New Source'} onClose={() => { setShowForm(false); setEditing(false); }}>
          <div className="form-group">
            <label>Name</label>
            <input className="form-control" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Source name" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="form-group">
              <label>Type</label>
              <select className="form-control" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                <option value="">Select type</option>
                <option value="Wire Service">Wire Service</option>
                <option value="Academic Expert">Academic Expert</option>
                <option value="Government PR">Government PR</option>
                <option value="Government Agency">Government Agency</option>
                <option value="Confidential Source">Confidential Source</option>
                <option value="Online Media">Online Media</option>
                <option value="Law Enforcement">Law Enforcement</option>
                <option value="International Organization">International Organization</option>
                <option value="Whistleblower">Whistleblower</option>
                <option value="NGO">NGO</option>
                <option value="Legal Expert">Legal Expert</option>
                <option value="Industry Group">Industry Group</option>
                <option value="Social Media">Social Media</option>
                <option value="Public Records">Public Records</option>
              </select>
            </div>
            <div className="form-group">
              <label>Credibility Score (0-100)</label>
              <input type="number" className="form-control" min="0" max="100" value={form.credibility_score} onChange={(e) => setForm({ ...form, credibility_score: parseInt(e.target.value) || 0 })} />
            </div>
            <div className="form-group">
              <label>Verification Status</label>
              <select className="form-control" value={form.verification_status} onChange={(e) => setForm({ ...form, verification_status: e.target.value })}>
                <option value="pending">Pending</option>
                <option value="verified">Verified</option>
                <option value="unverified">Unverified</option>
                <option value="under_review">Under Review</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label>URL</label>
            <input className="form-control" value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} placeholder="https://..." />
          </div>
          <div className="form-group">
            <label>Contact Info</label>
            <input className="form-control" value={form.contact_info} onChange={(e) => setForm({ ...form, contact_info: e.target.value })} placeholder="Email, phone, etc." />
          </div>
          <div className="form-group">
            <label>Notes</label>
            <textarea className="form-control" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Additional notes..." />
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
