const express = require('express');
const path = require('path');
const fs = require('fs');
const db = require('../db');
const { authenticate, requireRole, logActivity } = require('../middleware/auth');
const { upload, UPLOADS_DIR } = require('../middleware/upload');

const router = express.Router();

router.get('/subjects', authenticate, (req, res) => {
  const rows = db.prepare('SELECT * FROM subjects ORDER BY name').all();
  res.json({ subjects: rows });
});

router.post('/subjects', authenticate, requireRole('admin', 'profesor'), (req, res) => {
  const { name, description, icon } = req.body || {};
  if (!name) return res.status(400).json({ error: 'Numele este obligatoriu' });
  try {
    const info = db.prepare('INSERT INTO subjects (name, description, icon) VALUES (?, ?, ?)').run(name, description || null, icon || null);
    res.status(201).json({ subject: db.prepare('SELECT * FROM subjects WHERE id = ?').get(info.lastInsertRowid) });
  } catch (e) {
    res.status(409).json({ error: 'Materie deja existentă' });
  }
});

router.get('/', authenticate, (req, res) => {
  const { subject_id, class_name, type, q, mine } = req.query;
  const conds = [];
  const params = [];

  if (req.user.role === 'elev') {
    conds.push("(visible_to = 'toti' OR visible_to = 'elevi' OR (visible_to = 'clasa' AND class_name = ?))");
    params.push(req.user.class_name || '');
  } else if (req.user.role === 'profesor') {
    conds.push("(visible_to != 'elevi' OR uploaded_by = ?)");
    params.push(req.user.id);
  }

  if (subject_id) { conds.push('r.subject_id = ?'); params.push(parseInt(subject_id, 10)); }
  if (class_name) { conds.push('r.class_name = ?'); params.push(class_name); }
  if (type) { conds.push('r.type = ?'); params.push(type); }
  if (q) { conds.push('(r.title LIKE ? OR r.description LIKE ? OR r.tags LIKE ?)'); params.push(`%${q}%`, `%${q}%`, `%${q}%`); }
  if (mine === '1') { conds.push('r.uploaded_by = ?'); params.push(req.user.id); }

  const where = conds.length ? `WHERE ${conds.join(' AND ')}` : '';
  const rows = db.prepare(`
    SELECT r.*, s.name AS subject_name, s.icon AS subject_icon,
           u.first_name || ' ' || u.last_name AS uploader_name
    FROM resources r
    LEFT JOIN subjects s ON s.id = r.subject_id
    LEFT JOIN users u ON u.id = r.uploaded_by
    ${where}
    ORDER BY r.created_at DESC
    LIMIT 500
  `).all(...params);

  res.json({ resources: rows });
});

router.get('/:id', authenticate, (req, res) => {
  const id = parseInt(req.params.id, 10);
  const row = db.prepare(`
    SELECT r.*, s.name AS subject_name, u.first_name || ' ' || u.last_name AS uploader_name
    FROM resources r
    LEFT JOIN subjects s ON s.id = r.subject_id
    LEFT JOIN users u ON u.id = r.uploaded_by
    WHERE r.id = ?
  `).get(id);
  if (!row) return res.status(404).json({ error: 'Resursă inexistentă' });
  res.json({ resource: row });
});

