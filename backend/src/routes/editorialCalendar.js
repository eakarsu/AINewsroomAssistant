const express = require('express');
const db = require('../models/db');
const auth = require('../middleware/auth');

const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 20);
    const offset = (page - 1) * limit;
    const countResult = await db.query('SELECT COUNT(*) FROM editorial_calendar');
    const total = parseInt(countResult.rows[0].count);
    const result = await db.query('SELECT * FROM editorial_calendar ORDER BY publish_date ASC LIMIT $1 OFFSET $2', [limit, offset]);
    res.json({ data: result.rows, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM editorial_calendar WHERE id = $1', [req.params.id]);
    if (!result.rows[0]) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', auth, async (req, res) => {
  try {
    const { title, section, publish_date, content_type, assigned_to, status, priority, description } = req.body;
    const result = await db.query(
      `INSERT INTO editorial_calendar (title, section, publish_date, content_type, assigned_to, status, priority, description)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [title, section, publish_date, content_type || 'article', assigned_to, status || 'planned', priority || 'medium', description]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const { title, section, publish_date, content_type, assigned_to, status, priority, description } = req.body;
    const result = await db.query(
      `UPDATE editorial_calendar SET title=$1, section=$2, publish_date=$3, content_type=$4, assigned_to=$5, status=$6, priority=$7, description=$8, updated_at=NOW()
       WHERE id=$9 RETURNING *`,
      [title, section, publish_date, content_type, assigned_to, status, priority, description, req.params.id]
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const result = await db.query('DELETE FROM editorial_calendar WHERE id = $1 RETURNING *', [req.params.id]);
    if (!result.rows[0]) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
