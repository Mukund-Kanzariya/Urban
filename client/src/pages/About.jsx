import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../css/StaticPages.css';

function About() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    axios.get('/api/stats')
      .then(res => setStats(res.data))
      .catch(() => {}); // fail silently, fallbacks shown
  }, []);

  const fmt = (n) => {
    if (n === undefined || n === null) return '...';
    if (n >= 1000) return `${(n / 1000).toFixed(1)}k+`;
    return `${n}+`;
  };

  return (
    <div>
      {/* Hero Banner */}
      <div style={{
        position: 'relative',
        height: '340px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        overflow: 'hidden'
      }}>
        <img
          src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1400&auto=format&fit=crop"
          alt="About ServiceHub"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(15,23,42,0.65)' }} />
        <div style={{ position: 'relative', zIndex: 2, padding: '0 1rem' }}>
          <h1 style={{ color: '#fff', fontSize: '2.2rem', fontWeight: 700, marginBottom: '0.6rem', letterSpacing: '-0.5px' }}>
            About ServiceHub
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.82)', fontSize: '1rem', maxWidth: '540px', margin: '0 auto', lineHeight: 1.65 }}>
            We are on a mission to connect communities by providing a reliable, transparent platform for local professionals and businesses.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="static-page-container">
        {/* Our Story */}
        <div className="about-grid">
          <div className="about-content">
            <h3>Our Story</h3>
            <p>
              Founded in 2024, ServiceHub began with a simple idea: finding a trusted plumber shouldn't
              take three days of calling around. We wanted to build a centralized hub where professionals
              can showcase their actual prices and skills, and customers can book instantly.
            </p>
            <p>
              Today, we empower thousands of independent contractors across India to run their own schedules, while
              giving homeowners the peace of mind they deserve. Every professional on our platform is
              community-reviewed and verified.
            </p>
            <p>
              From plumbing and electrical repairs to home cleaning and salon services — we cover it all,
              right at your doorstep, at transparent prices with no hidden charges.
            </p>
          </div>

          <div>
            <img
              src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&auto=format&fit=crop"
              alt="Our Team"
              style={{
                width: '100%',
                borderRadius: '12px',
                objectFit: 'cover',
                height: '300px',
                boxShadow: '0 4px 24px rgba(0,0,0,0.10)',
                border: '1px solid var(--border)'
              }}
            />
          </div>
        </div>

        {/* Dynamic Stats */}
        <div className="about-stats">
          <div className="stat-item">
            <h4>{fmt(stats?.customers)}</h4>
            <span>Happy Customers</span>
          </div>
          <div className="stat-item">
            <h4>{fmt(stats?.providers)}</h4>
            <span>Verified Providers</span>
          </div>
          <div className="stat-item">
            <h4>{fmt(stats?.services)}</h4>
            <span>Services Listed</span>
          </div>
          <div className="stat-item">
            <h4>{fmt(stats?.categories)}</h4>
            <span>Service Categories</span>
          </div>
          <div className="stat-item">
            <h4>{fmt(stats?.bookings)}</h4>
            <span>Bookings Completed</span>
          </div>
        </div>

        {/* Why Choose Us */}
        <div style={{ marginTop: '3rem' }}>
          <h2 style={{ textAlign: 'center', fontSize: '1.4rem', marginBottom: '1.5rem', fontWeight: 700 }}>Why Choose ServiceHub?</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem' }}>
            {[
              { icon: '✅', title: 'Verified Professionals', desc: 'Every provider is background-checked and community-reviewed.' },
              { icon: '💰', title: 'Transparent Pricing', desc: 'No hidden fees. See exact prices before you book.' },
              { icon: '⚡', title: 'Instant Booking', desc: 'Book in minutes. No calls, no hassle.' },
              { icon: '🛡️', title: 'Secure Payments', desc: 'Pay safely via Cash, Card, or UPI.' },
            ].map(item => (
              <div key={item.title} style={{
                background: '#f8fafc',
                border: '1px solid var(--border)',
                borderRadius: '12px',
                padding: '1.25rem',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{item.icon}</div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.35rem' }}>{item.title}</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.55 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default About;
