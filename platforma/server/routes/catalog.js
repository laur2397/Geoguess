const express = require('express');
const db = require('../db');
const { authenticate, requireRole, logActivity } = require('../middleware/auth');

const router = express.Router();

function currentSchoolYear(date = new Date()) {
  const y = date.getFullYear();
  return date.getMonth() >= 8 ? `${y}-${y + 1}` : `${y - 1}-${y}`;
}

function currentSemester(date = new Date()) {
  const m = date.getMonth();
  return m >= 8 || m === 0 ? 1 : 2;
}

router.get('/year', (req, res) => {
  res.json({ school_year: currentSchoolYear(), semester: currentSemester() });
});

// ============ GRADES ============

router.get('/grades', authenticate, (req, res) => {
  const { student_id, subject_id, semester, school_year, class_name } = req.query;
  const conds = [];
  const params = [];

  if (req.user.role === 'elev') {
    conds.push('g.student_id = ?');
    params.push(req.user.id);
  } else if (student_id) {
    conds.push('g.student_id = ?');
    params.push(parseInt(student_id, 10));
  } else if (class_name) {
    conds.push('u.class_name = ?');
    params.push(class_name);
  }

  if (subject_id) { conds.push('g.subject_id = ?'); params.push(parseInt(subject_id, 10)); }
  if (semester) { conds.push('g.semester = ?'); params.push(parseInt(semester, 10)); }
  if (school_year) { conds.push('g.school_year = ?'); params.push(school_year); }

  const where = conds.length ? `WHERE ${conds.join(' AND ')}` : '';
  const rows = db.prepare(`
    SELECT g.*,
           s.name AS subject_name,
           u.first_name || ' ' || u.last_name AS student_name,
           u.class_name AS student_class,
           t.first_name || ' ' || t.last_name AS teacher_name
    FROM grades g
    JOIN subjects s ON s.id = g.subject_id
    JOIN users u ON u.id = g.student_id
    LEFT JOIN users t ON t.id = g.teacher_id
    ${where}
    ORDER BY g.graded_at DESC
    LIMIT 1000
  `).all(...params);

  res.json({ grades: rows });
});

