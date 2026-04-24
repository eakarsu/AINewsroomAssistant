const express = require('express');
const db = require('../models/db');
const auth = require('../middleware/auth');

const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM story_leads ORDER BY created_at DESC');
    res.json(result.rows);
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

module.exports = router;
