const express = require('express');
const router = express.Router();
const User = require('../models/Users');
const Artwork = require('../models/Artworks');
const { isAuthenticated } = require('../middlewares/auth');

// Get user's wishlist/favorites
router.get('/', isAuthenticated, async (req, res) => {
  try {
    // Fetch the user with populated favorites
    const user = await User.findById(req.user.id).populate('favorites');
    
    if (!user) {
      return res.status(404).render('error', {
        message: 'User not found',
        error: 'Unable to locate user profile'
      });
    }
    
    // Render the favorites page with the user's favorites
    res.render('favorites', {
      favorites: user.favorites || [],
      pageTitle: 'My Wishlist',
      user: req.user
    });
  } catch (err) {
    console.error('Error fetching wishlist:', err);
    res.status(500).render('error', { 
      message: 'Failed to fetch your wishlist',
      error: err
    });
  }
});

// Add an artwork to favorites
router.post('/add/:artworkId', isAuthenticated, async (req, res) => {
  try {
    const { artworkId } = req.params;
    
    // Verify the artwork exists
    const artwork = await Artwork.findById(artworkId);
    if (!artwork) {
      return res.status(404).json({
        success: false,
        message: 'Artwork not found'
      });
    }
    
    // Check if the artwork is already in favorites
    const user = await User.findById(req.user.id);
    if (user.favorites.includes(artworkId)) {
      return res.json({
        success: true,
        added: false,
        message: 'Artwork is already in your wishlist'
      });
    }
    
    // Add to favorites
    await User.findByIdAndUpdate(
      req.user.id,
      { $addToSet: { favorites: artworkId } }
    );
    
    res.json({
      success: true,
      added: true,
      message: 'Artwork added to your wishlist'
    });
  } catch (err) {
    console.error('Error adding to wishlist:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to add artwork to wishlist'
    });
  }
});

// Remove an artwork from favorites
router.delete('/remove/:artworkId', isAuthenticated, async (req, res) => {
  try {
    const { artworkId } = req.params;
    
    // Remove from favorites
    await User.findByIdAndUpdate(
      req.user.id,
      { $pull: { favorites: artworkId } }
    );
    
    res.json({
      success: true,
      removed: true,
      message: 'Artwork removed from your wishlist'
    });
  } catch (err) {
    console.error('Error removing from wishlist:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to remove artwork from wishlist'
    });
  }
});

// Check if an artwork is in the user's favorites
router.get('/check/:artworkId', isAuthenticated, async (req, res) => {
  try {
    const { artworkId } = req.params;
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    const isFavorite = user.favorites.some(
      favId => favId.toString() === artworkId
    );
    
    res.json({
      success: true,
      isFavorite
    });
  } catch (err) {
    console.error('Error checking wishlist status:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to check wishlist status'
    });
  }
});

module.exports = router; 