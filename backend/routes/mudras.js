const express = require('express');
const Mudra = require('../models/Mudra');

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const mudras = await Mudra.find({}).sort({ difficulty: 1, name: 1 });
    res.json(mudras);
  } catch (e) { next(e); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const mudra = await Mudra.findById(req.params.id);
    if (!mudra) return res.status(404).json({ message: 'Mudra not found' });
    res.json(mudra);
  } catch (e) { next(e); }
});

module.exports = router;