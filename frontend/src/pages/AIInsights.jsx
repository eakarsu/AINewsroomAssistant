import React, { useState } from 'react';
import { ai } from '../services/api';

const TOOLS = [
  { id: 'competitive', label: 'Story Competitive Analysis' },
  { id: 'source-match', label: 'Source Matching' },
  { id: 'correction', label: 'Correction Suggestion' },
  { id: 'embargo', label: 'Embargo Management' },
  { id: 'a11y', label: 'Alt Text & Captions' },
];

export default function AIInsights({ showToast }) {
  const [activeTool, setActiveTool] = useState('competitive');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const [compForm, setCompForm] = useState({ topic: '', angle: '', published_articles: '', target_outlet: '' });
  const [matchForm, setMatchForm] = useState({ story_topic: '', desired_perspective: '', source_pool: '' });
  const [corrForm, setCorrForm] = useState({ original_article: '', error_description: '', context: '' });
  const [embargoForm, setEmbargoForm] = useState({ story_title: '', embargo_until: '', jurisdictions: '', distribution_partners: '', sensitivity: 'standard' });
  const [a11yForm, setA11yForm] = useState({ media_kind: 'image', media_description: '', headline: '', caption_lang: 'en', audience: 'general' });

  const run = async () => {
    setLoading(true);
    setResult(null);
    setError('');
    try {
      let r;
      if (activeTool === 'competitive') {
        const body = {
          topic: compForm.topic,
          angle: compForm.angle,
          target_outlet: compForm.target_outlet,
        };
        if (compForm.published_articles.trim()) {
          try {
            body.published_articles = JSON.parse(compForm.published_articles);
          } catch {
            body.published_articles = compForm.published_articles
              .split('\n')
              .map((s) => s.trim())
              .filter(Boolean);
          }
        }
        r = await ai.storyCompetitiveAnalysis(body);
      } else if (activeTool === 'source-match') {
        const body = {
          story_topic: matchForm.story_topic,
          desired_perspective: matchForm.desired_perspective,
        };
        if (matchForm.source_pool.trim()) {
          try {
            body.source_pool = JSON.parse(matchForm.source_pool);
          } catch {
            body.source_pool = matchForm.source_pool;
          }
        }
        r = await ai.sourceMatching(body);
      } else if (activeTool === 'correction') {
        r = await ai.correctionSuggestion({
          original_article: corrForm.original_article,
          error_description: corrForm.error_description,
          context: corrForm.context,
        });
      } else if (activeTool === 'embargo') {
        const body = {
          story_title: embargoForm.story_title,
          embargo_until: embargoForm.embargo_until,
          sensitivity: embargoForm.sensitivity,
        };
        if (embargoForm.jurisdictions.trim()) {
          try { body.jurisdictions = JSON.parse(embargoForm.jurisdictions); }
          catch { body.jurisdictions = embargoForm.jurisdictions.split(',').map(s => s.trim()).filter(Boolean); }
        }
        if (embargoForm.distribution_partners.trim()) {
          try { body.distribution_partners = JSON.parse(embargoForm.distribution_partners); }
          catch { body.distribution_partners = embargoForm.distribution_partners.split(',').map(s => s.trim()).filter(Boolean); }
        }
        r = await ai.embargoManagement(body);
      } else {
        r = await ai.accessibilityAltCaption({
          media_kind: a11yForm.media_kind,
          media_description: a11yForm.media_description,
          headline: a11yForm.headline,
          caption_lang: a11yForm.caption_lang,
          audience: a11yForm.audience,
        });
      }
      setResult(r);
    } catch (err) {
      const msg = err.message || 'AI request failed';
      setError(msg);
      showToast && showToast(msg, 'error');
    }
    setLoading(false);
  };

  const renderResult = () => {
    if (!result) return null;
    const data = result.result || result.data || result.parsed || result;
    return (
      <pre style={{ background: '#1e293b', color: '#94a3b8', borderRadius: 8, padding: 16, fontSize: 12, overflow: 'auto', maxHeight: 500 }}>
        {typeof data === 'string' ? data : JSON.stringify(data, null, 2)}
      </pre>
    );
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>AI Insights</h1>
          <p>Competitive analysis, source matching, and correction tools</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        {TOOLS.map((tool) => (
          <button
            key={tool.id}
            onClick={() => { setActiveTool(tool.id); setResult(null); setError(''); }}
            className={`btn ${activeTool === tool.id ? 'btn-primary' : 'btn-secondary'}`}
          >
            {tool.label}
          </button>
        ))}
      </div>

      {activeTool === 'competitive' && (
        <div className="card">
          <div className="card-header">
            <h2>Story Competitive Analysis</h2>
            <p style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>Compare against published articles and find a unique angle.</p>
          </div>
          <div className="card-body">
            <div className="form-grid-2">
              <div className="form-group">
                <label>Topic *</label>
                <input value={compForm.topic} onChange={(e) => setCompForm({ ...compForm, topic: e.target.value })} placeholder="e.g., AI regulation in EU" />
              </div>
              <div className="form-group">
                <label>Your Angle</label>
                <input value={compForm.angle} onChange={(e) => setCompForm({ ...compForm, angle: e.target.value })} placeholder="Small business impact" />
              </div>
              <div className="form-group">
                <label>Target Outlet</label>
                <input value={compForm.target_outlet} onChange={(e) => setCompForm({ ...compForm, target_outlet: e.target.value })} placeholder="National daily, trade pub..." />
              </div>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label>Published Articles (one per line, or JSON)</label>
                <textarea
                  rows={5}
                  value={compForm.published_articles}
                  onChange={(e) => setCompForm({ ...compForm, published_articles: e.target.value })}
                  placeholder="Headline 1&#10;Headline 2&#10;..."
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTool === 'source-match' && (
        <div className="card">
          <div className="card-header">
            <h2>Source Matching</h2>
            <p style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>Match the best sources from your contact pool to a story.</p>
          </div>
          <div className="card-body">
            <div className="form-grid-2">
              <div className="form-group">
                <label>Story Topic *</label>
                <input value={matchForm.story_topic} onChange={(e) => setMatchForm({ ...matchForm, story_topic: e.target.value })} placeholder="e.g., Hospital staffing shortages" />
              </div>
              <div className="form-group">
                <label>Desired Perspective</label>
                <input value={matchForm.desired_perspective} onChange={(e) => setMatchForm({ ...matchForm, desired_perspective: e.target.value })} placeholder="Frontline nurse view" />
              </div>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label>Source Pool (JSON or free text)</label>
                <textarea
                  rows={5}
                  value={matchForm.source_pool}
                  onChange={(e) => setMatchForm({ ...matchForm, source_pool: e.target.value })}
                  placeholder='[{"name":"Dr. Smith","expertise":"public health"}]'
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTool === 'correction' && (
        <div className="card">
          <div className="card-header">
            <h2>Correction Suggestion</h2>
            <p style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>Draft a publishable correction notice.</p>
          </div>
          <div className="card-body">
            <div className="form-group">
              <label>Original Article *</label>
              <textarea rows={6} value={corrForm.original_article} onChange={(e) => setCorrForm({ ...corrForm, original_article: e.target.value })} placeholder="Paste the article text..." />
            </div>
            <div className="form-group">
              <label>Error Description *</label>
              <textarea rows={3} value={corrForm.error_description} onChange={(e) => setCorrForm({ ...corrForm, error_description: e.target.value })} placeholder="What is incorrect?" />
            </div>
            <div className="form-group">
              <label>Context</label>
              <textarea rows={2} value={corrForm.context} onChange={(e) => setCorrForm({ ...corrForm, context: e.target.value })} placeholder="Any additional context" />
            </div>
          </div>
        </div>
      )}

      {activeTool === 'embargo' && (
        <div className="card">
          <div className="card-header">
            <h2>Embargo Management</h2>
            <p style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>Build a multi-timezone embargo plan with partner notifications and leak-risk mitigations.</p>
          </div>
          <div className="card-body">
            <div className="form-grid-2">
              <div className="form-group">
                <label>Story Title *</label>
                <input value={embargoForm.story_title} onChange={(e) => setEmbargoForm({ ...embargoForm, story_title: e.target.value })} placeholder="e.g., Quarterly earnings exclusive" />
              </div>
              <div className="form-group">
                <label>Embargo Until (ISO datetime)</label>
                <input value={embargoForm.embargo_until} onChange={(e) => setEmbargoForm({ ...embargoForm, embargo_until: e.target.value })} placeholder="2025-06-15T13:00:00Z" />
              </div>
              <div className="form-group">
                <label>Sensitivity</label>
                <select value={embargoForm.sensitivity} onChange={(e) => setEmbargoForm({ ...embargoForm, sensitivity: e.target.value })}>
                  {['standard', 'elevated', 'highly-sensitive'].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Jurisdictions (comma-separated or JSON)</label>
                <input value={embargoForm.jurisdictions} onChange={(e) => setEmbargoForm({ ...embargoForm, jurisdictions: e.target.value })} placeholder="US, UK, EU, JP" />
              </div>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label>Distribution Partners (comma-separated or JSON)</label>
                <textarea rows={3} value={embargoForm.distribution_partners} onChange={(e) => setEmbargoForm({ ...embargoForm, distribution_partners: e.target.value })} placeholder="Wire service, syndication partner, broadcast affiliate..." />
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTool === 'a11y' && (
        <div className="card">
          <div className="card-header">
            <h2>Accessibility - Alt Text & Captions</h2>
            <p style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>Generate WCAG-compliant alt text and caption variants for newsroom media.</p>
          </div>
          <div className="card-body">
            <div className="form-grid-2">
              <div className="form-group">
                <label>Media Kind</label>
                <select value={a11yForm.media_kind} onChange={(e) => setA11yForm({ ...a11yForm, media_kind: e.target.value })}>
                  {['image', 'photo', 'chart', 'infographic', 'video-still', 'audio'].map(k => <option key={k} value={k}>{k}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Caption Language</label>
                <input value={a11yForm.caption_lang} onChange={(e) => setA11yForm({ ...a11yForm, caption_lang: e.target.value })} placeholder="en" />
              </div>
              <div className="form-group">
                <label>Headline / Story Context</label>
                <input value={a11yForm.headline} onChange={(e) => setA11yForm({ ...a11yForm, headline: e.target.value })} placeholder="Headline this media accompanies" />
              </div>
              <div className="form-group">
                <label>Audience</label>
                <input value={a11yForm.audience} onChange={(e) => setA11yForm({ ...a11yForm, audience: e.target.value })} placeholder="general | trade | local | wire" />
              </div>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label>Reporter-Supplied Description *</label>
                <textarea rows={5} value={a11yForm.media_description} onChange={(e) => setA11yForm({ ...a11yForm, media_description: e.target.value })} placeholder="Describe what the media shows so AI can generate WCAG alt text & captions." />
              </div>
            </div>
          </div>
        </div>
      )}

      <div style={{ marginTop: 16 }}>
        <button className="btn btn-primary" onClick={run} disabled={loading}>
          {loading ? 'Running...' : 'Run AI'}
        </button>
      </div>

      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', padding: 12, borderRadius: 8, marginTop: 16, fontSize: 14 }}>
          {error}
        </div>
      )}

      {result && (
        <div className="card" style={{ marginTop: 16 }}>
          <div className="card-header">
            <h2>Result</h2>
          </div>
          <div className="card-body">{renderResult()}</div>
        </div>
      )}
    </div>
  );
}
