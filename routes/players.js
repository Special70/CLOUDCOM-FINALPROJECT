const express = require('express');
const router = express.Router();
const pool = require('../db');

router.get('/', async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM playerstbl');
  res.json(rows);
});

router.post('/', async (req, res) => {
  const { player_name, username, password } = req.body;

  const [result] = await pool.query(
    'INSERT INTO playerstbl (player_name, username, password) VALUES (?, ?, ?)',
    [player_name, username, password]
  );

  res.json({ player_id: result.insertId });
});

router.put('/:id', async (req, res) => {
  const { player_name, username, password } = req.body;

  await pool.query(
    'UPDATE playerstbl SET player_name=?, username=?, password=? WHERE player_id=?',
    [player_name, username, password, req.params.id]
  );

  res.json({ message: 'updated' });
});

router.delete('/:id', async (req, res) => {
  await pool.query(
    'DELETE FROM playerstbl WHERE player_id=?',
    [req.params.id]
  );

  res.json({ message: 'deleted' });
});

module.exports = router;