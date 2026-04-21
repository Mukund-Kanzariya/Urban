import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../css/Dashboards.css';

function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(sessionStorage.getItem('user')) || {};
  const navigate = useNavigate();

  const [search, setSearch] = useState('');

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

  // Enhance Bookings by sorting and filtering
  const filteredBookings = bookings
    .filter(b => b.providerId?.name?.toLowerCase().includes(search.toLowerCase()) || b.serviceId?.title?.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      // Sort by Created At Timestamp (Latest first)
      if (a.createdAt && b.createdAt) {
        return new Date(b.createdAt) - new Date(a.createdAt);
      }
      // Fallback: Sort by Service Date + Time descending
      const dateA = new Date(`${a.date} ${a.time}`);
      const dateB = new Date(`${b.date} ${b.time}`);
      return dateB - dateA;
    });

  return (
    <div className="dashboard-container" style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem 1rem' }}>
      <header className="dashboard-header" style={{ borderBottom: 'none', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: '800', color: '#111827', margin: '0 0 0.5rem 0' }}>My Bookings</h2>
        <p style={{ fontSize: '1.1rem', color: '#6b7280' }}>
          Manage your service history and appointments, <span style={{ color: '#4f46e5', fontWeight: '600' }}>{user.name}</span>.
        </p>
      </header>

      {/* Search Input */}
      {bookings.length > 0 && (
        <div style={{ marginBottom: '2rem', display: 'flex' }}>
          <input
            type="text"
            placeholder="Search by Provider or Service name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: '100%', padding: '0.8rem 1.25rem', borderRadius: '12px', border: '1px solid #d1d5db', fontSize: '1rem', outline: 'none', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}
          />
        </div>
      )}

      <div className="dashboard-grid single-column" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {bookings.length === 0 ? (
          <div className="empty-state" style={{ background: '#fff', borderRadius: '16px', padding: '4rem 2rem', border: '1px dashed #d1d5db', textAlign: 'center', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
            <span style={{ fontSize: '4rem', display: 'block', marginBottom: '1rem', opacity: 0.5 }}>📅</span>
            <h3 style={{ fontSize: '1.5rem', color: '#374151', marginBottom: '0.5rem' }}>No bookings yet</h3>
            <p style={{ color: '#6b7280', marginBottom: '2rem' }}>You haven't requested any services so far. Ready to get started?</p>
            <button className="btn btn-primary" onClick={() => navigate('/services')} style={{ padding: '0.75rem 2rem', fontSize: '1.1rem', borderRadius: '9999px', boxShadow: '0 4px 14px 0 rgba(79, 70, 229, 0.39)' }}>
              Explore Services
            </button>
          </div>
        ) : (
          filteredBookings.map((b) => (
            <div key={b._id} className="item-card" style={{ padding: '1.5rem', border: '1px solid #f3f4f6', borderRadius: '16px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.025)', backgroundColor: '#fff', transition: 'transform 0.2s ease, box-shadow 0.2s ease' }}>
              <div className="item-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid #f3f4f6' }}>
                <h4 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '700', color: '#111827' }}>
                  {b.serviceId?.title || 'Unknown Service'}
                </h4>
                <span className={`status-badge status-${b.status.toLowerCase()}`} style={{ fontSize: '0.75rem', padding: '0.4rem 0.8rem', borderRadius: '9999px', fontWeight: '700' }}>
                  {b.status}
                </span>
              </div>

              <div className="item-details" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ fontSize: '1.5rem' }}>👤</div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#6b7280', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.05em' }}>Provider</div>
                    <div style={{ color: '#1f2937', fontWeight: '600' }}>{b.providerId?.name || 'Assigned soon'}</div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ fontSize: '1.5rem' }}>📅</div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#6b7280', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.05em' }}>Date & Time</div>
                    <div style={{ color: '#1f2937', fontWeight: '600' }}>{b.date} • {b.time}</div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  {/* width: '40px', height: '40px', borderRadius: '10px', background: '#fce7f3', display: 'flex', alignItems: 'center', justifyContent: 'center',  */}
                  <div style={{ fontSize: '1.5rem' }}>📍</div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#6b7280', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.05em' }}>Location</div>
                    <div style={{ color: '#1f2937', fontWeight: '600', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '180px' }} title={b.service_address || b.address || 'Address not provided'}>
                      {b.service_address || b.address || 'Address not provided'}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '24px' }}>₹</div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#6b7280', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.05em' }}>Total Cost</div>
                    <div style={{ color: '#059669', fontWeight: '800', fontSize: '1.1rem' }}>Rs. {b.price || b.totalCost || b.serviceId?.price || 0}</div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#374151', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '24px' }}>₹</div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#6b7280', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.05em' }}>Payment</div>
                    <div style={{ color: b.payment?.paymentStatus === 'completed' ? '#10b981' : '#ef4444', fontWeight: '800', textTransform: 'capitalize' }}>
                      {b.payment?.paymentStatus || 'pending'} <span style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: '600' }}>via {b.payment?.paymentMethod || 'cash'}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card-actions" style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px dashed #e5e7eb', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                {b.status.toLowerCase() === 'completed' && (
                  <button className="btn btn-primary" onClick={() => handleLeaveReview(b._id)} style={{ padding: '0.6rem 1.5rem', borderRadius: '8px', fontWeight: '600', boxShadow: '0 4px 6px -1px rgba(79, 70, 229, 0.2), 0 2px 4px -1px rgba(79, 70, 229, 0.1)' }}>
                    Leave a Review ⭐
                  </button>
                )}
                {b.status.toLowerCase() === 'pending' && (
                  <button className="btn btn-secondary" disabled style={{ padding: '0.6rem 1.5rem', borderRadius: '8px', fontWeight: '600', opacity: 0.6, cursor: 'not-allowed', border: '1px solid #d1d5db' }}>
                    Awaiting Provider ⏳
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default MyBookings;
