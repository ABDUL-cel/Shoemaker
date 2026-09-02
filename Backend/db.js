// MongoDB connection + data models, using Mongoose.
// Replaces the old JSON-file storage so data survives server restarts.

const mongoose = require('mongoose');

async function connect() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('MONGODB_URI is not set. Add it as an environment variable.');
    return;
  }
  try {
    await mongoose.connect(uri);
    console.log('Connected to MongoDB');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
  }
}

const ContactMessageSchema = new mongoose.Schema({
  id: String,
  name: String,
  phone: String,
  email: String,
  subject: String,
  message: String,
  status: { type: String, default: 'new' },
  createdAt: { type: Date, default: Date.now },
});

const DesignRequestSchema = new mongoose.Schema({
  id: String,
  shoeType: String,
  size: String,
  budgetRange: String,
  colorMaterial: String,
  deliveryDate: String,
  notes: String,
  fullName: String,
  phone: String,
  referenceImage: String,
  status: { type: String, default: 'pending' },
  createdAt: { type: Date, default: Date.now },
});

const OrderSchema = new mongoose.Schema({
  id: String,
  items: [
    {
      name: String,
      size: String,
      color: String,
      qty: Number,
      price: Number,
    },
  ],
  subtotal: Number,
  deliveryFee: Number,
  total: Number,
  fullName: String,
  phone: String,
  address: String,
  city: String,
  state: String,
  notes: String,
  paymentMethod: String,
  status: { type: String, default: 'order_placed' },
  rider: {
    name: String,
    phone: String,
    eta: String,
  },
  createdAt: { type: Date, default: Date.now },
});

const GalleryItemSchema = new mongoose.Schema({
  id: String,
  title: String,
  category: String,
  price: String,
  location: String,
  description: String,
  image: String,
  createdAt: { type: Date, default: Date.now },
});

const ContactMessage = mongoose.model('ContactMessage', ContactMessageSchema);
const DesignRequest = mongoose.model('DesignRequest', DesignRequestSchema);
const Order = mongoose.model('Order', OrderSchema);
const GalleryItem = mongoose.model('GalleryItem', GalleryItemSchema);

module.exports = { connect, ContactMessage, DesignRequest, Order, GalleryItem };
