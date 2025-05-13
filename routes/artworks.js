const express = require('express');
const router = express.Router();
const Artwork = require('../models/Artworks');
const { isAuthenticated } = require('../middlewares/auth');
const jwt = require('jsonwebtoken');

// Get all artworks with optional category filtering
router.get('/', async (req, res) => {
  try {
    const { category, sortBy, search, minPrice, maxPrice } = req.query;
    const filter = {};
    
    // Apply category filter if provided
    if (category && category !== 'all') {
      filter.category = category;
    }
    
    // Apply search filter if provided
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { artist: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Apply price range filter if provided
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseFloat(minPrice);
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
    }
    
    // Determine sort order
    let sortOptions = { createdAt: -1 }; // Default: newest first
    if (sortBy === 'price-low') sortOptions = { price: 1 };
    if (sortBy === 'price-high') sortOptions = { price: -1 };
    if (sortBy === 'oldest') sortOptions = { createdAt: 1 };
    
    const artworks = await Artwork.find(filter).sort(sortOptions);
    
    // Get all categories for the filter UI
    const categories = await Artwork.distinct('category');

    // Check if user is logged in
    const user = req.cookies.token ? jwt.verify(req.cookies.token, require('../config/keys').JWT_SECRET) : null;
    
    res.render('artworks', {
      artworks,
      activeCategory: category || 'all',
      categories,
      sortBy: sortBy || 'newest',
      searchQuery: search || '',
      minPrice: minPrice || '',
      maxPrice: maxPrice || '',
      user: user
    });
  } catch (err) {
    console.error('Error fetching artworks:', err);
    res.status(500).render('artworks', { 
      error: 'Failed to fetch artworks',
      artworks: [],
      categories: []
    });
  }
});

// Get artworks by user (artist username)
router.get('/user/:username', async (req, res) => {
  try {
    const artworks = await Artwork.find({ artist: req.params.username }).sort({ createdAt: -1 });
    
    if (req.headers.accept.includes('application/json')) {
      return res.json(artworks);
    }
    
    res.render('user-artworks', { 
      artworks, 
      username: req.params.username,
      pageTitle: `Artworks by ${req.params.username}`
    });
  } catch (err) {
    console.error('Error fetching user artworks:', err);
    
    if (req.headers.accept.includes('application/json')) {
      return res.status(500).json({ error: 'Failed to fetch artworks' });
    }
    
    res.status(500).render('error', { message: 'Failed to fetch artworks' });
  }
});

// Get artworks by current logged in user (for dashboard)
router.get('/my-artworks', isAuthenticated, async (req, res) => {
  try {
    const artworks = await Artwork.find({ artist: req.user.username }).sort({ createdAt: -1 });
    res.json(artworks);
  } catch (err) {
    console.error('Error fetching user artworks:', err);
    res.status(500).json({ error: 'Failed to fetch your artworks' });
  }
});

// Delete an artwork
router.delete('/:id', isAuthenticated, async (req, res) => {
  try {
    const artwork = await Artwork.findById(req.params.id);
    
    if (!artwork) {
      return res.status(404).json({ success: false, error: 'Artwork not found' });
    }
    
    // Check if the user is the owner of the artwork
    if (artwork.artist !== req.user.username && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Not authorized to delete this artwork' });
    }
    
    await Artwork.findByIdAndDelete(req.params.id);
    
    res.json({ success: true, message: 'Artwork deleted successfully' });
  } catch (err) {
    console.error('Error deleting artwork:', err);
    res.status(500).json({ success: false, error: 'Failed to delete artwork' });
  }
});

// Get a single artwork by ID
router.get('/:id', async (req, res) => {
  try {
    const artwork = await Artwork.findById(req.params.id);
    if (!artwork) {
      return res.status(404).render('404');
    }
    
    // Get related artworks from the same category
    const relatedArtworks = await Artwork.find({ 
      category: artwork.category,
      _id: { $ne: artwork._id } // exclude current artwork
    }).limit(4);
    
    res.render('artwork-detail', { artwork, relatedArtworks });
  } catch (err) {
    console.error('Error fetching artwork:', err);
    res.status(500).render('error', { message: 'Failed to fetch artwork details' });
  }
});

// Create a new artwork (from sell page)
router.post('/', isAuthenticated, async (req, res) => {
  try {
    const newArtwork = new Artwork({
      title: req.body.title,
      description: req.body.description,
      price: req.body.price,
      imageUrl: req.body.imageUrl,
      category: req.body.category,
      dimensions: req.body.dimensions,
      artist: req.body.artist || req.user.username,
      location: req.body.location
    });
    
    const savedArtwork = await newArtwork.save();
    
    // Check if the request wants JSON response
    if (req.headers['content-type'] === 'application/json') {
      return res.status(201).json({ 
        success: true, 
        message: 'Artwork created successfully', 
        artworkId: savedArtwork._id 
      });
    }
    
    // Otherwise redirect for form submissions
    res.redirect('/artworks/' + savedArtwork._id);
  } catch (err) {
    console.error('Error creating artwork:', err);
    
    // Return error as JSON if request expects JSON
    if (req.headers['content-type'] === 'application/json') {
      return res.status(400).json({ 
        success: false, 
        message: 'Failed to create artwork. Please check your inputs.' 
      });
    }
    
    // Otherwise render the sell page with error
    res.status(400).render('sell', { 
      error: 'Failed to create artwork. Please check your inputs.',
      formData: req.body
    });
  }
});

module.exports = router;