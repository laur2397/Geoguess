const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const UPLOADS_DIR = process.env.UPLOADS_DIR || path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

const MAX_SIZE = (parseInt(process.env.MAX_UPLOAD_SIZE_MB, 10) || 200) * 1024 * 1024;

const ALLOWED_EXT = new Set([
  '.pdf', '.doc', '.docx', '.odt', '.txt', '.rtf',
  '.ppt', '.pptx', '.odp',
  '.xls', '.xlsx', '.ods', '.csv',
  '.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg',
  '.mp4', '.webm', '.mov', '.mkv', '.avi',
  '.mp3', '.wav', '.ogg', '.m4a',
  '.zip', '.rar', '.7z',
]);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const rand = crypto.randomBytes(8).toString('hex');
    const ts = Date.now();
    cb(null, `${ts}-${rand}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (!ALLOWED_EXT.has(ext)) {
    return cb(new Error(`Extensie de fișier neacceptată: ${ext}`));
  }
  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_SIZE },
});

module.exports = { upload, UPLOADS_DIR };
