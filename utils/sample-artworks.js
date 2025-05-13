const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: '../.env' });

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/kala-kriti', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Define the Artwork schema
const artworkSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  price: {
    type: Number,
    required: true
  },
  imageUrl: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['painting', 'sculpture', 'photography', 'digital-art', 'mixed-media', 'other']
  },
  dimensions: {
    type: String,
    trim: true
  },
  artist: {
    type: String,
    required: true,
    trim: true
  },
  location: {
    type: String,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create model
const Artwork = mongoose.models.Artwork || mongoose.model('Artwork', artworkSchema);

// Sample artwork data
const sampleArtworks = [
  {
    title: "Guernica Style Canvas",
    description: "A vibrant abstract canvas inspired by Pablo Picasso's cubist style, showcasing vivid colors and dynamic impressions.",
    dimensions: "77 x 35 x 5 cm",
    artist: "Pablo Picasso",
    location: "London, UK",
    price: 12000,
    imageUrl: "https://i.pinimg.com/736x/de/ab/3d/deab3d81c927d636bc054c71afcf93c9.jpg",
    category: "painting"
  },
  {
    title: "Guernica Wall Art Print",
    description: "Extra-large wall art inspired by Pablo Picasso's iconic Guernica, featuring boho mid-century modern elements, perfect for living room decor.",
    dimensions: "77 x 35 x 5 cm",
    artist: "Pablo Picasso",
    location: "Paris, France",
    price: 4500,
    imageUrl: "https://i.etsystatic.com/40294966/r/il/63078a/4772036790/il_1588xN.4772036790_6jt6.jpg",
    category: "painting"
  },
  {
    title: "Vincent van Gogh Landscape Art",
    description: "Modern colorful wall art featuring a textured landscape oil painting by Vincent van Gogh, perfect for living room decor.",
    dimensions: "77 x 35 x 5 cm",
    artist: "Vincent van Gogh",
    location: "Dortmund, Germany",
    price: 8700,
    imageUrl: "https://i.etsystatic.com/53319961/r/il/e39316/6338486424/il_1588xN.6338486424_24bh.jpg",
    category: "painting"
  },
  {
    title: "Abstract Forest Oil Painting",
    description: "Original green landscape oil painting with textured details, ideal for living room or office decor.",
    dimensions: "77 x 35 x 5 cm",
    artist: "Alexandra Hart",
    location: "Madrid, Spain",
    price: 12500,
    imageUrl: "https://i.etsystatic.com/53319961/r/il/ab653f/6521058532/il_1588xN.6521058532_mnfe.jpg",
    category: "painting"
  },
  {
    title: "Starry Night Canvas Print",
    description: "Reproduction of Vincent van Gogh's Starry Night, a timeless piece of modern home and wall decor in an extra-large format.",
    dimensions: "77 x 35 x 5 cm",
    artist: "Vincent van Gogh",
    location: "Munich, Germany",
    price: 6500,
    imageUrl: "https://i.etsystatic.com/47644130/r/il/7a6623/6497595246/il_1588xN.6497595246_jyq8.jpg",
    category: "painting"
  },
  {
    title: "The Last Supper Wall Decor",
    description: "Modern canvas poster of Da Vinci's The Last Supper, featuring a floating frame for a classic and timeless look.",
    dimensions: "77 x 35 x 5 cm",
    artist: "Leonardo da Vinci",
    location: "Rome, Italy",
    price: 4000,
    imageUrl: "https://i.etsystatic.com/36000157/r/il/c6e502/6089132369/il_1588xN.6089132369_hrqm.jpg",
    category: "painting"
  },
  {
    title: "Mona Lisa Canvas Art",
    description: "Reproduction of Da Vinci's Mona Lisa, a timeless piece of famous art decor for modern spaces.",
    dimensions: "77 x 35 x 5 cm",
    artist: "Leonardo da Vinci",
    location: "Paris, France",
    price: 25000,
    imageUrl: "https://i.etsystatic.com/53946075/r/il/5682b1/6385871675/il_1588xN.6385871675_p8n8.jpg",
    category: "painting"
  },
  {
    title: "Lady in the Garden",
    description: "Indian Mughal-inspired digital artwork of a traditional Indian woman, perfect as a printable wall art piece.",
    dimensions: "77 x 35 x 5 cm",
    artist: "Ayesha Khan",
    location: "New Delhi, India",
    price: 3100,
    imageUrl: "https://i.etsystatic.com/7365004/r/il/9307c3/5962781201/il_1588xN.5962781201_m957.jpg",
    category: "digital-art"
  },
  {
    title: "Vibrant Bazaar: Colors of India",
    description: "Stunning oil painting capturing the rich textures and vivid hues of an Indian street market, available as printable digital art.",
    dimensions: "77 x 35 x 5 cm",
    artist: "Rajesh Patel",
    location: "Mumbai, India",
    price: 1000,
    imageUrl: "https://i.etsystatic.com/51083786/r/il/029b84/5939745414/il_1588xN.5939745414_nor6.jpg",
    category: "mixed-media"
  },
  {
    title: "The Human face",
    description: "A face that depicts the two human and walls",
    dimensions: "77 X 45 X 4",
    artist: "Pablo Picasso",
    location: "Italy",
    price: 2500,
    imageUrl: "https://stylemywall.com.au/cdn/shop/files/street-of-the-legion-of-honor-2-by-pablo-picasso-164755.jpg?v=1719144164&width=1000",
    category: "painting"
  },
  {
    title: "Nature Painting",
    description: "Good look nature drawing made with water colors",
    dimensions: "100 x 100",
    artist: "Ramanjot Singh",
    location: "Patiala",
    price: 13999,
    imageUrl: "https://i.pinimg.com/736x/ec/e5/49/ece5496a43d74a68d1b2c051dc87cf70.jpg",
    category: "painting"
  },
  {
    title: "Artsense Painting",
    description: "Artsense Painting for wall decoration Abstract wall painting for living- Colorful butterfly painting for home decoration with frame-Multicolor/20x20",
    dimensions: "20 x 20 x 5",
    artist: "Artsense",
    location: "USA",
    price: 1499,
    imageUrl: "https://encrypted-tbn2.gstatic.com/shopping?q=tbn:ANd9GcTW68Z-jYItRN8djdccMwYEzxE1h3OunLK-ir06k2lNzWpEMTh3vAsq2vRxxW6XPLZYpu7HSdIVctdgobpcIeWdpPumsaMfqav96Dmk1-E",
    category: "mixed-media",
    createdAt: new Date("2025-03-03T04:13:40.714Z")
  }
];

// Function to import sample artworks
async function importSampleArtworks() {
  try {
    // Remove existing artworks
    await Artwork.deleteMany({});
    console.log('Previous artworks removed');
    
    // Insert new sample artworks
    const createdArtworks = await Artwork.insertMany(sampleArtworks);
    console.log(`${createdArtworks.length} sample artworks successfully imported`);
    
    // Disconnect from MongoDB
    mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error importing sample artworks:', error);
    mongoose.disconnect();
    process.exit(1);
  }
}

// Run the import function
importSampleArtworks();