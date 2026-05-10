const { DatabaseSync } = require('node:sqlite');
const path = require('path');
const fs = require('fs');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, '..', 'data', 'platforma.db');
const dbDir = path.dirname(DB_PATH);
if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });

const db = new DatabaseSync(DB_PATH);
db.exec('PRAGMA journal_mode = WAL');
db.exec('PRAGMA foreign_keys = ON');

// Compatibility wrapper to match better-sqlite3 API surface used by routes
const origPrepare = db.prepare.bind(db);
db.prepare = function (sql) {
  const stmt = origPrepare(sql);
  const wrapped = {
    run: (...args) => {
      const info = stmt.run(...args);
      return {
        changes: Number(info.changes),
        lastInsertRowid: typeof info.lastInsertRowid === 'bigint' ? Number(info.lastInsertRowid) : info.lastInsertRowid,
      };
    },
    get: (...args) => stmt.get(...args),
    all: (...args) => stmt.all(...args),
    iterate: (...args) => stmt.iterate(...args),
  };
  return wrapped;
};

db.transaction = function (fn) {
  return (...args) => {
    db.exec('BEGIN');
    try {
      const result = fn(...args);
      db.exec('COMMIT');
      return result;
    } catch (e) {
      try { db.exec('ROLLBACK'); } catch (_) { /* noop */ }
      throw e;
    }
  };
};

function init() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('admin', 'profesor', 'elev')),
      class_name TEXT,
      avatar_url TEXT,
      active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS subjects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      description TEXT,
      icon TEXT
    );

    CREATE TABLE IF NOT EXISTS resources (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      subject_id INTEGER REFERENCES subjects(id) ON DELETE SET NULL,
      class_name TEXT,
      type TEXT NOT NULL CHECK(type IN ('document', 'video', 'link', 'imagine', 'altul')),
      file_path TEXT,
      file_name TEXT,
      file_size INTEGER,
      mime_type TEXT,
      external_url TEXT,
      uploaded_by INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      visible_to TEXT NOT NULL DEFAULT 'toti' CHECK(visible_to IN ('toti', 'elevi', 'profesori', 'clasa')),
      tags TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS homework (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      subject_id INTEGER REFERENCES subjects(id) ON DELETE SET NULL,
      class_name TEXT NOT NULL,
      teacher_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      due_date TEXT,
      max_score INTEGER NOT NULL DEFAULT 10,
      attachment_path TEXT,
      attachment_name TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS submissions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      homework_id INTEGER NOT NULL REFERENCES homework(id) ON DELETE CASCADE,
      student_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      content TEXT,
      file_path TEXT,
      file_name TEXT,
      submitted_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      score REAL,
      feedback TEXT,
      graded_at TEXT,
      graded_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
      UNIQUE(homework_id, student_id)
    );

    CREATE TABLE IF NOT EXISTS activity_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      action TEXT NOT NULL,
      entity_type TEXT,
      entity_id INTEGER,
      details TEXT,
      ip TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT
    );

    CREATE INDEX IF NOT EXISTS idx_resources_subject ON resources(subject_id);
    CREATE INDEX IF NOT EXISTS idx_resources_class ON resources(class_name);
    CREATE INDEX IF NOT EXISTS idx_homework_class ON homework(class_name);
    CREATE INDEX IF NOT EXISTS idx_submissions_student ON submissions(student_id);
    CREATE INDEX IF NOT EXISTS idx_submissions_homework ON submissions(homework_id);
  `);

  const subjectsCount = db.prepare('SELECT COUNT(*) AS n FROM subjects').get().n;
  if (subjectsCount === 0) {
    const insert = db.prepare('INSERT INTO subjects (name, description, icon) VALUES (?, ?, ?)');
    const defaults = [
      ['Matematică', 'Resurse pentru matematică gimnaziu', 'mdi-calculator'],
      ['Limba și literatura română', 'Resurse pentru limba română', 'mdi-book-open-page-variant'],
      ['Limba engleză', 'Resurse pentru limba engleză', 'mdi-translate'],
      ['Științe', 'Biologie, fizică, chimie', 'mdi-flask'],
      ['Istorie', 'Resurse istorie', 'mdi-castle'],
      ['Geografie', 'Resurse geografie', 'mdi-earth'],
      ['Educație tehnologică', 'TIC, informatică', 'mdi-laptop'],
      ['Educație fizică', 'Sport și mișcare', 'mdi-run'],
      ['Arte', 'Educație plastică și muzicală', 'mdi-palette'],
    ];
    const tx = db.transaction(() => defaults.forEach((r) => insert.run(...r)));
    tx();
  }

  const settingsCount = db.prepare('SELECT COUNT(*) AS n FROM settings').get().n;
  if (settingsCount === 0) {
    const stmt = db.prepare('INSERT INTO settings (key, value) VALUES (?, ?)');
    stmt.run('school_name', 'Școala Gimnazială Greceşti');
    stmt.run('theme_color', '#1565c0');
    stmt.run('logo_url', '');
    stmt.run('contact_email', 'scoalagrecesti@gmail.com');
  }
}

init();

module.exports = db;
