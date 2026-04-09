import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../css/Dashboards.css';

function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(sessionStorage.getItem('user')) || {};
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || user.role !== 'customer') {
      navigate('/login');
      return;
    }
    fetchBookings();
  }, [navigate]);

  const fetchBookings = async () => {
    try {
      const res = await axios.get('/api/bookings');
      setBookings(res.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setLoading(false);
    }
  };

  const handleLeaveReview = (bookingId) => {
    navigate(`/add-review/${bookingId}`);
  };

  if (loading) return <div className="loading-spinner">Loading Bookings...</div>;

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h2>My Bookings</h2>
        <p>Manage your service history and upcoming appointments, <span className="highlight-text">{user.name}</span>.</p>
      </header>
      
      <div className="dashboard-grid single-column">
        {/* Active Bookings Section */}
        <section className="dashboard-card main-section">
          <h3>Booking History</h3>
          {bookings.length === 0 ? (
            <div className="empty-state">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '48px', height: '48px', marginBottom: '16px', opacity: 0.5 }}>
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              <p>You have no bookings yet.</p>
              <button className="btn btn-primary" onClick={() => navigate('/services')} style={{ marginTop: '16px' }}>
                Browse Services
              </button>
            </div>
          ) : (
            <div className="list-grid">
              {bookings.map((b) => (
                <div key={b._id} className="item-card">
                  <div className="item-card-header">
                    <h4>{b.serviceId?.title}</h4>
                    <span className={`status-badge status-${b.status.toLowerCase()}`}>{b.status}</span>
                  </div>
                  <div className="item-details">
                    <div className="detail-row">
                      <strong>Provider:</strong> <span>{b.providerId?.name}</span>
                    </div>
                    <div className="detail-row">
                      <strong>Date & Time:</strong> <span>{b.date} at {b.time}</span>
                    </div>
                    <div className="detail-row">
                      <strong>Price:</strong> <span>${b.serviceId?.price}</span>
                    </div>
                    
                    <div className="card-actions" style={{ marginTop: '15px', paddingTop: '15px', borderTop: '1px solid var(--border)' }}>
                      {b.status.toLowerCase() === 'completed' && (
                        <button className="btn btn-secondary btn-sm" onClick={() => handleLeaveReview(b._id)}>
                          Leave a Review
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default MyBookings;
