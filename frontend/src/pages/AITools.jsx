import React, { useState } from 'react';
import { ai } from '../services/api';

const TOOLS = [
  { id: 'headline', label: 'Headline Optimizer' },
  { id: 'angles', label: 'Story Angle Generator' },
  { id: 'readability', label: 'Readability Scorer' },
  { id: 'credibility', label: 'Source Credibility Scorer' },
];

export default function AITools({ showToast }) {
  const [activeTool, setActiveTool] = useState('headline');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  // Headline optimizer form
  const [headlineForm, setHeadlineForm] = useState({ title: '', content: '', category: '', target_audience: '' });

  // Angles form
  const [anglesForm, setAnglesForm] = useState({ topic: '', context: '', audience: '', outlet_type: '' });

  // Readability form
  const [readabilityForm, setReadabilityForm] = useState({ title: '', content: '', target_grade_level: 'Grade 8' });

  // Credibility form
  const [credibilityForm, setCredibilityForm] = useState({ source_name: '', source_type: '', url: '', track_record: '', context: '' });

  const run = async (apiCall, data) => {
    setLoading(true);
    setResult(null);
    try {
      const r = await apiCall(data);
      setResult(r);
    } catch (err) {
      showToast(err.message || 'AI error', 'error');
    }
    setLoading(false);
  };

  const renderJSON = (obj) => {
    if (!obj) return null;
    return (
      <pre style={{ background: '#1e293b', color: '#94a3b8', borderRadius: 8, padding: 16, fontSize: 12, overflow: 'auto', maxHeight: 400 }}>
        {JSON.stringify(obj, null, 2)}
      </pre>
    );
  };

  const renderText = (text) => {
    if (!text) return null;
    return (
      <div style={{ background: '#f8fafc', borderRadius: 8, padding: 16, whiteSpace: 'pre-wrap', fontSize: 14, lineHeight: 1.7, color: '#334155', marginTop: 12 }}>
        {text}
      </div>
    );
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>AI Tools</h1>
          <p>Advanced AI writing and analysis tools</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        {TOOLS.map(tool => (
          <button
            key={tool.id}
            onClick={() => { setActiveTool(tool.id); setResult(null); }}
            className={`btn ${activeTool === tool.id ? 'btn-primary' : 'btn-secondary'}`}
          >
            {tool.label}
          </button>
        ))}
      </div>

      {activeTool === 'headline' && (
        <div className="card">
          <div className="card-header">
            <h2>Headline Optimizer — A/B Variants</h2>
            <p style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>Generate multiple headline variants with click and SEO scores.</p>
          </div>
          <div className="card-body">
            <div className="form-grid-2">
              <div className="form-group">
                <label>Original Headline *</label>
                <input value={headlineForm.title} onChange={e => setHeadlineForm({ ...headlineForm, title: e.target.value })} placeholder="Your current headline" />
              </div>
              <div className="form-group">
                <label>Category</label>
                <select value={headlineForm.category} onChange={e => setHeadlineForm({ ...headlineForm, category: e.target.value })}>
                  <option value="">General</option>
                  {['Politics', 'Business', 'Tech', 'Health', 'Science', 'Sports', 'Culture', 'Local', 'International'].map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Target Audience</label>
                <input value={headlineForm.target_audience} onChange={e => setHeadlineForm({ ...headlineForm, target_audience: e.target.value })} placeholder="e.g., Young professionals" />
              </div>
            </div>
            <div className="form-group">
              <label>Article Content (optional)</label>
              <textarea rows={4} value={headlineForm.content} onChange={e => setHeadlineForm({ ...headlineForm, content: e.target.value })} placeholder="Paste article content for better headlines..." />
            </div>
            <button className="btn btn-primary" disabled={loading || !headlineForm.title} onClick={() => run(ai.optimizeHeadline, headlineForm)}>
              {loading ? 'Optimizing...' : 'Optimize Headlines'}
            </button>

            {result && result.parsed && (
              <div style={{ marginTop: 20 }}>
                <h3 style={{ marginBottom: 12 }}>Headline Variants</h3>
                {result.parsed.headline_variants?.map((v, i) => (
                  <div key={i} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: 14, marginBottom: 10 }}>
                    <div style={{ fontWeight: 700, fontSize: 15, color: '#0f172a', marginBottom: 6 }}>{v.headline}</div>
                    <div style={{ display: 'flex', gap: 12, fontSize: 12, color: '#64748b', flexWrap: 'wrap' }}>
                      <span>Type: <strong>{v.type}</strong></span>
                      <span>Click Score: <strong style={{ color: '#10b981' }}>{v.click_score}/10</strong></span>
                      <span>SEO Score: <strong style={{ color: '#3b82f6' }}>{v.seo_score}/10</strong></span>
                    </div>
                    {v.rationale && <p style={{ fontSize: 13, color: '#475569', margin: '6px 0 0' }}>{v.rationale}</p>}
                  </div>
                ))}
                {result.parsed.winner_recommendation && (
                  <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 8, padding: 12, marginTop: 8 }}>
                    <strong style={{ color: '#166534' }}>Recommendation: </strong>
                    <span style={{ color: '#374151' }}>{result.parsed.winner_recommendation}</span>
                  </div>
                )}
                {result.parsed.meta_description && (
                  <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 8, padding: 12, marginTop: 8 }}>
                    <strong style={{ color: '#1d4ed8' }}>Meta Description: </strong>
                    <span style={{ color: '#374151', fontSize: 13 }}>{result.parsed.meta_description}</span>
                  </div>
                )}
                {result.parsed.social_headline && (
                  <div style={{ background: '#fef3c7', border: '1px solid #fde68a', borderRadius: 8, padding: 12, marginTop: 8 }}>
                    <strong style={{ color: '#92400e' }}>Social Media: </strong>
                    <span style={{ color: '#374151' }}>{result.parsed.social_headline}</span>
                  </div>
                )}
                {!result.parsed.headline_variants && renderText(result.result)}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTool === 'angles' && (
        <div className="card">
          <div className="card-header">
            <h2>Story Angle Generator</h2>
            <p style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>Generate unique story angles with hooks, sources, and impact scores.</p>
          </div>
          <div className="card-body">
            <div className="form-group">
              <label>Topic *</label>
              <input value={anglesForm.topic} onChange={e => setAnglesForm({ ...anglesForm, topic: e.target.value })} placeholder="e.g., Rising inflation and grocery prices" />
            </div>
            <div className="form-group">
              <label>Context / Background</label>
              <textarea rows={3} value={anglesForm.context} onChange={e => setAnglesForm({ ...anglesForm, context: e.target.value })} placeholder="Any additional context..." />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="form-group">
                <label>Target Audience</label>
                <input value={anglesForm.audience} onChange={e => setAnglesForm({ ...anglesForm, audience: e.target.value })} placeholder="e.g., Suburban families" />
              </div>
              <div className="form-group">
                <label>Outlet Type</label>
                <select value={anglesForm.outlet_type} onChange={e => setAnglesForm({ ...anglesForm, outlet_type: e.target.value })}>
                  <option value="">Select...</option>
                  {['Digital news', 'Print newspaper', 'TV broadcast', 'Podcast', 'Magazine', 'Investigative', 'Local news'].map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
            </div>
            <button className="btn btn-primary" disabled={loading || !anglesForm.topic} onClick={() => run(ai.generateAngles, anglesForm)}>
              {loading ? 'Generating...' : 'Generate Angles'}
            </button>

            {result && (
              <div style={{ marginTop: 20 }}>
                {result.parsed?.angles?.map((angle, i) => (
                  <div key={i} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: 14, marginBottom: 10 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ fontWeight: 700, fontSize: 14, color: '#0f172a' }}>{angle.angle}</div>
                      <div style={{ display: 'flex', gap: 8, flexShrink: 0, marginLeft: 12 }}>
                        <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 12, background: '#e0f2fe', color: '#0369a1' }}>{angle.difficulty}</span>
                        <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 12, background: '#dcfce7', color: '#166534' }}>Impact: {angle.impact_score}/10</span>
                      </div>
                    </div>
                    {angle.unique_hook && <p style={{ fontSize: 13, color: '#475569', margin: '6px 0 4px', fontStyle: 'italic' }}>{angle.unique_hook}</p>}
                    {angle.approach && <p style={{ fontSize: 13, color: '#374151', margin: '4px 0' }}>{angle.approach}</p>}
                    {angle.sources_needed?.length > 0 && (
                      <div style={{ fontSize: 12, color: '#64748b', marginTop: 6 }}>Sources: {angle.sources_needed.join(' · ')}</div>
                    )}
                  </div>
                ))}
                {result.parsed?.recommended_angle && (
                  <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 8, padding: 12, marginTop: 8 }}>
                    <strong style={{ color: '#166534' }}>Best Angle: </strong>
                    <span style={{ color: '#374151', fontSize: 13 }}>{result.parsed.recommended_angle}</span>
                  </div>
                )}
                {!result.parsed?.angles && renderText(result.result)}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTool === 'readability' && (
        <div className="card">
          <div className="card-header">
            <h2>Readability Scorer</h2>
            <p style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>Analyze article readability and get improvement suggestions.</p>
          </div>
          <div className="card-body">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="form-group">
                <label>Article Title</label>
                <input value={readabilityForm.title} onChange={e => setReadabilityForm({ ...readabilityForm, title: e.target.value })} placeholder="Article title" />
              </div>
              <div className="form-group">
                <label>Target Grade Level</label>
                <select value={readabilityForm.target_grade_level} onChange={e => setReadabilityForm({ ...readabilityForm, target_grade_level: e.target.value })}>
                  {['Grade 6', 'Grade 8', 'Grade 10', 'Grade 12', 'College', 'Professional'].map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
            </div>
            <div className="form-group">
              <label>Article Content *</label>
              <textarea rows={8} value={readabilityForm.content} onChange={e => setReadabilityForm({ ...readabilityForm, content: e.target.value })} placeholder="Paste your article content here..." />
            </div>
            <button className="btn btn-primary" disabled={loading || !readabilityForm.content} onClick={() => run(ai.scoreReadability, readabilityForm)}>
              {loading ? 'Analyzing...' : 'Score Readability'}
            </button>

            {result && result.parsed && (
              <div style={{ marginTop: 20 }}>
                <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
                  <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 8, padding: '12px 16px', flex: 1, minWidth: 120, textAlign: 'center' }}>
                    <div style={{ fontSize: 28, fontWeight: 800, color: '#166534' }}>{result.parsed.overall_score ?? '-'}</div>
                    <div style={{ fontSize: 12, color: '#6b7280' }}>Overall Score /100</div>
                  </div>
                  <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 8, padding: '12px 16px', flex: 1, minWidth: 120, textAlign: 'center' }}>
                    <div style={{ fontSize: 18, fontWeight: 700, color: '#1d4ed8' }}>{result.parsed.grade_level ?? '-'}</div>
                    <div style={{ fontSize: 12, color: '#6b7280' }}>Grade Level</div>
                  </div>
                  <div style={{ background: '#fef3c7', border: '1px solid #fde68a', borderRadius: 8, padding: '12px 16px', flex: 1, minWidth: 120, textAlign: 'center' }}>
                    <div style={{ fontSize: 18, fontWeight: 700, color: '#92400e' }}>{result.parsed.verdict ?? '-'}</div>
                    <div style={{ fontSize: 12, color: '#6b7280' }}>Verdict</div>
                  </div>
                </div>
                {result.parsed.improvements?.length > 0 && (
                  <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 8, padding: 14, marginBottom: 12 }}>
                    <h4 style={{ color: '#991b1b', marginBottom: 8 }}>Improvements Needed</h4>
                    {result.parsed.improvements.map((item, i) => (
                      <div key={i} style={{ fontSize: 13, color: '#374151', marginBottom: 4 }}>- {item}</div>
                    ))}
                  </div>
                )}
                {result.parsed.strengths?.length > 0 && (
                  <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 8, padding: 14, marginBottom: 12 }}>
                    <h4 style={{ color: '#166534', marginBottom: 8 }}>Strengths</h4>
                    {result.parsed.strengths.map((item, i) => (
                      <div key={i} style={{ fontSize: 13, color: '#374151', marginBottom: 4 }}>- {item}</div>
                    ))}
                  </div>
                )}
                {result.parsed.jargon_detected?.length > 0 && (
                  <div style={{ marginBottom: 12 }}>
                    <h4 style={{ marginBottom: 8 }}>Jargon Detected</h4>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      {result.parsed.jargon_detected.map((term, i) => (
                        <span key={i} style={{ background: '#fef3c7', color: '#92400e', padding: '2px 10px', borderRadius: 12, fontSize: 12, fontWeight: 600 }}>{term}</span>
                      ))}
                    </div>
                  </div>
                )}
                {!result.parsed.overall_score && renderText(result.result)}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTool === 'credibility' && (
        <div className="card">
          <div className="card-header">
            <h2>Source Credibility Scorer</h2>
            <p style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>Score any source for credibility, bias, and reliability.</p>
          </div>
          <div className="card-body">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="form-group">
                <label>Source Name *</label>
                <input value={credibilityForm.source_name} onChange={e => setCredibilityForm({ ...credibilityForm, source_name: e.target.value })} placeholder="e.g., John Smith, City Hall" />
              </div>
              <div className="form-group">
                <label>Source Type</label>
                <select value={credibilityForm.source_type} onChange={e => setCredibilityForm({ ...credibilityForm, source_type: e.target.value })}>
                  <option value="">Select...</option>
                  {['Government official', 'Academic expert', 'Industry insider', 'Whistleblower', 'Anonymous source', 'Think tank', 'NGO/Non-profit', 'Corporate PR', 'Social media post', 'Document/Report'].map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>URL / Publication</label>
                <input value={credibilityForm.url} onChange={e => setCredibilityForm({ ...credibilityForm, url: e.target.value })} placeholder="https://..." />
              </div>
            </div>
            <div className="form-group">
              <label>Track Record / Notes</label>
              <textarea rows={2} value={credibilityForm.track_record} onChange={e => setCredibilityForm({ ...credibilityForm, track_record: e.target.value })} placeholder="Any known history or concerns..." />
            </div>
            <div className="form-group">
              <label>Context of Use</label>
              <input value={credibilityForm.context} onChange={e => setCredibilityForm({ ...credibilityForm, context: e.target.value })} placeholder="What story is this source for?" />
            </div>
            <button className="btn btn-primary" disabled={loading || !credibilityForm.source_name} onClick={() => run(ai.scoreSourceCredibility, credibilityForm)}>
              {loading ? 'Scoring...' : 'Score Credibility'}
            </button>

            {result && result.parsed && (
              <div style={{ marginTop: 20 }}>
                <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
                  <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 8, padding: '12px 16px', flex: 1, textAlign: 'center' }}>
                    <div style={{ fontSize: 28, fontWeight: 800, color: '#166534' }}>{result.parsed.credibility_score ?? '-'}/100</div>
                    <div style={{ fontSize: 12, color: '#6b7280' }}>Credibility Score</div>
                  </div>
                  <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 8, padding: '12px 16px', flex: 1, textAlign: 'center' }}>
                    <div style={{ fontSize: 16, fontWeight: 700, color: '#1d4ed8' }}>{result.parsed.tier ?? '-'}</div>
                    <div style={{ fontSize: 12, color: '#6b7280' }}>Tier</div>
                  </div>
                  <div style={{ background: '#fef3c7', border: '1px solid #fde68a', borderRadius: 8, padding: '12px 16px', flex: 1, textAlign: 'center' }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#92400e' }}>{result.parsed.bias_assessment ?? '-'}</div>
                    <div style={{ fontSize: 12, color: '#6b7280' }}>Bias</div>
                  </div>
                </div>
                <div style={{ background: result.parsed.verdict?.includes('high') ? '#f0fdf4' : result.parsed.verdict?.includes('avoid') ? '#fef2f2' : '#fef3c7', borderRadius: 8, padding: 12, marginBottom: 12 }}>
                  <strong>Verdict: </strong>{result.parsed.verdict}
                </div>
                {result.parsed.risk_factors?.length > 0 && (
                  <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 8, padding: 14, marginBottom: 12 }}>
                    <h4 style={{ color: '#991b1b', marginBottom: 8 }}>Risk Factors</h4>
                    {result.parsed.risk_factors.map((f, i) => <div key={i} style={{ fontSize: 13, marginBottom: 4 }}>- {f}</div>)}
                  </div>
                )}
                {result.parsed.verification_requirements?.length > 0 && (
                  <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 8, padding: 14, marginBottom: 12 }}>
                    <h4 style={{ color: '#1d4ed8', marginBottom: 8 }}>Verification Required</h4>
                    {result.parsed.verification_requirements.map((r, i) => <div key={i} style={{ fontSize: 13, marginBottom: 4 }}>- {r}</div>)}
                  </div>
                )}
                {!result.parsed.credibility_score && renderText(result.result)}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
