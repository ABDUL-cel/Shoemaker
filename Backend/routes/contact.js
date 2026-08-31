const express = require('express');
const { nanoid } = require('nanoid');
const db = require('../db');

const router = express.Router();

// POST /api/contact  — handles the Contact page form
router.post('/', (req, res) => {
  const { name, phone, email, subject, message } = req.body;

  if (!name || !phone || !message) {
    return res.status(400).json({ error: 'Name, phone, and message are required.' });
  }

  const record = {
    id: nanoid(10),
    name,
    phone,
    email: email || '',
    subject: subject || 'General Inquiry',
    message,
    createdAt: new Date().toISOString(),
    status: 'new', // new -> read -> replied
  };

  db.insert('contact_messages', record);

  // TODO once ready: send this to WhatsApp/email automatically (see README).
  res.status(201).json({ success: true, message: 'Thanks! We will get back to you shortly.', id: record.id });
});

// GET /api/contact — owner-side: list all messages (for a future admin dashboard)
router.get('/', (req, res) => {
  const messages = db.findAll('contact_messages').sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );
  res.json(messages);
});

module.exports = router;
