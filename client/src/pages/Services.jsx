import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../css/Services.css';

const categoryImages = {
  'Plumbing': '/images/plumbing.png',
  'Electrical': '/images/electrical.png',
  'Cleaning': '/images/cleaning.png',
  'Carpentry': '/images/carpentry.png',
};

// Categories will be fetched from API

function Services() {
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState(['All']);
  const [filteredServices, setFilteredServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filter & Sort State
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [sortBy, setSortBy] = useState('Newest');

  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [servicesRes, categoriesRes] = await Promise.all([
        axios.get('/api/services'),
        axios.get('/api/categories')
      ]);
      setServices(servicesRes.data);
      setCategories(['All', ...categoriesRes.data.map(c => c.name)]);
      setLoading(false);
    } catch (err) {
      setError('Failed to load data. Please try again.');
      setLoading(false);
    }
  };

  useEffect(() => {
    applyFilters();
  }, [services, search, activeCategory, sortBy]);

  const applyFilters = () => {
    let result = [...services];

    // Filter by search
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(s => 
        s.title.toLowerCase().includes(q) ||
        s.providerName?.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q)
      );
    }

    // Filter by category
    if (activeCategory !== 'All') {
      result = result.filter(s => s.category === activeCategory);
    }

    // Sort
    if (sortBy === 'Price: Low to High') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'Price: High to Low') {
      result.sort((a, b) => b.price - a.price);
    } else {
      result.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    }

    setFilteredServices(result);
  };

  const handleBook = async (serviceId, providerId) => {
    const token = sessionStorage.getItem('token');
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
      alert('Successfully Booked! Redirecting to your bookings...');
      navigate('/bookings');
    } catch (err) {
      alert(err.response?.data?.error || 'Booking failed!');
    }
  };

  if (loading) return <div className="loading-spinner">Loading Services...</div>;

  return (
    <div className="services-container">
      <header className="marketplace-header">
        <h1>Find Your Service</h1>
        <p>Book top-rated local professionals instantly.</p>
      </header>

      {/* Top Search Bar */}
      <section className="search-row">
        <div className="search-input-wrapper">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input 
            type="text" 
            placeholder="What service do you need today?" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </section>

      <div className="marketplace-layout">
        {/* Left Sidebar Filters */}
        <aside className="marketplace-sidebar">
          <div className="sidebar-section">
            <h4>Categories</h4>
            <div className="category-list">
              {categories.map(cat => (
                <button 
                  key={cat} 
                  className={`category-link ${activeCategory === cat ? 'active' : ''}`}
                  onClick={() => setActiveCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="sidebar-section">
            <h4>Sort By</h4>
            <select 
              className="sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option>Newest</option>
              <option>Price: Low to High</option>
              <option>Price: High to Low</option>
            </select>
          </div>
        </aside>

        {/* Right Main Content */}
        <main className="marketplace-main">
          {error && <div className="error-message">{error}</div>}

          <div className="marketplace-grid">
            {filteredServices.length === 0 ? (
              <div className="empty-marketplace">
                <h3>No services found</h3>
                <p>Try different filters or search keywords.</p>
              </div>
            ) : (
              filteredServices.map((service) => (
                <div key={service._id} className="marketplace-card">
                  <div className="card-banner">
                    <img
                      src={categoryImages[service.category] || '/images/plumbing.png'}
                      alt={service.category}
                    />
                    <span className="category-badge">{service.category}</span>
                  </div>

                  <div className="card-body">
                    <h3 className="card-title">{service.title}</h3>
                    
                    <div className="card-provider">
                      <div className="card-provider-initials" style={{ position: 'relative' }}>
                        {(service.providerName || 'P').charAt(0).toUpperCase()}
                        {service.providerAvailability === 'available' && (
                          <span style={{ position: 'absolute', bottom: -2, right: -2, width: '10px', height: '10px', background: '#10b981', border: '2px solid white', borderRadius: '50%' }}></span>
                        )}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span className="card-provider-name" style={{ lineHeight: '1.2' }}>{service.providerName || 'Professional'}</span>
                        {service.providerAvailability && (
                          <span style={{ fontSize: '0.65rem', fontWeight: 'bold', textTransform: 'uppercase', color: service.providerAvailability === 'available' ? '#10b981' : '#ef4444' }}>
                            {service.providerAvailability === 'available' ? 'Accepting Jobs' : 'Offline'}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="card-footer">
                      <div className="card-price">
                        <span className="label">Starting at</span>
                        <span className="value">Rs. {service.price}</span>
                      </div>
                      <button 
                        className="card-btn"
                        onClick={() => handleBook(service._id, service.providerId)}
                      >
                        Book Now
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default Services;
