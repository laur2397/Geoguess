const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../db');
const { authenticate, requireRole, logActivity } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticate, requireRole('admin', 'profesor'), (req, res) => {
  const { role, class_name, q } = req.query;
  const conds = [];
  const params = [];
  if (role) { conds.push('role = ?'); params.push(role); }
  if (class_name) { conds.push('class_name = ?'); params.push(class_name); }
  if (q) { conds.push('(first_name LIKE ? OR last_name LIKE ? OR email LIKE ?)'); params.push(`%${q}%`, `%${q}%`, `%${q}%`); }
  const where = conds.length ? `WHERE ${conds.join(' AND ')}` : '';
  const rows = db
    .prepare(`SELECT id, email, first_name, last_name, role, class_name, active, created_at FROM users ${where} ORDER BY last_name, first_name`)
    .all(...params);
  res.json({ users: rows });
});

router.get('/classes', authenticate, (req, res) => {
  const rows = db
    .prepare(`SELECT DISTINCT class_name FROM users WHERE class_name IS NOT NULL AND class_name != '' ORDER BY class_name`)
    .all();
  res.json({ classes: rows.map((r) => r.class_name) });
});

router.put('/:id', authenticate, (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (req.user.role !== 'admin' && req.user.id !== id) {
    return res.status(403).json({ error: 'Permisiune insuficientă' });
  }
  const { first_name, last_name, class_name, avatar_url, active, role } = req.body || {};
  const current = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
  if (!current) return res.status(404).json({ error: 'Utilizator inexistent' });

  const updates = {
    first_name: first_name ?? current.first_name,
    last_name: last_name ?? current.last_name,
    class_name: class_name ?? current.class_name,
    avatar_url: avatar_url ?? current.avatar_url,
    active: req.user.role === 'admin' && active != null ? (active ? 1 : 0) : current.active,
    role: req.user.role === 'admin' && role ? role : current.role,
  };

  db.prepare(
    `UPDATE users SET first_name = ?, last_name = ?, class_name = ?, avatar_url = ?, active = ?, role = ? WHERE id = ?`
  ).run(updates.first_name, updates.last_name, updates.class_name, updates.avatar_url, updates.active, updates.role, id);

  logActivity(req.user.id, 'update_user', 'user', id, null, req.ip);
  const updated = db.prepare('SELECT id, email, first_name, last_name, role, class_name, avatar_url, active FROM users WHERE id = ?').get(id);
  res.json({ user: updated });
});

router.post('/', authenticate, requireRole('admin'), (req, res) => {
  const { email, password, first_name, last_name, role, class_name } = req.body || {};
  if (!email || !password || !first_name || !last_name || !role) {
    return res.status(400).json({ error: 'Câmpuri obligatorii lipsă' });
  }
  const exists = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase());
  if (exists) return res.status(409).json({ error: 'Email deja folosit' });
  const hash = bcrypt.hashSync(password, 10);
  const info = db
    .prepare('INSERT INTO users (email, password_hash, first_name, last_name, role, class_name) VALUES (?, ?, ?, ?, ?, ?)')
    .run(email.toLowerCase(), hash, first_name, last_name, role, class_name || null);
  logActivity(req.user.id, 'create_user', 'user', info.lastInsertRowid, null, req.ip);
  const user = db.prepare('SELECT id, email, first_name, last_name, role, class_name, active FROM users WHERE id = ?').get(info.lastInsertRowid);
  res.status(201).json({ user });
});

router.delete('/:id', authenticate, requireRole('admin'), (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (id === req.user.id) return res.status(400).json({ error: 'Nu vă puteți șterge propriul cont' });
  db.prepare('DELETE FROM users WHERE id = ?').run(id);
  logActivity(req.user.id, 'delete_user', 'user', id, null, req.ip);
  res.json({ ok: true });
});

module.exports = router;
