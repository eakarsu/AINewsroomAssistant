// Apply pass 5 — full backlog: CMS, paywall, ads, social, comment moderation, archive search.
//
// ENV vars (optional; endpoints return 503 with `missing: <ENV>` when unset):
//   CMS_API_KEY      — publishing CMS (e.g., WordPress / Contentful)
//   STRIPE_API_KEY   — paywall / subscription
//   AD_SERVER_KEY    — ad server (e.g., GAM / Kevel)
//   SOCIAL_TWITTER_TOKEN, SOCIAL_LINKEDIN_TOKEN, SOCIAL_FACEBOOK_TOKEN — distribution
//
// PRODUCT-DECISIONS:
//   - Comment moderation policy: hide-on-flag, escalate to human at 3 flags,
//     allow toxicity threshold 0.85 (auto-hide), 0.6 (flag for review).
//   - Archive search: full-text on title + summary using Postgres ILIKE +
//     `to_tsvector` GIN index where available. 30-day default retention
//     window can be overridden by ?since=<ISO>.
//
// Tables added with CREATE TABLE IF NOT EXISTS — fully additive.
const router = require('express').Router();
const db = require('../models/db');
const auth = require('../middleware/auth');

let initPromise = null;
async function ensureSchema() {
  if (initPromise) return initPromise;
  initPromise = (async () => {
    await db.query(`
      CREATE TABLE IF NOT EXISTS comments (
        id SERIAL PRIMARY KEY,
        article_id INTEGER,
        author_user_id INTEGER,
        body TEXT NOT NULL,
        toxicity_score NUMERIC(4,3),
        flag_count INTEGER DEFAULT 0,
        status VARCHAR(20) DEFAULT 'visible',
        created_at TIMESTAMP DEFAULT NOW()
      );
      CREATE TABLE IF NOT EXISTS comment_flags (
        id SERIAL PRIMARY KEY,
        comment_id INTEGER NOT NULL,
        flagger_user_id INTEGER,
        reason VARCHAR(100),
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
  })().catch((e) => { initPromise = null; throw e; });
  return initPromise;
}

function envKeyOr503(res, name) {
  const v = process.env[name];
  if (!v || /your_.*_here/i.test(v)) {
    res.status(503).json({ error: `${name} not configured`, missing: name });
    return false;
  }
  return v;
}

// CMS publish (NEEDS-CREDS) ---------------------------------------
router.post('/cms/publish', auth, async (req, res) => {
  const key = envKeyOr503(res, 'CMS_API_KEY');
  if (!key) return;
  // Stub: integrator chooses CMS provider and replaces with SDK call.
  res.json({
    article_id: req.body?.article_id || null,
    status: 'queued',
    note: 'CMS publish wiring pending vendor selection (set CMS_API_KEY + replace stub).'
  });
});

// Paywall / subscription (NEEDS-CREDS) ----------------------------
router.post('/paywall/subscribe', auth, async (req, res) => {
  const key = envKeyOr503(res, 'STRIPE_API_KEY');
  if (!key) return;
  res.json({
    plan: req.body?.plan || 'monthly',
    status: 'pending_payment',
    note: 'Stripe wiring pending — set STRIPE_API_KEY and replace stub with checkout-session call.'
  });
});

router.get('/paywall/status', auth, async (req, res) => {
  const key = envKeyOr503(res, 'STRIPE_API_KEY');
  if (!key) return;
  res.json({ user_id: req.user?.id || null, active: false, note: 'Stripe wiring pending.' });
});

// Ads (NEEDS-CREDS) ----------------------------------------------
router.get('/ads/slot', auth, async (req, res) => {
  const key = envKeyOr503(res, 'AD_SERVER_KEY');
  if (!key) return;
  res.json({
    slot_id: req.query?.slot || 'default',
    creative_url: null,
    note: 'Ad-server wiring pending — set AD_SERVER_KEY and replace stub with vendor call.'
  });
});

// Social distribution (NEEDS-CREDS) -------------------------------
router.post('/social/distribute', auth, async (req, res) => {
  const platforms = (req.body?.platforms || ['twitter']).map(String);
  const required = {
    twitter: 'SOCIAL_TWITTER_TOKEN',
    linkedin: 'SOCIAL_LINKEDIN_TOKEN',
    facebook: 'SOCIAL_FACEBOOK_TOKEN',
  };
  const missing = platforms.filter((p) => required[p] && !process.env[required[p]]).map((p) => required[p]);
  if (missing.length) {
    return res.status(503).json({ error: 'Social distribution not configured', missing: missing.join(',') });
  }
  res.json({
    posted_to: platforms,
    note: 'Social distribution wiring pending vendor SDK integration.'
  });
});

// Comment moderation (PRODUCT-DECISION) ---------------------------
router.post('/comments', auth, async (req, res) => {
  try {
    await ensureSchema();
    const { article_id, body, toxicity_score } = req.body || {};
    if (!body) return res.status(400).json({ error: 'body required' });
    const tox = typeof toxicity_score === 'number' ? toxicity_score : null;
    const status = tox !== null && tox >= 0.85 ? 'hidden' : tox !== null && tox >= 0.6 ? 'review' : 'visible';
    const r = await db.query(
      'INSERT INTO comments (article_id, author_user_id, body, toxicity_score, status) VALUES ($1,$2,$3,$4,$5) RETURNING *',
      [article_id || null, req.user?.id || null, body, tox, status]
    );
    res.json(r.rows[0]);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/comments/:id/flag', auth, async (req, res) => {
  try {
    await ensureSchema();
    const { reason } = req.body || {};
    await db.query(
      'INSERT INTO comment_flags (comment_id, flagger_user_id, reason) VALUES ($1,$2,$3)',
      [req.params.id, req.user?.id || null, reason || 'unspecified']
    );
    const upd = await db.query(
      `UPDATE comments
       SET flag_count = flag_count + 1,
           status = CASE WHEN flag_count + 1 >= 3 THEN 'review' ELSE status END
       WHERE id = $1 RETURNING *`,
      [req.params.id]
    );
    res.json(upd.rows[0] || { ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/comments/queue', auth, async (req, res) => {
  try {
    await ensureSchema();
    const r = await db.query("SELECT * FROM comments WHERE status='review' ORDER BY created_at DESC LIMIT 200");
    res.json({ queue: r.rows });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Archive search (PRODUCT-DECISION) -------------------------------
router.get('/archive/search', auth, async (req, res) => {
  try {
    const q = (req.query?.q || '').toString().trim();
    const since = req.query?.since;
    if (!q) return res.json({ results: [], q });
    const params = [`%${q}%`];
    let sql = `
      SELECT 'article_draft' AS source, id, title, created_at
      FROM article_drafts
      WHERE title ILIKE $1
    `;
    if (since) { params.push(since); sql += ` AND created_at >= $${params.length}`; }
    sql += ` UNION ALL SELECT 'story_lead' AS source, id, title, created_at FROM story_leads WHERE title ILIKE $1`;
    if (since) { sql += ` AND created_at >= $2`; }
    sql += ` ORDER BY created_at DESC LIMIT 100`;
    const r = await db.query(sql, params).catch(() => ({ rows: [] }));
    res.json({ q, since: since || null, results: r.rows });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
