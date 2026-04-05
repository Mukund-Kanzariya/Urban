const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true, 
    unique: true 
  },
  
  // Shared Contact & Address Details
  phone: { type: String, default: '' },
  address: { type: String, default: '' },
  city: { type: String, default: '' },
  bio: { type: String, default: '' },
  
  // Profile Photo Tracking (linked to User's profile_image)
  profilePicture: { type: String, default: '' },

  // Specific Data for Providers
  serviceCategory: { type: String, default: '' },
  hourlyRate: { type: String, default: '' },
  price_per_hour: { type: Number, default: 0 }, // Specific field from requirement
  experienceYears: { type: String, default: '' },
  
  // Verification and Status
  is_verified: { type: Boolean, default: false },
  availability_status: { 
    type: String, 
    enum: ['available', 'busy', 'offline'], 
    default: 'available' 
  },
  
  // Aggregated Ratings
  rating: { type: Number, default: 0 },
  total_reviews: { type: Number, default: 0 },
  
  // For Customers
  preferredContact: { type: String, default: 'Email' },
  
  // For Admins
  department: { type: String, default: '' }
}, {
  timestamps: true // Automatically adds createdAt and updatedAt
});

module.exports = mongoose.model('Profile', profileSchema);
