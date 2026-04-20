import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../css/Services.css';

// Real Unsplash photos matched to Indian service contexts
const SERVICE_IMAGES = {
  'Plumbing': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&auto=format&fit=crop',
  'Electrical': 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800&auto=format&fit=crop',
  'Cleaning': 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&auto=format&fit=crop',
  'Carpentry': 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=800&auto=format&fit=crop',
  'Painting': 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=800&auto=format&fit=crop',
  'AC Repair': 'https://images.unsplash.com/photo-1599696848652-f0ff23bc911f?w=800&auto=format&fit=crop',
  'Salon': 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&auto=format&fit=crop',
  'Pest Control': 'https://images.unsplash.com/photo-1629976928790-f6c830e9b530?w=800&auto=format&fit=crop',
  'default': 'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=800&auto=format&fit=crop'
};

const getDynamicImage = (nameOrId) => {
  if (!nameOrId) return SERVICE_IMAGES.default;
  const text = String(nameOrId).toLowerCase();
  if (text.includes('plumb')) return SERVICE_IMAGES['Plumbing'];
  if (text.includes('elect') || text.includes('wir')) return SERVICE_IMAGES['Electrical'];
  if (text.includes('clean') || text.includes('maid')) return SERVICE_IMAGES['Cleaning'];
  if (text.includes('carpent') || text.includes('wood') || text.includes('furniture')) return SERVICE_IMAGES['Carpentry'];
  if (text.includes('paint')) return SERVICE_IMAGES['Painting'];
  if (text.includes('ac') || text.includes('air') || text.includes('appliance') || text.includes('repair')) return SERVICE_IMAGES['AC Repair'];
  if (text.includes('salon') || text.includes('beaut') || text.includes('spa') || text.includes('hair')) return SERVICE_IMAGES['Salon'];
  if (text.includes('pest') || text.includes('insect')) return SERVICE_IMAGES['Pest Control'];
  const vals = Object.values(SERVICE_IMAGES);
  const charSum = text.split('').reduce((s, c) => s + c.charCodeAt(0), 0);
  return vals[charSum % vals.length];
};

// Categories will be fetched from API

