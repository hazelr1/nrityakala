const dotenv = require('dotenv');
const mongoose = require('mongoose');
const Mudra = require('../models/Mudra');

dotenv.config();

const mudras = [
  {
    name: 'Pataka',
    sanskritName: 'पताका',
    category: 'Asamyuta',
    difficulty: 'Beginner',
    description: 'A foundational single-hand gesture used widely in Bharatanatyam and other styles.',
    howToForm: 'Extend all four fingers together. Keep the thumb slightly bent and touching the side of the index finger.',
    meaning: 'Flag, clouds, forest, blessing (contextual)'
  },
  {
    name: 'Tripataka',
    sanskritName: 'त्रिपताका',
    category: 'Asamyuta',
    difficulty: 'Intermediate',
    description: 'Variation of Pataka with the ring finger bent.',
    howToForm: 'Form Pataka, then bend the ring finger at the middle joint. Keep the other fingers extended.',
    meaning: 'Crown, tree, arrow, lamp (contextual)'
  },
  {
    name: 'Mushti',
    sanskritName: 'मुष्टि',
    category: 'Asamyuta',
    difficulty: 'Beginner',
    description: 'Closed fist gesture.',
    howToForm: 'Curl all fingers into the palm to form a fist. Keep the thumb folded naturally.',
    meaning: 'Strength, holding, anger (contextual)'
  },
  {
    name: 'Shikara',
    sanskritName: 'शिखर',
    category: 'Asamyuta',
    difficulty: 'Beginner',
    description: 'Thumb extended upward with a closed fist.',
    howToForm: 'Make a fist and extend the thumb upward like a peak.',
    meaning: 'Bow, pillar, assurance (contextual)'
  },
  {
    name: 'Ardhachandra',
    sanskritName: 'अर्धचन्द्र',
    category: 'Asamyuta',
    difficulty: 'Intermediate',
    description: 'Open palm with thumb extended outward.',
    howToForm: 'Extend all fingers together and stretch the thumb sideways away from the palm.',
    meaning: 'Half-moon, knife, offering (contextual)'
  },
  {
    name: 'Alapadma',
    sanskritName: 'आलपद्म',
    category: 'Asamyuta',
    difficulty: 'Intermediate',
    description: 'Lotus-like open palm with fingers spread.',
    howToForm: 'Open the palm and spread all fingers gracefully, like a blooming lotus.',
    meaning: 'Lotus, beauty, full moon (contextual)'
  },
  {
    name: 'Mayura',
    sanskritName: 'मयूर',
    category: 'Asamyuta',
    difficulty: 'Advanced',
    description: 'Peacock gesture used for delicate expressions.',
    howToForm: 'Bring the thumb and ring finger together. Keep other fingers extended and relaxed.',
    meaning: 'Peacock, writing, ornament (contextual)'
  },
  {
    name: 'Katakamukha',
    sanskritName: 'कटकमुख',
    category: 'Asamyuta',
    difficulty: 'Advanced',
    description: 'Used to hold flowers, ornaments, or to show gentle grasping.',
    howToForm: 'Bring index, middle, and ring fingers toward the thumb as if pinching, keep pinky slightly extended.',
    meaning: 'Holding, garland, plucking flowers (contextual)'
  }
];

async function run() {
  if (!process.env.MONGO_URI) {
    console.error('Missing MONGO_URI in backend .env');
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected. Seeding mudras...');

  for (const m of mudras) {
    await Mudra.updateOne({ name: m.name }, { $set: m }, { upsert: true });
  }

  console.log('Seed complete.');
  await mongoose.disconnect();
  process.exit(0);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});