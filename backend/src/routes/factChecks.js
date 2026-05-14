const express = require('express');
const db = require('../models/db');
const auth = require('../middleware/auth');

const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 20);
    const offset = (page - 1) * limit;
    const countResult = await db.query('SELECT COUNT(*) FROM fact_checks');
    const total = parseInt(countResult.rows[0].count);
    const result = await db.query('SELECT * FROM fact_checks ORDER BY created_at DESC LIMIT $1 OFFSET $2', [limit, offset]);
    res.json({ data: result.rows, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM fact_checks WHERE id = $1', [req.params.id]);
    if (!result.rows[0]) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const { claim, source_article, status, verdict, evidence, ai_analysis, checked_by } = req.body;
    const result = await db.query(
      `INSERT INTO fact_checks (claim, source_article, status, verdict, evidence, ai_analysis, checked_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [claim, source_article, status || 'pending', verdict || 'unverified', evidence, ai_analysis, checked_by]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const { claim, source_article, status, verdict, evidence, ai_analysis, checked_by } = req.body;
    const result = await db.query(
      `UPDATE fact_checks SET claim=$1, source_article=$2, status=$3, verdict=$4, evidence=$5, ai_analysis=$6, checked_by=$7, updated_at=NOW()
       WHERE id=$8 RETURNING *`,
      [claim, source_article, status, verdict, evidence, ai_analysis, checked_by, req.params.id]
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const result = await db.query('DELETE FROM fact_checks WHERE id = $1 RETURNING *', [req.params.id]);
    if (!result.rows[0]) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
