const express = require('express');
const db = require('../db');
const { authenticate, requireRole } = require('../middleware/auth');

const router = express.Router();

router.get('/me', authenticate, requireRole('elev'), (req, res) => {
  const stats = db.prepare(`
    SELECT
      (SELECT COUNT(*) FROM homework WHERE class_name = ?) AS total_homework,
      (SELECT COUNT(*) FROM submissions WHERE student_id = ?) AS submitted,
      (SELECT COUNT(*) FROM submissions WHERE student_id = ? AND score IS NOT NULL) AS graded,
      (SELECT AVG(score) FROM submissions WHERE student_id = ? AND score IS NOT NULL) AS avg_score
  `).get(req.user.class_name || '', req.user.id, req.user.id, req.user.id);

  const recent = db.prepare(`
    SELECT s.id, s.score, s.feedback, s.submitted_at, s.graded_at,
           h.title AS homework_title, h.max_score, sub.name AS subject_name
    FROM submissions s
    JOIN homework h ON h.id = s.homework_id
    LEFT JOIN subjects sub ON sub.id = h.subject_id
    WHERE s.student_id = ?
    ORDER BY s.submitted_at DESC
    LIMIT 20
  `).all(req.user.id);

  const bySubject = db.prepare(`
    SELECT sub.name AS subject_name, AVG(s.score) AS avg_score, COUNT(s.id) AS count
    FROM submissions s
    JOIN homework h ON h.id = s.homework_id
    LEFT JOIN subjects sub ON sub.id = h.subject_id
    WHERE s.student_id = ? AND s.score IS NOT NULL
    GROUP BY sub.id
  `).all(req.user.id);

  res.json({ stats, recent, bySubject });
});

router.get('/student/:id', authenticate, requireRole('admin', 'profesor'), (req, res) => {
  const id = parseInt(req.params.id, 10);
  const student = db.prepare('SELECT id, first_name, last_name, class_name FROM users WHERE id = ? AND role = ?').get(id, 'elev');
  if (!student) return res.status(404).json({ error: 'Elev inexistent' });

  const stats = db.prepare(`
    SELECT
      (SELECT COUNT(*) FROM homework WHERE class_name = ?) AS total_homework,
      (SELECT COUNT(*) FROM submissions WHERE student_id = ?) AS submitted,
      (SELECT COUNT(*) FROM submissions WHERE student_id = ? AND score IS NOT NULL) AS graded,
      (SELECT AVG(score) FROM submissions WHERE student_id = ? AND score IS NOT NULL) AS avg_score
  `).get(student.class_name || '', id, id, id);

  const submissions = db.prepare(`
    SELECT s.*, h.title AS homework_title, h.max_score, sub.name AS subject_name
    FROM submissions s
    JOIN homework h ON h.id = s.homework_id
    LEFT JOIN subjects sub ON sub.id = h.subject_id
    WHERE s.student_id = ?
    ORDER BY s.submitted_at DESC
  `).all(id);

  res.json({ student, stats, submissions });
});

router.get('/class/:class_name', authenticate, requireRole('admin', 'profesor'), (req, res) => {
  const className = req.params.class_name;
  const students = db.prepare(`
    SELECT u.id, u.first_name, u.last_name,
           (SELECT COUNT(*) FROM submissions s WHERE s.student_id = u.id) AS submitted,
           (SELECT COUNT(*) FROM submissions s WHERE s.student_id = u.id AND s.score IS NOT NULL) AS graded,
           (SELECT AVG(score) FROM submissions s WHERE s.student_id = u.id AND s.score IS NOT NULL) AS avg_score
    FROM users u
    WHERE u.role = 'elev' AND u.class_name = ?
    ORDER BY u.last_name, u.first_name
  `).all(className);
  const totalHw = db.prepare('SELECT COUNT(*) AS n FROM homework WHERE class_name = ?').get(className).n;
  res.json({ class_name: className, total_homework: totalHw, students });
});

router.get('/overview', authenticate, requireRole('admin', 'profesor'), (req, res) => {
  const stats = db.prepare(`
    SELECT
      (SELECT COUNT(*) FROM users WHERE role = 'elev' AND active = 1) AS students,
      (SELECT COUNT(*) FROM users WHERE role = 'profesor' AND active = 1) AS teachers,
      (SELECT COUNT(*) FROM resources) AS resources,
      (SELECT COUNT(*) FROM homework) AS homework,
      (SELECT COUNT(*) FROM submissions) AS submissions,
      (SELECT COUNT(*) FROM submissions WHERE score IS NULL) AS pending_grading
  `).get();
  res.json({ stats });
});

module.exports = router;
