require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs');

const authRouter = require('./routes/auth');
const usersRouter = require('./routes/users');
const resourcesRouter = require('./routes/resources');
const homeworkRouter = require('./routes/homework');
const progressRouter = require('./routes/progress');
const settingsRouter = require('./routes/settings');

const app = express();
const PORT = parseInt(process.env.PORT, 10) || 3000;

app.set('trust proxy', 1);
app.use(helmet({ contentSecurityPolicy: false, crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: (process.env.CORS_ORIGIN || '*').split(',').map((s) => s.trim()),
  credentials: false,
}));

const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 30, standardHeaders: true, legacyHeaders: false });
const apiLimiter = rateLimit({ windowMs: 60 * 1000, max: 300, standardHeaders: true, legacyHeaders: false });

app.get('/api/health', (req, res) => res.json({ ok: true, uptime: process.uptime(), ts: Date.now() }));

app.use('/api/auth', authLimiter, authRouter);
app.use('/api', apiLimiter);
app.use('/api/users', usersRouter);
app.use('/api/resources', resourcesRouter);
app.use('/api/homework', homeworkRouter);
app.use('/api/progress', progressRouter);
app.use('/api/settings', settingsRouter);

// Serve client build in production
const clientDist = path.join(__dirname, '..', 'client', 'dist');
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get(/^(?!\/api).*/, (req, res) => res.sendFile(path.join(clientDist, 'index.html')));
}

app.use((err, req, res, next) => {
  if (err && err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ error: 'Fișier prea mare' });
  }
  if (err) {
    console.error(err);
    return res.status(err.status || 500).json({ error: err.message || 'Eroare server' });
  }
  next();
});

app.listen(PORT, () => {
  console.log(`Platforma rulează pe http://localhost:${PORT}`);
});
