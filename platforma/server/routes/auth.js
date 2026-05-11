const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../db');
const { signToken, authenticate, logActivity } = require('../middleware/auth');

const router = express.Router();

function sanitizeUser(u) {
  if (!u) return null;
  const { password_hash, ...rest } = u;
  return rest;
}

router.post('/register', (req, res) => {
  const { email, password, first_name, last_name, role, class_name } = req.body || {};
  if (!email || !password || !first_name || !last_name || !role) {
    return res.status(400).json({ error: 'Toate câmpurile sunt obligatorii' });
  }
  if (!['profesor', 'elev'].includes(role)) {
    return res.status(400).json({ error: 'Rol invalid' });
  }
  if (password.length < 8) {
    return res.status(400).json({ error: 'Parola trebuie să aibă minim 8 caractere' });
  }
  const exists = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase());
  if (exists) return res.status(409).json({ error: 'Există deja un cont cu acest email' });

  const hash = bcrypt.hashSync(password, 10);
  const info = db
    .prepare(
      `INSERT INTO users (email, password_hash, first_name, last_name, role, class_name)
       VALUES (?, ?, ?, ?, ?, ?)`
    )
    .run(email.toLowerCase(), hash, first_name.trim(), last_name.trim(), role, class_name || null);

  const user = db.prepare('SELECT id, email, first_name, last_name, role, class_name FROM users WHERE id = ?').get(info.lastInsertRowid);
  const token = signToken(user);
  logActivity(user.id, 'register', 'user', user.id, null, req.ip);
  res.status(201).json({ token, user });
});

router.post('/login', (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'Email și parolă obligatorii' });
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase());
  if (!user || !user.active) return res.status(401).json({ error: 'Credențiale invalide' });
  if (!bcrypt.compareSync(password, user.password_hash)) {
    logActivity(user.id, 'login_failed', 'user', user.id, null, req.ip);
    return res.status(401).json({ error: 'Credențiale invalide' });
  }
  const safe = sanitizeUser(user);
  const token = signToken(safe);
  logActivity(user.id, 'login', 'user', user.id, null, req.ip);
  res.json({ token, user: safe });
});

router.get('/me', authenticate, (req, res) => {
  res.json({ user: req.user });
});

router.post('/change-password', authenticate, (req, res) => {
  const { current_password, new_password } = req.body || {};
  if (!current_password || !new_password) return res.status(400).json({ error: 'Câmpuri lipsă' });
  if (new_password.length < 8) return res.status(400).json({ error: 'Parola nouă trebuie să aibă minim 8 caractere' });
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
  if (!bcrypt.compareSync(current_password, user.password_hash)) {
    return res.status(401).json({ error: 'Parola curentă este incorectă' });
  }
  const hash = bcrypt.hashSync(new_password, 10);
  db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(hash, req.user.id);
  logActivity(req.user.id, 'change_password', 'user', req.user.id, null, req.ip);
  res.json({ ok: true });
});

module.exports = router;
