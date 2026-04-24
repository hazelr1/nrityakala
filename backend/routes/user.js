const express = require('express');
const auth = require('../middleware/auth');
const User = require('../models/User');

const router = express.Router();

router.get('/profile', auth, async (req, res) => {
  res.json(req.user);
});

router.put('/profile', auth, async (req, res, next) => {
  try {
    const { name, bio, level } = req.body;

    const updates = {};
    if (typeof name === 'string' && name.trim()) updates.name = name.trim();
    if (typeof bio === 'string') updates.bio = bio.slice(0, 200);
    if (['Beginner', 'Intermediate', 'Advanced'].includes(level)) updates.level = level;

    const updated = await User.findByIdAndUpdate(req.user._id, updates, { new: true }).select('-passwordHash');
    res.json(updated);
  } catch (e) { next(e); }
});

module.exports = router;