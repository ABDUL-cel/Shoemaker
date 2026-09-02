const express = require('express');
const { nanoid } = require('nanoid');
const multer = require('multer');
const { DesignRequest } = require('../db');
const { uploadBufferToCloudinary } = require('../cloudinary');
const { requireAdminKey } = require('../middleware');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 8 * 1024 * 1024 } });

router.post('/', upload.single('referenceImage'), async (req, res) => {
  const {
    shoeType, size, budgetRange, colorMaterial,
    deliveryDate, notes, fullName, phone,
  } = req.body;

  if (!fullName || !phone || !shoeType) {
    return res.status(400).json({ error: 'Name, phone, and shoe type are required.' });
  }

  try {
    let referenceImage = null;
    if (req.file) {
      referenceImage = await uploadBufferToCloudinary(req.file.buffer, 'samadii4kt/design-requests');
    }

    const record = await DesignRequest.create({
      id: nanoid(10),
      shoeType,
      size: size || '',
      budgetRange: budgetRange || '',
      colorMaterial: colorMaterial || '',
      deliveryDate: deliveryDate || '',
      notes: notes || '',
      fullName,
      phone,
      referenceImage,
    });

    res.status(201).json({
      success: true,
      message: "Thanks! We'll reach out on WhatsApp within 24 hours to confirm your design.",
      id: record.id,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
});

router.get('/', requireAdminKey, async (req, res) => {
  const requests = await DesignRequest.find().sort({ createdAt: -1 });
  res.json(requests);
});

router.patch('/:id/status', requireAdminKey, async (req, res) => {
  const { status } = req.body;
  if (!status) return res.status(400).json({ error: 'Status is required.' });

  const updated = await DesignRequest.findOneAndUpdate({ id: req.params.id }, { status }, { new: true });
  if (!updated) return res.status(404).json({ error: 'Design request not found.' });
  res.json({ success: true, request: updated });
});

module.exports = router;