router.post('/grades', authenticate, requireRole('admin', 'profesor'), (req, res) => {
  const { student_id, subject_id, value, type, description, semester, school_year } = req.body || {};
  if (!student_id || !subject_id || value == null) {
    return res.status(400).json({ error: 'student_id, subject_id și value sunt obligatorii' });
  }
  const v = parseFloat(value);
  if (isNaN(v) || v < 1 || v > 10) {
    return res.status(400).json({ error: 'Nota trebuie să fie între 1 și 10' });
  }
  const student = db.prepare("SELECT id, role FROM users WHERE id = ? AND role = 'elev'").get(parseInt(student_id, 10));
  if (!student) return res.status(404).json({ error: 'Elev inexistent' });
  const subject = db.prepare('SELECT id FROM subjects WHERE id = ?').get(parseInt(subject_id, 10));
  if (!subject) return res.status(404).json({ error: 'Materie inexistentă' });

  const info = db.prepare(`
    INSERT INTO grades (student_id, subject_id, teacher_id, value, type, description, semester, school_year)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    parseInt(student_id, 10),
    parseInt(subject_id, 10),
    req.user.id,
    v,
    type || 'oral',
    description || null,
    semester ? parseInt(semester, 10) : currentSemester(),
    school_year || currentSchoolYear()
  );

  logActivity(req.user.id, 'create_grade', 'grade', info.lastInsertRowid, `${v} (elev ${student_id}, materie ${subject_id})`, req.ip);
  const grade = db.prepare(`
    SELECT g.*, s.name AS subject_name, u.first_name || ' ' || u.last_name AS student_name
    FROM grades g JOIN subjects s ON s.id = g.subject_id JOIN users u ON u.id = g.student_id
    WHERE g.id = ?
  `).get(info.lastInsertRowid);
  res.status(201).json({ grade });
});

router.put('/grades/:id', authenticate, requireRole('admin', 'profesor'), (req, res) => {
  const id = parseInt(req.params.id, 10);
  const current = db.prepare('SELECT * FROM grades WHERE id = ?').get(id);
  if (!current) return res.status(404).json({ error: 'Notă inexistentă' });
  if (req.user.role !== 'admin' && current.teacher_id !== req.user.id) {
    return res.status(403).json({ error: 'Puteți modifica doar notele proprii' });
  }
  const { value, type, description, semester } = req.body || {};
  const v = value != null ? parseFloat(value) : current.value;
  if (isNaN(v) || v < 1 || v > 10) {
    return res.status(400).json({ error: 'Nota trebuie să fie între 1 și 10' });
  }
  db.prepare('UPDATE grades SET value = ?, type = ?, description = ?, semester = ? WHERE id = ?').run(
    v, type || current.type, description ?? current.description, semester ? parseInt(semester, 10) : current.semester, id
  );
  logActivity(req.user.id, 'update_grade', 'grade', id, `value=${v}`, req.ip);
  res.json({ grade: db.prepare('SELECT * FROM grades WHERE id = ?').get(id) });
});

router.delete('/grades/:id', authenticate, requireRole('admin', 'profesor'), (req, res) => {
  const id = parseInt(req.params.id, 10);
  const current = db.prepare('SELECT * FROM grades WHERE id = ?').get(id);
  if (!current) return res.status(404).json({ error: 'Notă inexistentă' });
  if (req.user.role !== 'admin' && current.teacher_id !== req.user.id) {
    return res.status(403).json({ error: 'Puteți șterge doar notele proprii' });
  }
  db.prepare('DELETE FROM grades WHERE id = ?').run(id);
  logActivity(req.user.id, 'delete_grade', 'grade', id, null, req.ip);
  res.json({ ok: true });
});

// ============ ABSENCES ============

router.get('/absences', authenticate, (req, res) => {
  const { student_id, subject_id, semester, school_year, class_name, motivated } = req.query;
  const conds = [];
  const params = [];

  if (req.user.role === 'elev') {
    conds.push('a.student_id = ?');
    params.push(req.user.id);
  } else if (student_id) {
    conds.push('a.student_id = ?');
    params.push(parseInt(student_id, 10));
  } else if (class_name) {
    conds.push('u.class_name = ?');
    params.push(class_name);
  }

  if (subject_id) { conds.push('a.subject_id = ?'); params.push(parseInt(subject_id, 10)); }
  if (semester) { conds.push('a.semester = ?'); params.push(parseInt(semester, 10)); }
  if (school_year) { conds.push('a.school_year = ?'); params.push(school_year); }
  if (motivated != null && motivated !== '') { conds.push('a.motivated = ?'); params.push(motivated === '1' || motivated === 'true' ? 1 : 0); }

  const where = conds.length ? `WHERE ${conds.join(' AND ')}` : '';
  const rows = db.prepare(`
    SELECT a.*,
           s.name AS subject_name,
           u.first_name || ' ' || u.last_name AS student_name,
           u.class_name AS student_class,
           t.first_name || ' ' || t.last_name AS teacher_name
    FROM absences a
    LEFT JOIN subjects s ON s.id = a.subject_id
    JOIN users u ON u.id = a.student_id
    LEFT JOIN users t ON t.id = a.teacher_id
    ${where}
    ORDER BY a.date DESC
    LIMIT 1000
  `).all(...params);

  res.json({ absences: rows });
});

router.post('/absences', authenticate, requireRole('admin', 'profesor'), (req, res) => {
  const { student_id, subject_id, date, motivated, reason, semester, school_year } = req.body || {};
  if (!student_id || !date) return res.status(400).json({ error: 'student_id și date sunt obligatorii' });

  const info = db.prepare(`
    INSERT INTO absences (student_id, subject_id, teacher_id, date, motivated, reason, semester, school_year)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    parseInt(student_id, 10),
    subject_id ? parseInt(subject_id, 10) : null,
    req.user.id,
    date,
    motivated ? 1 : 0,
    reason || null,
    semester ? parseInt(semester, 10) : currentSemester(),
    school_year || currentSchoolYear()
  );
  logActivity(req.user.id, 'create_absence', 'absence', info.lastInsertRowid, null, req.ip);
  res.status(201).json({ absence: db.prepare('SELECT * FROM absences WHERE id = ?').get(info.lastInsertRowid) });
});

router.put('/absences/:id', authenticate, requireRole('admin', 'profesor'), (req, res) => {
  const id = parseInt(req.params.id, 10);
  const current = db.prepare('SELECT * FROM absences WHERE id = ?').get(id);
  if (!current) return res.status(404).json({ error: 'Absență inexistentă' });
  if (req.user.role !== 'admin' && current.teacher_id !== req.user.id) {
    return res.status(403).json({ error: 'Permisiune insuficientă' });
  }
  const { motivated, reason, date } = req.body || {};
  db.prepare('UPDATE absences SET motivated = ?, reason = ?, date = ? WHERE id = ?').run(
    motivated ? 1 : 0,
    reason ?? current.reason,
    date || current.date,
    id
  );
  logActivity(req.user.id, 'update_absence', 'absence', id, null, req.ip);
  res.json({ absence: db.prepare('SELECT * FROM absences WHERE id = ?').get(id) });
});

router.delete('/absences/:id', authenticate, requireRole('admin', 'profesor'), (req, res) => {
  const id = parseInt(req.params.id, 10);
  const current = db.prepare('SELECT * FROM absences WHERE id = ?').get(id);
  if (!current) return res.status(404).json({ error: 'Absență inexistentă' });
  if (req.user.role !== 'admin' && current.teacher_id !== req.user.id) {
    return res.status(403).json({ error: 'Permisiune insuficientă' });
  }
  db.prepare('DELETE FROM absences WHERE id = ?').run(id);
  logActivity(req.user.id, 'delete_absence', 'absence', id, null, req.ip);
  res.json({ ok: true });
});

// ============ CARNET (student view) ============

