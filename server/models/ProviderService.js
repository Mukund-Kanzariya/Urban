const mongoose = require('mongoose');

// This model represents the Many-to-Many relationship between Providers and Services
const providerServiceSchema = new mongoose.Schema({
  providerId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  serviceId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Service', 
    required: true 
  }
}, {
  timestamps: true // Track when the service was added
});

// Compound Index to prevent duplicate entries
providerServiceSchema.index({ providerId: 1, serviceId: 1 }, { unique: true });

module.exports = mongoose.model('ProviderService', providerServiceSchema);
