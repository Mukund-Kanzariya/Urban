import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import '../css/Experts.css';

const Experts = () => {
  const [experts, setExperts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const getInitials = (name = '') => {
    if (!name) return '?';
    const parts = name.trim().split(/\s+/);
    return parts.length >= 2
      ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
      : name.slice(0, 2).toUpperCase();
  };

  useEffect(() => {
    const fetchExperts = async () => {
      try {
        const response = await axios.get('/api/users/providers');
        setExperts(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load expert directory. Please try again later.');
        setLoading(false);
      }
    };
    fetchExperts();
  }, []);

  const filteredExperts = experts.filter(expert =>
    expert.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (expert.profileData?.serviceCategory || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderStars = (rating) => {
    const stars = [];
    const roundedRating = Math.round(rating || 0);
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <svg key={i} viewBox="0 0 24 24" fill={i <= roundedRating ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '16px', height: '16px' }}>
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      );
    }
    return stars;
  };

  if (loading) return <div className="loading-spinner">Discovering Top Experts...</div>;

  return (
    <div className="experts-container">
      <header className="experts-header">
        <h1>Meet Our Experts</h1>
        <p>Vetted, highly-rated professionals ready to help with your next project.</p>

        {/* Simple Search Row */}
        <div style={{ maxWidth: '600px', margin: '2rem auto 0 auto', position: 'relative' }}>
          <input
            type="text"
            placeholder="Search experts by name or specialty..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: '100%', padding: '0.85rem 1rem 0.85rem 3rem', borderRadius: '12px', border: '1px solid var(--border)', fontSize: '1rem' }}
          />
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', width: '20px', color: 'var(--text-muted)' }}>
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </div>
      </header>

      {error && <div className="error-message" style={{ textAlign: 'center', marginBottom: '2rem' }}>{error}</div>}

      <div className="experts-grid">
        {filteredExperts.length === 0 ? (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
            <h3>No experts matched your search</h3>
            <p>Try searching for a name or service like "Plumbing".</p>
          </div>
        ) : (
          filteredExperts.map(expert => (
            <div key={expert._id} className="expert-card">
              <div className="expert-photo-wrapper">
                {expert.profileData?.profilePicture ? (
                  <img src={expert.profileData.profilePicture} alt={expert.name} className="expert-photo" />
                ) : (
                  <div className="expert-initials">{getInitials(expert.name)}</div>
                )}
                {expert.profileData?.experienceYears && (
                  <span className="experience-badge">{expert.profileData.experienceYears}+ Yrs</span>
                )}
              </div>

              <div className="expert-info">
                <div style={{ display: 'flex', justifyContent: 'center', gap: '0.4rem', marginBottom: '0.5rem', alignItems: 'center' }}>
                  <span className="expert-category">{expert.profileData?.serviceCategory || 'Service Hub Pro'}</span>
                  {expert.profileData?.is_verified && (
                    <span title="Verified Professional" style={{ color: '#0ea5e9' }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" /></svg>
                    </span>
                  )}
                </div>
                <h3>{expert.name}</h3>
                {expert.profileData?.availability_status && (
                  <span style={{ fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase', color: expert.profileData.availability_status === 'available' ? '#10b981' : '#6b7280' }}>
                    ● {expert.profileData.availability_status}
                  </span>
                )}
                <p className="expert-bio">{expert.profileData?.bio || `${expert.name} is a dedicated professional committed to delivering high-quality service at ServiceHub.`}</p>
              </div>

              {/* <div className="expert-rating">
                <div className="stars-wrapper">
                  {renderStars(expert.averageRating)}
                </div>
                <span className="review-count">
                  {expert.reviewCount > 0 
                    ? `${expert.averageRating.toFixed(1)} / 5 (${expert.reviewCount} Reviews)` 
                    : "No reviews yet"}
                </span>
              </div> */}

              <div className="expert-contact-ui" style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: 'var(--text-muted)' }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '16px', height: '16px' }}>
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                  <polyline points="22,6 12,13 2,6"></polyline>
                </svg>
                <a href={`mailto:${expert.email}`} style={{ color: 'var(--primary)', textDecoration: 'none', fontSize: '0.9rem', fontWeight: '500' }}>
                  {expert.email}
                </a>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Experts;
