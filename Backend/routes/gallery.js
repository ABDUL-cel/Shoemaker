const express = require('express');
const { nanoid } = require('nanoid');
const multer = require('multer');
const path = require('path');
const db = require('../db');

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '..', 'uploads')),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `work-${Date.now()}${ext}`);
  },
});
const upload = multer({ storage, limits: { fileSize: 8 * 1024 * 1024 } });

// Very simple owner-only check for now — swap for real login later.
// Set ADMIN_UPLOAD_KEY in your environment (see README) and send it
// from admin-upload.html as a header: "x-admin-key".
function requireAdminKey(req, res, next) {
  const key = req.headers['x-admin-key'];
  if (!key || key !== process.env.ADMIN_UPLOAD_KEY) {
    return res.status(401).json({ error: 'Not authorized. Owner access only.' });
  }
  next();
}

// GET /api/gallery — public: used by gallery.html to display finished work
router.get('/', (req, res) => {
  const items = db.findAll('gallery').sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );
  res.json(items);
});

// POST /api/gallery — owner only: used by admin-upload.html
router.post('/', requireAdminKey, upload.single('photo'), (req, res) => {
  const { title, category, price, location, description } = req.body;

  if (!title || !category || !req.file) {
    return res.status(400).json({ error: 'Title, category, and photo are required.' });
  }

  const record = {
    id: nanoid(10),
    title,
    category,
    price: price || '',
    location: location || '',
    description: description || '',
    image: `/uploads/${req.file.filename}`,
    createdAt: new Date().toISOString(),
  };

  db.insert('gallery', record);
  res.status(201).json({ success: true, item: record });
});

module.exports = router;
