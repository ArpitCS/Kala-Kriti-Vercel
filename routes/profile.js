const express = require('express');
const User = require('../models/Users');
const { isAuthenticated } = require('../middlewares/auth');

const router = express.Router();

// Get user profile
router.get('/', isAuthenticated, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.render('portfolio', { user });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).redirect('/dashboard?error=Failed to load profile');
  }
});

// Update user profile
router.post('/update', isAuthenticated, async (req, res) => {
  try {
    const { fullName, email, bio, phoneNumber, profilePicture } = req.body;
    
    // Get current user data
    const currentUser = await User.findById(req.user.id);
    
    // Find user and update fields
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { 
        fullName,
        email,
        bio,
        phoneNumber,
        profilePicture: profilePicture || currentUser.profilePicture
      },
      { new: true }
    ).select('-password');
    
    // If request expects JSON (AJAX), return JSON response
    if (req.xhr || req.headers.accept.includes('application/json')) {
      return res.json({ success: true, message: 'Profile updated successfully' });
    }
    
    // Otherwise redirect for regular form submissions
    res.redirect('/profile?success=Profile updated successfully');
  } catch (error) {
    console.error('Update profile error:', error);
    
    // If request expects JSON (AJAX), return JSON response
    if (req.xhr || req.headers.accept.includes('application/json')) {
      return res.status(500).json({ success: false, message: 'Failed to update profile' });
    }
    
    res.status(500).redirect('/profile?error=Failed to update profile');
  }
});

// Check if user is authenticated
router.get('/check-auth', (req, res) => {
  const isAuthenticated = req.isAuthenticated && req.isAuthenticated();
  res.json({ authenticated: isAuthenticated });
});

module.exports = router;