// Step 3: MongoDB Model for Bookings
const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  serviceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true },
  providerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
  date: { type: String, required: true }, // Date of service
  time: { type: String, required: true }, // Time of service
  address: { type: String, required: true }, // Address of service
  totalCost: { type: Number, required: true }, // Total cost value
  
  // Status helps the provider "Accept" or "Reject" the booking
  status: { type: String, enum: ['pending', 'accepted', 'rejected', 'completed'], default: 'pending' }
});

module.exports = mongoose.model('Booking', bookingSchema);
