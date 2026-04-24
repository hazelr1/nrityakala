const mongoose = require('mongoose');

const MudraSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, unique: true },
  sanskritName: { type: String, default: '' },
  category: { type: String, enum: ['Asamyuta', 'Samyuta'], default: 'Asamyuta' },
  difficulty: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], default: 'Beginner' },
  description: { type: String, default: '' },
  howToForm: { type: String, default: '' },
  meaning: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('Mudra', MudraSchema);