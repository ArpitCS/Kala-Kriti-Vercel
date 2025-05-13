const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  phoneNumber: {
    type: String,
    trim: true
  },
  password: {
    type: String,
    required: true,
  },
  bio: {
    type: String,
    trim: true
  },
  profilePicture: {
    type: String,
    default: "/uploads/profile/default.jpg",
  },
  address: {
    street: String,
    city: String,
    state: String,
    postalCode: String,
    country: String
  },
  favorites: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Artwork'
  }],
  // Cart items stored directly in user document
  cart: [{
    artwork: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Artwork',
      required: true
    },
    quantity: {
      type: Number,
      default: 1,
      min: 1
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  role: {
    type: String,
    enum: ["user", "artist", "admin"],
    default: "user",
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  // For artists
  exhibitionHistory: [String],
  artistStatement: String,  socialMedia: {
    instagram: String,
    twitter: String,
    facebook: String,
    website: String
  }
});

// Pre-save hook to hash password
userSchema.pre('save', async function(next) {
  // Debug logs
  console.log('Pre-save hook triggered for user:', this.username || 'new user');
  console.log('Password modified:', this.isModified('password'));
  console.log('Current password format:', this.password.substring(0, 10) + '...');
  
  // Only hash the password if it's modified (or new)
  if (!this.isModified('password')) {
    console.log('Password not modified, skipping hashing');
    return next();
  }
  
  try {
    console.log('Hashing password for user:', this.username || 'new user');
    
    // Generate a salt with complexity of 10
    const salt = await bcrypt.genSalt(10);
    
    // Hash the password using the salt
    const hashedPassword = await bcrypt.hash(this.password, salt);
    console.log('Generated hash:', hashedPassword.substring(0, 10) + '...');
    
    this.password = hashedPassword;
    console.log('Password successfully hashed');
    next();
  } catch (error) {
    console.error('Error hashing password:', error);
    next(error);
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(enteredPassword) {
  try {
    return await bcrypt.compare(enteredPassword, this.password);
  } catch (error) {
    console.error("Error comparing passwords:", error);
    return false;
  }
};

const User = mongoose.model("User", userSchema);

module.exports = User;