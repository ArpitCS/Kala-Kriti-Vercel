const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/Users');
const { isAuthenticated } = require('../middlewares/auth');
const { JWT_SECRET } = require('../config/keys');

const router = express.Router();

// Register route
router.post('/register', async (req, res) => {
  try {
    console.log('Registration attempt for:', req.body.username);
    const { 
      username, 
      email, 
      fullName, 
      password, 
      confirmPassword, 
      phoneNumber, 
      profilePicture, 
      bio, 
      instagram, 
      twitter, 
      facebook, 
      website 
    } = req.body;

    // Basic validation
    if (!username || !email || !fullName || !password) {
      console.log('Missing fields for registration');
      return res.status(400).redirect('/register?error=All fields are required');
    }

    if (password !== confirmPassword) {
      console.log('Passwords do not match');
      return res.status(400).redirect('/register?error=Passwords do not match');
    }

    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      if (existingUser.email === email) {
        console.log('Email already in use:', email);
        return res.status(400).redirect('/register?error=Email already in use');
      } else {
        console.log('Username already taken:', username);
        return res.status(400).redirect('/register?error=Username already taken');
      }
    }

    console.log('Creating new user:', username);
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user with extended fields
    const newUser = new User({
      username,
      email,
      fullName,
      password: hashedPassword,
      role: 'artist', // Set default role to artist
      phoneNumber: phoneNumber || '',
      profilePicture: profilePicture || '/uploads/profile/default.jpg',
      bio: bio || '',
      socialMedia: {
        instagram: instagram || '',
        twitter: twitter || '',
        facebook: facebook || '',
        website: website || ''
      }
    });

    await newUser.save();
    console.log('User created successfully, ID:', newUser._id);

    // Generate JWT token
    const payload = { userId: newUser._id };
    console.log('JWT payload:', payload);
    console.log('Using JWT_SECRET:', JWT_SECRET.substring(0, 3) + '...');
    
    const token = jwt.sign(payload, JWT_SECRET, {
      expiresIn: '1d'
    });
    
    console.log('JWT token generated successfully');

    // Set cookie and redirect
    res.cookie('token', token, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 1 day
      sameSite: 'strict',
      path: '/' // Ensure cookie is available on all paths
    });
    
    console.log('Cookie set, redirecting to homepage');
    res.redirect('/homepage');
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).redirect('/register?error=Registration failed. Please try again.');
  }
});

// Login route
router.post('/login', async (req, res) => {
  try {
    console.log('Login attempt for:', req.body.username);
    const { username, password } = req.body;

    // Basic validation
    if (!username || !password) {
      console.log('Missing credentials');
      return res.status(400).redirect('/login?error=All fields are required');
    }

    // Check if user exists (by username or email)
    const user = await User.findOne({ 
      $or: [
        { username },
        { email: username } // Allow login with email as username
      ]
    });

    if (!user) {
      console.log('User not found:', username);
      return res.status(400).redirect('/register?error=User not found. Please register.');
    }

    console.log('User found:', user.username, '(ID:', user._id, ')');

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log('Invalid password for user:', user.username);
      return res.status(400).redirect('/login?error=Invalid password');
    }

    console.log('Password match successful');
    
    // Generate JWT token
    const payload = { userId: user._id };
    console.log('JWT payload:', payload);
    console.log('Using JWT_SECRET:', JWT_SECRET.substring(0, 3) + '...');
    
    const token = jwt.sign(payload, JWT_SECRET, {
      expiresIn: '1d'
    });
    
    console.log('JWT token generated successfully');

    // Set cookie and redirect
    res.cookie('token', token, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 1 day
      sameSite: 'strict',
      path: '/' // Ensure cookie is available on all paths
    });
    
    console.log('Cookie set, redirecting to homepage');
    res.redirect('/homepage');
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).redirect('/login?error=Login failed. Please try again.');
  }
});

// Logout route
router.get('/logout', (req, res) => {
  res.clearCookie('token');
  res.redirect('/login');
});

// Get current user
router.get('/me', isAuthenticated, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Change password
router.post('/change-password', isAuthenticated, async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    
    // Validate inputs
    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }
    
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'New passwords do not match' });
    }
    
    // Get user with password
    const user = await User.findById(req.user.id);
    
    // Check if current password is correct
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect' });
    }
    
    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    
    await user.save();
    
    res.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    console.error('Password change error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Add route to check token status
router.get('/check-token', (req, res) => {
  try {
    const token = req.cookies.token;
    console.log('Check token route - Token exists:', !!token);
    
    if (!token) {
      return res.json({
        authenticated: false,
        message: 'No token found'
      });
    }
    
    // Try to verify the token
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      console.log('Check token route - Token verified, payload:', decoded);
      
      return res.json({
        authenticated: true,
        userId: decoded.userId,
        message: 'Token is valid'
      });
    } catch (verifyError) {
      console.log('Check token route - Token verification failed:', verifyError.message);
      
      return res.json({
        authenticated: false,
        error: verifyError.message,
        message: 'Token is invalid'
      });
    }
  } catch (error) {
    console.error('Check token error:', error);
    return res.status(500).json({
      authenticated: false,
      error: 'Server error',
      message: 'Failed to check authentication status'
    });
  }
});

module.exports = router;