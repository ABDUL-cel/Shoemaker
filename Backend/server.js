require('dotenv').config();
const fs = require('fs');
const express = require('express');
const cors = require('cors');
const path = require('path');

const contactRoutes = require('./routes/contact');
const designRoutes = require('./routes/design');
const orderRoutes = require('./routes/orders');
const galleryRoutes = require('./routes/gallery');

const app = express();
const PORT = process.env.PORT || 4000;

// Make sure the uploads folder exists — it won't be there after a fresh
// deploy since empty folders aren't stored in git.
const UPLOADS_DIR = path.join(__dirname, 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

app.use(cors());               // allows the frontend (different origin) to call this API
app.use(express.json());       // parses JSON request bodies
app.use('/uploads', express.static(UPLOADS_DIR)); // serves uploaded photos

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
