import React, { useState, useEffect } from 'react';
import { articleDrafts, ai } from '../services/api';
import { extractData } from '../services/api';
import Modal from '../components/Modal';
import AIResponse from '../components/AIResponse';
import Pagination from '../components/Pagination';

const emptyForm = { title: '', content: '', category: '', status: 'draft', author: '', word_count: 0 };

export default function ArticleDrafts({ showToast }) {
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
  const [publishing, setPublishing] = useState(false);

  useEffect(() => { load(); }, [page]);

  const load = async () => {
    try {
      const response = await articleDrafts.getAll(page, 20);
      setItems(extractData(response));
      if (response.pagination) setPagination(response.pagination);
    } catch (e) { console.error(e); }
  };

  const handleSave = async () => {
    try {
      if (editing) {
        await articleDrafts.update(selected.id, form);
        showToast('Article draft updated');
      } else {
        await articleDrafts.create(form);
        showToast('Article draft created');
      }
      setShowForm(false);
      setForm(emptyForm);
      setEditing(false);
      setSelected(null);
      load();
    } catch (e) { showToast(e.message, 'error'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this article draft?')) return;
    try {
      await articleDrafts.delete(id);
      showToast('Article draft deleted');
      setSelected(null);
      load();
    } catch (e) { showToast(e.message, 'error'); }
  };

  const handleEdit = (item) => {
    setForm({ title: item.title, content: item.content || '', category: item.category || '', status: item.status, author: item.author || '', word_count: item.word_count || 0 });
    setEditing(true);
    setSelected(item);
    setShowForm(true);
  };

  const handleAiGenerate = async (item) => {
    setAiLoading(true);
    setAiError(null);
    setAiResult(null);
    try {
      const result = await ai.generateDraft({ title: item.title, content: item.content, category: item.category });
      if (result.success) { setAiResult(result); } else { setAiError(result.error); }
    } catch (e) { setAiError(e.message); }
    setAiLoading(false);
  };

  const handlePublish = async (item) => {
    if (!confirm(`Publish "${item.title}"? AI will generate SEO metadata.`)) return;
    setPublishing(true);
    try {
      const updated = await articleDrafts.publish(item.id);
      showToast('Article published with AI SEO metadata');
      if (selected && selected.id === item.id) setSelected(updated);
      load();
    } catch (e) { showToast(e.message, 'error'); }
    setPublishing(false);
  };

  if (selected && !showForm) {
    return (
      <div>
        <button className="back-btn" onClick={() => { setSelected(null); setAiResult(null); setAiError(null); }}>
          &larr; Back to Article Drafts
        </button>
        <div className="detail-view">
          <div className="detail-header">
            <div>
              <h3>{selected.title}</h3>
              <div className="card-meta" style={{ marginTop: 8 }}>
                <span className={`badge badge-${selected.status}`}>{selected.status}</span>
                {selected.status === 'published' && (
                  <span className="badge" style={{ background: 'rgba(16,185,129,0.2)', color: '#10b981', border: '1px solid #10b981' }}>Published</span>
                )}
                <span className="badge" style={{ background: 'rgba(59,130,246,0.15)', color: '#3b82f6' }}>{selected.category}</span>
              </div>
            </div>
            <div className="detail-actions">
              <button className="btn btn-ai" onClick={() => handleAiGenerate(selected)}>AI Generate</button>
              {selected.status !== 'published' && (
                <button className="btn btn-primary" onClick={() => handlePublish(selected)} disabled={publishing}>
                  {publishing ? 'Publishing...' : 'Publish'}
                </button>
              )}
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
              <div className="field-label">Word Count</div>
              <div className="field-value">{selected.word_count || 0}</div>
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
            <div className="field-label">Content</div>
            <div className="field-value">{selected.content || 'No content available'}</div>
          </div>
          {selected.seo_metadata && (
            <div className="detail-field" style={{ marginTop: 16 }}>
              <div className="field-label">SEO Metadata (AI Generated)</div>
              <div style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 8, padding: 16, marginTop: 8 }}>
                {typeof selected.seo_metadata === 'object' ? (
                  <pre style={{ margin: 0, fontSize: 12, color: 'var(--text-dim)', whiteSpace: 'pre-wrap' }}>
                    {JSON.stringify(selected.seo_metadata, null, 2)}
                  </pre>
                ) : (
                  <div style={{ color: 'var(--text-dim)', fontSize: 13 }}>{JSON.stringify(selected.seo_metadata)}</div>
                )}
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
          <h2>Article Drafts</h2>
          <p className="subtitle">AI-powered article drafting and management</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setForm(emptyForm); setEditing(false); setShowForm(true); }}>+ New Draft</button>
      </div>

      <div className="stats-row">
        <div className="stat-box"><div className="stat-number">{pagination ? pagination.total : items.length}</div><div className="stat-label">Total</div></div>
        <div className="stat-box"><div className="stat-number" style={{ color: '#3b82f6' }}>{items.filter(i => i.status === 'draft').length}</div><div className="stat-label">Draft</div></div>
        <div className="stat-box"><div className="stat-number" style={{ color: '#10b981' }}>{items.filter(i => i.status === 'published').length}</div><div className="stat-label">Published</div></div>
        <div className="stat-box"><div className="stat-number" style={{ color: '#a855f7' }}>{items.filter(i => i.status === 'in_review').length}</div><div className="stat-label">In Review</div></div>
      </div>

      <div className="card-grid">
        {items.map((item) => (
          <div key={item.id} className="card" style={{ position: 'relative' }}>
            <div onClick={() => setSelected(item)}>
              <div className="card-title">{item.title}</div>
              <div className="card-meta">
                <span className={`badge badge-${item.status}`}>{item.status}</span>
                {item.status === 'published' && (
                  <span className="badge" style={{ background: 'rgba(16,185,129,0.2)', color: '#10b981', border: '1px solid #10b981' }}>Published</span>
                )}
                {item.category && <span className="badge" style={{ background: 'rgba(59,130,246,0.15)', color: '#3b82f6' }}>{item.category}</span>}
                {item.author && <span className="badge" style={{ background: 'rgba(16,185,129,0.15)', color: '#10b981' }}>{item.author}</span>}
              </div>
              <div className="card-summary">{item.content}</div>
            </div>
            {item.status !== 'published' && (
              <div style={{ marginTop: 8 }}>
                <button
                  className="btn btn-sm btn-primary"
                  style={{ fontSize: 12, padding: '4px 10px' }}
                  onClick={(e) => { e.stopPropagation(); handlePublish(item); }}
                  disabled={publishing}
                >
                  Publish
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {pagination && (
        <Pagination page={page} totalPages={pagination.totalPages} onPageChange={setPage} />
      )}

      {showForm && (
        <Modal title={editing ? 'Edit Article Draft' : 'New Article Draft'} onClose={() => { setShowForm(false); setEditing(false); }}>
          <div className="form-group">
            <label>Title</label>
            <input className="form-control" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Article title" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="form-group">
              <label>Category</label>
              <input className="form-control" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="e.g. Technology" />
            </div>
            <div className="form-group">
              <label>Status</label>
              <select className="form-control" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                <option value="draft">Draft</option>
                <option value="in_review">In Review</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>
            <div className="form-group">
              <label>Author</label>
              <input className="form-control" value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} placeholder="Author name" />
            </div>
            <div className="form-group">
              <label>Word Count</label>
              <input className="form-control" type="number" value={form.word_count} onChange={(e) => setForm({ ...form, word_count: parseInt(e.target.value) || 0 })} placeholder="0" />
            </div>
          </div>
          <div className="form-group">
            <label>Content</label>
            <textarea className="form-control" value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} placeholder="Article content..." />
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
