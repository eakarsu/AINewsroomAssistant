import React, { useState, useEffect } from 'react';
import { expenses } from '../services/api';
import Modal from '../components/Modal';

const emptyForm = { description: '', amount: '', category: 'travel', expense_date: '', related_story: '', reporter: '', status: 'pending', receipt_ref: '' };

export default function Expenses({ showToast }) {
  const [items, setItems] = useState([]);
  const [selected, setSelected] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState(false);

  useEffect(() => { load(); }, []);

  const load = async () => {
    try { setItems(await expenses.getAll()); } catch (e) { console.error(e); }
  };

  const handleSave = async () => {
    try {
      if (editing) { await expenses.update(selected.id, form); showToast('Expense updated'); }
      else { await expenses.create(form); showToast('Expense created'); }
      setShowForm(false); setForm(emptyForm); setEditing(false); setSelected(null); load();
    } catch (e) { showToast(e.message, 'error'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this expense?')) return;
    try { await expenses.delete(id); showToast('Expense deleted'); setSelected(null); load(); } catch (e) { showToast(e.message, 'error'); }
  };

  const handleEdit = (item) => {
    setForm({ description: item.description, amount: item.amount || '', category: item.category || 'other', expense_date: item.expense_date ? new Date(item.expense_date).toISOString().slice(0, 10) : '', related_story: item.related_story || '', reporter: item.reporter || '', status: item.status || 'pending', receipt_ref: item.receipt_ref || '' });
    setEditing(true); setSelected(item); setShowForm(true);
  };

  const totalAmount = items.reduce((sum, i) => sum + parseFloat(i.amount || 0), 0);
  const pendingAmount = items.filter(i => i.status === 'pending').reduce((sum, i) => sum + parseFloat(i.amount || 0), 0);
  const approvedAmount = items.filter(i => i.status === 'approved').reduce((sum, i) => sum + parseFloat(i.amount || 0), 0);

  const statusColor = { pending: '#f59e0b', approved: '#10b981', rejected: '#ef4444', reimbursed: '#3b82f6' };

  if (selected && !showForm) {
    return (
      <div>
        <button className="back-btn" onClick={() => setSelected(null)}>&larr; Back to Expenses</button>
        <div className="detail-view">
          <div className="detail-header">
            <div>
              <h3>{selected.description}</h3>
              <div className="card-meta" style={{ marginTop: 8 }}>
                <span className="badge" style={{ background: `${statusColor[selected.status]}20`, color: statusColor[selected.status] }}>{selected.status}</span>
                <span className="badge" style={{ background: 'rgba(59,130,246,0.15)', color: '#3b82f6' }}>{selected.category}</span>
              </div>
            </div>
            <div className="detail-actions">
              <button className="btn btn-secondary" onClick={() => handleEdit(selected)}>Edit</button>
              <button className="btn btn-danger" onClick={() => handleDelete(selected.id)}>Delete</button>
            </div>
          </div>
          <div className="detail-grid">
            <div className="detail-field">
              <div className="field-label">Amount</div>
              <div className="field-value" style={{ fontSize: 28, fontWeight: 800, color: '#10b981' }}>${parseFloat(selected.amount || 0).toFixed(2)}</div>
            </div>
            <div className="detail-field">
              <div className="field-label">Date</div>
              <div className="field-value">{selected.expense_date ? new Date(selected.expense_date).toLocaleDateString() : 'N/A'}</div>
            </div>
            <div className="detail-field">
              <div className="field-label">Reporter</div>
              <div className="field-value">{selected.reporter || 'N/A'}</div>
            </div>
            <div className="detail-field">
              <div className="field-label">Receipt Ref</div>
              <div className="field-value">{selected.receipt_ref || 'N/A'}</div>
            </div>
            <div className="detail-field">
              <div className="field-label">Related Story</div>
              <div className="field-value">{selected.related_story || 'N/A'}</div>
            </div>
            <div className="detail-field">
              <div className="field-label">Created</div>
              <div className="field-value">{new Date(selected.created_at).toLocaleString()}</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Expense Reports</h2>
          <p className="subtitle">Track and manage reporting expenses and reimbursements</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setForm(emptyForm); setEditing(false); setShowForm(true); }}>+ New Expense</button>
      </div>

      <div className="stats-row">
        <div className="stat-box"><div className="stat-number">${totalAmount.toFixed(2)}</div><div className="stat-label">Total</div></div>
        <div className="stat-box"><div className="stat-number" style={{ color: '#f59e0b' }}>${pendingAmount.toFixed(2)}</div><div className="stat-label">Pending</div></div>
        <div className="stat-box"><div className="stat-number" style={{ color: '#10b981' }}>${approvedAmount.toFixed(2)}</div><div className="stat-label">Approved</div></div>
        <div className="stat-box"><div className="stat-number">{items.length}</div><div className="stat-label">Entries</div></div>
      </div>

      <div style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', overflow: 'hidden' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Description</th>
              <th>Amount</th>
              <th>Category</th>
              <th>Date</th>
              <th>Reporter</th>
              <th>Story</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} onClick={() => setSelected(item)}>
                <td style={{ fontWeight: 600, color: 'var(--text-bright)' }}>{item.description}</td>
                <td style={{ fontWeight: 700, color: '#10b981' }}>${parseFloat(item.amount || 0).toFixed(2)}</td>
                <td><span className="badge" style={{ background: 'rgba(59,130,246,0.15)', color: '#3b82f6' }}>{item.category}</span></td>
                <td style={{ fontSize: 13 }}>{item.expense_date ? new Date(item.expense_date).toLocaleDateString() : '-'}</td>
                <td style={{ fontSize: 13 }}>{item.reporter || '-'}</td>
                <td style={{ fontSize: 13, color: 'var(--text-dim)' }}>{item.related_story || '-'}</td>
                <td><span className="badge" style={{ background: `${statusColor[item.status]}20`, color: statusColor[item.status] }}>{item.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showForm && (
        <Modal title={editing ? 'Edit Expense' : 'New Expense'} onClose={() => { setShowForm(false); setEditing(false); }}>
          <div className="form-group">
            <label>Description</label>
            <input className="form-control" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="What was the expense for?" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="form-group">
              <label>Amount ($)</label>
              <input className="form-control" type="number" step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="0.00" />
            </div>
            <div className="form-group">
              <label>Category</label>
              <select className="form-control" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                <option value="travel">Travel</option>
                <option value="meals">Meals</option>
                <option value="equipment">Equipment</option>
                <option value="subscription">Subscription</option>
                <option value="communication">Communication</option>
                <option value="lodging">Lodging</option>
                <option value="transportation">Transportation</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="form-group">
              <label>Date</label>
              <input type="date" className="form-control" value={form.expense_date} onChange={(e) => setForm({ ...form, expense_date: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Status</label>
              <select className="form-control" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="reimbursed">Reimbursed</option>
              </select>
            </div>
            <div className="form-group">
              <label>Reporter</label>
              <input className="form-control" value={form.reporter} onChange={(e) => setForm({ ...form, reporter: e.target.value })} placeholder="Who incurred the expense" />
            </div>
            <div className="form-group">
              <label>Receipt Reference</label>
              <input className="form-control" value={form.receipt_ref} onChange={(e) => setForm({ ...form, receipt_ref: e.target.value })} placeholder="Receipt # or reference" />
            </div>
          </div>
          <div className="form-group">
            <label>Related Story</label>
            <input className="form-control" value={form.related_story} onChange={(e) => setForm({ ...form, related_story: e.target.value })} placeholder="Associated story (optional)" />
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
