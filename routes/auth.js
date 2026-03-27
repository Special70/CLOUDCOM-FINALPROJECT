const express = require('express');
const router = express.Router();
const pool = require('../db');
const bcrypt = require('bcrypt');

// CHECK USERNAME AVAILABILITY
router.post('/check-username', async (req, res) => {
  try {
    const { username } = req.body;
    const [rows] = await pool.query('SELECT player_id FROM playerstbl WHERE username = ?', [username]);
    if (rows.length > 0) {
      return res.json({ available: false, message: 'Username is already taken.' });
    }
    res.json({ available: true });
  } catch (err) {
    res.json({ available: false, message: err.message });
  }
});

// REGISTER
router.post('/register', async (req, res) => {
  try {
    const { player_name, username, password } = req.body;

    const hashed = await bcrypt.hash(password, 10);

    await pool.query(
      'INSERT INTO playerstbl (player_name, username, password) VALUES (?, ?, ?)',
      [player_name, username, hashed]
    );

    res.json({ success: true, message: 'Registered successfully' });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
});

// LOGIN
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    const [rows] = await pool.query(
      'SELECT * FROM playerstbl WHERE username = ?',
      [username]
    );

    if (rows.length === 0) {
      return res.json({ success: false, message: 'User not found' });
    }

    const user = rows[0];
    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.json({ success: false, message: 'Wrong password' });
    }

    res.json({
      success: true,
      data: {
        player_id: user.player_id,
        player_name: user.player_name,
        username: user.username
      }
    });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
});

module.exports = router;