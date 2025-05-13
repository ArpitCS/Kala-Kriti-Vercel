const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middlewares/auth');

// Import models
const Artwork = require('../models/Artworks');
const Order = require('../models/Orders');

// View cart page
router.get('/', isAuthenticated, async (req, res) => {
  try {
    // Just render cart view - cart data will be loaded from localStorage on client side
    res.render('cart');
  } catch (error) {
    console.error('Error fetching cart:', error);
    res.status(500).render('error', { 
      message: 'Error loading cart',
      error: { status: 500 }
    });
  }
});

// Get cart items as JSON (for AJAX requests)
router.get('/json', isAuthenticated, async (req, res) => {
  // Send empty response - cart data will be managed entirely on client side
  return res.status(200).json({ cart: [] });
});

// Add item to cart - Now just returns success response, actual cart storage happens in client localStorage
router.post('/add', isAuthenticated, async (req, res) => {
  try {
    const { artworkId, quantity = 1 } = req.body;
    
    console.log('Add to cart - Request body:', req.body);
    
    // Validate artwork exists
    const artwork = await Artwork.findById(artworkId);
    if (!artwork) {
      console.log('Add to cart - Artwork not found:', artworkId);
      return res.status(404).json({ message: 'Artwork not found' });
    }
    
    // Return artwork details for client-side storage
    return res.status(200).json({ 
      message: 'Item added to cart',
      artwork: {
        _id: artwork._id,
        title: artwork.title,
        artist: artwork.artist,
        price: artwork.price,
        imageUrl: artwork.imageUrl
      }
    });
  } catch (error) {
    console.error('Error adding to cart:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Remove item from cart - Now just returns success response
router.delete('/remove/:artworkId', isAuthenticated, async (req, res) => {
  try {
    const artworkId = req.params.artworkId;
    
    // Just return success - client will handle removing from localStorage
    return res.status(200).json({ 
      message: 'Item removed from cart'
    });
  } catch (error) {
    console.error('Error removing from cart:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Update item quantity - Now just returns success response
router.put('/update/:artworkId', isAuthenticated, async (req, res) => {
  try {
    const artworkId = req.params.artworkId;
    const { quantity } = req.body;
    
    // Validate input
    if (quantity < 1) {
      return res.status(400).json({ message: 'Quantity must be at least 1' });
    }
    
    // Just return success - client will handle updating localStorage
    return res.status(200).json({ 
      message: 'Cart updated'
    });
  } catch (error) {
    console.error('Error updating cart:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Checkout page
router.get('/checkout', isAuthenticated, async (req, res) => {
  try {
    // Render checkout view - cart data will be loaded from localStorage on client side
    res.render('checkout');
  } catch (error) {
    console.error('Error loading checkout:', error);
    res.status(500).render('error', { 
      message: 'Error loading checkout',
      error: { status: 500 }
    });
  }
});

// Process order
router.post('/place-order', isAuthenticated, async (req, res) => {
  try {
    const userId = req.user.id;
    const { 
      fullName,
      address,
      city,
      state, 
      postalCode,
      country,
      paymentMethod,
      cartItems // We'll expect the cart items to be sent from client
    } = req.body;
    
    // Validate required fields
    if (!fullName || !address || !city || !state || !postalCode || !country || !paymentMethod) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    
    if (!cartItems || cartItems.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }
    
    // Calculate totals
    let subtotal = 0;
    let tax = 0;
    let shipping = 15; // Fixed shipping price
    
    // Process cart items sent from client
    const orderItems = [];
    
    for (const item of cartItems) {
      // Verify each artwork exists in database
      const artwork = await Artwork.findById(item.id);
      if (!artwork) {
        return res.status(404).json({ message: `Artwork with ID ${item.id} not found` });
      }
      
      subtotal += artwork.price * item.quantity;
      
      orderItems.push({
        artwork: artwork._id,
        title: artwork.title,
        price: artwork.price,
        quantity: item.quantity
      });
    }
    
    tax = subtotal * 0.05; // 5% tax
    const total = subtotal + tax + shipping;
    
    // Create shipping address object
    const shippingAddress = {
      fullName,
      address,
      city,
      state,
      postalCode,
      country
    };
    
    // Create new order
    const order = new Order({
      user: userId,
      items: orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice: subtotal,
      taxPrice: tax,
      shippingPrice: shipping,
      totalPrice: total,
      status: 'pending'
    });
    
    // Save order
    await order.save();
    
    return res.status(200).json({ 
      message: 'Order placed successfully',
      orderId: order._id
    });
  } catch (error) {
    console.error('Error placing order:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Order confirmation page
router.get('/order/:orderId', isAuthenticated, async (req, res) => {
  try {
    const userId = req.user.id;
    const orderId = req.params.orderId;
    
    const order = await Order.findOne({
      _id: orderId,
      user: userId
    }).populate('items.artwork');
    
    if (!order) {
      return res.status(404).render('error', { 
        message: 'Order not found',
        error: { status: 404 }
      });
    }
    
    res.render('order-confirmation', { order });
  } catch (error) {
    console.error('Error loading order:', error);
    res.status(500).render('error', { 
      message: 'Error loading order',
      error: { status: 500 }
    });
  }
});

module.exports = router; 