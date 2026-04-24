import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { storyLeads, sources, factChecks, deadlines, biasReports, articleDrafts, trendingTopics, interviews, mediaAssets, editorialCalendar, contacts, notes, expenses } from '../services/api';

export default function Dashboard() {
  const navigate = useNavigate();
  const [counts, setCounts] = useState({ leads: 0, sources: 0, facts: 0, deadlines: 0, bias: 0, drafts: 0, trends: 0, interviews: 0, media: 0, calendar: 0, contacts: 0, notes: 0, expenses: 0 });
  const [recentLeads, setRecentLeads] = useState([]);
  const [urgentDeadlines, setUrgentDeadlines] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [l, s, f, d, b, ad, tt, iv, ma, ec, ct, nt, ex] = await Promise.all([
        storyLeads.getAll(),
        sources.getAll(),
        factChecks.getAll(),
        deadlines.getAll(),
        biasReports.getAll(),
        articleDrafts.getAll(),
        trendingTopics.getAll(),
        interviews.getAll(),
        mediaAssets.getAll(),
        editorialCalendar.getAll(),
        contacts.getAll(),
        notes.getAll(),
        expenses.getAll(),
      ]);
      setCounts({ leads: l.length, sources: s.length, facts: f.length, deadlines: d.length, bias: b.length, drafts: ad.length, trends: tt.length, interviews: iv.length, media: ma.length, calendar: ec.length, contacts: ct.length, notes: nt.length, expenses: ex.length });
      setRecentLeads(l.slice(0, 5));
      setUrgentDeadlines(d.filter(x => x.priority === 'critical' || x.priority === 'high').slice(0, 5));
    } catch (err) {
      console.error(err);
    }
  };

  const cards = [
    { key: 'leads', path: '/story-leads', icon: '\u26A1', title: 'Story Leads', desc: 'AI-powered story lead identification from data feeds', cls: 'dc-leads' },
    { key: 'sources', path: '/sources', icon: '\u2714', title: 'Source Verification', desc: 'Verify source credibility and reliability', cls: 'dc-sources' },
    { key: 'facts', path: '/fact-checks', icon: '\u2691', title: 'Fact Checking', desc: 'Automated fact-checking and claim verification', cls: 'dc-facts' },
    { key: 'deadlines', path: '/deadlines', icon: '\u23F0', title: 'Deadline Management', desc: 'Track and manage editorial deadlines', cls: 'dc-deadlines' },
    { key: 'bias', path: '/bias-reports', icon: '\u2696', title: 'Bias Detection', desc: 'AI-powered bias analysis in articles', cls: 'dc-bias' },
    { key: 'drafts', path: '/article-drafts', icon: '\u270F', title: 'Article Drafts', desc: 'AI-assisted article writing and editing', cls: 'dc-drafts' },
    { key: 'trends', path: '/trending-topics', icon: '\u{1F4C8}', title: 'Trending Topics', desc: 'Track and analyze trending news topics', cls: 'dc-trends' },
    { key: 'interviews', path: '/interviews', icon: '\u{1F3A4}', title: 'Interviews', desc: 'Schedule interviews with AI question prep', cls: 'dc-interviews' },
    { key: 'media', path: '/media-assets', icon: '\u{1F4F7}', title: 'Media Assets', desc: 'Manage photos, videos, and documents', cls: 'dc-media' },
    { key: 'calendar', path: '/editorial-calendar', icon: '\u{1F4C5}', title: 'Editorial Calendar', desc: 'Plan content with AI strategy insights', cls: 'dc-calendar' },
    { key: 'contacts', path: '/contacts', icon: '\u{1F4D1}', title: 'Contact Book', desc: 'Manage newsroom contacts and sources directory', cls: 'dc-contacts' },
    { key: 'notes', path: '/notes', icon: '\u{1F4DD}', title: 'Notes', desc: 'Quick notes, research, and story ideas', cls: 'dc-notes' },
    { key: 'expenses', path: '/expenses', icon: '\u{1F4B0}', title: 'Expenses', desc: 'Track reporting expenses and reimbursements', cls: 'dc-expenses' },
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Dashboard</h2>
          <p className="subtitle">AI-Powered Newsroom Intelligence Overview</p>
        </div>
      </div>

      <div className="dashboard-cards">
        {cards.map((card) => (
          <div key={card.key} className={`dashboard-card ${card.cls}`} onClick={() => navigate(card.path)}>
            <div className="card-icon">{card.icon}</div>
            <h3>{card.title}</h3>
            <p>{card.desc}</p>
            <div className="card-count">{counts[card.key]}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        <div className="detail-view">
          <h3 style={{ fontSize: 18, marginBottom: 16, color: 'var(--text-bright)' }}>Recent Story Leads</h3>
          {recentLeads.map((lead) => (
            <div key={lead.id} className="card" style={{ marginBottom: 12, padding: 16 }} onClick={() => navigate('/story-leads')}>
              <div className="card-title" style={{ fontSize: 14 }}>{lead.title}</div>
              <div className="card-meta">
                <span className={`badge badge-${lead.priority}`}>{lead.priority}</span>
                <span className={`badge badge-${lead.status}`}>{lead.status}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="detail-view">
          <h3 style={{ fontSize: 18, marginBottom: 16, color: 'var(--text-bright)' }}>Urgent Deadlines</h3>
          {urgentDeadlines.map((dl) => (
            <div key={dl.id} className="card" style={{ marginBottom: 12, padding: 16 }} onClick={() => navigate('/deadlines')}>
              <div className="card-title" style={{ fontSize: 14 }}>{dl.title}</div>
              <div className="card-meta">
                <span className={`badge badge-${dl.priority}`}>{dl.priority}</span>
                <span style={{ fontSize: 12, color: 'var(--text-dim)' }}>
                  Due: {new Date(dl.due_date).toLocaleString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
