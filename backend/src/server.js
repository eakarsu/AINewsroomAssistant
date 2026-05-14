const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
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

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json({ limit: '10mb' }));

// Ensure ai_analyses table exists
db.query(`CREATE TABLE IF NOT EXISTS ai_analyses (
  id SERIAL PRIMARY KEY,
  endpoint VARCHAR(100),
  entity_id INTEGER,
  result TEXT,
  created_at TIMESTAMP DEFAULT NOW()
)`).catch(err => console.error('ai_analyses table creation error:', err.message));

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
// Apply pass 5 — backlog: cms/paywall/ads/social/comments/archive
app.use('/api/integrations', require('./routes/integrations'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});

// === BATCH 05 AUTO-MOUNT (custom feature suggestions) ===
app.use('/api/editorial-director-agent', require('./routes/editorial-director-agent'));
app.use('/api/bias-realtime-stream', require('./routes/bias-realtime-stream'));
app.use('/api/fact-check-autonomous', require('./routes/fact-check-autonomous'));
app.use('/api/source-credibility-stream', require('./routes/source-credibility-stream'));
app.use('/api/multi-format-content', require('./routes/multi-format-content'));

// === Batch 05 Gaps & Frontend Mounts ===
try { const _gap_story_competitive_analysis = require('./routes/gap-story-competitive-analysis'); app.use('/api/gap-story-competitive-analysis', _gap_story_competitive_analysis); } catch(e) { console.error('gap mount fail story-competitive-analysis:', e.message); }
try { const _gap_source_matching = require('./routes/gap-source-matching'); app.use('/api/gap-source-matching', _gap_source_matching); } catch(e) { console.error('gap mount fail source-matching:', e.message); }
try { const _gap_embargo_management = require('./routes/gap-embargo-management'); app.use('/api/gap-embargo-management', _gap_embargo_management); } catch(e) { console.error('gap mount fail embargo-management:', e.message); }
try { const _gap_correction_suggestion = require('./routes/gap-correction-suggestion'); app.use('/api/gap-correction-suggestion', _gap_correction_suggestion); } catch(e) { console.error('gap mount fail correction-suggestion:', e.message); }
try { const _gap_publishing = require('./routes/gap-publishing'); app.use('/api/gap-publishing', _gap_publishing); } catch(e) { console.error('gap mount fail publishing:', e.message); }
try { const _gap_comment = require('./routes/gap-comment'); app.use('/api/gap-comment', _gap_comment); } catch(e) { console.error('gap mount fail comment:', e.message); }
try { const _gap_reader = require('./routes/gap-reader'); app.use('/api/gap-reader', _gap_reader); } catch(e) { console.error('gap mount fail reader:', e.message); }
try { const _gap_paywall = require('./routes/gap-paywall'); app.use('/api/gap-paywall', _gap_paywall); } catch(e) { console.error('gap mount fail paywall:', e.message); }
try { const _gap_advertising = require('./routes/gap-advertising'); app.use('/api/gap-advertising', _gap_advertising); } catch(e) { console.error('gap mount fail advertising:', e.message); }
try { const _gap_social = require('./routes/gap-social'); app.use('/api/gap-social', _gap_social); } catch(e) { console.error('gap mount fail social:', e.message); }
try { const _gap_accessibility = require('./routes/gap-accessibility'); app.use('/api/gap-accessibility', _gap_accessibility); } catch(e) { console.error('gap mount fail accessibility:', e.message); }
try { const _gap_historical = require('./routes/gap-historical'); app.use('/api/gap-historical', _gap_historical); } catch(e) { console.error('gap mount fail historical:', e.message); }
// === End Batch 05 Mounts ===
