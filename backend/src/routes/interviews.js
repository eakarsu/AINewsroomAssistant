const express = require('express');
const db = require('../models/db');
const auth = require('../middleware/auth');

const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 20);
    const offset = (page - 1) * limit;
    const countResult = await db.query('SELECT COUNT(*) FROM interviews');
    const total = parseInt(countResult.rows[0].count);
    const result = await db.query('SELECT * FROM interviews ORDER BY scheduled_date ASC LIMIT $1 OFFSET $2', [limit, offset]);
    res.json({ data: result.rows, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM interviews WHERE id = $1', [req.params.id]);
    if (!result.rows[0]) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', auth, async (req, res) => {
  try {
    const { subject_name, subject_role, topic, scheduled_date, duration_minutes, location, status, reporter, notes } = req.body;
    const result = await db.query(
      `INSERT INTO interviews (subject_name, subject_role, topic, scheduled_date, duration_minutes, location, status, reporter, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [subject_name, subject_role, topic, scheduled_date, duration_minutes || 30, location, status || 'scheduled', reporter, notes]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const { subject_name, subject_role, topic, scheduled_date, duration_minutes, location, status, reporter, notes } = req.body;
    const result = await db.query(
      `UPDATE interviews SET subject_name=$1, subject_role=$2, topic=$3, scheduled_date=$4, duration_minutes=$5, location=$6, status=$7, reporter=$8, notes=$9, updated_at=NOW()
       WHERE id=$10 RETURNING *`,
      [subject_name, subject_role, topic, scheduled_date, duration_minutes, location, status, reporter, notes, req.params.id]
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const result = await db.query('DELETE FROM interviews WHERE id = $1 RETURNING *', [req.params.id]);
    if (!result.rows[0]) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
