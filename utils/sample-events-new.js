const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const Event = require('../models/Events');

// Load environment variables with absolute path
dotenv.config({ path: path.join(__dirname, '../.env') });

// Verify the connection string is loaded
console.log("MongoDB URI available:", !!process.env.MONGO_URI);

// MongoDB Connection
const connectDB = require("../config/db");
connectDB();


// 2. Define 12 art-themed sample events
const sampleEvents = [
  {
    name: 'Watercolor Masterclass',
    startTime: new Date('2025-06-10T10:00:00'),
    endTime:   new Date('2025-06-10T13:00:00'),
    location:  'Kala Art Studio, New Delhi',
    type:      'Offline',
    category:  'Painting',
    platform:  null,
    description: 'Hands-on workshop exploring watercolor techniques on paper.',
    imageUrl:    'https://picsum.photos/seed/watercolor1/800/600',
    tags:       ['watercolor', 'painting', 'workshop'],
  },
  {
    name: 'Clay Sculpture Bootcamp',
    startTime: new Date('2025-06-20T11:00:00'),
    endTime:   new Date('2025-06-20T16:00:00'),
    location:  'ClayWorks Studio, Jaipur',
    type:      'Offline',
    category:  'Sculpture',
    platform:  null,
    description: 'Build your own clay sculptures with guidance from masters.',
    imageUrl:    'https://picsum.photos/seed/sculpture2/800/600',
    tags:       ['clay', 'sculpture', 'bootcamp'],
  },
  {
    name: 'Digital Illustration Webinar',
    startTime: new Date('2025-07-05T15:00:00'),
    endTime:   new Date('2025-07-05T17:00:00'),
    location:  'Online',
    type:      'Online',
    category:  'Digital Art',
    platform:  'Zoom',
    description: 'Learn to create stunning digital illustrations using Procreate and Photoshop.',
    imageUrl:    'https://picsum.photos/seed/illustration3/800/600',
    tags:       ['digital', 'illustration', 'webinar'],
  },
  {
    name: 'Art History: Mughal Miniatures',
    startTime: new Date('2025-07-15T11:00:00'),
    endTime:   new Date('2025-07-15T13:00:00'),
    location:  'Kala Art Gallery, Lucknow',
    type:      'Offline',
    category:  'Lecture',
    platform:  null,
    description: 'An expert talk on the evolution of Mughal miniature painting.',
    imageUrl:    'https://picsum.photos/seed/history4/800/600',
    tags:       ['history', 'miniature', 'lecture'],
  },
  {
    name: 'Printmaking Techniques Workshop',
    startTime: new Date('2025-08-01T09:00:00'),
    endTime:   new Date('2025-08-01T12:00:00'),
    location:  'PrintLab, Kolkata',
    type:      'Offline',
    category:  'Printmaking',
    platform:  null,
    description: 'Explore linocut, etching and monotype printmaking methods.',
    imageUrl:    'https://picsum.photos/seed/printmaking5/800/600',
    tags:       ['printmaking', 'linocut', 'etching'],
  },
  {
    name: 'Photography in the Studio',
    startTime: new Date('2025-08-10T14:00:00'),
    endTime:   new Date('2025-08-10T17:00:00'),
    location:  'LensArt Studio, Mumbai',
    type:      'Offline',
    category:  'Photography',
    platform:  null,
    description: 'Studio lighting and composition workshop for art photographers.',
    imageUrl:    'https://picsum.photos/seed/photography6/800/600',
    tags:       ['photography', 'studio', 'composition'],
  },
  {
    name: 'Outdoor Mural Walk',
    startTime: new Date('2025-09-05T08:00:00'),
    endTime:   new Date('2025-09-05T11:00:00'),
    location:  'Street Art District, Bengaluru',
    type:      'Offline',
    category:  'Street Art',
    platform:  null,
    description: 'Guided tour of the city’s best street art and murals.',
    imageUrl:    'https://picsum.photos/seed/mural7/800/600',
    tags:       ['street art', 'mural', 'tour'],
  },
  {
    name: 'Children’s Art Camp',
    startTime: new Date('2025-09-15T10:00:00'),
    endTime:   new Date('2025-09-17T16:00:00'),
    location:  'Kala Kids Studio, Pune',
    type:      'Offline',
    category:  'Kids',
    platform:  null,
    description: 'Three-day immersive art camp for ages 6–12.',
    imageUrl:    'https://picsum.photos/seed/kidsart8/800/600',
    tags:       ['children', 'camp', 'art'],
  },
  {
    name: 'Contemporary Art Panel',
    startTime: new Date('2025-10-01T17:00:00'),
    endTime:   new Date('2025-10-01T19:00:00'),
    location:  'Modern Arts Center, Chennai',
    type:      'Offline',
    category:  'Discussion',
    platform:  null,
    description: 'Panel discussion with leading contemporary artists.',
    imageUrl:    'https://picsum.photos/seed/contemporary9/800/600',
    tags:       ['contemporary', 'panel', 'discussion'],
  },
  {
    name: 'Bronze Casting Demonstration',
    startTime: new Date('2025-10-20T12:00:00'),
    endTime:   new Date('2025-10-20T15:00:00'),
    location:  'Sculpture Foundry, Bhubaneshwar',
    type:      'Offline',
    category:  'Sculpture',
    platform:  null,
    description: 'Live demo of lost-wax bronze casting technique.',
    imageUrl:    'https://picsum.photos/seed/bronze10/800/600',
    tags:       ['bronze', 'casting', 'demo'],
  },
  {
    name: 'Textile Art Exhibition',
    startTime: new Date('2025-11-05T10:00:00'),
    endTime:   new Date('2025-11-05T18:00:00'),
    location:  'Fiber Arts Gallery, Ahmedabad',
    type:      'Offline',
    category:  'Exhibition',
    platform:  null,
    description: 'Showcase of contemporary textile and fiber art.',
    imageUrl:    'https://picsum.photos/seed/textile11/800/600',
    tags:       ['textile', 'fiber', 'exhibition'],
  },
  {
    name: 'Mixed Media Showcase',
    startTime: new Date('2025-11-20T15:00:00'),
    endTime:   new Date('2025-11-20T20:00:00'),
    location:  'Kala Art Gallery, New Delhi',
    type:      'Offline',
    category:  'Exhibition',
    platform:  null,
    description: 'An evening of paintings, sculptures, and installations using mixed media.',
    imageUrl:    'https://picsum.photos/seed/mixedmedia12/800/600',
    tags:       ['mixed media', 'installation', 'gallery'],
  },
];

// 3. Clear old events and insert new ones
async function loadSampleEvents() {
  try {
    await Event.deleteMany({});
    console.log('✔️ Existing events cleared.');

    await Event.insertMany(sampleEvents);
    console.log('🎉 12 art events loaded successfully.');
  } catch (err) {
    console.error('❌ Error loading sample events:', err);
  } finally {
    mongoose.connection.close();
  }
}

// 4. Run it
loadSampleEvents();
