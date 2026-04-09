import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../../css/Dashboards.css';

function AdminDashboard() {
  const [data, setData] = useState({ users: [], services: [], bookings: [], contacts: [], reviews: [], categories: [] });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('metrics');
  const user = JSON.parse(sessionStorage.getItem('user')) || {};
  const navigate = useNavigate();

  // ─── Modal State ───────────────────────────────────────────────
  const [modal, setModal] = useState(null); // { type: 'user'|'service'|'review', data: {...} }
  const [modalForm, setModalForm] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user.role !== 'admin' && user.role !== 'super_admin') { navigate('/'); return; }
    fetchData();
  }, [navigate]);

  const fetchData = async () => {
    try {
      setLoading(true);
      console.log('Fetching all dashboard data...');
      
      const results = await Promise.allSettled([
        axios.get('/api/users'),       // 0
        axios.get('/api/services'),    // 1
        axios.get('/api/bookings'),    // 2
        axios.get('/api/contacts'),    // 3
        axios.get('/api/reviews/all'), // 4
        axios.get('/api/categories')   // 5
      ]);

      const newData = {
        users: results[0].status === 'fulfilled' ? results[0].value.data : [],
        services: results[1].status === 'fulfilled' ? results[1].value.data : [],
        bookings: results[2].status === 'fulfilled' ? results[2].value.data : [],
        contacts: results[3].status === 'fulfilled' ? results[3].value.data : [],
        reviews: results[4].status === 'fulfilled' ? results[4].value.data : [],
        categories: results[5].status === 'fulfilled' ? results[5].value.data : []
      };

      // Check if critical data failed
      if (results[0].status === 'rejected') {
        console.error('CRITICAL: Failed to load users', results[0].reason);
      }

      setData(newData);
      setLoading(false);
    } catch (err) {
      console.error('Fatal error in Admin Dashboard fetchData:', err);
      setLoading(false);
    }
  };

  // ─── Open / Close Modal ─────────────────────────────────────────
  const openModal = (type, item) => {
    setModal({ type, data: item });
    if (type === 'addUser') setModalForm({ name: '', email: '', password: '', role: 'customer' });
    if (type === 'user')    setModalForm({ name: item.name, role: item.role });
    if (type === 'service') setModalForm({ title: item.title, category: item.category, price: item.price, location: item.location });
    if (type === 'review')  setModalForm({ rating: item.rating, comment: item.comment });
    if (type === 'category') setModalForm({ name: item.name || '', description: item.description || '' });
  };

  const closeModal = () => { setModal(null); setModalForm({}); };

  // ─── Save (PUT / POST) ──────────────────────────────────────────────────
  const handleSave = async () => {
    if (!modal) return;
    setSaving(true);
    try {
      const { type, data: item } = modal;
      if (type === 'addUser') await axios.post('/api/users', modalForm);
      if (type === 'user')    await axios.put(`/api/users/${item._id}`, modalForm);
      if (type === 'service') await axios.put(`/api/services/${item._id}`, modalForm);
      if (type === 'review')  await axios.put(`/api/reviews/${item._id}`, modalForm);
      if (type === 'category') {
        if (item?._id) await axios.put(`/api/categories/${item._id}`, modalForm);
        else await axios.post('/api/categories', modalForm);
      }
      fetchData();
      closeModal();
    } catch (err) {
      alert('Failed to update. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // ─── Delete Handlers ─────────────────────────────────────────────
  const deleteUser = async (id) => {
    if (window.confirm('Delete this user permanently?')) {
      try { await axios.delete(`/api/users/${id}`); fetchData(); }
      catch { alert('Failed to delete user'); }
    }
  };
  const deleteService = async (id) => {
    if (window.confirm('Delete this service permanently?')) {
      try { await axios.delete(`/api/services/${id}`); fetchData(); }
      catch { alert('Failed to delete service'); }
    }
  };
  const deleteContact = async (id) => {
    if (window.confirm('Delete this message permanently?')) {
      try { await axios.delete(`/api/contacts/${id}`); fetchData(); }
      catch { alert('Failed to delete message'); }
    }
  };
  const deleteReview = async (id) => {
    if (window.confirm('Delete this review permanently?')) {
      try { await axios.delete(`/api/reviews/${id}`); fetchData(); }
      catch { alert('Failed to delete review'); }
    }
  };
  const deleteCategory = async (id) => {
    if (window.confirm('Delete this category? Services using this category may be affected.')) {
      try { await axios.delete(`/api/categories/${id}`); fetchData(); }
      catch { alert('Failed to delete category'); }
    }
  };

  if (loading) return <div className="loading-spinner">Loading Admin Panel...</div>;

  return (
    <div className="admin-container">

      {/* ── Update Modal ── */}
      {modal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                {modal.type === 'addUser' && '➕ Add User'}
                {modal.type === 'user'    && '✏️ Update User'}
                {modal.type === 'service' && '✏️ Update Service'}
                {modal.type === 'review'  && '✏️ Update Review'}
                {modal.type === 'category' && (modal.data?._id ? '✏️ Update Category' : '➕ Add New Category')}
              </h3>
              <button className="modal-close" onClick={closeModal}>✕</button>
            </div>

            <div className="modal-body">
              {/* ADD USER FORM */}
              {modal.type === 'addUser' && (
                <>
                  <div className="modal-field">
                    <label>Name</label>
                    <input type="text" value={modalForm.name || ''}
                      onChange={(e) => setModalForm({ ...modalForm, name: e.target.value })} />
                  </div>
                  <div className="modal-field">
                    <label>Email</label>
                    <input type="email" value={modalForm.email || ''}
                      onChange={(e) => setModalForm({ ...modalForm, email: e.target.value })} />
                  </div>
                  <div className="modal-field">
                    <label>Password</label>
                    <input type="password" value={modalForm.password || ''}
                      onChange={(e) => setModalForm({ ...modalForm, password: e.target.value })} />
                  </div>
                  <div className="modal-field">
                    <label>Role</label>
                    <select value={modalForm.role || 'customer'}
                      onChange={(e) => setModalForm({ ...modalForm, role: e.target.value })}>
                      <option value="customer">Customer</option>
                      <option value="provider">Provider</option>
                      <option value="admin">Admin</option>
                      {user.role === 'super_admin' && <option value="super_admin">Super Admin</option>}
                    </select>
                  </div>
                </>
              )}

              {/* USER FORM */}
              {modal.type === 'user' && (
                <>
                  <div className="modal-field">
                    <label>Name</label>
                    <input type="text" value={modalForm.name || ''}
                      onChange={(e) => setModalForm({ ...modalForm, name: e.target.value })} />
                  </div>
                  <div className="modal-field">
                    <label>Role</label>
                    <select value={modalForm.role || 'customer'}
                      onChange={(e) => setModalForm({ ...modalForm, role: e.target.value })}>
                      <option value="customer">Customer</option>
                      <option value="provider">Provider</option>
                      <option value="admin">Admin</option>
                      {user.role === 'super_admin' && <option value="super_admin">Super Admin</option>}
                    </select>
                  </div>
                </>
              )}

              {/* SERVICE FORM */}
              {modal.type === 'service' && (
                <>
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
                    <label>Price ($)</label>
                    <input type="number" value={modalForm.price || ''}
                      onChange={(e) => setModalForm({ ...modalForm, price: e.target.value })} />
                  </div>
                  <div className="modal-field">
                    <label>Location</label>
                    <input type="text" value={modalForm.location || ''}
                      onChange={(e) => setModalForm({ ...modalForm, location: e.target.value })} />
                  </div>
                </>
              )}

              {/* REVIEW FORM */}
              {modal.type === 'review' && (
                <>
                  <div className="modal-field">
                    <label>Rating (1–5)</label>
                    <select value={modalForm.rating || 5}
                      onChange={(e) => setModalForm({ ...modalForm, rating: Number(e.target.value) })}>
                      {[1,2,3,4,5].map(n => <option key={n} value={n}>{n} ★</option>)}
                    </select>
                  </div>
                  <div className="modal-field">
                    <label>Comment</label>
                    <textarea rows={4} value={modalForm.comment || ''}
                      onChange={(e) => setModalForm({ ...modalForm, comment: e.target.value })} />
                  </div>
                </>
              )}

              {/* CATEGORY FORM */}
              {modal.type === 'category' && (
                <>
                  <div className="modal-field">
                    <label>Category Name</label>
                    <input type="text" placeholder="e.g. Plumbing" value={modalForm.name || ''}
                      onChange={(e) => setModalForm({ ...modalForm, name: e.target.value })} />
                  </div>
                  <div className="modal-field">
                    <label>Description</label>
                    <textarea rows={3} placeholder="Brief description..." value={modalForm.description || ''}
                      onChange={(e) => setModalForm({ ...modalForm, description: e.target.value })} />
                  </div>
                </>
              )}
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

      {/* ── Header & Tabs ── */}
      <header className="admin-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={{ margin: 0 }}>Admin Control Center</h2>
          {user.role === 'super_admin' && (
            <span style={{ 
              background: 'linear-gradient(135deg, #6366f1, #4f46e5)', 
              color: 'white', 
              padding: '0.4rem 1rem', 
              borderRadius: '100px', 
              fontSize: '0.75rem', 
              fontWeight: '800', 
              textTransform: 'uppercase',
              boxShadow: '0 4px 6px rgba(99, 102, 241, 0.2)'
            }}>
              Super Admin Mode
            </span>
          )}
        </div>
        <div className="admin-tabs">
          <button className={`tab ${activeTab === 'metrics'  ? 'active' : ''}`} onClick={() => setActiveTab('metrics')}>Overview</button>
          <button className={`tab ${activeTab === 'users'    ? 'active' : ''}`} onClick={() => setActiveTab('users')}>Users</button>
          <button className={`tab ${activeTab === 'services' ? 'active' : ''}`} onClick={() => setActiveTab('services')}>Services</button>
          <button className={`tab ${activeTab === 'bookings' ? 'active' : ''}`} onClick={() => setActiveTab('bookings')}>Bookings</button>
          <button className={`tab ${activeTab === 'categories' ? 'active' : ''}`} onClick={() => setActiveTab('categories')}>Categories</button>
          <button className={`tab ${activeTab === 'contacts' ? 'active' : ''}`} onClick={() => setActiveTab('contacts')}>Messages</button>
          <button className={`tab ${activeTab === 'reviews'  ? 'active' : ''}`} onClick={() => setActiveTab('reviews')}>Reviews</button>
        </div>
      </header>

      <div className="admin-content">

        {/* ── Metrics Overview ── */}
        {activeTab === 'metrics' && (
          <div className="metrics-grid">
            <div className="metric-card"><h3>Total Users</h3><p className="metric-number">{data.users.length}</p></div>
            <div className="metric-card"><h3>Total Services</h3><p className="metric-number">{data.services.length}</p></div>
            <div className="metric-card"><h3>Total Categories</h3><p className="metric-number">{data.categories.length}</p></div>
            <div className="metric-card"><h3>Total Bookings</h3><p className="metric-number">{data.bookings.length}</p></div>
            <div className="metric-card"><h3>Total Reviews</h3><p className="metric-number">{data.reviews.length}</p></div>
          </div>
        )}

        {/* ── Users Table ── */}
        {activeTab === 'users' && (
          <div className="data-table-container">
            {user.role === 'super_admin' && (
              <div style={{ padding: '1rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end' }}>
                <button className="btn btn-primary btn-sm" onClick={() => openModal('addUser', null)}>➕ Add User</button>
              </div>
            )}
            <table className="data-table">
                <thead>
                  <tr>
                    <th className="avatar-cell">Photo</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    {user.role === 'super_admin' && <th style={{ textAlign: 'right' }}>Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {data.users.map(u => (
                    <tr key={u._id}>
                      <td className="avatar-cell">
                        {u.profilePicture ? (
                          <img src={u.profilePicture} alt="" className="table-avatar-img" />
                        ) : (
                          <div className="table-avatar" style={{ background: u.role === 'admin' ? '#4f46e5' : (u.role === 'provider' ? '#10b981' : '#3b82f6') }}>
                            {u.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </td>
                      <td style={{ fontWeight: '500' }}>{u.name}</td>
                      <td>{u.email}</td>
                      <td><span className={`role-badge role-${u.role}`}>{u.role}</span></td>
                      {user.role === 'super_admin' && (
                        <td className="action-cell" style={{ justifyContent: 'flex-end' }}>
                          <button className="btn btn-warning btn-sm" onClick={() => openModal('user', u)}>Update</button>
                          <button className="btn btn-danger btn-sm"  onClick={() => deleteUser(u._id)}>Delete</button>
                        </td>
                      )}
                    </tr>
                  ))}
                  {data.users.length === 0 && (
                    <tr><td colSpan={user.role === 'super_admin' ? "5" : "4"} className="empty-state" style={{ textAlign: 'center', padding: '2rem' }}>No users found or error fetching users.</td></tr>
                  )}
                </tbody>
            </table>
          </div>
        )}

        {/* ── Services Table ── */}
        {activeTab === 'services' && (
          <div className="data-table-container">
            <table className="data-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Provider</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.services.map(s => (
                    <tr key={s._id}>
                      <td style={{ fontWeight: '500' }}>{s.title}</td>
                      <td>{s.category}</td>
                      <td>${s.price}</td>
                      <td>
                        <div className="info-with-photo">
                          {s.providerPhoto ? (
                            <img src={s.providerPhoto} alt="" className="table-avatar-img" />
                          ) : (
                            <div className="table-avatar" style={{ background: '#10b981' }}>
                              {(s.providerName || 'P').charAt(0).toUpperCase()}
                            </div>
                          )}
                          <span>{s.providerName}</span>
                        </div>
                      </td>
                      <td className="action-cell">
                        <button className="btn btn-warning btn-sm" onClick={() => openModal('service', s)}>Update</button>
                        <button className="btn btn-danger btn-sm"  onClick={() => deleteService(s._id)}>Delete</button>
                      </td>
                    </tr>
                  ))}
                  {data.services.length === 0 && (
                    <tr><td colSpan="5" className="empty-state" style={{ textAlign: 'center', padding: '2rem' }}>No services found or error fetching services.</td></tr>
                  )}
                </tbody>
            </table>
          </div>
        )}

        {/* ── Bookings Table ── */}
        {activeTab === 'bookings' && (
          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Service</th>
                  <th>Customer</th>
                  <th>Provider</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {data.bookings.map(b => (
                  <tr key={b._id}>
                    <td>{b.serviceId?.title}</td>
                    <td>
                      <div className="info-with-photo">
                        {b.customerId?.profilePicture ? (
                          <img src={b.customerId.profilePicture} alt="" className="table-avatar-img" />
                        ) : (
                          <div className="table-avatar" style={{ background: '#3b82f6' }}>
                            {(b.customerId?.name || 'C').charAt(0).toUpperCase()}
                          </div>
                        )}
                        <span>{b.customerId?.name}</span>
                      </div>
                    </td>
                    <td>{b.providerId?.name}</td>
                    <td>{b.date} {b.time}</td>
                    <td><span className={`status-badge status-${b.status.toLowerCase()}`}>{b.status}</span></td>
                  </tr>
                ))}
                {data.bookings.length === 0 && (
                  <tr><td colSpan="5" className="empty-state" style={{ textAlign: 'center', padding: '2rem' }}>No bookings found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* ── Contacts Table ── */}
        {activeTab === 'contacts' && (
          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr><th>Date</th><th>Name</th><th>Email</th><th>Message</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {data.contacts.map(c => (
                  <tr key={c._id}>
                    <td>{new Date(c.createdAt).toLocaleDateString()}</td>
                    <td>{c.name}</td>
                    <td><a href={`mailto:${c.email}`} className="text-primary">{c.email}</a></td>
                    <td style={{ maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.message}</td>
                    <td className="action-cell">
                      <button className="btn btn-danger btn-sm" onClick={() => deleteContact(c._id)}>Delete</button>
                    </td>
                  </tr>
                ))}
                {data.contacts.length === 0 && (
                  <tr><td colSpan="5" className="empty-state">No messages received yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* ── Reviews Table ── */}
        {activeTab === 'reviews' && (
          <div className="data-table-container">
            <table className="data-table">
                <thead>
                  <tr>
                    <th className="avatar-cell">Photo</th>
                    <th>Customer</th>
                    <th>Service</th>
                    <th>Provider</th>
                    <th>Rating</th>
                    <th>Comment</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.reviews.map(r => (
                    <tr key={r._id}>
                      <td className="avatar-cell">
                        {r.customerId?.profilePicture ? (
                          <img src={r.customerId.profilePicture} alt="" className="table-avatar-img" />
                        ) : (
                          <div className="table-avatar" style={{ background: '#3b82f6' }}>
                            {(r.customerId?.name || 'C').charAt(0).toUpperCase()}
                          </div>
                        )}
                      </td>
                      <td style={{ fontWeight: '500' }}>{r.customerId?.name || 'Unknown'}</td>
                      <td>{r.bookingId?.serviceId?.title || 'Unknown'}</td>
                      <td>{r.bookingId?.providerId?.name || 'Unknown'}</td>
                      <td style={{ color: '#fbbf24', fontSize: '1.1rem' }}>{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</td>
                      <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.comment}</td>
                      <td className="action-cell">
                        <button className="btn btn-danger btn-sm"  onClick={() => deleteReview(r._id)}>Delete</button>
                      </td>
                    </tr>
                  ))}
                  {data.reviews.length === 0 && (
                    <tr><td colSpan="7" className="empty-state">No reviews have been written yet.</td></tr>
                  )}
                </tbody>
            </table>
          </div>
        )}

        {/* ── Categories Table ── */}
        {activeTab === 'categories' && (
          <div className="data-table-container">
            <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '1rem' }}>
              <button className="btn btn-primary" onClick={() => openModal('category', {})}>
                ➕ Add New Category
              </button>
            </div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Category Name</th>
                  <th>Description</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.categories.map(c => (
                  <tr key={c._id}>
                    <td style={{ fontWeight: '700' }}>{c.name}</td>
                    <td style={{ color: '#666' }}>{c.description || 'No description'}</td>
                    <td className="action-cell">
                      <button className="btn btn-warning btn-sm" onClick={() => openModal('category', c)}>Update</button>
                      <button className="btn btn-danger btn-sm" onClick={() => deleteCategory(c._id)}>Delete</button>
                    </td>
                  </tr>
                ))}
                {data.categories.length === 0 && (
                  <tr><td colSpan="3" className="empty-state">No categories found. Add your first one!</td></tr>
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
