const express = require('express');
const router = express.Router();
const Mudra = require('../models/Mudra');
const { protect } = require('../middleware/auth');

// GET /api/mudras
router.get('/', async (req, res) => {
  try {
    const mudras = await Mudra.find().sort({ difficulty: 1, name: 1 });
    res.json(mudras);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// GET /api/mudras/:id
router.get('/:id', async (req, res) => {
  try {
    const mudra = await Mudra.findById(req.params.id);
    if (!mudra) return res.status(404).json({ message: 'Mudra not found' });
    res.json(mudra);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
