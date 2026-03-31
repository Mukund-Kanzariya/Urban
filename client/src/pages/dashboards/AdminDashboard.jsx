import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../../css/Dashboards.css';

function AdminDashboard() {
  const [data, setData] = useState({ users: [], services: [], bookings: [], contacts: [] });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('metrics'); // metrics, users, services, bookings
  const user = JSON.parse(sessionStorage.getItem('user')) || {};
  const navigate = useNavigate();

  useEffect(() => {
    if (user.role !== 'admin') {
      navigate('/');
      return;
    }
    fetchData();
  }, [navigate]);

  const fetchData = async () => {
    try {
      const [usersRes, servicesRes, bookingsRes, contactsRes] = await Promise.all([
        axios.get('/api/users'),
        axios.get('/api/services'),
        axios.get('/api/bookings'),
        axios.get('/api/contacts')
      ]);
      setData({
        users: usersRes.data,
        services: servicesRes.data,
        bookings: bookingsRes.data,
        contacts: contactsRes.data
      });
      setLoading(false);
    } catch (err) {
      console.error('Error fetching admin data');
      setLoading(false);
    }
  };

  const deleteUser = async (id) => {
    if (window.confirm('Delete this user permanently?')) {
      try {
        await axios.delete(`/api/users/${id}`);
        fetchData();
      } catch (err) { alert('Failed to delete user'); }
    }
  };

  const deleteService = async (id) => {
    if (window.confirm('Delete this service permanently?')) {
      try {
        await axios.delete(`/api/services/${id}`);
        fetchData();
      } catch (err) { alert('Failed to delete service'); }
    }
  };

  const deleteContact = async (id) => {
    if (window.confirm('Delete this message permanently?')) {
      try {
        await axios.delete(`/api/contacts/${id}`);
        fetchData();
      } catch (err) { alert('Failed to delete message'); }
    }
  };

  if (loading) return <div className="loading-spinner">Loading Admin Panel...</div>;

  return (
    <div className="admin-container">
      <header className="admin-header">
        <h2>Admin Control Center</h2>
        <div className="admin-tabs">
          <button className={`tab ${activeTab === 'metrics' ? 'active' : ''}`} onClick={() => setActiveTab('metrics')}>Overview</button>
          <button className={`tab ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')}>Users</button>
          <button className={`tab ${activeTab === 'services' ? 'active' : ''}`} onClick={() => setActiveTab('services')}>Services</button>
          <button className={`tab ${activeTab === 'bookings' ? 'active' : ''}`} onClick={() => setActiveTab('bookings')}>Bookings</button>
          <button className={`tab ${activeTab === 'contacts' ? 'active' : ''}`} onClick={() => setActiveTab('contacts')}>Messages</button>
        </div>
      </header>

      <div className="admin-content">
        {/* Metrics Overview */}
        {activeTab === 'metrics' && (
          <div className="metrics-grid">
            <div className="metric-card">
              <h3>Total Users</h3>
              <p className="metric-number">{data.users.length}</p>
            </div>
            <div className="metric-card">
              <h3>Total Services</h3>
              <p className="metric-number">{data.services.length}</p>
            </div>
            <div className="metric-card">
              <h3>Total Bookings</h3>
              <p className="metric-number">{data.bookings.length}</p>
            </div>
          </div>
        )}

        {/* Users Table */}
        {activeTab === 'users' && (
          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th><th>Email</th><th>Role</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.users.map(u => (
                  <tr key={u._id}>
                    <td>{u.name}</td><td>{u.email}</td><td><span className={`role-badge role-${u.role}`}>{u.role}</span></td>
                    <td><button className="btn btn-danger btn-sm" onClick={() => deleteUser(u._id)}>Delete</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Services Table */}
        {activeTab === 'services' && (
          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Title</th><th>Category</th><th>Price</th><th>Provider</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.services.map(s => (
                  <tr key={s._id}>
                    <td>{s.title}</td><td>{s.category}</td><td>${s.price}</td><td>{s.providerId?.name}</td>
                    <td><button className="btn btn-danger btn-sm" onClick={() => deleteService(s._id)}>Delete</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Bookings Table */}
        {activeTab === 'bookings' && (
          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Service</th><th>Customer</th><th>Provider</th><th>Date</th><th>Status</th>
                </tr>
              </thead>
              <tbody>
                {data.bookings.map(b => (
                  <tr key={b._id}>
                    <td>{b.serviceId?.title}</td>
                    <td>{b.customerId?.name}</td>
                    <td>{b.providerId?.name}</td>
                    <td>{b.date} {b.time}</td>
                    <td><span className={`status-badge status-${b.status.toLowerCase()}`}>{b.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Contacts Table */}
        {activeTab === 'contacts' && (
          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th><th>Name</th><th>Email</th><th>Message</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.contacts.map(c => (
                  <tr key={c._id}>
                    <td>{new Date(c.createdAt).toLocaleDateString()}</td>
                    <td>{c.name}</td>
                    <td><a href={`mailto:${c.email}`} className="text-primary">{c.email}</a></td>
                    <td style={{ maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.message}</td>
                    <td><button className="btn btn-danger btn-sm" onClick={() => deleteContact(c._id)}>Delete</button></td>
                  </tr>
                ))}
                {data.contacts.length === 0 && (
                  <tr><td colSpan="5" className="empty-state">No messages received yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;
