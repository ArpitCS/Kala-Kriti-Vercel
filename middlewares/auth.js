const jwt = require('jsonwebtoken');
const User = require('../models/Users');
const { JWT_SECRET } = require('../config/keys');

// Middleware to check if user is authenticated
exports.isAuthenticated = async (req, res, next) => {
  try {
    // Get the token from cookies
    const token = req.cookies.token;
    
    console.log('Auth middleware - Checking token:', token ? 'Token exists' : 'No token');
    
    if (!token) {
      return res.redirect('/login?error=Please login to access this page');
    }
    
    // Verify the token
    console.log('Auth middleware - Verifying token with secret:', JWT_SECRET.substring(0, 3) + '...');
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('Auth middleware - Token verified, userId:', decoded.userId);
    
    // Find user by ID
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      console.log('Auth middleware - User not found for ID:', decoded.userId);
      return res.redirect('/login?error=Authentication failed');
    }
    
    console.log('Auth middleware - User authenticated:', user.username);
    
    // Attach user data to request
    req.user = {
      id: user._id,
      username: user.username,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      favorites: user.favorites || []
    };
    
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.clearCookie('token');
    res.redirect('/login?error=Session expired. Please login again');
  }
};

// Middleware to redirect if user is already authenticated
exports.redirectIfAuthenticated = (req, res, next) => {
  const token = req.cookies.token;
  
  if (token) {
    try {
      jwt.verify(token, JWT_SECRET);
      return res.redirect('/dashboard'); // Already logged in, redirect to dashboard
    } catch (error) {
      // Token is invalid, clear it and continue
      res.clearCookie('token');
    }
  }
  
  next();
};