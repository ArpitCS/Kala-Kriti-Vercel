const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middlewares/auth');
const Order = require('../models/Orders');
const User = require('../models/Users');

// Render checkout page
router.get('/', isAuthenticated, async (req, res) => {
  try {
    // Render the checkout page - cart data will be loaded from localStorage on client side
    res.render('checkout', {
      user: req.user
    });
  } catch (error) {
    console.error('Error loading checkout page:', error);
    res.status(500).render('error', { 
      message: 'Error loading checkout',
      error: { status: 500 }
    });
  }
});

// Process order and save to MongoDB
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
      cartItems, // Cart items from localStorage
      shipping, // Shipping option
      subtotal,
      shippingCost,
      discount,
      total
    } = req.body;
    
    // Validate required fields
    if (!fullName || !address || !city || !state || !postalCode || !country || !paymentMethod) {
      return res.status(400).json({ success: false, message: 'All address fields are required' });
    }
    
    if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
      return res.status(400).json({ success: false, message: 'Cart is empty' });
    }

    // Format items for order
    const items = cartItems.map(item => ({
      title: item.title,
      price: item.price,
      quantity: item.quantity || 1,
      // If you have artwork IDs, include them
      artwork: item.id
    }));
    
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
      items: items,
      shippingAddress,
      paymentMethod,
      itemsPrice: parseFloat(subtotal) || 0,
      taxPrice: parseFloat(discount) || 0, // Using tax field for discount
      shippingPrice: parseFloat(shippingCost) || 0,
      totalPrice: parseFloat(total) || 0,
      status: 'pending',
      isPaid: false // Will be updated when payment is confirmed
    });
    
    // Save order to database
    await order.save();

    // If you want to generate an order number that's more user-friendly
    const orderNumber = `KK-${new Date().getFullYear()}-${order._id.toString().slice(-6).toUpperCase()}`;
    
    return res.status(200).json({ 
      success: true,
      message: 'Order placed successfully',
      orderId: order._id,
      orderNumber: orderNumber
    });
  } catch (error) {
    console.error('Error placing order:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Order confirmation page
router.get('/confirmation/:orderId', isAuthenticated, async (req, res) => {
  try {
    const userId = req.user.id;
    const orderId = req.params.orderId;
    
    const order = await Order.findOne({
      _id: orderId,
      user: userId
    });
    
    if (!order) {
      return res.status(404).render('error', { 
        message: 'Order not found',
        error: { status: 404 }
      });
    }
    
    // Generate user-friendly order number
    const orderNumber = `KK-${new Date(order.createdAt).getFullYear()}-${order._id.toString().slice(-6).toUpperCase()}`;
    
    res.render('order-confirmation', { 
      order,
      orderNumber
    });
  } catch (error) {
    console.error('Error loading order confirmation:', error);
    res.status(500).render('error', { 
      message: 'Error loading order confirmation',
      error: { status: 500 }
    });
  }
});

// Get user orders
router.get('/my-orders', isAuthenticated, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Find all orders for the current user and sort by creation date (newest first)
    const orders = await Order.find({ user: userId })
      .sort({ createdAt: -1 });
    
    // Return the orders as JSON
    res.status(200).json(orders);
  } catch (error) {
    console.error('Error fetching user orders:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching orders',
      error: error.message
    });
  }
});

module.exports = router; 