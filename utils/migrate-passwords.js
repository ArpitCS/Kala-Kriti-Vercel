/**
 * This is a utility script to migrate plain text passwords to bcrypt hashed passwords.
 * Run this script once after updating the authentication system.
 */
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('../models/Users'); // Adjust the path as necessary
const path = require('path');

// Load environment variables with absolute path
dotenv.config({ path: path.join(__dirname, '../.env') });

// Verify the connection string is loaded
console.log("MongoDB URI available:", !!process.env.MONGO_URI);

// MongoDB Connection
const connectDB = require("../config/db");
connectDB();

async function migratePasswords() {
  try {
    // Connect to MongoDB
    console.log('Attempting to connect to MongoDB...');
    const MONGO_URI = process.env.MONGO_URI;
    console.log('MONGO_URI available:', !!MONGO_URI);
    
    if (!MONGO_URI) {
      throw new Error('MongoDB URI is not defined. Please check your configuration.');
    }
    
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB successfully');
    
    // Create test user if no users exist
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('No users found, creating a test user...');
      const testUser = new User({
        username: 'testuser',
        email: 'test@example.com',
        fullName: 'Test User',
        password: 'TestPassword123!',
        role: 'user'
      });
      await testUser.save();
      console.log('Test user created with password:', testUser.password);
      console.log('Is password hashed?', testUser.password.startsWith('$2'));
    }
    
    // Find all users
    const users = await User.find({});
    console.log(`Found ${users.length} users to check for migration`);
    
    // Debug: show password format for each user
    users.forEach(user => {
      console.log(`User ${user.username} - Password format check:`, {
        length: user.password.length,
        startsWithHash: user.password.startsWith('$'),
        firstChars: user.password.substring(0, 10) + '...'
      });
    });
    
    let migratedCount = 0;
    
    // Check each user's password and hash it if needed
    for (const user of users) {
      try {
        // Skip if password is already hashed (basic check)
        if (user.password.startsWith('$2a$') || user.password.startsWith('$2b$')) {
          console.log(`User ${user.username} already has a hashed password`);
          continue;
        }
        
        console.log(`Processing user ${user.username} with current password format:`, user.password.substring(0, 5) + '...');
        
        // Store the plain text password temporarily
        const plainPassword = user.password;
        
        // Generate salt and hash
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(plainPassword, salt);
        console.log(`Hashed password generated: ${hashedPassword.substring(0, 10)}...`);
        
        // Save directly with findByIdAndUpdate to bypass middleware
        const result = await User.findByIdAndUpdate(
          user._id,
          { $set: { password: hashedPassword } },
          { new: true }
        );
        
        console.log(`Updated password for ${user.username}:`, result.password.substring(0, 10) + '...');
        migratedCount++;
      } catch (userError) {
        console.error(`Failed to migrate password for user ${user.username}:`, userError);
      }
    }
    
    console.log(`Migration complete. Migrated ${migratedCount} user passwords.`);
  } catch (error) {
    console.error('Password migration failed:', error);
  } finally {
    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the migration
migratePasswords();
