const express = require('express');
const auth = require('../middleware/auth');
const PracticeLog = require('../models/PracticeLog');

const router = express.Router();

// Save a practice log
router.post('/', auth, async (req, res, next) => {
  try {
    const { mudraId, mudraName, detectedMudra, accuracyScore, isCorrect, duration } = req.body;

    if (!mudraId || !mudraName) return res.status(400).json({ message: 'mudraId and mudraName are required' });

    const log = await PracticeLog.create({
      user: req.user._id,
      mudraId,
      mudraName,
      detectedMudra: detectedMudra || 'Unknown',
      accuracyScore: Number.isFinite(accuracyScore) ? accuracyScore : 0,
      isCorrect: !!isCorrect,
      duration: Number.isFinite(duration) ? duration : 0,
      timestamp: new Date()
    });

    res.status(201).json(log);
  } catch (e) { next(e); }
});

// Paginated history
router.get('/history', auth, async (req, res, next) => {
  try {
    const page = Math.max(parseInt(req.query.page || '1', 10), 1);
    const limit = 10;
    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      PracticeLog.find({ user: req.user._id })
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(limit),
      PracticeLog.countDocuments({ user: req.user._id })
    ]);

    const pages = Math.max(Math.ceil(total / limit), 1);
    res.json({ logs, page, pages, total });
  } catch (e) { next(e); }
});

// Stats
router.get('/stats', auth, async (req, res, next) => {
  try {
    const userId = req.user._id;

    const [totals] = await PracticeLog.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: null,
          totalSessions: { $sum: 1 },
          avgAccuracy: { $avg: '$accuracyScore' },
          totalCorrect: { $sum: { $cond: ['$isCorrect', 1, 0] } }
        }
      }
    ]);

    // last 7 days trend
    const trend = await PracticeLog.aggregate([
      { $match: { user: userId, timestamp: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
          count: { $sum: 1 },
          avgAccuracy: { $avg: '$accuracyScore' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const mudraBreakdown = await PracticeLog.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: '$mudraName',
          count: { $sum: 1 },
          avgAccuracy: { $avg: '$accuracyScore' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    res.json({
      totalSessions: totals?.totalSessions || 0,
      avgAccuracy: Math.round(totals?.avgAccuracy || 0),
      totalCorrect: totals?.totalCorrect || 0,
      trend,
      mudraBreakdown
    });
  } catch (e) { next(e); }
});

module.exports = router;