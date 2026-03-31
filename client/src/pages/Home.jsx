import React from 'react';
import { Link } from 'react-router-dom';
import '../css/Home.css'; 
import '../css/StaticPages.css';

function Home() {
  return (
    <div>
      {/* Massive Hero Section */}
      <div className="home-hero" style={{ padding: '6rem 1rem', background: 'linear-gradient(to right, #0ea5e9, #10b981)', color: 'white', borderBottom: 'none' }}>
        <h1 style={{ fontSize: '3.5rem', fontWeight: '800', marginBottom: '1.5rem', color: 'white' }}>
          Your Trusted Local Professionals
        </h1>
        <p style={{ fontSize: '1.25rem', color: 'rgba(255,255,255,0.9)', maxWidth: '700px', margin: '0 auto 2.5rem' }}>
          Instantly book top-rated cleaners, plumbers, electricians, and more. 
          Transparent pricing and verified community reviews.
        </p>
        <Link to="/services" className="btn" style={{ fontSize: '1.1rem', padding: '1rem 2rem', background: 'white', color: '#0ea5e9', fontWeight: 'bold' }}>
          Browse All Services
        </Link>
      </div>

      {/* How It Works Section */}
      <div className="container" style={{ textAlign: 'center', padding: '5rem 1rem' }}>
        <h2 style={{ fontSize: '2.5rem', marginBottom: '3rem' }}>How It Works</h2>
        <div className="about-grid" style={{ gridTemplateColumns: '1fr 1fr 1fr', gap: '2rem' }}>
          
          <div style={{ padding: '2rem', background: 'var(--bg-surface)', borderRadius: '16px', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
            <h3 style={{ marginBottom: '1rem' }}>1. Find a Pro</h3>
            <p style={{ color: 'var(--text-muted)' }}>Browse thousands of verified local professionals based on your specific needs and location.</p>
          </div>

          <div style={{ padding: '2rem', background: 'var(--bg-surface)', borderRadius: '16px', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📅</div>
            <h3 style={{ marginBottom: '1rem' }}>2. Book Instantly</h3>
            <p style={{ color: 'var(--text-muted)' }}>Choose an available time slot and book securely directly through our transparent platform.</p>
          </div>

          <div style={{ padding: '2rem', background: 'var(--bg-surface)', borderRadius: '16px', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✨</div>
            <h3 style={{ marginBottom: '1rem' }}>3. Relax</h3>
            <p style={{ color: 'var(--text-muted)' }}>The professional arrives and completes the job. You review and pay only when satisfied.</p>
          </div>

        </div>
      </div>

    </div>
  );
}

export default Home;
