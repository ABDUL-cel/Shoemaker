const express = require('express');
const { nanoid } = require('nanoid');
const { Order } = require('../db');
const { requireAdminKey } = require('../middleware');

const router = express.Router();

function generateOrderId() {
  return `S4KT-${nanoid(6).toUpperCase()}`;
}

router.post('/', async (req, res) => {
  const {
    items, fullName, phone,
    address, city, state,
    notes, paymentMethod,
  } = req.body;

  if (!items || !items.length || !fullName || !phone || !address) {
    return res.status(400).json({ error: 'Items, name, phone, and address are required.' });
  }

  try {
    const subtotal = items.reduce((sum, i) => sum + (i.price * i.qty), 0);
    const deliveryFee = 2500;

    const record = await Order.create({
      id: generateOrderId(),
      items,
      subtotal,
      deliveryFee,
      total: subtotal + deliveryFee,
      fullName, phone, address, city: city || '', state: state || '',
      notes: notes || '',
      paymentMethod: paymentMethod || 'Pay on Delivery',
    });

    res.status(201).json({
      success: true,
      message: 'Order placed! We will confirm on WhatsApp shortly.',
      orderId: record.id,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong placing your order. Please try again.' });
  }
});

router.get('/:id', async (req, res) => {
  const order = await Order.findOne({ id: new RegExp(`^${req.params.id}$`, 'i') });
  if (!order) {
    return res.status(404).json({ error: 'Order not found. Please check your Order ID and try again.' });
  }
  res.json(order);
});

router.get('/', requireAdminKey, async (req, res) => {
  const orders = await Order.find().sort({ createdAt: -1 });
  res.json(orders);
});

router.patch('/:id/status', requireAdminKey, async (req, res) => {
  const { status, rider } = req.body;
  const updates = {};
  if (status) updates.status = status;
  if (rider) updates.rider = rider;

  const updated = await Order.findOneAndUpdate(
    { id: new RegExp(`^${req.params.id}$`, 'i') },
    updates,
    { new: true }
  );

  if (!updated) return res.status(404).json({ error: 'Order not found.' });
  res.json({ success: true, order: updated });
});

module.exports = router;
