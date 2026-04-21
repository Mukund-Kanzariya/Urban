// Step 3: MongoDB Model for Services
const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  // The provider creating this service. We link it to a specific User's ID.
  providerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
  category: { type: String, required: true }, // e.g., 'plumber', 'cleaner'
  title: { type: String, required: true }, // e.g., 'Fix leaky pipes'
  price: { type: Number, required: true }, // e.g., 500
  location: { type: String, required: true }, // Service area
  image: { type: String } // Service image path
});

module.exports = mongoose.model('Service', serviceSchema);
