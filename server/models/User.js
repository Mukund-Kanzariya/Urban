// Step 3: MongoDB Model for Users
const mongoose = require('mongoose');

// This defines the structure of a User document in MongoDB
const userSchema = new mongoose.Schema({
  name: { type: String, required: true }, // Every user must have a name
  email: { type: String, required: true, unique: true }, // Email must be unique
  password: { type: String, required: true }, // We will store securely hashed passwords
  role: { type: String, enum: ['customer', 'provider', 'admin'], default: 'customer' }, // Three roles available
});

// We create a model named 'User' from the schema and export it
module.exports = mongoose.model('User', userSchema);
