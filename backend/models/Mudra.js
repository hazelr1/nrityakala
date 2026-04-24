const mongoose = require('mongoose');

const mudraSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  sanskritName: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  howToForm: {
    type: String,
    required: true
  },
  meaning: {
    type: String
  },
  category: {
    type: String,
    enum: ['Asamyuta', 'Samyuta', 'Nritta'],
    default: 'Asamyuta'
  },
  difficulty: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    default: 'Beginner'
  },
  imageUrl: {
    type: String,
    default: ''
  },
  fingerPattern: {
    type: Object,
    default: {}
  }
});

module.exports = mongoose.model('Mudra', mudraSchema);
