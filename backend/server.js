const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/mudras', require('./routes/mudras'));
app.use('/api/practice', require('./routes/practice'));
app.use('/api/user', require('./routes/user'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'NrityaKala API is running' });
});

// Connect to MongoDB and start server
const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/nrityakala')
  .then(() => {
    console.log('[OK] MongoDB connected');
    app.listen(PORT, () => {
      console.log(`[READY] Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('[ERROR] MongoDB connection failed:', err.message);
    process.exit(1);
  });
