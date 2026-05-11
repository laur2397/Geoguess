const jwt = require('jsonwebtoken');
const db = require('../db');

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';

function signToken(user) {
  return jwt.sign(
    { id: user.id, role: user.role, email: user.email },
    JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

function authenticate(req, res, next) {
  const header = req.headers.authorization || '';
  let token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token && req.query && req.query.token) token = req.query.token;
  if (!token) return res.status(401).json({ error: 'Lipsește tokenul de autentificare' });
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    const user = db.prepare('SELECT id, email, first_name, last_name, role, class_name, active FROM users WHERE id = ?').get(payload.id);
    if (!user || !user.active) return res.status(401).json({ error: 'Utilizator inactiv sau inexistent' });
    req.user = user;
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Token invalid sau expirat' });
  }
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'Neautentificat' });
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Nu aveți permisiunea necesară' });
    }
    next();
  };
}

function logActivity(userId, action, entityType, entityId, details, ip) {
  try {
    db.prepare(
      'INSERT INTO activity_log (user_id, action, entity_type, entity_id, details, ip) VALUES (?, ?, ?, ?, ?, ?)'
    ).run(userId || null, action, entityType || null, entityId || null, details || null, ip || null);
  } catch (e) {
    // log only — nu blocăm requestul
  }
}

module.exports = { signToken, authenticate, requireRole, logActivity, JWT_SECRET };
