const express = require("express");
const router = express.Router();
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const API_BASE_URL = "https://api.artic.edu/api/v1/artworks";
const IMAGE_BASE_URL = "https://www.artic.edu/iiif/2/";
const DEFAULT_FIELDS = "id,title,image_id,artist_title,date_display,dimensions,medium_display,artwork_type_title";

// Get all artworks for gallery
router.get("/", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 20;
    
    const response = await fetch(
      `${API_BASE_URL}?fields=${DEFAULT_FIELDS}&limit=${limit}&page=${page}`
    );
    const data = await response.json();
    
    // Process artworks to match your gallery structure
    const artworks = processArtworks(data.data);
    
    res.render("gallery", { 
      artworks,
      currentPage: page,
      totalPages: Math.ceil(data.pagination.total_pages)
    });
  } catch (error) {
    console.error("Error fetching artworks:", error);
    res.status(500).render("gallery", { 
      artworks: [],
      error: "Failed to load artworks. Please try again later." 
    });
  }
});

// Search artworks
router.get("/search", async (req, res) => {
  const query = req.query.q;
  if (!query || !query.trim()) {
    return res.redirect("/gallery");
  }

  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 20;
    
    const response = await fetch(
      `${API_BASE_URL}/search?q=${encodeURIComponent(query)}&fields=${DEFAULT_FIELDS}&limit=${limit}&page=${page}`
    );
    const data = await response.json();
    
    // Process artworks to match your gallery structure
    const artworks = processArtworks(data.data);
    
    res.render("gallery", { 
      artworks,
      searchQuery: query,
      currentPage: page,
      totalPages: Math.ceil(data.pagination.total_pages)
    });
  } catch (error) {
    console.error("Error searching artworks:", error);
    res.status(500).render("gallery", { 
      artworks: [],
      error: "Failed to search artworks. Please try again later." 
    });
  }
});

// Filter artworks by category
router.get("/filter/:category", async (req, res) => {
  const category = req.params.category;
  
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 20;
    const searchTerm = category === 'all' ? 'art' : category;
    
    const response = await fetch(
      `${API_BASE_URL}/search?q=${encodeURIComponent(searchTerm)}&fields=${DEFAULT_FIELDS}&limit=${limit}&page=${page}`
    );
    const data = await response.json();
    
    // Process artworks to match your gallery structure
    const artworks = processArtworks(data.data);
    
    res.render("gallery", { 
      artworks,
      activeCategory: category,
      currentPage: page,
      totalPages: Math.ceil(data.pagination.total_pages)
    });
  } catch (error) {
    console.error(`Error filtering by ${category}:`, error);
    res.status(500).render("gallery", { 
      artworks: [],
      error: "Failed to filter artworks. Please try again later." 
    });
  }
});

// Helper function to process API artworks into the format needed for the gallery
function processArtworks(apiArtworks) {
  return apiArtworks.map(artwork => {
    // Generate image URL using image_id
    let imageUrl = artwork.image_id 
      ? `${IMAGE_BASE_URL}${artwork.image_id}/full/843,/0/default.jpg` 
      : "/images/artwork-placeholder.jpg";
    
    // Generate random price if not available
    const price = Math.floor(Math.random() * 5000) + 500;
    
    return {
      id: artwork.id,
      title: artwork.title || "Untitled Artwork",
      artist: artwork.artist_title || "Unknown Artist",
      imageUrl: imageUrl,
      price: price,
      medium: artwork.medium_display || "Mixed Media",
      category: artwork.artwork_type_title || "painting",
      dimensions: artwork.dimensions || "",
      dateCreated: artwork.date_display || "Unknown date"
    };
  });
}

module.exports = router;