const express = require('express');
const router = express.Router();
const axios = require('axios');

router.get('/', async (req, res) => {
  try {
    const query = req.query.q || 'art';
    const apiKey = process.env.NEWS_API_KEY || req.app.get('newsApiKey');
    
    const response = await axios.get('https://newsapi.org/v2/everything', {
      params: {
        q: query,
        apiKey: apiKey,
        pageSize: 100  // Get more results at once
      }
    });
    
    res.json(response.data);
  } catch (error) {
    console.error('News API error:', error.response?.data || error.message);
    res.status(500).json({ 
      error: 'Failed to fetch news',
      message: error.response?.data?.message || error.message
    });
  }
});

module.exports = router;