import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import '../css/Home.css';
import '../css/StaticPages.css';

// Apply body gradient strictly while on Home page
// and provide realistic, diverse images for category cards
// Real Unsplash photos matching Indian service contexts
const SERVICE_IMAGES = {
  'Plumbing': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&auto=format&fit=crop',
  'Electrical': 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800&auto=format&fit=crop',
  'Cleaning': 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&auto=format&fit=crop',
  'Carpentry': 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=800&auto=format&fit=crop',
  'Painting': 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=800&auto=format&fit=crop',
  'AC Repair': 'https://images.unsplash.com/photo-1599696848652-f0ff23bc911f?w=800&auto=format&fit=crop',
  'Salon': 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&auto=format&fit=crop',
  'Pest Control': 'https://images.unsplash.com/photo-1629976928790-f6c830e9b530?w=800&auto=format&fit=crop',
  'default': 'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=1200&auto=format&fit=crop'
};

const getDynamicImage = (nameOrId) => {
  if (!nameOrId) return SERVICE_IMAGES.default;
  const text = String(nameOrId).toLowerCase();
  if (text.includes('plumb')) return SERVICE_IMAGES['Plumbing'];
  if (text.includes('elect') || text.includes('wir')) return SERVICE_IMAGES['Electrical'];
  if (text.includes('clean') || text.includes('maid')) return SERVICE_IMAGES['Cleaning'];
  if (text.includes('carpent') || text.includes('wood') || text.includes('furniture')) return SERVICE_IMAGES['Carpentry'];
  if (text.includes('paint')) return SERVICE_IMAGES['Painting'];
  if (text.includes('ac') || text.includes('air con') || text.includes('appliance') || text.includes('repair')) return SERVICE_IMAGES['AC Repair'];
  if (text.includes('salon') || text.includes('beaut') || text.includes('spa') || text.includes('hair')) return SERVICE_IMAGES['Salon'];
  if (text.includes('pest') || text.includes('insect')) return SERVICE_IMAGES['Pest Control'];
  // generic fallback by hash
  const vals = Object.values(SERVICE_IMAGES);
  const charSum = text.split('').reduce((s, c) => s + c.charCodeAt(0), 0);
  return vals[charSum % vals.length];
};

