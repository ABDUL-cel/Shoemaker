const express = require('express');
const { nanoid } = require('nanoid');
const multer = require('multer');
const { GalleryItem } = require('../db');
const { uploadBufferToCloudinary } = require('../cloudinary');
const { requireAdminKey } = require('middleware/middleware');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 8 * 1024 * 1024 } });

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

router.delete('/:id', requireAdminKey, async (req, res) => {
  const deleted = await GalleryItem.findOneAndDelete({ id: req.params.id });
  if (!deleted) return res.status(404).json({ error: 'Item not found.' });
  res.json({ success: true });
});

module.exports = router;
