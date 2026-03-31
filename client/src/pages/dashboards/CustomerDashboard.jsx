import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../../css/Dashboards.css';

function CustomerDashboard() {
  const [bookings, setBookings] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem('user')) || {};
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
      setBookings(bookingsRes.data);
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
                  <h4>{b.serviceId?.title}</h4>
                  <div className="item-details">
                    <p><strong>Provider:</strong> {b.providerId?.name}</p>
                    <p><strong>Date & Time:</strong> {b.date} at {b.time}</p>
                    <p><strong>Price:</strong> ${b.serviceId?.price}</p>
                    <span className={`status-badge status-${b.status.toLowerCase()}`}>{b.status}</span>
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
                 <div className="mini-card-header">
                   <h4>{s.title} <span>${s.price}</span></h4>
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
