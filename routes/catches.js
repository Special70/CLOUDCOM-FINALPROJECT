const express = require('express');
const router = express.Router();
const pool = require('../db');

// 🔢 Haversine formula (distance calculation)
function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const toRad = deg => (deg * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
    Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

//
// 🔍 DETECT MONSTER
//
router.post('/detect', async (req, res) => {
  try {
    const { latitude, longitude } = req.body;

    if (latitude === undefined || longitude === undefined) {
      return res.status(400).json({
        error: 'latitude and longitude are required'
      });
    }

    const [monsters] = await pool.query('SELECT * FROM monsterstbl');

    const detected = [];

    for (const m of monsters) {
      const distance = haversineDistance(
        parseFloat(latitude),
        parseFloat(longitude),
        parseFloat(m.spawn_latitude),
        parseFloat(m.spawn_longitude)
      );

      if (distance <= parseFloat(m.spawn_radius_meters)) {
        detected.push({
          monster_id: m.monster_id,
          monster_name: m.monster_name,
          monster_type: m.monster_type,
          picture_url: m.picture_url,
          distance_meters: Number(distance.toFixed(2))
        });
      }
    }

    res.json({
      success: true,
      detected_count: detected.length,
      detected
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

//
// 🎯 SAVE CATCH
//
router.post('/catch', async (req, res) => {
  try {
    const { player_id, monster_id, location_id, latitude, longitude } = req.body;

    if (!player_id || !monster_id || !location_id) {
      return res.status(400).json({
        error: 'Missing required fields'
      });
    }

    const [result] = await pool.query(
      `INSERT INTO monster_catchestbl
      (player_id, monster_id, location_id, latitude, longitude)
      VALUES (?, ?, ?, ?, ?)`,
      [player_id, monster_id, location_id, latitude, longitude]
    );

    res.json({
      message: 'Monster caught successfully',
      catch_id: result.insertId
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

//
// 📜 CATCH HISTORY
//
router.get('/history/:playerId', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT 
        mc.catch_id,
        mc.catch_datetime,
        mc.latitude,
        mc.longitude,
        m.monster_name,
        m.monster_type
      FROM monster_catchestbl mc
      JOIN monsterstbl m ON mc.monster_id = m.monster_id
      WHERE mc.player_id = ?
      ORDER BY mc.catch_datetime DESC`,
      [req.params.playerId]
    );

    res.json(rows);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;