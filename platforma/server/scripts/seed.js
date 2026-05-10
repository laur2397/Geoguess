require('dotenv').config();
const bcrypt = require('bcryptjs');
const db = require('../db');

function ensureUser(email, password, first_name, last_name, role, class_name) {
  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (existing) {
    console.log(`  - există deja: ${email}`);
    return existing.id;
  }
  const hash = bcrypt.hashSync(password, 10);
  const info = db
    .prepare('INSERT INTO users (email, password_hash, first_name, last_name, role, class_name) VALUES (?, ?, ?, ?, ?, ?)')
    .run(email, hash, first_name, last_name, role, class_name || null);
  console.log(`  + creat: ${email} (${role})`);
  return info.lastInsertRowid;
}

console.log('Seed: conturi de bază');
ensureUser('admin@scoala.local', 'admin1234', 'Director', 'Școală', 'admin', null);
ensureUser('profesor@scoala.local', 'profesor1234', 'Maria', 'Popescu', 'profesor', null);
ensureUser('elev@scoala.local', 'elev1234', 'Ion', 'Ionescu', 'elev', 'V A');
ensureUser('elev2@scoala.local', 'elev1234', 'Ana', 'Marin', 'elev', 'V A');
ensureUser('elev3@scoala.local', 'elev1234', 'Andrei', 'Stan', 'elev', 'VI B');

console.log('\nCredențiale demo:');
console.log('  Admin:    admin@scoala.local    / admin1234');
console.log('  Profesor: profesor@scoala.local / profesor1234');
console.log('  Elev:     elev@scoala.local     / elev1234');
