const express = require('express');
const db = require('../models/db');
const auth = require('../middleware/auth');

const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 20);
    const offset = (page - 1) * limit;
    const countResult = await db.query('SELECT COUNT(*) FROM trending_topics');
    const total = parseInt(countResult.rows[0].count);
    const result = await db.query('SELECT * FROM trending_topics ORDER BY trend_score DESC LIMIT $1 OFFSET $2', [limit, offset]);
    res.json({ data: result.rows, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM trending_topics WHERE id = $1', [req.params.id]);
    if (!result.rows[0]) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', auth, async (req, res) => {
  try {
    const { topic, category, trend_score, volume, sentiment, region, keywords, status } = req.body;
    const result = await db.query(
      `INSERT INTO trending_topics (topic, category, trend_score, volume, sentiment, region, keywords, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [topic, category, trend_score || 50, volume || 0, sentiment || 'neutral', region || 'Global', keywords, status || 'active']
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const { topic, category, trend_score, volume, sentiment, region, keywords, status } = req.body;
    const result = await db.query(
      `UPDATE trending_topics SET topic=$1, category=$2, trend_score=$3, volume=$4, sentiment=$5, region=$6, keywords=$7, status=$8, updated_at=NOW()
       WHERE id=$9 RETURNING *`,
      [topic, category, trend_score, volume, sentiment, region, keywords, status, req.params.id]
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const result = await db.query('DELETE FROM trending_topics WHERE id = $1 RETURNING *', [req.params.id]);
    if (!result.rows[0]) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
