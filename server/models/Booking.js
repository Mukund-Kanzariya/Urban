// Step 3: MongoDB Model for Bookings
const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  serviceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Service",
    required: true,
  },
  providerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  date: { type: String, required: true }, // Date of service
  time: { type: String, required: true }, // Time of service
  service_address: { type: String, required: true }, // Address of service
  price: { type: Number, required: true }, // Actual price of service
  commission: { type: Number, default: 0 }, // Admin's 20% commission
  provider_earns: { type: Number, default: 0 }, // Provider's 80% earnings

  // Status helps the provider "Accept" or "Reject" the booking
  status: {
    type: String,
    enum: ["pending", "accepted", "rejected", "completed"],
    default: "pending",
  },
}, { timestamps: true });

module.exports = mongoose.model("Booking", bookingSchema);
