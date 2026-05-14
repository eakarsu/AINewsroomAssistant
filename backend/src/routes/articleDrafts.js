const express = require('express');
const db = require('../models/db');
const auth = require('../middleware/auth');
const { callOpenRouter } = require('../services/openrouter');

const router = express.Router();

// Ensure seo_metadata column exists
db.query(`ALTER TABLE article_drafts ADD COLUMN IF NOT EXISTS seo_metadata JSONB`)
  .catch(err => console.error('seo_metadata column error:', err.message));

// GET all article drafts with pagination
router.get('/', auth, async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 20);
    const offset = (page - 1) * limit;

    const countResult = await db.query('SELECT COUNT(*) FROM article_drafts');
    const total = parseInt(countResult.rows[0].count);

    const result = await db.query(
      'SELECT * FROM article_drafts ORDER BY created_at DESC LIMIT $1 OFFSET $2',
      [limit, offset]
    );
    res.json({ data: result.rows, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM article_drafts WHERE id = $1', [req.params.id]);
    if (!result.rows[0]) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const { title, content, category, status, author, word_count } = req.body;
    const result = await db.query(
      `INSERT INTO article_drafts (title, content, category, status, author, word_count)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [title, content, category, status || 'draft', author, word_count || 0]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const { title, content, category, status, author, word_count } = req.body;
    const result = await db.query(
      `UPDATE article_drafts SET title=$1, content=$2, category=$3, status=$4, author=$5, word_count=$6, updated_at=NOW()
       WHERE id=$7 RETURNING *`,
      [title, content, category, status, author, word_count, req.params.id]
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/article-drafts/:id/publish
router.put('/:id/publish', auth, async (req, res) => {
  try {
    const draft = await db.query('SELECT * FROM article_drafts WHERE id = $1', [req.params.id]);
    if (!draft.rows[0]) return res.status(404).json({ error: 'Not found' });

    const { title, content, category } = draft.rows[0];

    // Generate SEO meta + social hooks via AI
    let seoMetadata = {};
    try {
      const sysPrompt = `You are an SEO and social media specialist. Return ONLY a JSON object with:
{
  "meta_title": "<60 char title>",
  "meta_description": "<160 char description>",
  "keywords": ["kw1","kw2","kw3","kw4","kw5"],
  "social_hooks": ["<tweet 1>", "<tweet 2>", "<tweet 3>"],
  "og_title": "<open graph title>",
  "og_description": "<open graph description>"
}`;
      const userMsg = `Article Title: "${title}"\nCategory: ${category || 'General'}\nContent preview: ${(content || '').substring(0, 500)}`;
      const aiResult = await callOpenRouter(sysPrompt, userMsg);
      if (aiResult.success) {
        const jsonMatch = aiResult.result.match(/```json\s*([\s\S]*?)```/) || aiResult.result.match(/(\{[\s\S]*\})/);
        if (jsonMatch) {
          try { seoMetadata = JSON.parse(jsonMatch[1]); } catch (_) { seoMetadata = { raw: aiResult.result }; }
        } else {
          try { seoMetadata = JSON.parse(aiResult.result); } catch (_) { seoMetadata = { raw: aiResult.result }; }
        }
      }
    } catch (aiErr) {
      console.error('AI SEO generation error:', aiErr.message);
    }

    const result = await db.query(
      `UPDATE article_drafts SET status='published', seo_metadata=$1, updated_at=NOW() WHERE id=$2 RETURNING *`,
      [JSON.stringify(seoMetadata), req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const result = await db.query('DELETE FROM article_drafts WHERE id = $1 RETURNING *', [req.params.id]);
    if (!result.rows[0]) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
