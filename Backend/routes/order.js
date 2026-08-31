
const express = require('express');
const { nanoid } = require('nanoid');
const db = require('../db');

const router = express.Router();

// Human-friendly order ID, e.g. S4KT-7F3K2Q
function generateOrderId() {
  return `S4KT-${nanoid(6).toUpperCase()}`;
}

// POST /api/orders — handles Checkout submission
router.post('/', (req, res) => {
  const {
    items,           // [{ name, size, color, qty, price }]
    fullName, phone,
    address, city, state,
    notes, paymentMethod,
  } = req.body;

  if (!items || !items.length || !fullName || !phone || !address) {
    return res.status(400).json({ error: 'Items, name, phone, and address are required.' });
  }

  const subtotal = items.reduce((sum, i) => sum + (i.price * i.qty), 0);
  const deliveryFee = 2500;

  const record = {
    id: generateOrderId(),
    items,
    subtotal,
    deliveryFee,
    total: subtotal + deliveryFee,
    fullName, phone, address, city: city || '', state: state || '',
    notes: notes || '',
    paymentMethod: paymentMethod || 'Pay on Delivery',
    status: 'order_placed', // order_placed -> confirmed -> out_for_delivery -> delivered
    rider: null, // { name, phone, eta } — filled in once dispatched
    createdAt: new Date().toISOString(),
  };

  db.insert('orders', record);

  res.status(201).json({
    success: true,
    message: 'Order placed! We will confirm on WhatsApp shortly.',
    orderId: record.id,
  });
});

// GET /api/orders/:id — Track My Order lookup (public, used by track-order.html)
router.get('/:id', (req, res) => {
  const order = db.findOne('orders', (o) => o.id.toLowerCase() === req.params.id.toLowerCase());
  if (!order) {
    return res.status(404).json({ error: 'Order not found. Please check your Order ID and try again.' });
  }
  res.json(order);
});

// GET /api/orders — owner-side: list all orders
router.get('/', (req, res) => {
  const orders = db.findAll('orders').sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );
  res.json(orders);
});

// PATCH /api/orders/:id/status — owner-side: update status and assign a rider
// body: { status, rider: { name, phone, eta } }
router.patch('/:id/status', (req, res) => {
  const { status, rider } = req.body;
  const updates = {};
  if (status) updates.status = status;
  if (rider) updates.rider = rider;

  const updated = db.updateOne(
    'orders',
    (o) => o.id.toLowerCase() === req.params.id.toLowerCase(),
    updates
  );

  if (!updated) return res.status(404).json({ error: 'Order not found.' });
  res.json({ success: true, order: updated });
});

module.exports = router;