router.get('/carnet', authenticate, requireRole('elev'), (req, res) => {
  const { school_year, semester } = req.query;
  const year = school_year || currentSchoolYear();

  const grades = db.prepare(`
    SELECT g.*, s.name AS subject_name, t.first_name || ' ' || t.last_name AS teacher_name
    FROM grades g
    JOIN subjects s ON s.id = g.subject_id
    LEFT JOIN users t ON t.id = g.teacher_id
    WHERE g.student_id = ? AND g.school_year = ? ${semester ? 'AND g.semester = ?' : ''}
    ORDER BY g.graded_at DESC
  `).all(...(semester ? [req.user.id, year, parseInt(semester, 10)] : [req.user.id, year]));

  // Group by subject and compute averages
  const subjectsMap = new Map();
  grades.forEach((g) => {
    const key = g.subject_id;
    if (!subjectsMap.has(key)) {
      subjectsMap.set(key, { subject_id: g.subject_id, subject_name: g.subject_name, sem1: [], sem2: [] });
    }
    const bucket = subjectsMap.get(key);
    (g.semester === 1 ? bucket.sem1 : bucket.sem2).push(g);
  });
  const bySubject = [...subjectsMap.values()].map((b) => {
    const avg = (arr) => arr.length ? arr.reduce((s, g) => s + g.value, 0) / arr.length : null;
    return {
      ...b,
      avg_sem1: avg(b.sem1),
      avg_sem2: avg(b.sem2),
      avg_year: avg([...b.sem1, ...b.sem2]),
    };
  }).sort((a, b) => a.subject_name.localeCompare(b.subject_name));

  const absences = db.prepare(`
    SELECT a.*, s.name AS subject_name
    FROM absences a
    LEFT JOIN subjects s ON s.id = a.subject_id
    WHERE a.student_id = ? AND a.school_year = ? ${semester ? 'AND a.semester = ?' : ''}
    ORDER BY a.date DESC
  `).all(...(semester ? [req.user.id, year, parseInt(semester, 10)] : [req.user.id, year]));

  const absStats = {
    total: absences.length,
    motivated: absences.filter((a) => a.motivated).length,
    unmotivated: absences.filter((a) => !a.motivated).length,
  };

  // Overall average across subjects
  const subjAvgs = bySubject.map((s) => s.avg_year).filter((v) => v != null);
  const generalAvg = subjAvgs.length ? subjAvgs.reduce((a, b) => a + b, 0) / subjAvgs.length : null;

  res.json({
    school_year: year,
    by_subject: bySubject,
    recent_grades: grades.slice(0, 20),
    absences,
    absence_stats: absStats,
    general_average: generalAvg,
  });
});

// ============ CATALOG (teacher/admin view) ============

router.get('/class/:class_name', authenticate, requireRole('admin', 'profesor'), (req, res) => {
  const className = req.params.class_name;
  const { school_year, semester } = req.query;
  const year = school_year || currentSchoolYear();

  const students = db.prepare(`
    SELECT id, first_name, last_name FROM users
    WHERE role = 'elev' AND class_name = ?
    ORDER BY last_name, first_name
  `).all(className);

  const subjects = db.prepare('SELECT id, name FROM subjects ORDER BY name').all();

  const gradeRows = db.prepare(`
    SELECT g.* FROM grades g
    JOIN users u ON u.id = g.student_id
    WHERE u.class_name = ? AND g.school_year = ? ${semester ? 'AND g.semester = ?' : ''}
  `).all(...(semester ? [className, year, parseInt(semester, 10)] : [className, year]));

  const absenceRows = db.prepare(`
    SELECT a.* FROM absences a
    JOIN users u ON u.id = a.student_id
    WHERE u.class_name = ? AND a.school_year = ? ${semester ? 'AND a.semester = ?' : ''}
  `).all(...(semester ? [className, year, parseInt(semester, 10)] : [className, year]));

  // Build matrix: studentId -> subjectId -> { grades[], avg, absences{total,motivated} }
  const matrix = {};
  students.forEach((s) => {
    matrix[s.id] = {};
    subjects.forEach((sub) => {
      matrix[s.id][sub.id] = { grades: [], avg: null, absences: 0, motivated: 0 };
    });
  });
  gradeRows.forEach((g) => {
    if (matrix[g.student_id] && matrix[g.student_id][g.subject_id]) {
      matrix[g.student_id][g.subject_id].grades.push(g);
    }
  });
  absenceRows.forEach((a) => {
    if (a.subject_id != null && matrix[a.student_id] && matrix[a.student_id][a.subject_id]) {
      const cell = matrix[a.student_id][a.subject_id];
      cell.absences += 1;
      if (a.motivated) cell.motivated += 1;
    }
  });
  // Compute averages
  Object.values(matrix).forEach((row) => {
    Object.values(row).forEach((cell) => {
      if (cell.grades.length) {
        cell.avg = cell.grades.reduce((s, g) => s + g.value, 0) / cell.grades.length;
      }
    });
  });

  res.json({
    class_name: className,
    school_year: year,
    semester: semester ? parseInt(semester, 10) : null,
    students,
    subjects,
    matrix,
  });
});

module.exports = router;
