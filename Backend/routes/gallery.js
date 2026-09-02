const express = require('express');
const { nanoid } = require('nanoid');
const multer = require('multer');
const { GalleryItem } = require('../db');
const { uploadBufferToCloudinary } = require('../cloudinary');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 8 * 1024 * 1024 } });

function requireAdminKey(req, res, next) {
  const key = req.headers['x-admin-key'];
  if (!key || key !== process.env.ADMIN_UPLOAD_KEY) {
    return res.status(401).json({ error: 'Not authorized. Owner access only.' });
  }
  next();
}

router.get('/', async (req, res) => {
  const items = await GalleryItem.find().sort({ createdAt: -1 });
  res.json(items);
});

router.post('/', requireAdminKey, upload.single('photo'), async (req, res) => {
  const { title, category, price, location, description } = req.body;

  if (!title || !category || !req.file) {
    return res.status(400).json({ error: 'Title, category, and photo are required.' });
  }

  try {
    const image = await uploadBufferToCloudinary(req.file.buffer, 'samadii4kt/gallery');

    const record = await GalleryItem.create({
      id: nanoid(10),
      title,
      category,
      price: price || '',
      location: location || '',
      description: description || '',
      image,
    });

    res.status(201).json({ success: true, item: record });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
});

module.exports = router;
