const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true, 
    unique: true 
  },
  phone: { type: String, default: '' },
  address: { type: String, default: '' },
  city: { type: String, default: '' },
  bio: { type: String, default: '' },
  
  // Profile Photo Tracking
  profilePicture: { type: String, default: '' },

  // Specific Data by User Role
  // For Providers
  serviceCategory: { type: String, default: '' },
  hourlyRate: { type: String, default: '' },
  experienceYears: { type: String, default: '' },
  
  // For Customers
  preferredContact: { type: String, default: 'Email' },
  
  // For Admins
  department: { type: String, default: '' }
}, {
  timestamps: true // Automatically adds createdAt and updatedAt
});

module.exports = mongoose.model('Profile', profileSchema);
