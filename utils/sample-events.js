const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Event = require('../models/Events');

// Load environment variables
dotenv.config();

// Sample event data
const eventData = [
  // Offline Events
  {
    name: "Sculpture Exhibition",
    startTime: new Date("2025-01-15T10:00:00"),
    endTime: new Date("2025-01-15T16:00:00"),
    location: "Downtown Art Center",
    type: "Offline",
    category: "Sculpture",
    description: "Experience beautiful sculptures by various contemporary artists.",
    imageUrl: "https://i.pinimg.com/736x/fe/1b/6d/fe1b6dbecf9616490acd6eb465c25e48.jpg",
    tags: ["sculpture", "exhibition", "art"]
  },
  {
    name: "Painting Workshop",
    startTime: new Date("2025-02-05T09:00:00"),
    endTime: new Date("2025-02-05T12:00:00"),
    location: "Creative Arts Studio",
    type: "Offline",
    category: "Painting",
    description: "Learn painting techniques from professional artists.",
    imageUrl: "https://i.pinimg.com/736x/a1/3e/25/a13e25eb158e80e1144caee6cbeaefaf.jpg",
    tags: ["painting", "workshop", "learning"]
  },
  {
    name: "Photography Meetup",
    startTime: new Date("2025-03-12T13:00:00"),
    endTime: new Date("2025-03-12T16:00:00"),
    location: "Urban Gallery",
    type: "Offline",
    category: "Photography",
    description: "Meet fellow photographers and share your work.",
    imageUrl: "https://i.pinimg.com/736x/4c/20/de/4c20def9197e065fd274795454ffac5c.jpg",
    tags: ["photography", "meetup", "networking"]
  },
  {
    name: "Nature Photography Workshop",
    startTime: new Date("2025-04-18T09:00:00"),
    endTime: new Date("2025-04-18T17:00:00"),
    location: "Riverside Park",
    type: "Offline",
    category: "Photography",
    description: "Learn how to capture stunning nature photographs.",
    imageUrl: "https://i.pinimg.com/736x/b2/17/47/b217472c84ae54592acfb8b117780fa2.jpg",
    tags: ["photography", "nature", "workshop"]
  },
  {
    name: "Street Art Tour",
    startTime: new Date("2025-05-09T14:00:00"),
    endTime: new Date("2025-05-09T18:00:00"),
    location: "Downtown District",
    type: "Offline",
    category: "Street Art",
    description: "Tour the city's best street art with expert guides.",
    imageUrl: "https://i.pinimg.com/736x/4a/88/d1/4a88d1392deb156c54a9de0c1a04ec14.jpg",
    tags: ["street art", "tour", "urban"]
  },
  
  // Online Events
  {
    name: "Online Sculpture Exhibition",
    startTime: new Date("2025-01-15T10:00:00"),
    endTime: new Date("2025-01-15T16:00:00"),
    location: "Virtual Gallery",
    type: "Online",
    platform: "Zoom",
    category: "Sculpture",
    description: "Experience beautiful sculptures virtually from the comfort of your home.",
    imageUrl: "https://thumbs2.follow.art/thumbs/event_list_xxxl/pieces-thubnail-666-x-400-px-673b9b0fca083920734255.jpg",
    tags: ["sculpture", "virtual", "exhibition"]
  },
  {
    name: "Online Painting Workshop",
    startTime: new Date("2025-02-05T09:00:00"),
    endTime: new Date("2025-02-05T12:00:00"),
    location: "Virtual Studio",
    type: "Online",
    platform: "Google Meet",
    category: "Painting",
    description: "Learn painting techniques from professional artists online.",
    imageUrl: "https://thumbs2.follow.art/thumbs/event_list_xxl/8b92d5a7-344c-4e8f-acad-27b33d884301-6768ac781d2b8547885942.jpg",
    tags: ["painting", "workshop", "virtual"]
  },
  {
    name: "Virtual Photography Meetup",
    startTime: new Date("2025-03-12T13:00:00"),
    endTime: new Date("2025-03-12T16:00:00"),
    location: "Online Gallery",
    type: "Online",
    platform: "Zoom",
    category: "Photography",
    description: "Meet fellow photographers virtually and share your work.",
    imageUrl: "https://thumbs2.follow.art/thumbs/event_list_xxxl/locandina-sara-thumbnail-674ecf2b97b4e516579006.jpg",
    tags: ["photography", "meetup", "virtual"]
  },
  {
    name: "Digital Art Masterclass",
    startTime: new Date("2025-04-22T15:00:00"),
    endTime: new Date("2025-04-22T18:00:00"),
    location: "Virtual Studio",
    type: "Online",
    platform: "Microsoft Teams",
    category: "Digital Art",
    description: "Master digital art techniques with industry professionals.",
    imageUrl: "https://thumbs2.follow.art/thumbs/event_list_xxxl/thumbnail-666-x-400-px-673744768c385236941491.jpg",
    tags: ["digital art", "masterclass", "virtual"]
  },
  
  // Past Events (adjust dates as needed)
  {
    name: "Photography Meetup",
    startTime: new Date("2024-10-05T13:00:00"),
    endTime: new Date("2024-10-05T16:00:00"),
    location: "Downtown Photography Studio",
    type: "Offline",
    category: "Photography",
    description: "A successful photography meetup with great participation.",
    imageUrl: "https://i.pinimg.com/736x/9d/c7/2f/9dc72fc53cd7f5dd2a9a3370d3fc2b4a.jpg",
    tags: ["photography", "past event", "meetup"]
  },
  {
    name: "Painting Exhibition",
    startTime: new Date("2024-11-18T10:00:00"),
    endTime: new Date("2024-11-18T17:00:00"),
    location: "Grand Art Gallery",
    type: "Offline",
    category: "Painting",
    description: "A wonderful painting exhibition featuring local artists.",
    imageUrl: "https://i.pinimg.com/736x/71/8a/7c/718a7c64fd9dabf15744a4bb75a4f6c1.jpg",
    tags: ["painting", "exhibition", "past event"]
  },
  {
    name: "Sculpture Workshop",
    startTime: new Date("2024-12-01T14:00:00"),
    endTime: new Date("2024-12-01T18:00:00"),
    location: "Sculpture Arts Studio",
    type: "Offline",
    category: "Sculpture",
    description: "An engaging workshop on sculpture techniques.",
    imageUrl: "https://i.pinimg.com/736x/03/b5/ab/03b5ab446c1606ac6b337cac71d7a4e4.jpg",
    tags: ["sculpture", "workshop", "past event"]
  }
];

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("MongoDB Connected!");
    
    try {
      // Delete all existing events
      await Event.deleteMany({});
      console.log("Cleared existing events data");
      
      // Insert new events
      const insertedEvents = await Event.insertMany(eventData);
      console.log(`Successfully added ${insertedEvents.length} sample events to the database!`);
      
    } catch (error) {
      console.error("Error seeding events data:", error);
    } finally {
      // Close the connection
      mongoose.connection.close();
      console.log("MongoDB connection closed");
    }
  })
  .catch(err => {
    console.error("MongoDB Connection Error:", err);
    process.exit(1);
  });