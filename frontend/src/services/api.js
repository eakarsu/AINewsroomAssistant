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

// Helper: extract array from paginated or plain response
export function extractData(response) {
  if (Array.isArray(response)) return response;
  if (response && Array.isArray(response.data)) return response.data;
  return [];
}

export const auth = {
  login: (email, password) => request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  register: (data) => request('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
};

export const storyLeads = {
  getAll: (page = 1, limit = 100) => request(`/story-leads?page=${page}&limit=${limit}`),
  getOne: (id) => request(`/story-leads/${id}`),
  create: (data) => request('/story-leads', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => request(`/story-leads/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => request(`/story-leads/${id}`, { method: 'DELETE' }),
  ingestRss: (url) => request('/story-leads/ingest-rss', { method: 'POST', body: JSON.stringify({ url }) }),
};

export const sources = {
  getAll: (page = 1, limit = 100) => request(`/sources?page=${page}&limit=${limit}`),
  getOne: (id) => request(`/sources/${id}`),
  create: (data) => request('/sources', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => request(`/sources/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => request(`/sources/${id}`, { method: 'DELETE' }),
};

export const factChecks = {
  getAll: (page = 1, limit = 100) => request(`/fact-checks?page=${page}&limit=${limit}`),
  getOne: (id) => request(`/fact-checks/${id}`),
  create: (data) => request('/fact-checks', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => request(`/fact-checks/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => request(`/fact-checks/${id}`, { method: 'DELETE' }),
};

export const deadlines = {
  getAll: (page = 1, limit = 100) => request(`/deadlines?page=${page}&limit=${limit}`),
  getOne: (id) => request(`/deadlines/${id}`),
  create: (data) => request('/deadlines', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => request(`/deadlines/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => request(`/deadlines/${id}`, { method: 'DELETE' }),
};

export const biasReports = {
  getAll: (page = 1, limit = 100) => request(`/bias-reports?page=${page}&limit=${limit}`),
  getOne: (id) => request(`/bias-reports/${id}`),
  create: (data) => request('/bias-reports', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => request(`/bias-reports/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => request(`/bias-reports/${id}`, { method: 'DELETE' }),
};

export const articleDrafts = {
  getAll: (page = 1, limit = 100) => request(`/article-drafts?page=${page}&limit=${limit}`),
  getOne: (id) => request(`/article-drafts/${id}`),
  create: (data) => request('/article-drafts', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => request(`/article-drafts/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => request(`/article-drafts/${id}`, { method: 'DELETE' }),
  publish: (id) => request(`/article-drafts/${id}/publish`, { method: 'PUT' }),
};

export const trendingTopics = {
  getAll: (page = 1, limit = 100) => request(`/trending-topics?page=${page}&limit=${limit}`),
  getOne: (id) => request(`/trending-topics/${id}`),
  create: (data) => request('/trending-topics', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => request(`/trending-topics/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => request(`/trending-topics/${id}`, { method: 'DELETE' }),
};

export const interviews = {
  getAll: (page = 1, limit = 100) => request(`/interviews?page=${page}&limit=${limit}`),
  getOne: (id) => request(`/interviews/${id}`),
  create: (data) => request('/interviews', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => request(`/interviews/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => request(`/interviews/${id}`, { method: 'DELETE' }),
};

export const mediaAssets = {
  getAll: (page = 1, limit = 100) => request(`/media-assets?page=${page}&limit=${limit}`),
  getOne: (id) => request(`/media-assets/${id}`),
  create: (data) => request('/media-assets', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => request(`/media-assets/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => request(`/media-assets/${id}`, { method: 'DELETE' }),
};

export const editorialCalendar = {
  getAll: (page = 1, limit = 100) => request(`/editorial-calendar?page=${page}&limit=${limit}`),
  getOne: (id) => request(`/editorial-calendar/${id}`),
  create: (data) => request('/editorial-calendar', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => request(`/editorial-calendar/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => request(`/editorial-calendar/${id}`, { method: 'DELETE' }),
};

export const contacts = {
  getAll: (page = 1, limit = 100) => request(`/contacts?page=${page}&limit=${limit}`),
  getOne: (id) => request(`/contacts/${id}`),
  create: (data) => request('/contacts', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => request(`/contacts/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => request(`/contacts/${id}`, { method: 'DELETE' }),
};

export const notes = {
  getAll: (page = 1, limit = 100) => request(`/notes?page=${page}&limit=${limit}`),
  getOne: (id) => request(`/notes/${id}`),
  create: (data) => request('/notes', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => request(`/notes/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => request(`/notes/${id}`, { method: 'DELETE' }),
};

export const expenses = {
  getAll: (page = 1, limit = 100) => request(`/expenses?page=${page}&limit=${limit}`),
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
  optimizeHeadline: (data) => request('/ai/optimize-headline', { method: 'POST', body: JSON.stringify(data) }),
  generateAngles: (data) => request('/ai/generate-angles', { method: 'POST', body: JSON.stringify(data) }),
  scoreReadability: (data) => request('/ai/score-readability', { method: 'POST', body: JSON.stringify(data) }),
  scoreSourceCredibility: (data) => request('/ai/score-source-credibility', { method: 'POST', body: JSON.stringify(data) }),
  storyCompetitiveAnalysis: (data) => request('/ai/story-competitive-analysis', { method: 'POST', body: JSON.stringify(data) }),
  sourceMatching: (data) => request('/ai/source-matching', { method: 'POST', body: JSON.stringify(data) }),
  correctionSuggestion: (data) => request('/ai/correction-suggestion', { method: 'POST', body: JSON.stringify(data) }),
  embargoManagement: (data) => request('/ai/embargo-management', { method: 'POST', body: JSON.stringify(data) }),
  accessibilityAltCaption: (data) => request('/ai/accessibility-altcaption', { method: 'POST', body: JSON.stringify(data) }),
  getHistory: (page = 1, limit = 20) => request(`/ai/history?page=${page}&limit=${limit}`),
};
