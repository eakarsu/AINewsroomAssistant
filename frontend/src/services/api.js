const API_BASE = '/api';

function getHeaders() {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function request(endpoint, options = {}) {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: getHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

export const auth = {
  login: (email, password) => request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  register: (data) => request('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
};

export const storyLeads = {
  getAll: () => request('/story-leads'),
  getOne: (id) => request(`/story-leads/${id}`),
  create: (data) => request('/story-leads', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => request(`/story-leads/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => request(`/story-leads/${id}`, { method: 'DELETE' }),
};

export const sources = {
  getAll: () => request('/sources'),
  getOne: (id) => request(`/sources/${id}`),
  create: (data) => request('/sources', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => request(`/sources/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => request(`/sources/${id}`, { method: 'DELETE' }),
};

export const factChecks = {
  getAll: () => request('/fact-checks'),
  getOne: (id) => request(`/fact-checks/${id}`),
  create: (data) => request('/fact-checks', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => request(`/fact-checks/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => request(`/fact-checks/${id}`, { method: 'DELETE' }),
};

export const deadlines = {
  getAll: () => request('/deadlines'),
  getOne: (id) => request(`/deadlines/${id}`),
  create: (data) => request('/deadlines', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => request(`/deadlines/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => request(`/deadlines/${id}`, { method: 'DELETE' }),
};

export const biasReports = {
  getAll: () => request('/bias-reports'),
  getOne: (id) => request(`/bias-reports/${id}`),
  create: (data) => request('/bias-reports', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => request(`/bias-reports/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => request(`/bias-reports/${id}`, { method: 'DELETE' }),
};

export const articleDrafts = {
  getAll: () => request('/article-drafts'),
  getOne: (id) => request(`/article-drafts/${id}`),
  create: (data) => request('/article-drafts', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => request(`/article-drafts/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => request(`/article-drafts/${id}`, { method: 'DELETE' }),
};

export const trendingTopics = {
  getAll: () => request('/trending-topics'),
  getOne: (id) => request(`/trending-topics/${id}`),
  create: (data) => request('/trending-topics', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => request(`/trending-topics/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => request(`/trending-topics/${id}`, { method: 'DELETE' }),
};

export const interviews = {
  getAll: () => request('/interviews'),
  getOne: (id) => request(`/interviews/${id}`),
  create: (data) => request('/interviews', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => request(`/interviews/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => request(`/interviews/${id}`, { method: 'DELETE' }),
};

export const mediaAssets = {
  getAll: () => request('/media-assets'),
  getOne: (id) => request(`/media-assets/${id}`),
  create: (data) => request('/media-assets', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => request(`/media-assets/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => request(`/media-assets/${id}`, { method: 'DELETE' }),
};

export const editorialCalendar = {
  getAll: () => request('/editorial-calendar'),
  getOne: (id) => request(`/editorial-calendar/${id}`),
  create: (data) => request('/editorial-calendar', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => request(`/editorial-calendar/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => request(`/editorial-calendar/${id}`, { method: 'DELETE' }),
};

export const contacts = {
  getAll: () => request('/contacts'),
  getOne: (id) => request(`/contacts/${id}`),
  create: (data) => request('/contacts', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => request(`/contacts/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => request(`/contacts/${id}`, { method: 'DELETE' }),
};

export const notes = {
  getAll: () => request('/notes'),
  getOne: (id) => request(`/notes/${id}`),
  create: (data) => request('/notes', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => request(`/notes/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => request(`/notes/${id}`, { method: 'DELETE' }),
};

export const expenses = {
  getAll: () => request('/expenses'),
  getOne: (id) => request(`/expenses/${id}`),
  create: (data) => request('/expenses', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => request(`/expenses/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => request(`/expenses/${id}`, { method: 'DELETE' }),
};

export const ai = {
  analyzeLead: (data) => request('/ai/analyze-lead', { method: 'POST', body: JSON.stringify(data) }),
  verifySource: (data) => request('/ai/verify-source', { method: 'POST', body: JSON.stringify(data) }),
  factCheck: (data) => request('/ai/fact-check', { method: 'POST', body: JSON.stringify(data) }),
  analyzeBias: (data) => request('/ai/analyze-bias', { method: 'POST', body: JSON.stringify(data) }),
  prioritizeDeadlines: (data) => request('/ai/prioritize-deadlines', { method: 'POST', body: JSON.stringify(data) }),
  generateDraft: (data) => request('/ai/generate-draft', { method: 'POST', body: JSON.stringify(data) }),
  analyzeTrend: (data) => request('/ai/analyze-trend', { method: 'POST', body: JSON.stringify(data) }),
  generateQuestions: (data) => request('/ai/generate-questions', { method: 'POST', body: JSON.stringify(data) }),
  analyzeMedia: (data) => request('/ai/analyze-media', { method: 'POST', body: JSON.stringify(data) }),
  contentStrategy: (data) => request('/ai/content-strategy', { method: 'POST', body: JSON.stringify(data) }),
};
