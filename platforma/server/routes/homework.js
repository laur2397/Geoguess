const express = require('express');
const path = require('path');
const fs = require('fs');
const db = require('../db');
const { authenticate, requireRole, logActivity } = require('../middleware/auth');
const { upload, UPLOADS_DIR } = require('../middleware/upload');

const router = express.Router();

router.get('/', authenticate, (req, res) => {
  const { class_name, subject_id, mine } = req.query;
  const conds = [];
  const params = [];

  if (req.user.role === 'elev') {
    conds.push('h.class_name = ?');
    params.push(req.user.class_name || '');
  } else if (req.user.role === 'profesor' && mine === '1') {
    conds.push('h.teacher_id = ?');
    params.push(req.user.id);
  }
  if (class_name) { conds.push('h.class_name = ?'); params.push(class_name); }
  if (subject_id) { conds.push('h.subject_id = ?'); params.push(parseInt(subject_id, 10)); }

  const where = conds.length ? `WHERE ${conds.join(' AND ')}` : '';
  const rows = db.prepare(`
    SELECT h.*, s.name AS subject_name,
           u.first_name || ' ' || u.last_name AS teacher_name,
           (SELECT COUNT(*) FROM submissions sb WHERE sb.homework_id = h.id) AS submissions_count,
           (SELECT COUNT(*) FROM submissions sb WHERE sb.homework_id = h.id AND sb.score IS NOT NULL) AS graded_count
    FROM homework h
    LEFT JOIN subjects s ON s.id = h.subject_id
    LEFT JOIN users u ON u.id = h.teacher_id
    ${where}
    ORDER BY h.due_date IS NULL, h.due_date ASC, h.created_at DESC
  `).all(...params);

  if (req.user.role === 'elev') {
    const subs = db.prepare(`
      SELECT homework_id, id AS submission_id, score, feedback, submitted_at, graded_at, file_name
      FROM submissions WHERE student_id = ?
    `).all(req.user.id);
    const map = new Map(subs.map((s) => [s.homework_id, s]));
    rows.forEach((r) => { r.my_submission = map.get(r.id) || null; });
  }

  res.json({ homework: rows });
});

router.get('/:id', authenticate, (req, res) => {
  const id = parseInt(req.params.id, 10);
  const hw = db.prepare(`
    SELECT h.*, s.name AS subject_name, u.first_name || ' ' || u.last_name AS teacher_name
    FROM homework h
    LEFT JOIN subjects s ON s.id = h.subject_id
    LEFT JOIN users u ON u.id = h.teacher_id
    WHERE h.id = ?
  `).get(id);
  if (!hw) return res.status(404).json({ error: 'Temă inexistentă' });

  if (req.user.role === 'elev' && hw.class_name !== req.user.class_name) {
    return res.status(403).json({ error: 'Permisiune insuficientă' });
  }

  let submissions = [];
  if (req.user.role === 'admin' || (req.user.role === 'profesor' && hw.teacher_id === req.user.id)) {
    submissions = db.prepare(`
      SELECT sb.*, u.first_name || ' ' || u.last_name AS student_name, u.class_name
      FROM submissions sb
      JOIN users u ON u.id = sb.student_id
      WHERE sb.homework_id = ?
      ORDER BY sb.submitted_at DESC
    `).all(id);
  } else if (req.user.role === 'elev') {
    submissions = db.prepare('SELECT * FROM submissions WHERE homework_id = ? AND student_id = ?').all(id, req.user.id);
  }

  res.json({ homework: hw, submissions });
});

