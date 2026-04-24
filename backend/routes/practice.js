const express = require('express');
const router = express.Router();
const PracticeLog = require('../models/PracticeLog');
const { protect } = require('../middleware/auth');

// POST /api/practice - save a practice result
router.post('/', protect, async (req, res) => {
  try {
    const { mudraId, mudraName, detectedMudra, accuracyScore, isCorrect, duration } = req.body;

    if (!mudraId || !mudraName) {
      return res.status(400).json({ message: 'mudraId and mudraName are required' });
    }

    const log = await PracticeLog.create({
      userId: req.user._id,
      mudraId,
      mudraName,
      detectedMudra: detectedMudra || 'Unknown',
      accuracyScore: accuracyScore || 0,
      isCorrect: isCorrect || false,
      duration: duration || 0
    });

    res.status(201).json(log);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// GET /api/practice/history - get user's practice history
router.get('/history', protect, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const logs = await PracticeLog.find({ userId: req.user._id })
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit);

    const total = await PracticeLog.countDocuments({ userId: req.user._id });

    res.json({ logs, total, page, pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// GET /api/practice/stats - get aggregated stats
router.get('/stats', protect, async (req, res) => {
  try {
    const userId = req.user._id;

    const totalSessions = await PracticeLog.countDocuments({ userId });

    const aggResult = await PracticeLog.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: null,
          avgAccuracy: { $avg: '$accuracyScore' },
          totalCorrect: { $sum: { $cond: ['$isCorrect', 1, 0] } }
        }
      }
    ]);

    const avgAccuracy = aggResult.length > 0 ? Math.round(aggResult[0].avgAccuracy) : 0;
    const totalCorrect = aggResult.length > 0 ? aggResult[0].totalCorrect : 0;

    // Recent 7 days trend
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const trend = await PracticeLog.aggregate([
      { $match: { userId, timestamp: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
          avgAccuracy: { $avg: '$accuracyScore' },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Per-mudra breakdown
    const mudraBreakdown = await PracticeLog.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: '$mudraName',
          avgAccuracy: { $avg: '$accuracyScore' },
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    res.json({ totalSessions, avgAccuracy, totalCorrect, trend, mudraBreakdown });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
