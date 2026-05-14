const express = require('express');
const db = require('../models/db');
const auth = require('../middleware/auth');

const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 20);
    const offset = (page - 1) * limit;
    const countResult = await db.query('SELECT COUNT(*) FROM sources');
    const total = parseInt(countResult.rows[0].count);
    const result = await db.query('SELECT * FROM sources ORDER BY created_at DESC LIMIT $1 OFFSET $2', [limit, offset]);
    res.json({ data: result.rows, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM sources WHERE id = $1', [req.params.id]);
    if (!result.rows[0]) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const { name, type, credibility_score, url, contact_info, verification_status, ai_assessment, notes } = req.body;
    const result = await db.query(
      `INSERT INTO sources (name, type, credibility_score, url, contact_info, verification_status, ai_assessment, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [name, type, credibility_score || 50, url, contact_info, verification_status || 'pending', ai_assessment, notes]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const { name, type, credibility_score, url, contact_info, verification_status, ai_assessment, notes } = req.body;
    const result = await db.query(
      `UPDATE sources SET name=$1, type=$2, credibility_score=$3, url=$4, contact_info=$5, verification_status=$6, ai_assessment=$7, notes=$8, updated_at=NOW()
       WHERE id=$9 RETURNING *`,
      [name, type, credibility_score, url, contact_info, verification_status, ai_assessment, notes, req.params.id]
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const result = await db.query('DELETE FROM sources WHERE id = $1 RETURNING *', [req.params.id]);
    if (!result.rows[0]) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
