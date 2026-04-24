const mongoose = require('mongoose');

const practiceLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  mudraId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Mudra',
    required: true
  },
  mudraName: {
    type: String,
    required: true
  },
  detectedMudra: {
    type: String,
    default: 'Unknown'
  },
  accuracyScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  isCorrect: {
    type: Boolean,
    default: false
  },
  duration: {
    type: Number, // seconds
    default: 0
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

// Virtual for formatted date
practiceLogSchema.virtual('formattedDate').get(function () {
  return this.timestamp.toLocaleDateString('en-IN', {
    year: 'numeric', month: 'short', day: 'numeric'
  });
});

module.exports = mongoose.model('PracticeLog', practiceLogSchema);
