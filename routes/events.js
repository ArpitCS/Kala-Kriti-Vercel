const express = require("express");
const router = express.Router();
const Event = require("../models/Events");

// Main events page - this is already handled in server.js, keeping it here for reference
router.get("/", async (req, res) => {
  try {
    // Fetch events from the database
    const upcomingOfflineEvents = await Event.find({ 
      type: 'Offline', 
      endTime: { $gt: new Date() }
    }).sort({ startTime: 1 }).limit(5);
    
    const upcomingOnlineEvents = await Event.find({ 
      type: 'Online', 
      endTime: { $gt: new Date() }
    }).sort({ startTime: 1 }).limit(5);
    
    const pastEvents = await Event.find({ 
      endTime: { $lt: new Date() } 
    }).sort({ endTime: -1 }).limit(5);
    
    const calendarEvents = await Event.find({
      endTime: { $gt: new Date() }
    }).sort({ startTime: 1 }).limit(10);
    
    res.render("events", { 
      upcomingOfflineEvents,
      upcomingOnlineEvents,
      pastEvents,
      calendarEvents
    });
  } catch (err) {
    console.error("Error fetching events:", err);
    res.status(500).send("Server error");
  }
});

// View all offline events - Moving this BEFORE the :id route
router.get("/offline", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 9; // Number of events per page
    const skip = (page - 1) * limit;
    
    // Build query based on filters
    let query = { 
      type: 'Offline',
      endTime: { $gt: new Date() }
    };
    
    // Apply category filter if provided
    if (req.query.category) {
      query.category = req.query.category;
    }
    
    // Apply location filter if provided
    if (req.query.location) {
      query.location = { $regex: req.query.location, $options: 'i' };
    }
    
    // Apply date range filter if provided
    if (req.query.date_range) {
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const thisWeekEnd = new Date(today);
      thisWeekEnd.setDate(thisWeekEnd.getDate() + (7 - today.getDay()));
      
      const thisMonthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      const nextMonthEnd = new Date(today.getFullYear(), today.getMonth() + 2, 0);
      
      switch (req.query.date_range) {
        case 'today':
          query.startTime = { 
            $gte: new Date(today.setHours(0, 0, 0, 0)),
            $lt: new Date(today.setHours(23, 59, 59, 999))
          };
          break;
        case 'tomorrow':
          query.startTime = { 
            $gte: new Date(tomorrow.setHours(0, 0, 0, 0)),
            $lt: new Date(tomorrow.setHours(23, 59, 59, 999))
          };
          break;
        case 'this_week':
          query.startTime = { 
            $gte: today,
            $lte: thisWeekEnd
          };
          break;
        case 'this_month':
          query.startTime = { 
            $gte: today,
            $lte: thisMonthEnd
          };
          break;
        case 'next_month':
          query.startTime = { 
            $gt: thisMonthEnd,
            $lte: nextMonthEnd
          };
          break;
      }
    }
    
    // Determine sort order
    let sortOption = { startTime: 1 }; // Default: date ascending
    
    if (req.query.sort) {
      switch (req.query.sort) {
        case 'date-desc':
          sortOption = { startTime: -1 };
          break;
        case 'name-asc':
          sortOption = { name: 1 };
          break;
        case 'name-desc':
          sortOption = { name: -1 };
          break;
      }
    }
    
    // Count total events matching query
    const total = await Event.countDocuments(query);
    const totalPages = Math.ceil(total / limit);
    
    // Fetch events with pagination
    const offlineEvents = await Event.find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(limit);
    
    res.render("events-offline", {
      offlineEvents,
      currentPage: page,
      totalPages,
      totalEvents: total
    });
  } catch (err) {
    console.error("Error fetching offline events:", err);
    res.status(500).render("error", { error: "Error fetching offline events" });
  }
});