function Home() {
  const [reviews, setReviews] = useState([]);
  const [categories, setCategories] = useState([]);
  
  const getInitials = (name = '') => {
    if (!name) return '?';
    const parts = name.trim().split(/\s+/);
    return parts.length >= 2
      ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
      : name.slice(0, 2).toUpperCase();
  };

  useEffect(() => {
    // Fetch reviews
    axios.get('/api/reviews')
      .then((res) => setReviews(res.data))
      .catch((err) => console.log('Could not load reviews'));

    // Fetch categories
    axios.get('/api/categories')
      .then((res) => setCategories(res.data))
      .catch((err) => console.log('Could not load categories'));
  }, []);

  return (
    <div>
      {/* Hero Section with Background Image */}
      <div style={{
        position: 'relative',
        minHeight: '480px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        overflow: 'hidden'
      }}>
        <img
          src="https://images.unsplash.com/photo-1584622781564-1d987f7333c1?w=1600&auto=format&fit=crop"
          alt="Professional home services"
          style={{
            position: 'absolute',
            top: 0, left: 0, width: '100%', height: '100%',
            objectFit: 'cover',
            zIndex: 0
          }}
        />
        <div style={{
          position: 'absolute',
          top: 0, left: 0, width: '100%', height: '100%',
          background: 'linear-gradient(135deg, rgba(15,23,42,0.80) 0%, rgba(30,58,138,0.65) 100%)',
          zIndex: 1
        }}></div>
        <div style={{ position: 'relative', zIndex: 2, padding: '2rem 1rem', maxWidth: '640px' }}>
          {/* <div style={{ display: 'inline-block', background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.25)', borderRadius: '999px', padding: '0.3rem 1rem', marginBottom: '1.2rem', fontSize: '0.82rem', color: 'rgba(255,255,255,0.9)', letterSpacing: '0.5px', backdropFilter: 'blur(8px)' }}>
            🇮🇳 India's Trusted Home Service Platform
          </div> */}
          <h1 style={{ fontSize: '2.6rem', fontWeight: '800', color: '#fff', marginBottom: '0.85rem', letterSpacing: '-0.5px', lineHeight: 1.2 }}>
            Find Trusted Local<br />Professionals
          </h1>
          <p style={{ fontSize: '1.05rem', color: 'rgba(255,255,255,0.85)', marginBottom: '2rem', lineHeight: '1.65' }}>
            Book top-rated cleaners, plumbers, electricians, and more — right at your doorstep.
            Transparent pricing, verified reviews, instant booking.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/services" className="btn btn-primary" style={{ padding: '0.75rem 2rem', fontSize: '1rem', fontWeight: 700 }}>
              Browse Services
            </Link>
            <Link to="/register" style={{ padding: '0.75rem 2rem', fontSize: '1rem', fontWeight: 600, background: 'rgba(255,255,255,0.15)', color: '#fff', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.35)', textDecoration: 'none', backdropFilter: 'blur(8px)' }}>
              Join as Provider
            </Link>
          </div>
        </div>
      </div>

      {/* Service Categories Section */}
      <div className="home-categories-section">
        <div className="container">
          <div className="section-title">
            <h2>Our Services</h2>
            <p>Professional help for every need around your home</p>
          </div>

          <div className="home-categories-grid">
            {categories.map((cat) => (
              <Link to="/services" key={cat._id} className="home-category-link">
                <div className="home-category-card">
                  <div className="home-category-img-wrapper">
                    <img
                      src={getDynamicImage(cat.name || cat._id)}
                      alt={cat.name}
                      className="home-category-img"
                    />
                    <div className="home-category-overlay">
                      <span className="explore-btn">
                        Explore
                        <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                      </span>
                    </div>
                  </div>
                  <div className="home-category-content">
                    <h3>{cat.name}</h3>
                    <p>{cat.description || 'Professional home services'}</p>
                  </div>
                </div>
              </Link>
            ))}
            {categories.length === 0 && (
              <p className="loading-text" style={{ gridColumn: '1 / -1', textAlign: 'center', color: '#666' }}>Loading categories...</p>
            )}
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="how-it-works-section">
        <div className="container">
          <div className="section-title">
            <h2>How It Works</h2>
            <p>Your journey to a better home in three simple steps</p>
          </div>
          <div className="steps-container">

            <div className="step-card">
              <div className="step-number">1</div>
              <div className="step-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              </div>
              <h3>Find a Pro</h3>
              <p>Browse verified local professionals based on your needs, location, and budget.</p>
            </div>

            <div className="step-card">
              <div className="step-number">2</div>
              <div className="step-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
              </div>
              <h3>Book Instantly</h3>
              <p>Choose a convenient time slot and book securely through our platform.</p>
            </div>

            <div className="step-card">
              <div className="step-number">3</div>
              <div className="step-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
              </div>
              <h3>Get It Done</h3>
              <p>The professional completes the job perfectly. Review and pay when you are completely satisfied.</p>
            </div>

          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="reviews-section">
        <div className="container">
          <div style={{ textAlign: 'center' }}>
            <h2 style={{ fontSize: '1.35rem', marginBottom: '0.4rem' }}>Customer Reviews</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Real feedback from people who used our platform.
            </p>
          </div>

          <div className="reviews-slider-container">
            {reviews.length === 0 ? (
              <p style={{ textAlign: 'center', width: '100%', color: 'var(--text-muted)' }}>Be the first to leave a review!</p>
            ) : (
              <div className="reviews-slider-track">
                {reviews.map((r) => (
                  <div key={`rev1-${r._id}`} className="review-card">
                    <div className="stars">
                      {'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}
                    </div>
                    <p className="review-quote">"{r.comment}"</p>
                    <div className="review-author">
                      <div className="author-initial">{getInitials(r.customerId?.name)}</div>
                      <div className="author-info">
                        <h4>{r.customerId?.name || 'Anonymous User'}</h4>
                        <span>Booked: {r.bookingId?.serviceId?.title || 'Unknown Service'}</span>
                      </div>
                    </div>
                  </div>
                ))}
                {/* Duplicate for infinite scrolling */}
                {reviews.map((r) => (
                  <div key={`rev2-${r._id}`} className="review-card" aria-hidden="true">
                    <div className="stars">
                      {'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}
                    </div>
                    <p className="review-quote">"{r.comment}"</p>
                    <div className="review-author">
                      <div className="author-initial">{getInitials(r.customerId?.name)}</div>
                      <div className="author-info">
                        <h4>{r.customerId?.name || 'Anonymous User'}</h4>
                        <span>Booked: {r.bookingId?.serviceId?.title || 'Unknown Service'}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div style={{
        background: '#EFF6FF',
        borderTop: '1px solid #dbeafe',
        padding: '5rem 1.5rem',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Decorative circles */}
        <div style={{ position: 'absolute', top: '-60px', left: '-60px', width: '260px', height: '260px', borderRadius: '50%', background: 'rgba(59,130,246,0.08)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-80px', right: '-80px', width: '300px', height: '300px', borderRadius: '50%', background: 'rgba(245,158,11,0.08)', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          {/* <span style={{ display: 'inline-block', background: 'rgba(30,58,138,0.08)', border: '1px solid #bfdbfe', color: '#1E3A8A', borderRadius: '999px', padding: '0.3rem 1.1rem', fontSize: '0.82rem', marginBottom: '1.2rem', letterSpacing: '0.4px', fontWeight: 600 }}>
            🚀 Join 10,000+ happy customers
          </span> */}
          <h2 style={{ fontSize: '2.4rem', fontWeight: 800, color: '#1E3A8A', marginBottom: '0.75rem', letterSpacing: '-0.5px', lineHeight: 1.2 }}>
            Ready to get started?
          </h2>
          <p style={{ margin: '0 auto 2rem', maxWidth: '480px', color: '#4b5563', fontSize: '1rem', lineHeight: 1.65 }}>
            Whether you need something fixed, built, or cleaned — our verified professionals are just a tap away.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/services" style={{ padding: '0.85rem 2.25rem', fontSize: '1rem', fontWeight: 800, background: '#1E3A8A', color: '#fff', borderRadius: '12px', textDecoration: 'none', boxShadow: '0 8px 24px rgba(30,58,138,0.25)', letterSpacing: '0.2px' }}>
              Browse Services
            </Link>
            <Link to="/register" style={{ padding: '0.85rem 2.25rem', fontSize: '1rem', fontWeight: 600, background: '#ffffff', color: '#1E3A8A', borderRadius: '12px', border: '2px solid #1E3A8A', textDecoration: 'none', boxShadow: '0 8px 24px rgba(30,58,138,0.1)' }}>
              Join as Provider
            </Link>
          </div>
        </div>
      </div>

    </div>
  );
}

export default Home;
