const express = require('express');
const db = require('../models/db');
const auth = require('../middleware/auth');

const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM deadlines ORDER BY due_date ASC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM deadlines WHERE id = $1', [req.params.id]);
    if (!result.rows[0]) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const { title, description, article_title, priority, due_date, status, assigned_to } = req.body;
    const result = await db.query(
      `INSERT INTO deadlines (title, description, article_title, priority, due_date, status, assigned_to)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [title, description, article_title, priority || 'medium', due_date, status || 'pending', assigned_to]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const { title, description, article_title, priority, due_date, status, assigned_to } = req.body;
    const result = await db.query(
      `UPDATE deadlines SET title=$1, description=$2, article_title=$3, priority=$4, due_date=$5, status=$6, assigned_to=$7, updated_at=NOW()
       WHERE id=$8 RETURNING *`,
      [title, description, article_title, priority, due_date, status, assigned_to, req.params.id]
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const result = await db.query('DELETE FROM deadlines WHERE id = $1 RETURNING *', [req.params.id]);
    if (!result.rows[0]) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