router.post(
  '/',
  authenticate,
  requireRole('admin', 'profesor'),
  upload.single('attachment'),
  (req, res) => {
    const { title, description, subject_id, class_name, due_date, max_score } = req.body || {};
    if (!title || !class_name) {
      if (req.file) fs.unlink(req.file.path, () => {});
      return res.status(400).json({ error: 'Titlu și clasă sunt obligatorii' });
    }
    const info = db.prepare(`
      INSERT INTO homework (title, description, subject_id, class_name, teacher_id, due_date, max_score, attachment_path, attachment_name)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      title.trim(),
      description || null,
      subject_id ? parseInt(subject_id, 10) : null,
      class_name,
      req.user.id,
      due_date || null,
      max_score ? parseInt(max_score, 10) : 10,
      req.file ? path.basename(req.file.path) : null,
      req.file ? req.file.originalname : null
    );
    logActivity(req.user.id, 'create_homework', 'homework', info.lastInsertRowid, title, req.ip);
    res.status(201).json({ homework: db.prepare('SELECT * FROM homework WHERE id = ?').get(info.lastInsertRowid) });
  }
);

router.delete('/:id', authenticate, requireRole('admin', 'profesor'), (req, res) => {
  const id = parseInt(req.params.id, 10);
  const hw = db.prepare('SELECT * FROM homework WHERE id = ?').get(id);
  if (!hw) return res.status(404).json({ error: 'Temă inexistentă' });
  if (req.user.role !== 'admin' && hw.teacher_id !== req.user.id) {
    return res.status(403).json({ error: 'Permisiune insuficientă' });
  }
  if (hw.attachment_path) fs.unlink(path.join(UPLOADS_DIR, hw.attachment_path), () => {});
  const subs = db.prepare('SELECT file_path FROM submissions WHERE homework_id = ?').all(id);
  subs.forEach((s) => { if (s.file_path) fs.unlink(path.join(UPLOADS_DIR, s.file_path), () => {}); });
  db.prepare('DELETE FROM homework WHERE id = ?').run(id);
  logActivity(req.user.id, 'delete_homework', 'homework', id, null, req.ip);
  res.json({ ok: true });
});

router.post(
  '/:id/submit',
  authenticate,
  requireRole('elev'),
  upload.single('file'),
  (req, res) => {
    const id = parseInt(req.params.id, 10);
    const { content } = req.body || {};
    const hw = db.prepare('SELECT * FROM homework WHERE id = ?').get(id);
    if (!hw) {
      if (req.file) fs.unlink(req.file.path, () => {});
      return res.status(404).json({ error: 'Temă inexistentă' });
    }
    if (hw.class_name !== req.user.class_name) {
      if (req.file) fs.unlink(req.file.path, () => {});
      return res.status(403).json({ error: 'Această temă nu este pentru clasa ta' });
    }

    const existing = db.prepare('SELECT * FROM submissions WHERE homework_id = ? AND student_id = ?').get(id, req.user.id);
    if (existing) {
      if (existing.file_path) fs.unlink(path.join(UPLOADS_DIR, existing.file_path), () => {});
      db.prepare(`
        UPDATE submissions SET content = ?, file_path = ?, file_name = ?, submitted_at = CURRENT_TIMESTAMP, score = NULL, feedback = NULL, graded_at = NULL, graded_by = NULL
        WHERE id = ?
      `).run(
        content || null,
        req.file ? path.basename(req.file.path) : null,
        req.file ? req.file.originalname : null,
        existing.id
      );
      logActivity(req.user.id, 'resubmit', 'submission', existing.id, null, req.ip);
      return res.json({ submission: db.prepare('SELECT * FROM submissions WHERE id = ?').get(existing.id) });
    }

    const info = db.prepare(`
      INSERT INTO submissions (homework_id, student_id, content, file_path, file_name)
      VALUES (?, ?, ?, ?, ?)
    `).run(
      id,
      req.user.id,
      content || null,
      req.file ? path.basename(req.file.path) : null,
      req.file ? req.file.originalname : null
    );
    logActivity(req.user.id, 'submit_homework', 'submission', info.lastInsertRowid, null, req.ip);
    res.status(201).json({ submission: db.prepare('SELECT * FROM submissions WHERE id = ?').get(info.lastInsertRowid) });
  }
);

router.post('/submissions/:id/grade', authenticate, requireRole('admin', 'profesor'), (req, res) => {
  const id = parseInt(req.params.id, 10);
  const { score, feedback } = req.body || {};
  const sub = db.prepare('SELECT s.*, h.teacher_id, h.max_score FROM submissions s JOIN homework h ON h.id = s.homework_id WHERE s.id = ?').get(id);
  if (!sub) return res.status(404).json({ error: 'Predare inexistentă' });
  if (req.user.role !== 'admin' && sub.teacher_id !== req.user.id) {
    return res.status(403).json({ error: 'Permisiune insuficientă' });
  }
  const scoreNum = parseFloat(score);
  if (isNaN(scoreNum) || scoreNum < 0 || scoreNum > sub.max_score) {
    return res.status(400).json({ error: `Nota trebuie să fie între 0 și ${sub.max_score}` });
  }
  db.prepare(`
    UPDATE submissions SET score = ?, feedback = ?, graded_at = CURRENT_TIMESTAMP, graded_by = ?
    WHERE id = ?
  `).run(scoreNum, feedback || null, req.user.id, id);
  logActivity(req.user.id, 'grade_submission', 'submission', id, `score=${scoreNum}`, req.ip);
  res.json({ submission: db.prepare('SELECT * FROM submissions WHERE id = ?').get(id) });
});

router.get('/submissions/:id/download', authenticate, (req, res) => {
  const id = parseInt(req.params.id, 10);
  const sub = db.prepare('SELECT s.*, h.teacher_id FROM submissions s JOIN homework h ON h.id = s.homework_id WHERE s.id = ?').get(id);
  if (!sub || !sub.file_path) return res.status(404).json({ error: 'Fișier inexistent' });
  if (req.user.role === 'elev' && sub.student_id !== req.user.id) {
    return res.status(403).json({ error: 'Permisiune insuficientă' });
  }
  if (req.user.role === 'profesor' && sub.teacher_id !== req.user.id) {
    return res.status(403).json({ error: 'Permisiune insuficientă' });
  }
  const fp = path.join(UPLOADS_DIR, sub.file_path);
  if (!fs.existsSync(fp)) return res.status(404).json({ error: 'Fișier lipsă pe disc' });
  res.download(fp, sub.file_name || sub.file_path);
});

router.get('/attachments/:id/download', authenticate, (req, res) => {
  const id = parseInt(req.params.id, 10);
  const hw = db.prepare('SELECT * FROM homework WHERE id = ?').get(id);
  if (!hw || !hw.attachment_path) return res.status(404).json({ error: 'Fișier inexistent' });
  const fp = path.join(UPLOADS_DIR, hw.attachment_path);
  if (!fs.existsSync(fp)) return res.status(404).json({ error: 'Fișier lipsă pe disc' });
  res.download(fp, hw.attachment_name || hw.attachment_path);
});

module.exports = router;
