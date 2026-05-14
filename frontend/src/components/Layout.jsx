import React from 'react';
import { NavLink } from 'react-router-dom';

export default function Layout({ user, onLogout, children }) {
  const navItems = [
    { path: '/', label: 'Dashboard', icon: '\u25A6' },
    { path: '/story-leads', label: 'Story Leads', icon: '\u26A1' },
    { path: '/sources', label: 'Source Verification', icon: '\u2714' },
    { path: '/fact-checks', label: 'Fact Checking', icon: '\u2691' },
    { path: '/deadlines', label: 'Deadlines', icon: '\u23F0' },
    { path: '/bias-reports', label: 'Bias Detection', icon: '\u2696' },
    { path: '/article-drafts', label: 'Article Drafts', icon: '\u270F' },
    { path: '/trending-topics', label: 'Trending Topics', icon: '\u{1F4C8}' },
    { path: '/interviews', label: 'Interviews', icon: '\u{1F3A4}' },
    { path: '/media-assets', label: 'Media Assets', icon: '\u{1F4F7}' },
    { path: '/editorial-calendar', label: 'Editorial Calendar', icon: '\u{1F4C5}' },
    { path: '/contacts', label: 'Contact Book', icon: '\u{1F4D1}' },
    { path: '/notes', label: 'Notes', icon: '\u{1F4DD}' },
    { path: '/expenses', label: 'Expenses', icon: '\u{1F4B0}' },
    { path: '/ai-tools', label: 'AI Tools', icon: '\u2728' },
    { path: '/ai-insights', label: 'AI Insights', icon: '\u{1F50D}' },
    { path: '/ai-history', label: 'AI History', icon: '\u{1F916}' },
  ];

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <h1><span>AI</span> Newsroom</h1>
          <p>Intelligence Platform</p>
        </div>
        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) => isActive ? 'active' : ''}
            >
              <span className="nav-icon">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-user">
          <div className="user-info">
            <div className="user-name">{user.name}</div>
            <div className="user-role">{user.role}</div>
          </div>
          <button className="btn btn-sm btn-secondary" onClick={onLogout}>Logout</button>
        </div>
      </aside>
      <main className="main-content">
        {children}
      </main>
    </div>
  );
}
