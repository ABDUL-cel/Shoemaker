const express = require('express');
const { nanoid } = require('nanoid');
const { ContactMessage } = require('../db');

const router = express.Router();

router.post('/', async (req, res) => {
  const { name, phone, email, subject, message } = req.body;

  if (!name || !phone || !message) {
    return res.status(400).json({ error: 'Name, phone, and message are required.' });
  }

  try {
    const record = await ContactMessage.create({
      id: nanoid(10),
      name,
      phone,
      email: email || '',
      subject: subject || 'General Inquiry',
      message,
    });

    res.status(201).json({ success: true, message: 'Thanks! We will get back to you shortly.', id: record.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
});

router.get('/', async (req, res) => {
  const messages = await ContactMessage.find().sort({ createdAt: -1 });
  res.json(messages);
});

module.exports = router;
