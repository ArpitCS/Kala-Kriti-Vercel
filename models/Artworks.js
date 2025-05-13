const mongoose = require("mongoose");

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

// Fix: Check if model exists before creating it
module.exports = mongoose.models.Artwork || mongoose.model("Artwork", artworkSchema);