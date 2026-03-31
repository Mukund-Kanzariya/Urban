import React from 'react';
import '../css/StaticPages.css';

function About() {
  return (
    <div className="static-page-container">
      <div className="static-header">
        <h1>About LocalService</h1>
        <p>We are on a mission to connect communities by providing a reliable, transparent platform for local freelance professionals and businesses.</p>
      </div>

      <div className="about-grid">
        <div className="about-content">
          <h3>Our Story</h3>
          <p>
            Founded in 2026, LocalService began with a simple idea: finding a trusted plumber shouldn't
            take three days of calling around. We wanted to build a centralized hub where professionals
            can showcase their actual prices and skills, and customers can book instantly.
          </p>
          <p>
            Today, we empower thousands of independent contractors to run their own schedules, while
            giving homeowners the peace of mind they deserve. Every professional on our platform is
            community-reviewed.
          </p>
        </div>
        
        <div className="about-image-placeholder" style={{ background: 'var(--border)', borderRadius: '16px', minHeight: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ color: 'var(--text-muted)' }}>[ Team Image Placeholder ]</span>
        </div>
      </div>

      <div className="about-stats">
        <div className="stat-item">
          <h4>10,000+</h4>
          <span>Happy Customers</span>
        </div>
        <div className="stat-item">
          <h4>500+</h4>
          <span>Verified Providers</span>
        </div>
        <div className="stat-item">
          <h4>25+</h4>
          <span>Service Categories</span>
        </div>
      </div>
    </div>
  );
}

export default About;
