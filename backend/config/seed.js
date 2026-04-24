const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const Mudra = require('../models/Mudra');

const mudras = [
  {
    name: 'Pataka',
    sanskritName: 'पताका',
    description: 'The Flag mudra — one of the most fundamental mudras in Bharatanatyam. Represents a flag, clouds, forest, and many more elements.',
    howToForm: 'All four fingers are held straight and together, thumb bent inward across the palm. The hand resembles a flat flag.',
    meaning: 'Flag, cloud, forest, river, cutting, wind, forbidden, blessing',
    category: 'Asamyuta',
    difficulty: 'Beginner',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Pataka.jpg/200px-Pataka.jpg',
    fingerPattern: { thumb: 'bent', index: 'straight', middle: 'straight', ring: 'straight', pinky: 'straight' }
  },
  {
    name: 'Tripataka',
    sanskritName: 'त्रिपताका',
    description: 'The Three Parts of a Flag mudra. Derived from Pataka but with the ring finger bent. Used to represent a crown, tree, or marriage ceremony.',
    howToForm: 'Similar to Pataka but with the ring finger bent at the middle joint while other fingers remain straight.',
    meaning: 'Crown, three, tree, marriage, lightning, arrow',
    category: 'Asamyuta',
    difficulty: 'Beginner',
    imageUrl: '',
    fingerPattern: { thumb: 'bent', index: 'straight', middle: 'straight', ring: 'bent', pinky: 'straight' }
  },
  {
    name: 'Alapadma',
    sanskritName: 'अलापद्म',
    description: 'The Fully Bloomed Lotus mudra. All five fingers are spread open and slightly curved, representing a fully bloomed lotus flower.',
    howToForm: 'Spread all five fingers apart, curve them slightly and fan them out like a blooming lotus.',
    meaning: 'Lotus in full bloom, beauty, the moon, wheel, universe',
    category: 'Asamyuta',
    difficulty: 'Beginner',
    imageUrl: '',
    fingerPattern: { thumb: 'spread', index: 'spread', middle: 'spread', ring: 'spread', pinky: 'spread' }
  },
  {
    name: 'Ardhachandra',
    sanskritName: 'अर्धचन्द्र',
    description: 'The Half Moon mudra. The thumb is stretched out at a right angle while other fingers are held straight and together.',
    howToForm: 'Extend the thumb perpendicular to the palm while keeping all four fingers straight and together.',
    meaning: 'Half moon, prayer, waist, spear, beginning of meditation',
    category: 'Asamyuta',
    difficulty: 'Beginner',
    imageUrl: '',
    fingerPattern: { thumb: 'extended', index: 'straight', middle: 'straight', ring: 'straight', pinky: 'straight' }
  },
  {
    name: 'Mayura',
    sanskritName: 'मयूर',
    description: 'The Peacock mudra. The thumb and index finger touch at the tips, while the other three fingers are held up representing a peacock\'s beak.',
    howToForm: 'Touch the tip of the thumb to the tip of the index finger. The middle, ring, and pinky fingers are raised and slightly curved.',
    meaning: 'Peacock, applying tilak, vomiting, stroking hair',
    category: 'Asamyuta',
    difficulty: 'Intermediate',
    imageUrl: '',
    fingerPattern: { thumb: 'tip_touch_index', index: 'tip_touch_thumb', middle: 'straight', ring: 'straight', pinky: 'straight' }
  },
  {
    name: 'Shikara',
    sanskritName: 'शिखर',
    description: 'The Peak or Spire mudra. The thumb points upward while all other fingers are curled into a fist. Represents a mountain peak.',
    howToForm: 'Make a fist with all four fingers, then extend the thumb straight up.',
    meaning: 'Peak, spire, husband, silence, love, pillar, bow',
    category: 'Asamyuta',
    difficulty: 'Beginner',
    imageUrl: '',
    fingerPattern: { thumb: 'straight_up', index: 'bent', middle: 'bent', ring: 'bent', pinky: 'bent' }
  },
  {
    name: 'Mushti',
    sanskritName: 'मुष्टि',
    description: 'The Fist mudra. All fingers are curled into the palm forming a fist, with the thumb placed over the ring and middle fingers.',
    howToForm: 'Curl all four fingers into the palm, then place the thumb over the ring and middle fingers.',
    meaning: 'Fist, grasping, steadfastness, wrestling, holding a sword',
    category: 'Asamyuta',
    difficulty: 'Beginner',
    imageUrl: '',
    fingerPattern: { thumb: 'over_fingers', index: 'bent', middle: 'bent', ring: 'bent', pinky: 'bent' }
  },
  {
    name: 'Katakamukha',
    sanskritName: 'कटकमुख',
    description: 'The Opening of a Bracelet mudra. Used in many contexts including garland picking, pulling arrows, and graceful movements.',
    howToForm: 'The index and middle fingers are bent towards the thumb tip. The ring and pinky fingers are extended.',
    meaning: 'Bracelet, pulling a bow, plucking flowers, conversation',
    category: 'Asamyuta',
    difficulty: 'Intermediate',
    imageUrl: '',
    fingerPattern: { thumb: 'curved', index: 'curved', middle: 'curved', ring: 'straight', pinky: 'straight' }
  }
];

async function seedDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/nrityakala');
    console.log('✅ Connected to MongoDB');

    await Mudra.deleteMany({});
    console.log('🗑️  Cleared existing mudras');

    const inserted = await Mudra.insertMany(mudras);
    console.log(`🌱 Seeded ${inserted.length} mudras successfully!`);

    inserted.forEach(m => console.log(`  ✓ ${m.name} (${m.difficulty})`));

    await mongoose.disconnect();
    console.log('✅ Done! Database seeded.');
  } catch (err) {
    console.error('❌ Seed failed:', err);
    process.exit(1);
  }
}

seedDB();
