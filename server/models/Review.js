// Step 3: MongoDB Model for Reviews
const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
  // Rating out of 5 stars
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String } // Text feedback left by customer
});

module.exports = mongoose.model('Review', reviewSchema);
