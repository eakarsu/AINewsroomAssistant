const express = require('express');
const https = require('https');
const http = require('http');
const db = require('../models/db');
const auth = require('../middleware/auth');

const router = express.Router();

// Helper: fetch URL via native http/https
function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    client.get(url, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

// Helper: parse RSS items from XML string
function parseRssItems(xml) {
  const items = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
  let match;
  while ((match = itemRegex.exec(xml)) !== null) {
    const block = match[1];
    const getTag = (tag) => {
      const m = block.match(new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>`, 'i'))
        || block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i'));
      return m ? m[1].trim() : '';
    };
    items.push({
      title: getTag('title'),
      description: getTag('description'),
      link: getTag('link'),
      pubDate: getTag('pubDate'),
    });
  }
  return items;
}

// GET all story leads with pagination
router.get('/', auth, async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 20);
    const offset = (page - 1) * limit;

    const countResult = await db.query('SELECT COUNT(*) FROM story_leads');
    const total = parseInt(countResult.rows[0].count);

    const result = await db.query(
      'SELECT * FROM story_leads ORDER BY created_at DESC LIMIT $1 OFFSET $2',
      [limit, offset]
    );
    res.json({ data: result.rows, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM story_leads WHERE id = $1', [req.params.id]);
    if (!result.rows[0]) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const { title, source, category, priority, status, summary, data_feed, ai_analysis } = req.body;
    const result = await db.query(
      `INSERT INTO story_leads (title, source, category, priority, status, summary, data_feed, ai_analysis)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [title, source, category, priority || 'medium', status || 'new', summary, data_feed, ai_analysis]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const { title, source, category, priority, status, summary, data_feed, ai_analysis } = req.body;
    const result = await db.query(
      `UPDATE story_leads SET title=$1, source=$2, category=$3, priority=$4, status=$5, summary=$6, data_feed=$7, ai_analysis=$8, updated_at=NOW()
       WHERE id=$9 RETURNING *`,
      [title, source, category, priority, status, summary, data_feed, ai_analysis, req.params.id]
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const result = await db.query('DELETE FROM story_leads WHERE id = $1 RETURNING *', [req.params.id]);
    if (!result.rows[0]) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/story-leads/ingest-rss
router.post('/ingest-rss', auth, async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: 'RSS feed URL is required' });

    const xml = await fetchUrl(url);
    const items = parseRssItems(xml);

    if (items.length === 0) {
      return res.status(400).json({ error: 'No items found in RSS feed' });
    }

    const created = [];
    for (const item of items) {
      if (!item.title) continue;
      const r = await db.query(
        `INSERT INTO story_leads (title, source, category, priority, status, summary, data_feed)
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
        [
          item.title,
          'rss',
          'rss',
          'medium',
          'new',
          item.description || '',
          item.link || url
        ]
      );
      created.push(r.rows[0]);
    }

    res.json({ message: `Ingested ${created.length} story leads from RSS`, created });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
