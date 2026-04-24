const mongoose = require('mongoose');

const PracticeLogSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  mudraId: { type: mongoose.Schema.Types.ObjectId, ref: 'Mudra', required: true },
  mudraName: { type: String, required: true },

  detectedMudra: { type: String, default: 'Unknown' },
  accuracyScore: { type: Number, min: 0, max: 100, default: 0 },
  isCorrect: { type: Boolean, default: false },
  duration: { type: Number, default: 0 }, // seconds

  timestamp: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('PracticeLog', PracticeLogSchema);