const express = require('express');
const { nanoid } = require('nanoid');
const multer = require('multer');
const path = require('path');
const db = require('../db');

const router = express.Router();

// Reference image upload storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '..', 'uploads')),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `design-ref-${Date.now()}${ext}`);
  },
});
const upload = multer({ storage, limits: { fileSize: 8 * 1024 * 1024 } }); // 8MB max

// POST /api/design-requests — handles the "Design Your Own Shoe" form
// Expects multipart/form-data because of the optional reference image.
router.post('/', upload.single('referenceImage'), (req, res) => {
  const {
    shoeType, size, budgetRange, colorMaterial,
    deliveryDate, notes, fullName, phone,
  } = req.body;

  if (!fullName || !phone || !shoeType) {
    return res.status(400).json({ error: 'Name, phone, and shoe type are required.' });
  }

  const record = {
    id: nanoid(10),
    shoeType,
    size: size || '',
    budgetRange: budgetRange || '',
    colorMaterial: colorMaterial || '',
    deliveryDate: deliveryDate || '',
    notes: notes || '',
    fullName,
    phone,
    referenceImage: req.file ? `/uploads/${req.file.filename}` : null,
    status: 'pending', // pending -> confirmed -> in_production -> ready -> delivered
    createdAt: new Date().toISOString(),
  };

  db.insert('design_requests', record);

  res.status(201).json({
    success: true,
    message: "Thanks! We'll reach out on WhatsApp within 24 hours to confirm your design.",
    id: record.id,
  });
});

// GET /api/design-requests — owner-side: list all custom design requests
router.get('/', (req, res) => {
  const requests = db.findAll('design_requests').sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );
  res.json(requests);
});

module.exports = router;
