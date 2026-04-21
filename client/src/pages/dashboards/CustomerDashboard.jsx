import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../../css/Dashboards.css';

function CustomerDashboard() {
  const [bookings, setBookings] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(sessionStorage.getItem('user')) || {};
  const navigate = useNavigate();

  useEffect(() => {
    if (user.role !== 'customer') {
      navigate('/');
      return;
    }
    fetchData();
  }, [navigate]);

  const fetchData = async () => {
    try {
      const [bookingsRes, servicesRes] = await Promise.all([
        axios.get('/api/bookings'),
        axios.get('/api/services')
      ]);
      setBookings(bookingsRes.data.sort((a, b) => {
        if (a.createdAt && b.createdAt) return new Date(b.createdAt) - new Date(a.createdAt);
        return new Date(b.date + ' ' + b.time) - new Date(a.date + ' ' + a.time);
      }));
      setServices(servicesRes.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching dashboard data');
      setLoading(false);
    }
  };

  const handleBookService = async (serviceId, providerId) => {
    try {
      const date = prompt('Enter Date (YYYY-MM-DD):');
      const time = prompt('Enter Time (HH:MM AM/PM):');
      if (!date || !time) return;

      await axios.post('/api/bookings', { serviceId, providerId, date, time });
      alert('Service Booked Successfully!');
      fetchData(); // Refresh bookings
    } catch (error) {
       alert(error.response?.data?.error || 'Failed to book service');
    }
  };

  const handleLeaveReview = (bookingId) => {
    // Beautifully redirect them to our brand new dedicated review page
    navigate(`/add-review/${bookingId}`);
  };

  if (loading) return <div className="loading-spinner">Loading Dashboard...</div>;

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h2>Customer Dashboard</h2>
        <p>Welcome back, <span className="highlight-text">{user.name}</span>!</p>
      </header>
      
      <div className="dashboard-grid">
        {/* Active Bookings Section */}
        <section className="dashboard-card main-section">
          <h3>Your Bookings</h3>
          {bookings.length === 0 ? (
            <p className="empty-state">You have no active bookings.</p>
          ) : (
            <div className="list-grid">
              {bookings.map((b) => (
                 <div key={b._id} className="item-card">
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                    {b.serviceId?.image && (
                      <img src={b.serviceId.image} alt="" style={{ width: '60px', height: '60px', borderRadius: '8px', objectFit: 'cover' }} />
                    )}
                    <div style={{ flex: 1 }}>
                      <h4 style={{ margin: 0 }}>{b.serviceId?.title}</h4>
                      <div className="item-details" style={{ marginTop: '0.5rem' }}>
                        <p style={{ margin: '0.2rem 0' }}><strong>Provider:</strong> {b.providerId?.name}</p>
                        <p style={{ margin: '0.2rem 0' }}><strong>Date & Time:</strong> {b.date} at {b.time}</p>
                        <p style={{ margin: '0.2rem 0' }}><strong>Price:</strong> Rs. {b.serviceId?.price || b.price}</p>
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                    <span className={`status-badge status-${b.status.toLowerCase()}`}>{b.status}</span>
                    {b.status.toLowerCase() === 'completed' && (
                        <button className="btn btn-primary btn-sm" onClick={() => handleLeaveReview(b._id)}>
                          Leave a Review
                        </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Available Services Section */}
        <section className="dashboard-card side-section">
          <h3>Available Services to Book</h3>
          <div className="list-grid mini">
            {services.map(s => (
              <div key={s._id} className="item-card mini-card">
                  <div className="mini-card-header" style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    {s.image && (
                      <img src={s.image} alt="" style={{ width: '40px', height: '40px', borderRadius: '4px', objectFit: 'cover' }} />
                    )}
                    <h4 style={{ margin: 0, flex: 1 }}>{s.title} <span style={{ float: 'right' }}>Rs. {s.price}</span></h4>
                  </div>
                 <p className="small-text">{s.providerId?.name} - {s.location}</p>
                 <button className="btn btn-primary btn-sm" onClick={() => handleBookService(s._id, s.providerId?._id)}>
                   Book Now
                 </button>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

export default CustomerDashboard;
