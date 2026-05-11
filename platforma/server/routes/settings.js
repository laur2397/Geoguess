const express = require('express');
const db = require('../db');
const { authenticate, requireRole, logActivity } = require('../middleware/auth');

const router = express.Router();

router.get('/', (req, res) => {
  const rows = db.prepare('SELECT key, value FROM settings').all();
  const out = {};
  rows.forEach((r) => { out[r.key] = r.value; });
  res.json({ settings: out });
});

router.put('/', authenticate, requireRole('admin'), (req, res) => {
  const updates = req.body || {};
  const stmt = db.prepare(`
    INSERT INTO settings (key, value) VALUES (?, ?)
    ON CONFLICT(key) DO UPDATE SET value = excluded.value
  `);
  const tx = db.transaction((entries) => {
    for (const [k, v] of entries) stmt.run(k, v == null ? '' : String(v));
  });
  tx(Object.entries(updates));
  logActivity(req.user.id, 'update_settings', 'settings', null, JSON.stringify(updates), req.ip);
  const rows = db.prepare('SELECT key, value FROM settings').all();
  const out = {};
  rows.forEach((r) => { out[r.key] = r.value; });
  res.json({ settings: out });
});

router.get('/activity', authenticate, requireRole('admin'), (req, res) => {
  const rows = db.prepare(`
    SELECT a.*, u.first_name || ' ' || u.last_name AS user_name, u.email
    FROM activity_log a
    LEFT JOIN users u ON u.id = a.user_id
    ORDER BY a.created_at DESC
    LIMIT 200
  `).all();
  res.json({ activity: rows });
});

module.exports = router;
