import React, { useState, useEffect } from 'react';
import { contacts } from '../services/api';
import Modal from '../components/Modal';

const emptyForm = { name: '', organization: '', role: '', phone: '', email: '', category: 'general', notes: '' };

export default function Contacts({ showToast }) {
  const [items, setItems] = useState([]);
  const [selected, setSelected] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => { load(); }, []);

  const load = async () => {
    try { setItems(await contacts.getAll()); } catch (e) { console.error(e); }
  };

  const handleSave = async () => {
    try {
      if (editing) { await contacts.update(selected.id, form); showToast('Contact updated'); }
      else { await contacts.create(form); showToast('Contact created'); }
      setShowForm(false); setForm(emptyForm); setEditing(false); setSelected(null); load();
    } catch (e) { showToast(e.message, 'error'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this contact?')) return;
    try { await contacts.delete(id); showToast('Contact deleted'); setSelected(null); load(); } catch (e) { showToast(e.message, 'error'); }
  };

  const handleEdit = (item) => {
    setForm({ name: item.name, organization: item.organization || '', role: item.role || '', phone: item.phone || '', email: item.email || '', category: item.category || 'general', notes: item.notes || '' });
    setEditing(true); setSelected(item); setShowForm(true);
  };

  const filtered = items.filter(i =>
    i.name.toLowerCase().includes(search.toLowerCase()) ||
    (i.organization || '').toLowerCase().includes(search.toLowerCase()) ||
    (i.role || '').toLowerCase().includes(search.toLowerCase())
  );

  const categoryColor = { source: '#3b82f6', pr: '#a855f7', expert: '#10b981', official: '#f59e0b', colleague: '#ef4444', general: '#6b7280' };

  if (selected && !showForm) {
    return (
      <div>
        <button className="back-btn" onClick={() => setSelected(null)}>&larr; Back to Contacts</button>
        <div className="detail-view">
          <div className="detail-header">
            <div>
              <h3>{selected.name}</h3>
              <div className="card-meta" style={{ marginTop: 8 }}>
                <span className="badge" style={{ background: `${categoryColor[selected.category] || '#6b7280'}20`, color: categoryColor[selected.category] || '#6b7280' }}>{selected.category}</span>
                {selected.organization && <span className="badge" style={{ background: 'rgba(59,130,246,0.15)', color: '#3b82f6' }}>{selected.organization}</span>}
              </div>
            </div>
            <div className="detail-actions">
              <button className="btn btn-secondary" onClick={() => handleEdit(selected)}>Edit</button>
              <button className="btn btn-danger" onClick={() => handleDelete(selected.id)}>Delete</button>
            </div>
          </div>
          <div className="detail-grid">
            <div className="detail-field">
              <div className="field-label">Role</div>
              <div className="field-value">{selected.role || 'N/A'}</div>
            </div>
            <div className="detail-field">
              <div className="field-label">Organization</div>
              <div className="field-value">{selected.organization || 'N/A'}</div>
            </div>
            <div className="detail-field">
              <div className="field-label">Phone</div>
              <div className="field-value">{selected.phone || 'N/A'}</div>
            </div>
            <div className="detail-field">
              <div className="field-label">Email</div>
              <div className="field-value">{selected.email || 'N/A'}</div>
            </div>
            <div className="detail-field">
              <div className="field-label">Added</div>
              <div className="field-value">{new Date(selected.created_at).toLocaleString()}</div>
            </div>
            <div className="detail-field">
              <div className="field-label">Updated</div>
              <div className="field-value">{new Date(selected.updated_at).toLocaleString()}</div>
            </div>
          </div>
          <div className="detail-field">
            <div className="field-label">Notes</div>
            <div className="field-value">{selected.notes || 'No notes'}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Contact Book</h2>
          <p className="subtitle">Manage your newsroom contacts and sources directory</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setForm(emptyForm); setEditing(false); setShowForm(true); }}>+ New Contact</button>
      </div>

      <div className="stats-row">
        <div className="stat-box"><div className="stat-number">{items.length}</div><div className="stat-label">Total</div></div>
        <div className="stat-box"><div className="stat-number" style={{ color: '#3b82f6' }}>{items.filter(i => i.category === 'source').length}</div><div className="stat-label">Sources</div></div>
        <div className="stat-box"><div className="stat-number" style={{ color: '#10b981' }}>{items.filter(i => i.category === 'expert').length}</div><div className="stat-label">Experts</div></div>
        <div className="stat-box"><div className="stat-number" style={{ color: '#f59e0b' }}>{items.filter(i => i.category === 'official').length}</div><div className="stat-label">Officials</div></div>
      </div>

      <div style={{ marginBottom: 16 }}>
        <input className="form-control" placeholder="Search contacts by name, organization, or role..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ maxWidth: 400 }} />
      </div>

      <div style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', overflow: 'hidden' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Organization</th>
              <th>Role</th>
              <th>Category</th>
              <th>Phone</th>
              <th>Email</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((item) => (
              <tr key={item.id} onClick={() => setSelected(item)}>
                <td style={{ fontWeight: 600, color: 'var(--text-bright)' }}>{item.name}</td>
                <td style={{ fontSize: 13 }}>{item.organization || '-'}</td>
                <td style={{ fontSize: 13, color: 'var(--text-dim)' }}>{item.role || '-'}</td>
                <td><span className="badge" style={{ background: `${categoryColor[item.category] || '#6b7280'}20`, color: categoryColor[item.category] || '#6b7280' }}>{item.category}</span></td>
                <td style={{ fontSize: 13 }}>{item.phone || '-'}</td>
                <td style={{ fontSize: 13 }}>{item.email || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showForm && (
        <Modal title={editing ? 'Edit Contact' : 'New Contact'} onClose={() => { setShowForm(false); setEditing(false); }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="form-group">
              <label>Name</label>
              <input className="form-control" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Full name" />
            </div>
            <div className="form-group">
              <label>Organization</label>
              <input className="form-control" value={form.organization} onChange={(e) => setForm({ ...form, organization: e.target.value })} placeholder="Company or org" />
            </div>
            <div className="form-group">
              <label>Role</label>
              <input className="form-control" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} placeholder="Job title" />
            </div>
            <div className="form-group">
              <label>Category</label>
              <select className="form-control" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                <option value="source">Source</option>
                <option value="expert">Expert</option>
                <option value="official">Official</option>
                <option value="pr">PR / Comms</option>
                <option value="colleague">Colleague</option>
                <option value="general">General</option>
              </select>
            </div>
            <div className="form-group">
              <label>Phone</label>
              <input className="form-control" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="Phone number" />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input className="form-control" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Email address" />
            </div>
          </div>
          <div className="form-group">
            <label>Notes</label>
            <textarea className="form-control" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Notes about this contact..." />
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