router.post(
  '/',
  authenticate,
  requireRole('admin', 'profesor'),
  upload.single('file'),
  (req, res) => {
    const { title, description, subject_id, class_name, type, external_url, visible_to, tags } = req.body || {};
    if (!title || !type) {
      if (req.file) fs.unlink(req.file.path, () => {});
      return res.status(400).json({ error: 'Titlu și tip sunt obligatorii' });
    }
    if (!['document', 'video', 'link', 'imagine', 'altul'].includes(type)) {
      return res.status(400).json({ error: 'Tip invalid' });
    }
    if (type === 'link' && !external_url) {
      return res.status(400).json({ error: 'URL extern este obligatoriu pentru tipul link' });
    }
    if (type !== 'link' && !req.file) {
      return res.status(400).json({ error: 'Fișierul este obligatoriu' });
    }

    const info = db.prepare(`
      INSERT INTO resources (title, description, subject_id, class_name, type, file_path, file_name, file_size, mime_type, external_url, uploaded_by, visible_to, tags)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      title.trim(),
      description || null,
      subject_id ? parseInt(subject_id, 10) : null,
      class_name || null,
      type,
      req.file ? path.basename(req.file.path) : null,
      req.file ? req.file.originalname : null,
      req.file ? req.file.size : null,
      req.file ? req.file.mimetype : null,
      external_url || null,
      req.user.id,
      visible_to || 'toti',
      tags || null
    );

    logActivity(req.user.id, 'create_resource', 'resource', info.lastInsertRowid, title, req.ip);
    const resource = db.prepare('SELECT * FROM resources WHERE id = ?').get(info.lastInsertRowid);
    res.status(201).json({ resource });
  }
);

router.put('/:id', authenticate, requireRole('admin', 'profesor'), (req, res) => {
  const id = parseInt(req.params.id, 10);
  const current = db.prepare('SELECT * FROM resources WHERE id = ?').get(id);
  if (!current) return res.status(404).json({ error: 'Resursă inexistentă' });
  if (req.user.role !== 'admin' && current.uploaded_by !== req.user.id) {
    return res.status(403).json({ error: 'Permisiune insuficientă' });
  }
  const { title, description, subject_id, class_name, visible_to, tags, external_url } = req.body || {};
  db.prepare(`
    UPDATE resources SET title = ?, description = ?, subject_id = ?, class_name = ?, visible_to = ?, tags = ?, external_url = ?
    WHERE id = ?
  `).run(
    title ?? current.title,
    description ?? current.description,
    subject_id != null ? parseInt(subject_id, 10) : current.subject_id,
    class_name ?? current.class_name,
    visible_to ?? current.visible_to,
    tags ?? current.tags,
    external_url ?? current.external_url,
    id
  );
  logActivity(req.user.id, 'update_resource', 'resource', id, null, req.ip);
  res.json({ resource: db.prepare('SELECT * FROM resources WHERE id = ?').get(id) });
});

router.delete('/:id', authenticate, requireRole('admin', 'profesor'), (req, res) => {
  const id = parseInt(req.params.id, 10);
  const current = db.prepare('SELECT * FROM resources WHERE id = ?').get(id);
  if (!current) return res.status(404).json({ error: 'Resursă inexistentă' });
  if (req.user.role !== 'admin' && current.uploaded_by !== req.user.id) {
    return res.status(403).json({ error: 'Permisiune insuficientă' });
  }
  if (current.file_path) {
    const fp = path.join(UPLOADS_DIR, current.file_path);
    fs.unlink(fp, () => {});
  }
  db.prepare('DELETE FROM resources WHERE id = ?').run(id);
  logActivity(req.user.id, 'delete_resource', 'resource', id, null, req.ip);
  res.json({ ok: true });
});

router.get('/:id/download', authenticate, (req, res) => {
  const id = parseInt(req.params.id, 10);
  const row = db.prepare('SELECT * FROM resources WHERE id = ?').get(id);
  if (!row || !row.file_path) return res.status(404).json({ error: 'Fișier inexistent' });
  const fp = path.join(UPLOADS_DIR, row.file_path);
  if (!fs.existsSync(fp)) return res.status(404).json({ error: 'Fișier lipsă pe disc' });
  logActivity(req.user.id, 'download_resource', 'resource', id, null, req.ip);
  res.download(fp, row.file_name || row.file_path);
});

router.get('/:id/stream', authenticate, (req, res) => {
  const id = parseInt(req.params.id, 10);
  const row = db.prepare('SELECT * FROM resources WHERE id = ?').get(id);
  if (!row || !row.file_path) return res.status(404).json({ error: 'Fișier inexistent' });
  const fp = path.join(UPLOADS_DIR, row.file_path);
  if (!fs.existsSync(fp)) return res.status(404).json({ error: 'Fișier lipsă pe disc' });

  const stat = fs.statSync(fp);
  const range = req.headers.range;
  if (!range) {
    res.writeHead(200, { 'Content-Length': stat.size, 'Content-Type': row.mime_type || 'application/octet-stream' });
    return fs.createReadStream(fp).pipe(res);
  }
  const parts = range.replace(/bytes=/, '').split('-');
  const start = parseInt(parts[0], 10);
  const end = parts[1] ? parseInt(parts[1], 10) : stat.size - 1;
  const chunkSize = end - start + 1;
  res.writeHead(206, {
    'Content-Range': `bytes ${start}-${end}/${stat.size}`,
    'Accept-Ranges': 'bytes',
    'Content-Length': chunkSize,
    'Content-Type': row.mime_type || 'application/octet-stream',
  });
  fs.createReadStream(fp, { start, end }).pipe(res);
});

module.exports = router;
