const express = require('express');
const { nanoid } = require('nanoid');
const multer = require('multer');
const { GalleryItem } = require('../db');
const { uploadBufferToCloudinary } = require('../cloudinary');
const { requireAdminKey } = require('../middleware');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 8 * 1024 * 1024 } });

// 👉 MUST add this to your app entry point:
 app.use(express.json());

router.get('/', async (req, res) => {
  try {
    const items = await GalleryItem.find().sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    console.error('❌ Gallery fetch error:', err);
    res.status(500).json({ error: 'Failed to load gallery items.' });
  }
});

router.post(
  '/',
  requireAdminKey,
  upload.single('photo'),
  async (req, res) => {
    try {
      const { title, category, price, location, description } = req.body;

      if (!title || !category || !req.file) {
        return res.status(400).json({ error: 'Title, category, and photo are required.' });
      }

      // 👇 Safely keep "0" or "" values instead of deleting them with || ''
      const safePrice = price !== undefined && price !== null ? price : '';
      const safeLocation = location !== undefined && location !== null ? location : '';
      const safeDescription =
        description !== undefined && description !== null ? description : '';

      const image = await uploadBufferToCloudinary(req.file.buffer, 'samadii4kt/gallery');

      const record = await GalleryItem.create({
        id: nanoid(10),
        title,
        category,
        price: safePrice,
        location: safeLocation,
        description: safeDescription,
        image,
      });

      res.status(201).json({ success: true, item: record });
    } catch (err) {
      console.error('❌ Gallery upload error:', err);
      res.status(500).json({ error: 'Something went wrong. Please try again.' });
    }
  }
);

router.delete('/:id', requireAdminKey, async (req, res) => {
  try {
    const deleted = await GalleryItem.findOneAndDelete({ id: req.params.id });
    if (!deleted) return res.status(404).json({ error: 'Item not found.' });
    res.json({ success: true });
  } catch (err) {
    console.error('❌ Gallery delete error:', err);
    res.status(500).json({ error: 'Failed to delete item.' });
  }
});

module.exports = router;