function Services() {
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState(['All']);
  const [filteredServices, setFilteredServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [bookingModal, setBookingModal] = useState({ isOpen: false, serviceId: null, providerId: null, date: '', time: '', address: '', totalCost: 0, paymentMethod: 'cash' });

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
      result = result.filter(s => s.category?.toLowerCase() === activeCategory.toLowerCase());
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

  const handleBookClick = (serviceId, providerId, price) => {
    const token = sessionStorage.getItem('token');
    if (!token) {
      return navigate('/login', { state: { message: "Please log in to book a service!" } });
    }
    setBookingModal({ isOpen: true, serviceId, providerId, date: new Date().toISOString().split('T')[0], time: '10:00', address: '', totalCost: price, paymentMethod: 'cash' });
  };

  const submitBooking = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/bookings', {
        serviceId: bookingModal.serviceId,
        providerId: bookingModal.providerId,
        date: bookingModal.date,
        time: bookingModal.time,
        service_address: bookingModal.address,
        price: bookingModal.totalCost,
        paymentMethod: bookingModal.paymentMethod
      });
      alert('Successfully Booked! Redirecting to your bookings...');
      setBookingModal({ isOpen: false, serviceId: null, providerId: null, date: '', time: '', address: '', totalCost: 0, paymentMethod: 'cash' });
      navigate('/bookings');
    } catch (err) {
      alert(err.response?.data?.error || 'Booking failed!');
    }
  };

  if (loading) return <div className="loading-spinner">Loading Services...</div>;

  return (
    <div>
      {/* Hero Banner */}
      <div className="services-hero">
        <img
          src="https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=1600&auto=format&fit=crop"
          alt="Home services"
          className="services-hero-img"
        />
        <div className="services-hero-overlay" />
        <div className="services-hero-content">
          {/* <span className="services-hero-pill">🔧 500+ Services Available</span> */}
          <h1>Find Your Perfect <br />Home Service</h1>
          <p>Book top-rated local professionals instantly. Verified reviews, transparent pricing.</p>

          {/* Search Bar in Hero */}
          <div className="services-hero-search">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Search plumber, cleaner, electrician..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Quick category pills */}
          {/* <div className="services-hero-tags">
            {['Plumbing', 'Electrical', 'Cleaning', 'Carpentry', 'Painting', 'Salon'].map(tag => (
              <button key={tag} className="hero-tag" onClick={() => setActiveCategory(tag)}>
                {tag}
              </button>
            ))}
          </div> */}
        </div>
      </div>

      <div className="services-container">

        <div className="marketplace-layout">
          {/* Left Sidebar Filters */}
          <aside className="marketplace-sidebar">
            <div className="sidebar-section">
              <h4>Categories</h4>
              <div className="category-list">
                {categories.map(cat => (
                  <button
                    key={cat}
                    className={`category-link ${activeCategory?.toLowerCase() === cat?.toLowerCase() ? 'active' : ''}`}
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

            {/* Results Count Strip */}
            <div className="results-strip">
              <span>
                🔍 {filteredServices.length} service{filteredServices.length !== 1 ? 's' : ''} found
                {activeCategory !== 'All' ? ` in "${activeCategory}"` : ''}
              </span>
              <span style={{ fontSize: '0.8rem', opacity: 0.75 }}>
                {search ? `For "${search}"` : 'All Categories'}
              </span>
            </div>


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
                        src={getDynamicImage(service.category + ' ' + service.title)}
                        alt={service.category}
                      />
                      <span className="category-badge">{service.category}</span>
                    </div>

                    <div className="card-body">
                      <h3 className="card-title">{service.title}</h3>

                      <div className="card-provider">
                        <div className="card-provider-initials" style={{ position: 'relative' }}>
                          {(service.providerName || 'P').charAt(0).toUpperCase()}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span className="card-provider-name" style={{ lineHeight: '1.2' }}>{service.providerName || 'Professional'}</span>
                          {service.providerAvailability && (
                            <span style={{ fontSize: '0.70rem', fontWeight: '800', textTransform: 'uppercase', color: service.providerAvailability === 'available' ? '#10b981' : '#ef4444' }}>
                              {service.providerAvailability === 'available' ? 'Available' : 'Busy '}
                            </span>
                          )}
                        </div>

                        {/* Provider Rating Badge */}
                        <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                          {service.providerRating > 0 ? (
                            <div style={{ background: '#fef3c7', color: '#d97706', padding: '0.2rem 0.5rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '800', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                              <span style={{ fontSize: '0.8rem' }}>⭐</span> {service.providerRating.toFixed(1)}
                              <span style={{ color: '#b45309', fontWeight: '600', opacity: 0.8 }}></span>
                            </div>
                          ) : (
                            <div style={{ background: '#f3f4f6', color: '#9ca3af', padding: '0.2rem 0.6rem', borderRadius: '6px', fontSize: '0.65rem', fontWeight: '800', textTransform: 'uppercase' }}>
                              New
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="card-footer">
                        <div className="card-price">
                          {/* <span className="label">Starting at</span> */}
                          <span className="value">Rs. {service.price}</span>
                        </div>
                        <button
                          className="card-btn"
                          onClick={() => handleBookClick(service._id, service.providerId, service.price)}
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

        {/* Booking Modal */}
        {bookingModal.isOpen && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '8px', width: '90%', maxWidth: '400px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
              <h3 style={{ marginTop: 0, marginBottom: '1.5rem', color: '#1f2937' }}>Select Date & Time</h3>
              <form onSubmit={submitBooking}>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Date</label>
                  <input type="date" required value={bookingModal.date} onChange={(e) => setBookingModal({ ...bookingModal, date: e.target.value })} style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #d1d5db', fontSize: '1rem' }} />
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Time</label>
                  <input type="time" required value={bookingModal.time} onChange={(e) => setBookingModal({ ...bookingModal, time: e.target.value })} style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #d1d5db', fontSize: '1rem' }} />
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Full Service Address</label>
                  <textarea required value={bookingModal.address} onChange={(e) => setBookingModal({ ...bookingModal, address: e.target.value })} style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #d1d5db', fontSize: '1rem', minHeight: '80px', resize: 'vertical' }} placeholder="Enter complete flat, building, strereet..." />
                </div>
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Payment Method</label>
                  <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.8rem', border: `1px solid ${bookingModal.paymentMethod === 'cash' ? '#4f46e5' : '#d1d5db'}`, borderRadius: '8px', cursor: 'pointer', background: bookingModal.paymentMethod === 'cash' ? '#eef2ff' : '#fff', flex: 1 }}>
                      <input type="radio" value="cash" checked={bookingModal.paymentMethod === 'cash'} onChange={(e) => setBookingModal({ ...bookingModal, paymentMethod: e.target.value })} style={{ margin: 0 }} />
                      <span style={{ fontWeight: '500', display: 'flex', alignItems: 'center', gap: '6px' }}>💵 Cash</span>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.8rem', border: `1px solid ${bookingModal.paymentMethod === 'card' ? '#4f46e5' : '#d1d5db'}`, borderRadius: '8px', cursor: 'pointer', background: bookingModal.paymentMethod === 'card' ? '#eef2ff' : '#fff', flex: 1 }}>
                      <input type="radio" value="card" checked={bookingModal.paymentMethod === 'card'} onChange={(e) => setBookingModal({ ...bookingModal, paymentMethod: e.target.value })} style={{ margin: 0 }} />
                      <span style={{ fontWeight: '500', display: 'flex', alignItems: 'center', gap: '6px' }}>💳 Card</span>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.8rem', border: `1px solid ${bookingModal.paymentMethod === 'upi' ? '#4f46e5' : '#d1d5db'}`, borderRadius: '8px', cursor: 'pointer', background: bookingModal.paymentMethod === 'upi' ? '#eef2ff' : '#fff', flex: 1 }}>
                      <input type="radio" value="upi" checked={bookingModal.paymentMethod === 'upi'} onChange={(e) => setBookingModal({ ...bookingModal, paymentMethod: e.target.value })} style={{ margin: 0 }} />
                      <span style={{ fontWeight: '500', display: 'flex', alignItems: 'center', gap: '6px' }}>📱 UPI</span>
                    </label>
                  </div>
                </div>
                <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f3f4f6', padding: '1rem', borderRadius: '4px' }}>
                  <span style={{ fontWeight: '600' }}>Total Cost:</span>
                  <span style={{ fontWeight: '700', fontSize: '1.25rem', color: '#10b981' }}>Rs. {bookingModal.totalCost}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                  <button type="button" onClick={() => setBookingModal({ isOpen: false, serviceId: null, providerId: null, date: '', time: '', address: '', totalCost: 0, paymentMethod: 'cash' })} style={{ padding: '0.5rem 1rem', border: 'none', background: '#e5e7eb', color: '#374151', borderRadius: '4px', cursor: 'pointer', fontWeight: '500' }}>Cancel</button>
                  <button type="submit" style={{ padding: '0.5rem 1rem', border: 'none', background: '#4f46e5', color: 'white', borderRadius: '4px', cursor: 'pointer', fontWeight: '500' }}>Confirm Booking</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>  {/* closes services-container */}
    </div>  // closes outer wrapper
  );
}

export default Services;
