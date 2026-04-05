// Step 3: MongoDB Model for Users
const mongoose = require('mongoose');

// This defines the structure of a User document in MongoDB
const userSchema = new mongoose.Schema({
  name: { type: String, required: true }, // Every user must have a name
  email: { type: String, required: true, unique: true }, // Email must be unique
  password: { type: String, required: true }, // We will store securely hashed passwords
  
  // Expanded Roles for deeper control
  role: { 
    type: String, 
    enum: ['customer', 'provider', 'admin', 'super_admin'], 
    default: 'customer' 
  },
  
  // New Fields for Admin and Provider status
  phone: { type: String, default: '' },
  profile_image: { type: String, default: '' },
  status: { 
    type: String, 
    enum: ['active', 'inactive', 'blocked'], 
    default: 'active' 
  },
  last_login: { type: Date, default: null }
}, {
  timestamps: true // Automatically adds createdAt and updatedAt
});

// We create a model named 'User' from the schema and export it
module.exports = mongoose.model('User', userSchema);
