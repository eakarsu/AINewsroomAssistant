const express = require('express');
const db = require('../models/db');
const auth = require('../middleware/auth');

const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM media_assets ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM media_assets WHERE id = $1', [req.params.id]);
    if (!result.rows[0]) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', auth, async (req, res) => {
  try {
    const { title, type, source, description, article_title, photographer, location, license, status } = req.body;
    const result = await db.query(
      `INSERT INTO media_assets (title, type, source, description, article_title, photographer, location, license, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [title, type || 'photo', source, description, article_title, photographer, location, license || 'unknown', status || 'available']
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const { title, type, source, description, article_title, photographer, location, license, status } = req.body;
    const result = await db.query(
      `UPDATE media_assets SET title=$1, type=$2, source=$3, description=$4, article_title=$5, photographer=$6, location=$7, license=$8, status=$9, updated_at=NOW()
       WHERE id=$10 RETURNING *`,
      [title, type, source, description, article_title, photographer, location, license, status, req.params.id]
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const result = await db.query('DELETE FROM media_assets WHERE id = $1 RETURNING *', [req.params.id]);
    if (!result.rows[0]) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
