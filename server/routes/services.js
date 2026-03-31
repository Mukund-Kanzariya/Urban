// Step 4: Service Routes
const express = require('express');
const router = express.Router();
const Service = require('../models/Service');
const verifyToken = require('../middleware/auth'); // Import our JWT checker

// GET /api/services - View all services (Browsing feature)
// Anyone can view services, no token needed!
router.get('/', async (req, res) => {
  try {
    // Find all services and include the provider's basic details using "populate"
    const services = await Service.find().populate('providerId', 'name email');
    res.json(services);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/services - Add a new service
// We use "verifyToken" to block strangers. ONLY logged in users pass this check.
router.post('/', verifyToken, async (req, res) => {
  try {
    // Ensure ONLY a provider role can create a service
    if (req.user.role !== 'provider') {
      return res.status(403).json({ error: 'Only providers can create services!' });
    }

    const { category, title, price, location } = req.body;

    // Create the service, pulling their unique ID straight from their confirmed JWT Token
    const newService = new Service({
      providerId: req.user._id, 
      category,
      title,
      price,
      location
    });

    const savedService = await newService.save();
    res.status(201).json(savedService);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/services/provider - View services for a logged-in provider
router.get('/provider', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'provider') {
      return res.status(403).json({ error: 'Only providers can view their services via this route' });
    }
    const services = await Service.find({ providerId: req.user._id });
    res.json(services);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/services/:id - Delete a service (Admin or owning Provider)
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ error: 'Service not found' });
    }

    if (req.user.role === 'admin' || (req.user.role === 'provider' && service.providerId.toString() === req.user._id.toString())) {
      await Service.findByIdAndDelete(req.params.id);
      return res.json({ message: 'Service deleted successfully' });
    } else {
      return res.status(403).json({ error: 'You do not have permission to delete this service' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
