const express = require('express');
const router = express.Router();
const User = require('../models/Users');
const Artwork = require('../models/Artworks');
const Event = require('../models/Events');
const Order = require('../models/Orders');
const { isAuthenticated } = require('../middlewares/auth');

// Middleware to check if user is admin
const isAdmin = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin role required.' });
    }
    next();
  } catch (error) {
    console.error('Admin auth error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Admin route protection
router.use(isAuthenticated, isAdmin);

// Get dashboard data
router.get('/dashboard', async (req, res) => {
  try {
    // Get current counts
    const users = await User.countDocuments();
    const artworks = await Artwork.countDocuments();
    const events = await Event.countDocuments();
    const orders = await Order.countDocuments();
    
    // Get last month's counts for growth calculation
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    lastMonth.setDate(1);
    lastMonth.setHours(0, 0, 0, 0);
    
    const prevUsers = await User.countDocuments({ createdAt: { $lt: lastMonth } });
    const prevArtworks = await Artwork.countDocuments({ createdAt: { $lt: lastMonth } });
    const prevEvents = await Event.countDocuments({ createdAt: { $lt: lastMonth } });
    const prevOrders = await Order.countDocuments({ orderDate: { $lt: lastMonth } });
    
    // Calculate growth percentages
    const userGrowth = prevUsers > 0 ? Math.round(((users - prevUsers) / prevUsers) * 100) : 100;
    const artworkGrowth = prevArtworks > 0 ? Math.round(((artworks - prevArtworks) / prevArtworks) * 100) : 100;
    const eventGrowth = prevEvents > 0 ? Math.round(((events - prevEvents) / prevEvents) * 100) : 100;
    const orderGrowth = prevOrders > 0 ? Math.round(((orders - prevOrders) / prevOrders) * 100) : 100;
    
    // Get recent activities
    const recentOrders = await Order.find()
      .sort({ orderDate: -1 })
      .limit(5)
      .populate('user', 'username profilePicture')
      .populate('items.artwork', 'title');
      
    const activities = recentOrders.map(order => ({
      user: {
        id: order.user._id,
        name: order.user.username,
        profilePicture: order.user.profilePicture
      },
      action: 'Purchased',
      resource: `Artwork${order.items.length > 1 ? 's' : ''}: ${order.items.map(item => item.artwork.title).join(', ')}`,
      timestamp: order.orderDate
    }));
    
    // Get recent artworks
    const recentArtworks = await Artwork.find()
      .sort({ createdAt: -1 })
      .limit(3);
      
    recentArtworks.forEach(artwork => {
      activities.push({
        user: {
          id: 'system',
          name: 'System',
          profilePicture: '/default.jpg'
        },
        action: 'Added',
        resource: `New Artwork: ${artwork.title} by ${artwork.artist}`,
        timestamp: artwork.createdAt
      });
    });
    
    // Get recent events
    const recentEvents = await Event.find()
      .sort({ createdAt: -1 })
      .limit(3);
      
    recentEvents.forEach(event => {
      activities.push({
        user: {
          id: 'system',
          name: 'System',
          profilePicture: '/default.jpg'
        },
        action: 'Created',
        resource: `New Event: ${event.name}`,
        timestamp: event.createdAt
      });
    });
    
    // Sort all activities by timestamp
    activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    res.json({
      counts: { users, artworks, events, orders },
      growth: { users: userGrowth, artworks: artworkGrowth, events: eventGrowth, orders: orderGrowth },
      activities: activities.slice(0, 10) // Limit to 10 activities
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// User management routes
router.get('/users', async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/users', async (req, res) => {
  try {
    const { username, email, fullName, password, role } = req.body;
    
    // Check if username or email already exists
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res.status(400).json({ 
        message: existingUser.username === username 
          ? 'Username is already taken' 
          : 'Email is already registered' 
      });
    }
    
    // Create new user
    const newUser = new User({
      username,
      email,
      fullName,
      password, // Will be hashed by the pre-save hook in the User model
      role: role || 'user'
    });
    
    const savedUser = await newUser.save();
    
    // Return user without password
    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: savedUser._id,
        username: savedUser.username,
        email: savedUser.email,
        fullName: savedUser.fullName,
        role: savedUser.role,
        profilePicture: savedUser.profilePicture,
        createdAt: savedUser.createdAt
      }
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/users/:id', async (req, res) => {
  try {
    const { username, email, fullName, role } = req.body;
    
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Update fields
    if (username) user.username = username;
    if (email) user.email = email;
    if (fullName) user.fullName = fullName;
    if (role) user.role = role;
    
    const updatedUser = await user.save();
    res.json({
      message: 'User updated successfully',
      user: {
        id: updatedUser._id,
        username: updatedUser.username,
        email: updatedUser.email,
        fullName: updatedUser.fullName,
        role: updatedUser.role
      }
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Artwork management routes
router.get('/artworks', async (req, res) => {
  try {
    const artworks = await Artwork.find();
    res.json(artworks);
  } catch (error) {
    console.error('Error fetching artworks:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/artworks/:id', async (req, res) => {
  try {
    const artwork = await Artwork.findById(req.params.id);
    if (!artwork) {
      return res.status(404).json({ message: 'Artwork not found' });
    }
    res.json(artwork);
  } catch (error) {
    console.error('Error fetching artwork:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/artworks', async (req, res) => {
  try {
    const { title, description, price, imageUrl, category, dimensions, artist, location } = req.body;
    
    const artwork = new Artwork({
      title,
      description,
      price,
      imageUrl,
      category,
      dimensions,
      artist,
      location
    });
    
    const savedArtwork = await artwork.save();
    res.status(201).json({
      message: 'Artwork created successfully',
      artwork: savedArtwork
    });
  } catch (error) {
    console.error('Error creating artwork:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/artworks/:id', async (req, res) => {
  try {
    const { title, description, price, imageUrl, category, dimensions, artist, location } = req.body;
    
    const artwork = await Artwork.findById(req.params.id);
    if (!artwork) {
      return res.status(404).json({ message: 'Artwork not found' });
    }
    
    // Update fields
    if (title) artwork.title = title;
    if (description) artwork.description = description;
    if (price) artwork.price = price;
    if (imageUrl) artwork.imageUrl = imageUrl;
    if (category) artwork.category = category;
    if (dimensions) artwork.dimensions = dimensions;
    if (artist) artwork.artist = artist;
    if (location) artwork.location = location;
    
    const updatedArtwork = await artwork.save();
    res.json({
      message: 'Artwork updated successfully',
      artwork: updatedArtwork
    });
  } catch (error) {
    console.error('Error updating artwork:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/artworks/:id', async (req, res) => {
  try {
    const artwork = await Artwork.findById(req.params.id);
    if (!artwork) {
      return res.status(404).json({ message: 'Artwork not found' });
    }
    
    await Artwork.findByIdAndDelete(req.params.id);
    res.json({ message: 'Artwork deleted successfully' });
  } catch (error) {
    console.error('Error deleting artwork:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Event management routes
router.get('/events', async (req, res) => {
  try {
    const events = await Event.find();
    res.json(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/events/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    res.json(event);
  } catch (error) {
    console.error('Error fetching event:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/events', async (req, res) => {
  try {
    const { name, startTime, endTime, location, type, category, platform, description, imageUrl, tags } = req.body;
    
    const event = new Event({
      name,
      startTime,
      endTime,
      location,
      type,
      category,
      platform,
      description,
      imageUrl,
      tags
    });
    
    const savedEvent = await event.save();
    res.status(201).json({
      message: 'Event created successfully',
      event: savedEvent
    });
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/events/:id', async (req, res) => {
  try {
    const { name, startTime, endTime, location, type, category, platform, description, imageUrl, tags } = req.body;
    
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    // Update fields
    if (name) event.name = name;
    if (startTime) event.startTime = startTime;
    if (endTime) event.endTime = endTime;
    if (location) event.location = location;
    if (type) event.type = type;
    if (category) event.category = category;
    if (platform) event.platform = platform;
    if (description) event.description = description;
    if (imageUrl) event.imageUrl = imageUrl;
    if (tags) event.tags = tags;
    
    const updatedEvent = await event.save();
    res.json({
      message: 'Event updated successfully',
      event: updatedEvent
    });
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/events/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    await Event.findByIdAndDelete(req.params.id);
    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Order management routes
router.get('/orders', async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('user', 'username email')
      .populate('items.artwork', 'title imageUrl');
    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/orders/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'username email fullName')
      .populate('items.artwork', 'title imageUrl artist');
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    res.json(order);
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/orders/:id', async (req, res) => {
  try {
    const { status, isPaid, isShipped, isDelivered } = req.body;
    
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Update fields
    if (status) order.status = status;
    if (isPaid !== undefined) {
      order.isPaid = isPaid;
      if (isPaid) order.paidAt = Date.now();
    }
    if (isShipped !== undefined) {
      order.isShipped = isShipped;
      if (isShipped) order.shippedAt = Date.now();
    }
    if (isDelivered !== undefined) {
      order.isDelivered = isDelivered;
      if (isDelivered) order.deliveredAt = Date.now();
    }
    
    const updatedOrder = await order.save();
    res.json({
      message: 'Order updated successfully',
      order: updatedOrder
    });
  } catch (error) {
    console.error('Error updating order:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 