import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import '../css/Home.css'; 
import '../css/StaticPages.css';

// Apply body gradient strictly while on Home page
// and provide realistic, diverse images for category cards
const diverseServiceImages = [
  'https://images.unsplash.com/photo-1607427293702-036933bbf746?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1581578731548-c64695cc6952?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1540555700478-4be289fbecef?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1615873968403-89e068629265?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1581578326227-18116b43d1cc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1505798577917-a65157d3320a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
];

const getDynamicImage = (id) => {
  if (!id) return diverseServiceImages[0];
  const charSum = id.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return diverseServiceImages[charSum % diverseServiceImages.length];
};

function Home() {
  const [reviews, setReviews] = useState([]);
  const [categories, setCategories] = useState([]);

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
        minHeight: '400px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        overflow: 'hidden'
      }}>
        <img 
          src="/images/hero-banner.png" 
          alt="Professional home service" 
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
          background: 'rgba(0,0,0,0.55)',
          zIndex: 1
        }}></div>
        <div style={{ position: 'relative', zIndex: 2, padding: '2rem 1rem', maxWidth: '600px' }}>
          <h1 style={{ fontSize: '2.2rem', fontWeight: '700', color: '#fff', marginBottom: '0.75rem', letterSpacing: '-0.5px' }}>
            Find Trusted Local Professionals
          </h1>
          <p style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.85)', marginBottom: '1.5rem', lineHeight: '1.6' }}>
            Book top-rated cleaners, plumbers, electricians, and more. 
            Transparent pricing, verified reviews.
          </p>
          <Link to="/services" className="btn btn-primary" style={{ padding: '0.6rem 1.5rem' }}>
            Browse Services
          </Link>
        </div>
      </div>

      {/* Service Categories with Images */}
      <div className="container" style={{ padding: '2.5rem 1rem' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '0.4rem', fontSize: '1.35rem' }}>Our Services</h2>
        <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>Professional help for every need around your home</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1.5rem' }}>
          {categories.map((cat) => (
            <Link to="/services" key={cat._id} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div style={{ 
                background: '#fff', 
                border: '1px solid var(--border)', 
                borderRadius: '12px', 
                overflow: 'hidden',
                transition: 'all 0.2s ease',
                height: '100%'
              }}
              className="category-card-home"
              >
                <img 
                  src={getDynamicImage(cat._id || cat.name)} 
                  alt={cat.name} 
                  style={{ width: '100%', height: '160px', objectFit: 'cover', display: 'block' }}
                />
                <div style={{ padding: '1rem', textAlign: 'center' }}>
                  <h3 style={{ fontSize: '1rem', margin: '0 0 0.4rem 0', fontWeight: '700' }}>{cat.name}</h3>
                  <p style={{ fontSize: '0.8rem', color: '#666', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {cat.description || 'Professional home services'}
                  </p>
                </div>
              </div>
            </Link>
          ))}
          {categories.length === 0 && (
            <p style={{ gridColumn: '1 / -1', textAlign: 'center', color: '#666' }}>Loading categories...</p>
          )}
        </div>
      </div>

      {/* How It Works */}
      <div style={{ background: 'transparent', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div className="container" style={{ padding: '2.5rem 1rem' }}>
          <h2 style={{ textAlign: 'center', marginBottom: '1.5rem', fontSize: '1.35rem' }}>How It Works</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.25rem' }}>
            
            <div style={{ padding: '1.25rem', textAlign: 'center' }}>
              <div style={{ 
                width: '48px', height: '48px', borderRadius: '50%', 
                background: 'var(--primary-light)', color: 'var(--primary)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.25rem', fontWeight: '700', margin: '0 auto 0.75rem'
              }}>1</div>
              <h3 style={{ fontSize: '1rem', marginBottom: '0.4rem' }}>Find a Pro</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', lineHeight: '1.55' }}>Browse verified local professionals based on your needs and location.</p>
            </div>

            <div style={{ padding: '1.25rem', textAlign: 'center' }}>
              <div style={{ 
                width: '48px', height: '48px', borderRadius: '50%', 
                background: 'var(--primary-light)', color: 'var(--primary)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.25rem', fontWeight: '700', margin: '0 auto 0.75rem'
              }}>2</div>
              <h3 style={{ fontSize: '1rem', marginBottom: '0.4rem' }}>Book Instantly</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', lineHeight: '1.55' }}>Choose a time slot and book securely through our platform.</p>
            </div>

            <div style={{ padding: '1.25rem', textAlign: 'center' }}>
              <div style={{ 
                width: '48px', height: '48px', borderRadius: '50%', 
                background: 'var(--primary-light)', color: 'var(--primary)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.25rem', fontWeight: '700', margin: '0 auto 0.75rem'
              }}>3</div>
              <h3 style={{ fontSize: '1rem', marginBottom: '0.4rem' }}>Get It Done</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', lineHeight: '1.55' }}>The professional completes the job. Review and pay when satisfied.</p>
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

          <div className="reviews-grid">
            {reviews.length === 0 ? (
              <p style={{ textAlign: 'center', gridColumn: '1 / -1', color: 'var(--text-muted)' }}>Be the first to leave a review!</p>
            ) : (
              reviews.map((r) => (
                <div key={r._id} className="review-card">
                  <div className="stars">
                    {'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}
                  </div>
                  <p className="review-quote">"{r.comment}"</p>
                  <div className="review-author">
                    {r.customerId?.profilePicture ? (
                      <img 
                        src={r.customerId.profilePicture} 
                        alt="Customer" 
                        style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} 
                      />
                    ) : (
                      <div className="author-initial">{r.customerId?.name?.charAt(0) || '?'}</div>
                    )}
                    <div className="author-info">
                      <h4>{r.customerId?.name || 'Anonymous User'}</h4>
                      <span>Booked: {r.bookingId?.serviceId?.title || 'Unknown Service'}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div style={{ background: '#1a1a1a', color: '#fff', padding: '3rem 1rem', textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '0.6rem', color: '#fff' }}>Ready to get started?</h2>
        <p style={{ margin: '0 auto 1.5rem', maxWidth: '450px', color: '#999', fontSize: '0.9rem' }}>
          Whether you need something fixed, built, or cleaned — our professionals are ready.
        </p>
        <Link to="/register" className="btn btn-primary">
          Join Now
        </Link>
      </div>

    </div>
  );
}

export default Home;
