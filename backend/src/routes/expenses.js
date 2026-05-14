const express = require('express');
const db = require('../models/db');
const auth = require('../middleware/auth');

const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 20);
    const offset = (page - 1) * limit;
    const countResult = await db.query('SELECT COUNT(*) FROM expenses');
    const total = parseInt(countResult.rows[0].count);
    const result = await db.query('SELECT * FROM expenses ORDER BY expense_date DESC LIMIT $1 OFFSET $2', [limit, offset]);
    res.json({ data: result.rows, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM expenses WHERE id = $1', [req.params.id]);
    if (!result.rows[0]) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', auth, async (req, res) => {
  try {
    const { description, amount, category, expense_date, related_story, reporter, status, receipt_ref } = req.body;
    const result = await db.query(
      `INSERT INTO expenses (description, amount, category, expense_date, related_story, reporter, status, receipt_ref)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [description, amount || 0, category || 'other', expense_date, related_story, reporter, status || 'pending', receipt_ref]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const { description, amount, category, expense_date, related_story, reporter, status, receipt_ref } = req.body;
    const result = await db.query(
      `UPDATE expenses SET description=$1, amount=$2, category=$3, expense_date=$4, related_story=$5, reporter=$6, status=$7, receipt_ref=$8, updated_at=NOW()
       WHERE id=$9 RETURNING *`,
      [description, amount, category, expense_date, related_story, reporter, status, receipt_ref, req.params.id]
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const result = await db.query('DELETE FROM expenses WHERE id = $1 RETURNING *', [req.params.id]);
    if (!result.rows[0]) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
