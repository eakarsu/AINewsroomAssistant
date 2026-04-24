const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const db = require('./models/db');
const authRoutes = require('./routes/auth');
const storyLeadsRoutes = require('./routes/storyLeads');
const sourcesRoutes = require('./routes/sources');
const factChecksRoutes = require('./routes/factChecks');
const deadlinesRoutes = require('./routes/deadlines');
const biasReportsRoutes = require('./routes/biasReports');
const articleDraftsRoutes = require('./routes/articleDrafts');
const trendingTopicsRoutes = require('./routes/trendingTopics');
const interviewsRoutes = require('./routes/interviews');
const mediaAssetsRoutes = require('./routes/mediaAssets');
const editorialCalendarRoutes = require('./routes/editorialCalendar');
const contactsRoutes = require('./routes/contacts');
const notesRoutes = require('./routes/notes');
const expensesRoutes = require('./routes/expenses');
const aiRoutes = require('./routes/ai');

const app = express();
const PORT = process.env.BACKEND_PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/story-leads', storyLeadsRoutes);
app.use('/api/sources', sourcesRoutes);
app.use('/api/fact-checks', factChecksRoutes);
app.use('/api/deadlines', deadlinesRoutes);
app.use('/api/bias-reports', biasReportsRoutes);
app.use('/api/article-drafts', articleDraftsRoutes);
app.use('/api/trending-topics', trendingTopicsRoutes);
app.use('/api/interviews', interviewsRoutes);
app.use('/api/media-assets', mediaAssetsRoutes);
app.use('/api/editorial-calendar', editorialCalendarRoutes);
app.use('/api/contacts', contactsRoutes);
app.use('/api/notes', notesRoutes);
app.use('/api/expenses', expensesRoutes);
app.use('/api/ai', aiRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});
