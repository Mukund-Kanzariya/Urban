import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../../css/Dashboards.css';

function ProviderDashboard() {
  const [bookings, setBookings] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(sessionStorage.getItem('user')) || {};
  const navigate = useNavigate();

  const [newService, setNewService] = useState({
    title: '', category: 'Plumbing', price: '', location: ''
  });

  useEffect(() => {
    if (user.role !== 'provider') {
      navigate('/');
      return;
    }
    fetchData();
  }, [navigate]);

  const fetchData = async () => {
    try {
      const [bookingsRes, servicesRes] = await Promise.all([
        axios.get('/api/bookings'),
        axios.get('/api/services/provider')
      ]);
      setBookings(bookingsRes.data);
      setServices(servicesRes.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching dashboard data');
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await axios.put(`/api/bookings/${id}/status`, { status });
      fetchData(); // Refresh list automatically
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const handleCreateService = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/services', newService);
      setNewService({ title: '', category: 'Plumbing', price: '', location: '' });
      fetchData(); // Refresh services automatically
      alert('Service added!');
    } catch (err) {
      alert('Failed to create service');
    }
  };

  if (loading) return <div className="loading-spinner">Loading Dashboard...</div>;

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h2>Provider Workspace</h2>
        <p>Manage your services and incoming jobs, <span className="highlight-text">{user.name}</span>.</p>
      </header>
      
      <div className="dashboard-grid">
        {/* Bookings Queue */}
        <section className="dashboard-card main-section">
          <h3>Your Job Queue</h3>
          {bookings.length === 0 ? (
            <p className="empty-state">No jobs assigned yet.</p>
          ) : (
            <div className="list-grid">
              {bookings.map((b) => (
                <div key={b._id} className="item-card">
                  <div className="job-card-header">
                    <h4>{b.serviceId?.title}</h4>
                    <span className={`status-badge status-${b.status.toLowerCase()}`}>{b.status}</span>
                  </div>
                  <div className="item-details">
                    <p><strong>Customer:</strong> {b.customerId?.name}</p>
                    <p><strong>Scheduled:</strong> {b.date} at {b.time}</p>
                  </div>
                  <div className="action-buttons">
                    {b.status === 'pending' && (
                      <>
                        <button className="btn btn-success btn-sm" onClick={() => updateStatus(b._id, 'accepted')}>Accept</button>
                        <button className="btn btn-danger btn-sm" onClick={() => updateStatus(b._id, 'rejected')}>Reject</button>
                      </>
                    )}
                    {b.status === 'accepted' && (
                      <button className="btn btn-primary btn-sm" onClick={() => updateStatus(b._id, 'completed')}>Mark Completed</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Services Management */}
        <section className="dashboard-card side-section">
          <div className="add-service-form">
            <h3>Add New Service</h3>
            <form onSubmit={handleCreateService}>
              <div className="input-group">
                <input type="text" placeholder="Service Title (e.g., Fix Leaky Pipe)" required
                  value={newService.title} onChange={(e) => setNewService({...newService, title: e.target.value})} />
              </div>
              <div className="input-group">
                <select value={newService.category} onChange={(e) => setNewService({...newService, category: e.target.value})}>
                  <option value="Plumbing">Plumbing</option>
                  <option value="Electrical">Electrical</option>
                  <option value="Cleaning">Cleaning</option>
                  <option value="Carpentry">Carpentry</option>
                </select>
              </div>
              <div className="input-group">
                <input type="number" placeholder="Price ($)" required
                  value={newService.price} onChange={(e) => setNewService({...newService, price: e.target.value})} />
              </div>
              <div className="input-group">
                <input type="text" placeholder="Location (e.g., Downtown)" required
                  value={newService.location} onChange={(e) => setNewService({...newService, location: e.target.value})} />
              </div>
              <button type="submit" className="btn btn-primary w-100">Post Service</button>
            </form>
          </div>

          <div className="my-services-list mt-20">
            <h3>Your Listed Services</h3>
            {services.map(s => (
              <div key={s._id} className="mini-card">
                 <span>{s.title}</span>
                 <strong className="text-primary">${s.price}</strong>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

export default ProviderDashboard;
