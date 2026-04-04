import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../css/Home.css'; // Re-use the existing grid logic

// Map each service category to its image
const categoryImages = {
  'Plumbing': '/images/plumbing.png',
  'Electrical': '/images/electrical.png',
  'Cleaning': '/images/cleaning.png',
  'Carpentry': '/images/carpentry.png',
};

function Services() {
  const [services, setServices] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch all services
    axios.get('/api/services')
      .then((response) => setServices(response.data))
      .catch(() => setError('Failed to load services. Please try again.'));
  }, []);

  const handleBook = async (serviceId, providerId) => {
    const token = sessionStorage.getItem('token');

    // Smooth redirect for unauthenticated users instead of harsh alerts!
    if (!token) {
      return navigate('/login', { state: { message: "Please log in to book a service!" } });
    }

    try {
      await axios.post('/api/bookings', {
        serviceId,
        providerId,
        date: new Date().toISOString().split('T')[0],
        time: '10:00 AM'
      });
      alert('Successfully Booked! Redirecting to dashboard...');
      navigate('/dashboard/customer');
    } catch (err) {
      alert(err.response?.data?.error || 'Booking failed!');
    }
  };

  return (
    <div className="container" style={{ padding: '2rem 1rem' }}>
      <div className="home-hero" style={{ padding: '1.5rem', marginBottom: '2rem', borderRadius: '8px' }}>
        <h2>Available Services</h2>
        <p>Browse our directory of verified local professionals.</p>
      </div>

      {error && <p className="error-message">{error}</p>}

      <div className="services-grid">
        {services.length === 0 && !error ? <p className="loading-spinner">Loading services...</p> : (
          services.map((service) => (
            <div key={service._id} className="service-card">
              <img
                src={categoryImages[service.category] || '/images/plumbing.png'}
                alt={service.category}
              />

              <div className="service-card-body">
                <div className="service-header">
                  <h3>{service.title}</h3>
                  <span className="service-category">{service.category}</span>
                </div>

                <div className="service-details">
                  <div className="service-detail-item">
                    <span>Location</span>
                    <strong>{service.location}</strong>
                  </div>
                  <div className="service-detail-item">
                    <span>Price</span>
                    <strong className="text-primary">Rs. {service.price}</strong>
                  </div>
                  <div className="service-detail-item">
                    <span>Provider</span>
                    <strong>{service.providerId?.name}</strong>
                  </div>
                </div>

                <button className="btn btn-primary w-100" onClick={() => handleBook(service._id, service.providerId?._id)}>
                  Book Now
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Services;