// View all online events - Moving this BEFORE the :id route
router.get("/online", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 9; // Number of events per page
    const skip = (page - 1) * limit;
    
    // Build query based on filters
    let query = { 
      type: 'Online',
      endTime: { $gt: new Date() }
    };
    
    // Apply category filter if provided
    if (req.query.category) {
      query.category = req.query.category;
    }
    
    // Apply platform filter if provided
    if (req.query.platform) {
      query.platform = req.query.platform;
    }
    
    // Apply date range filter if provided
    if (req.query.date_range) {
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const thisWeekEnd = new Date(today);
      thisWeekEnd.setDate(thisWeekEnd.getDate() + (7 - today.getDay()));
      
      const thisMonthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      const nextMonthEnd = new Date(today.getFullYear(), today.getMonth() + 2, 0);
      
      switch (req.query.date_range) {
        case 'today':
          query.startTime = { 
            $gte: new Date(today.setHours(0, 0, 0, 0)),
            $lt: new Date(today.setHours(23, 59, 59, 999))
          };
          break;
        case 'tomorrow':
          query.startTime = { 
            $gte: new Date(tomorrow.setHours(0, 0, 0, 0)),
            $lt: new Date(tomorrow.setHours(23, 59, 59, 999))
          };
          break;
        case 'this_week':
          query.startTime = { 
            $gte: today,
            $lte: thisWeekEnd
          };
          break;
        case 'this_month':
          query.startTime = { 
            $gte: today,
            $lte: thisMonthEnd
          };
          break;
        case 'next_month':
          query.startTime = { 
            $gt: thisMonthEnd,
            $lte: nextMonthEnd
          };
          break;
      }
    }
    
    // Determine sort order
    let sortOption = { startTime: 1 }; // Default: date ascending
    
    if (req.query.sort) {
      switch (req.query.sort) {
        case 'date-desc':
          sortOption = { startTime: -1 };
          break;
        case 'name-asc':
          sortOption = { name: 1 };
          break;
        case 'name-desc':
          sortOption = { name: -1 };
          break;
      }
    }
    
    // Count total events matching query
    const total = await Event.countDocuments(query);
    const totalPages = Math.ceil(total / limit);
    
    // Fetch events with pagination
    const onlineEvents = await Event.find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(limit);
    
    res.render("events-online", {
      onlineEvents,
      currentPage: page,
      totalPages,
      totalEvents: total
    });
  } catch (err) {
    console.error("Error fetching online events:", err);
    res.status(500).render("error", { error: "Error fetching online events" });
  }
});

// View all past events - Moving this BEFORE the :id route
router.get("/past", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 9; // Number of events per page
    const skip = (page - 1) * limit;
    
    // Build query based on filters
    let query = { 
      endTime: { $lt: new Date() }
    };
    
    // Apply category filter if provided
    if (req.query.category) {
      query.category = req.query.category;
    }
    
    // Apply type filter if provided
    if (req.query.type) {
      query.type = req.query.type;
    }
    
    // Apply year filter if provided
    if (req.query.year) {
      const yearStart = new Date(parseInt(req.query.year), 0, 1);
      const yearEnd = new Date(parseInt(req.query.year), 11, 31, 23, 59, 59, 999);
      
      query.startTime = { 
        $gte: yearStart,
        $lte: yearEnd
      };
    }
    
    // Determine sort order
    let sortOption = { startTime: -1 }; // Default: date descending (newest first)
    
    if (req.query.sort) {
      switch (req.query.sort) {
        case 'date-asc':
          sortOption = { startTime: 1 };
          break;
        case 'name-asc':
          sortOption = { name: 1 };
          break;
        case 'name-desc':
          sortOption = { name: -1 };
          break;
      }
    }
    
    // Count total events matching query
    const total = await Event.countDocuments(query);
    const totalPages = Math.ceil(total / limit);
    
    // Fetch events with pagination
    const pastEvents = await Event.find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(limit);
    
    res.render("events-past", {
      pastEvents,
      currentPage: page,
      totalPages,
      totalEvents: total
    });
  } catch (err) {
    console.error("Error fetching past events:", err);
    res.status(500).render("error", { error: "Error fetching past events" });
  }
});

// View single event detail - Moving this AFTER the named routes
router.get("/:id", async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).render("404", {
        title: "Event Not Found",
        message: "The event you're looking for doesn't exist or has been removed.",
        imagePath: "/art/with-every-kiss.png",
        logoPath: "/logo-color.png",
        year: new Date().getFullYear()
      });
    }
    
    // Find similar events based on category
    const similarEvents = await Event.find({
      _id: { $ne: event._id },
      category: event.category,
      type: event.type
    }).limit(5);
    
    res.render("event-detail", { 
      event,
      similarEvents
    });
  } catch (err) {
    console.error("Error fetching event details:", err);
    if (err.kind === 'ObjectId') {
      return res.status(404).render("404", {
        title: "Event Not Found",
        message: "The event you're looking for doesn't exist or has been removed.",
        imagePath: "/art/with-every-kiss.png",
        logoPath: "/logo-color.png",
        year: new Date().getFullYear()
      });
    }
    res.status(500).render("error", { error: "Error fetching event details" });
  }
});

module.exports = router; 