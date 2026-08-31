require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const contactRoutes = require('./routes/contact');
const designRoutes = require('./routes/design');
const orderRoutes = require('./routes/orders');
const galleryRoutes = require('./routes/gallery');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());               // allows the frontend (different origin) to call this API
app.use(express.json());       // parses JSON request bodies
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); // serves uploaded photos

// API routes — these match what the frontend forms will call
app.use('/api/contact', contactRoutes);
app.use('/api/design-requests', designRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/gallery', galleryRoutes);

app.get('/', (req, res) => {
  res.send('Samadii4KT Luxe API is running.');
});

app.listen(PORT, () => {
  console.log(`Samadii4KT Luxe backend running on http://localhost:${PORT}`);
});
