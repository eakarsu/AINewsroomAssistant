import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import StoryLeads from './pages/StoryLeads';
import Sources from './pages/Sources';
import FactChecks from './pages/FactChecks';
import Deadlines from './pages/Deadlines';
import BiasReports from './pages/BiasReports';
import ArticleDrafts from './pages/ArticleDrafts';
import TrendingTopics from './pages/TrendingTopics';
import Interviews from './pages/Interviews';
import MediaAssets from './pages/MediaAssets';
import EditorialCalendar from './pages/EditorialCalendar';
import Contacts from './pages/Contacts';
import Notes from './pages/Notes';
import Expenses from './pages/Expenses';
import Layout from './components/Layout';

export default function App() {
  const [user, setUser] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleLogin = (userData, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <>
      <Layout user={user} onLogout={handleLogout}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/story-leads" element={<StoryLeads showToast={showToast} />} />
          <Route path="/sources" element={<Sources showToast={showToast} />} />
          <Route path="/fact-checks" element={<FactChecks showToast={showToast} />} />
          <Route path="/deadlines" element={<Deadlines showToast={showToast} />} />
          <Route path="/bias-reports" element={<BiasReports showToast={showToast} />} />
          <Route path="/article-drafts" element={<ArticleDrafts showToast={showToast} />} />
          <Route path="/trending-topics" element={<TrendingTopics showToast={showToast} />} />
          <Route path="/interviews" element={<Interviews showToast={showToast} />} />
          <Route path="/media-assets" element={<MediaAssets showToast={showToast} />} />
          <Route path="/editorial-calendar" element={<EditorialCalendar showToast={showToast} />} />
          <Route path="/contacts" element={<Contacts showToast={showToast} />} />
          <Route path="/notes" element={<Notes showToast={showToast} />} />
          <Route path="/expenses" element={<Expenses showToast={showToast} />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Layout>
      {toast && <div className={`toast toast-${toast.type}`}>{toast.message}</div>}
    </>
  );
}
