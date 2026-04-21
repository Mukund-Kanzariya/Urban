import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../../css/Dashboards.css';

function ProviderDashboard() {
  const [data, setData] = useState({ bookings: [], services: [], reviews: [], categories: [] });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('metrics'); // metrics, requests, services, add-service, reviews
  const [availability, setAvailability] = useState('available');
  const user = JSON.parse(sessionStorage.getItem('user')) || {};
  const navigate = useNavigate();

  const [newService, setNewService] = useState({
    title: '', category: '', price: '', location: '', image: null
  });

  // ─── Update Modal State ─────────────────────────────────────────
  const [modal, setModal] = useState(null);  // { data: service }
  
  const getInitials = (name = '') => {
    if (!name) return '?';
    const parts = name.trim().split(/\s+/);
    return parts.length >= 2
      ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
      : name.slice(0, 2).toUpperCase();
  };
  const [modalForm, setModalForm] = useState({});
  const [saving, setSaving] = useState(false);

  const openModal = (service) => {
    setModal({ data: service });
    setModalForm({ 
      title: service.title, 
      category: service.category, 
      price: service.price, 
      location: service.location,
      image: null // New file if user selects one
    });
  };
  const closeModal = () => { setModal(null); setModalForm({}); };

  const handleSave = async () => {
    if (!modal) return;
    setSaving(true);

    const formData = new FormData();
    formData.append('title', modalForm.title);
    formData.append('category', modalForm.category);
    formData.append('price', modalForm.price);
    formData.append('location', modalForm.location);
    if (modalForm.image) {
      formData.append('image', modalForm.image);
    }

    try {
      await axios.put(`/api/services/${modal.data._id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      fetchData();
      closeModal();
      alert('Service updated successfully!');
    } catch (err) {
      alert('Failed to update service');
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    if (user.role !== 'provider') {
      navigate('/');
      return;
    }
    fetchData();
  }, [navigate]);

  const fetchData = async () => {
    try {
      const [bookingsRes, servicesRes, reviewsRes, categoriesRes, profileRes] = await Promise.all([
        axios.get('/api/bookings'),
        axios.get('/api/services/provider'),
        axios.get('/api/reviews/provider'),
        axios.get('/api/categories'),
        axios.get('/api/profiles/me')
      ]);
      setData({
        bookings: bookingsRes.data.sort((a, b) => {
          if (a.createdAt && b.createdAt) return new Date(b.createdAt) - new Date(a.createdAt);
          return new Date(b.date + ' ' + b.time) - new Date(a.date + ' ' + a.time);
        }),
        services: servicesRes.data,
        reviews: reviewsRes.data,
        categories: categoriesRes.data
      });
      setAvailability(profileRes.data.availability_status || 'available');
      setLoading(false);
    } catch (err) {
      console.error('Error fetching dashboard data');
      setLoading(false);
    }
  };

  const toggleAvailability = async () => {
    const newStatus = availability === 'available' ? 'offline' : 'available';
    try {
      await axios.put('/api/profiles/me', { availability_status: newStatus });
      setAvailability(newStatus);
    } catch (err) {
      alert('Failed to update availability status');
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
    const formData = new FormData();
    formData.append('title', newService.title);
    formData.append('category', newService.category);
    formData.append('price', newService.price);
    formData.append('location', newService.location);
    if (newService.image) {
      formData.append('image', newService.image);
    }

    try {
      await axios.post('/api/services', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setNewService({ title: '', category: '', price: '', location: '', image: null });
      fetchData(); // Refresh services automatically
      alert('Service added successfully!');
      setActiveTab('services'); // Auto-switch back to services list
    } catch (err) {
      alert('Failed to create service');
    }
  };

  const deleteService = async (id) => {
    if (window.confirm('Delete this listing permanently?')) {
      try {
        await axios.delete(`/api/services/${id}`);
        fetchData();
      } catch (err) { alert('Failed to delete service'); }
    }
  };

  if (loading) return <div className="loading-spinner">Loading Dashboard...</div>;

  // Calculate Average Rating
  const avgRating = data.reviews.length > 0
    ? (data.reviews.reduce((acc, r) => acc + r.rating, 0) / data.reviews.length).toFixed(1)
    : 'New';

  // Calculate Total Provider Earnings dynamically
  const totalEarnings = data.bookings
    .filter(b => b.status === 'completed')
    .reduce((acc, b) => acc + (b.provider_earns || b.providerEarn || 0), 0)
    .toFixed(2);

  return (
    <div className="admin-container">

      {/* ── Update Service Modal ── */}
      {modal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>✏️ Update Service</h3>
              <button className="modal-close" onClick={closeModal}>✕</button>
            </div>
            <div className="modal-body">
              <div className="modal-field">
                <label>Title</label>
                <input type="text" value={modalForm.title || ''}
                  onChange={(e) => setModalForm({ ...modalForm, title: e.target.value })} />
              </div>
              <div className="modal-field">
                <label>Category</label>
                <select value={modalForm.category || ''}
                  onChange={(e) => setModalForm({ ...modalForm, category: e.target.value })}>
                  <option value="">Select Category</option>
                  {data.categories.map(c => (
                    <option key={c._id} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="modal-field">
                <label>Price (Rs.)</label>
                <input type="number" value={modalForm.price || ''}
                  onChange={(e) => setModalForm({ ...modalForm, price: e.target.value })} />
              </div>
              <div className="modal-field">
                <label>Location</label>
                <input type="text" value={modalForm.location || ''}
                  onChange={(e) => setModalForm({ ...modalForm, location: e.target.value })} />
              </div>
              <div className="modal-field">
                <label>Update Service Image</label>
                <input type="file" accept="image/*"
                  onChange={(e) => setModalForm({ ...modalForm, image: e.target.files[0] })} />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary btn-sm" onClick={closeModal}>Cancel</button>
              <button className="btn btn-primary btn-sm" onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
      <header className="admin-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2>Provider Workspace</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{
              fontWeight: '600',
              fontSize: '0.9rem',
              color: availability === 'available' ? 'var(--success)' : 'var(--text-muted)'
            }}>
              {availability === 'available' ? '🟢 Accepting Jobs' : '🔴 Offline'}
            </span>
            <label style={{
              position: 'relative',
              display: 'inline-block',
              width: '50px',
              height: '24px',
              cursor: 'pointer'
            }}>
              <input
                type="checkbox"
                checked={availability === 'available'}
                onChange={toggleAvailability}
                style={{ opacity: 0, width: 0, height: 0 }}
              />
              <span style={{
                position: 'absolute',
                cursor: 'pointer',
                top: 0, left: 0, right: 0, bottom: 0,
                backgroundColor: availability === 'available' ? 'var(--success)' : 'var(--border)',
                transition: '.3s',
                borderRadius: '34px'
              }}>
                <span style={{
                  position: 'absolute',
                  content: '""',
                  height: '18px', width: '18px',
                  left: availability === 'available' ? '28px' : '3px',
                  bottom: '3px',
                  backgroundColor: 'white',
                  transition: '.3s',
                  borderRadius: '50%'
                }} />
              </span>
            </label>
          </div>
        </div>
        <div className="admin-tabs">
          <button className={`tab ${activeTab === 'metrics' ? 'active' : ''}`} onClick={() => setActiveTab('metrics')}>Overview</button>
          <button className={`tab ${activeTab === 'requests' ? 'active' : ''}`} onClick={() => setActiveTab('requests')}>Job Requests</button>
          <button className={`tab ${activeTab === 'services' ? 'active' : ''}`} onClick={() => setActiveTab('services')}>Your Services</button>
          <button className={`tab ${activeTab === 'add-service' ? 'active' : ''}`} onClick={() => setActiveTab('add-service')}>Add Service</button>
          <button className={`tab ${activeTab === 'reviews' ? 'active' : ''}`} onClick={() => setActiveTab('reviews')}>Ratings</button>
        </div>
      </header>

      <div className="admin-content">
        {/* Metrics Overview */}
        {activeTab === 'metrics' && (
          <div className="metrics-grid">
            <div className="metric-card">
              <h3>Total Jobs Assigned</h3>
              <p className="metric-number">{data.bookings.length}</p>
            </div>
            <div className="metric-card">
              <h3>Active Services</h3>
              <p className="metric-number">{data.services.length}</p>
            </div>
            <div className="metric-card">
              <h3>Average Rating</h3>
              <p className="metric-number" style={{ color: '#fbbf24' }}>
                {avgRating} {avgRating !== 'New' && <span style={{ fontSize: '1.5rem' }}>★</span>}
              </p>
            </div>
            <div className="metric-card">
              <h3>Total Earnings</h3>
              <p className="metric-number" style={{ color: '#10b981' }}>Rs. {totalEarnings}</p>
            </div>
          </div>
        )}

        {/* Requests Table */}
        {activeTab === 'requests' && (
          <div className="dashboard-card main-section" style={{ gridColumn: '1 / -1', padding: '1rem' }}>
            <h3>Incoming & Active Requests</h3>
            {data.bookings.length === 0 ? (
              <p className="empty-state">No jobs assigned yet.</p>
            ) : (
              <div className="list-grid">
                {data.bookings.map((b) => (
                  <div key={b._id} className="item-card">
                    <div className="job-card-header">
                      <h4>{b.serviceId?.title}</h4>
                      <span className={`status-badge status-${b.status.toLowerCase()}`}>{b.status}</span>
                    </div>
                    <div className="item-details" style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.5rem' }}>
                      <div className="table-avatar" style={{ width: '40px', height: '40px', background: '#3b82f6', fontSize: '0.9rem' }}>
                        {getInitials(b.customerId?.name)}
                      </div>
                      <div>
                        <p style={{ margin: 0 }}><strong>Customer:</strong> {b.customerId?.name}</p>
                        <p style={{ margin: '0.2rem 0', fontSize: '0.9rem' }}><strong>Address:</strong> {b.service_address || b.address || 'Address not provided'}</p>
                        <p style={{ margin: 0, fontSize: '0.85rem' }}>{b.date} at {b.time}</p>
                        <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem' }}>
                          Price: Rs. {b.price || b.totalCost || b.serviceId?.price || 0} <span style={{ color: '#d1d5db', margin: '0 4px' }}>|</span>
                          <span style={{ color: '#10b981', fontWeight: 'bold' }}>Your Earnings: Rs. {b.provider_earns || b.providerEarn || ((b.price || b.totalCost || b.serviceId?.price || 0) * 0.8).toFixed(2)}</span>
                        </p>
                        <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', color: '#6b7280', textTransform: 'capitalize' }}>
                          <strong>Payment:</strong> <span style={{ color: b.payment?.paymentStatus === 'completed' ? '#10b981' : '#ef4444', fontWeight: 'bold' }}>{b.payment?.paymentStatus || 'pending'}</span> <span style={{fontSize: '0.75rem'}}>(via {b.payment?.paymentMethod || 'cash'})</span>
                        </p>
                      </div>
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
          </div>
        )}

        {/* Services Table */}
        {activeTab === 'services' && (
          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th className="avatar-cell">Photo</th>
                  <th>Title</th><th>Category</th><th>Price</th><th>Location</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.services.map(s => (
                  <tr key={s._id}>
                    <td className="avatar-cell">
                      <div className="table-avatar" style={{ background: '#10b981', overflow: 'hidden' }}>
                        {s.image ? (
                          <img src={s.image} alt={s.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          getInitials(s.providerName || user.name)
                        )}
                      </div>
                    </td>
                    <td>{s.title}</td><td>{s.category}</td><td>Rs. {s.price}</td><td>{s.location}</td>
                    <td className="action-cell">
                      <button className="btn btn-warning btn-sm" onClick={() => openModal(s)}>Update</button>
                      <button className="btn btn-danger btn-sm" onClick={() => deleteService(s._id)}>Delete</button>
                    </td>
                  </tr>
                ))}
                {data.services.length === 0 && (
                  <tr><td colSpan="5" className="empty-state">You haven't listed any services yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Add Service Block */}
        {activeTab === 'add-service' && (
          <div className="dashboard-card" style={{ maxWidth: '600px', margin: '0 auto', gridColumn: '1 / -1' }}>
            <h3 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>Create a New Service Listing</h3>
            <form onSubmit={handleCreateService}>
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label>Service Title</label>
                <input type="text" placeholder="e.g., Fix Leaky Pipe" required
                  style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--border)', borderRadius: '8px' }}
                  value={newService.title} onChange={(e) => setNewService({ ...newService, title: e.target.value })} />
              </div>
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label>Category</label>
                <select value={newService.category} onChange={(e) => setNewService({ ...newService, category: e.target.value })}
                  required
                  style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--border)', borderRadius: '8px' }}>
                  <option value="">Select Category</option>
                  {data.categories.map(c => (
                    <option key={c._id} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label>Price (Rs.)</label>
                <input type="number" placeholder="e.g., 1500" required
                  style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--border)', borderRadius: '8px' }}
                  value={newService.price} onChange={(e) => setNewService({ ...newService, price: e.target.value })} />
              </div>
              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label>Service Location</label>
                <input type="text" placeholder="e.g., Downtown Area" required
                  style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--border)', borderRadius: '8px' }}
                  value={newService.location} onChange={(e) => setNewService({ ...newService, location: e.target.value })} />
              </div>
              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label>Service Image (Optional)</label>
                <input type="file" accept="image/*"
                  style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--border)', borderRadius: '8px' }}
                  onChange={(e) => setNewService({ ...newService, image: e.target.files[0] })} />
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '1rem', fontSize: '1.1rem' }}>Post Service Securely</button>
            </form>
          </div>
        )}

        {/* Reviews Table */}
        {activeTab === 'reviews' && (
          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Job / Service</th><th>Customer</th><th>Rating</th><th>Comment</th>
                </tr>
              </thead>
              <tbody>
                {data.reviews.map(r => (
                  <tr key={r._id}>
                    <td>{r.bookingId?.serviceId?.title || 'Unknown Job'}</td>
                    <td>{r.customerId?.name || 'Unknown'}</td>
                    <td style={{ color: '#fbbf24', fontSize: '1.2rem', whiteSpace: 'nowrap' }}>
                      {'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}
                    </td>
                    <td style={{ maxWidth: '400px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.comment}</td>
                  </tr>
                ))}
                {data.reviews.length === 0 && (
                  <tr><td colSpan="4" className="empty-state">No ratings received yet. Provide great service to get reviews!</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProviderDashboard;
