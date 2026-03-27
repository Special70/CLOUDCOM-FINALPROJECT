const express = require('express');
const router = express.Router();
const pool = require('../db');

router.get('/', async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM monsterstbl');
  res.json(rows);
});

router.post('/', async (req, res) => {
  try {
    const m = req.body;
    await pool.query(
      `INSERT INTO monsterstbl 
      (monster_name, monster_type, spawn_latitude, spawn_longitude, spawn_radius_meters, picture_url)
      VALUES (?, ?, ?, ?, ?, ?)`,
      [m.monster_name, m.monster_type, m.spawn_latitude, m.spawn_longitude, m.spawn_radius_meters, m.picture_url || null]
    );
    res.json({ message: 'created' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const m = req.body;
    await pool.query(
      `UPDATE monsterstbl SET
      monster_name=?, monster_type=?, spawn_latitude=?, spawn_longitude=?, spawn_radius_meters=?
      WHERE monster_id=?`,
      [m.monster_name, m.monster_type, m.spawn_latitude, m.spawn_longitude, m.spawn_radius_meters, req.params.id]
    );
    res.json({ message: 'updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM monster_catchestbl WHERE monster_id=?', [req.params.id]);
    await pool.query('DELETE FROM monsterstbl WHERE monster_id=?', [req.params.id]);
    res.json({ message: 'deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;