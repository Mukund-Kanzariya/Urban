import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../css/Dashboards.css';

function Profile() {
  const [profile, setProfile] = useState({
    phone: '',
    address: '',
    city: '',
    bio: '',
    serviceCategory: '',
    hourlyRate: '',
    price_per_hour: 0,
    experienceYears: '',
    preferredContact: 'Email',
    department: '',
    availability_status: 'available',
    is_verified: false,
    profilePicture: '',
    password: '',
    confirmPassword: ''
  });
  const [baseUser, setBaseUser] = useState({ name: '', email: '', role: '' });
  const [status, setStatus] = useState({ type: '', msg: '' });
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [file, setFile] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    if (!sessionStorage.getItem('token')) {
      navigate('/login');
      return;
    }

    const fetchProfile = async () => {
      try {
        const response = await axios.get('/api/profiles/me');
        const data = response.data;

        if (data.userId) {
          setBaseUser({
            id: data.userId._id,
            name: data.userId.name,
            email: data.userId.email,
            role: data.userId.role
          });
        }

        setProfile({
          phone: data.phone || '',
          address: data.address || '',
          city: data.city || '',
          bio: data.bio || '',
          serviceCategory: data.serviceCategory || '',
          hourlyRate: data.hourlyRate || '',
          price_per_hour: data.price_per_hour || 0,
          experienceYears: data.experienceYears || '',
          preferredContact: data.preferredContact || 'Email',
          department: data.department || '',
          availability_status: data.availability_status || 'available',
          is_verified: data.is_verified || false,
          profilePicture: data.profilePicture || '',
          password: '',
          confirmPassword: ''
        });

        setLoading(false);
      } catch (err) {
        setStatus({ type: 'error', msg: 'Failed to load profile data.' });
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  const handleChange = (e) => {
    const val = e.target.type === 'number' ? parseFloat(e.target.value) : e.target.value;
    setProfile({ ...profile, [e.target.name]: val });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Safety check for matching passwords
    if (profile.password && profile.password !== profile.confirmPassword) {
      return setStatus({ type: 'error', msg: 'New passwords do not match!' });
    }

    setStatus({ type: 'loading', msg: 'Saving changes...' });

    try {
      const formData = new FormData();
      Object.keys(profile).forEach((key) => {
        if (key === 'password' && profile[key] === '') return; // Don't send empty password
        formData.append(key, profile[key]);
      });
      if (file) {
        formData.append('profilePicture', file);
      }

      const res = await axios.put('/api/profiles/me', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      if (res.data.profilePicture) {
        setProfile(prev => ({...prev, profilePicture: res.data.profilePicture}));
      }

      setStatus({ type: 'success', msg: 'Profile updated successfully!' });
      setIsEditing(false);
      setTimeout(() => setStatus({ type: '', msg: '' }), 3000);
    } catch (err) {
      setStatus({ type: 'error', msg: err.response?.data?.message || 'Failed to update profile.' });
    }
  };

  if (loading) return <div className="loading-spinner">Loading Profile...</div>;

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h2>My Profile</h2>
        <p>Manage your account settings and professional details.</p>
      </header>

      <div className="dashboard-grid center-form">
        <section className="dashboard-card" style={{ maxWidth: '850px', margin: '0 auto', width: '100%' }}>

          {status.msg && (
            <div style={{
              padding: '1rem', marginBottom: '1.5rem', borderRadius: '8px', textAlign: 'center',
              backgroundColor: status.type === 'success' ? '#d1fae5' : (status.type === 'error' ? '#fee2e2' : '#e0f2fe'),
              color: status.type === 'success' ? '#065f46' : (status.type === 'error' ? '#991b1b' : '#0369a1')
            }}>
              {status.msg}
            </div>
          )}

          {!isEditing ? (
            <div className="profile-view-mode">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border)', paddingBottom: '1.5rem', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                  {profile.profilePicture ? (
                    <img 
                      src={profile.profilePicture} 
                      alt="Profile" 
                      style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover', border: '4px solid #fff', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} 
                    />
                  ) : (
                    <div style={{
                      width: '100px', height: '100px', borderRadius: '50%', backgroundColor: '#0ea5e9', color: 'white',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', fontWeight: 'bold'
                    }}>
                      {baseUser.name ? baseUser.name.charAt(0).toUpperCase() : '?'}
                    </div>
                  )}
                  <div>
                    <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.6rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      {baseUser.name}
                      {profile.is_verified && (
                        <span title="Verified Professional" style={{ color: '#0ea5e9', fontSize: '1.2rem' }}>
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
                        </span>
                      )}
                    </h3>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                      <span className={`role-badge role-${baseUser.role}`}>{baseUser.role}</span>
                      {baseUser.role === 'provider' && (
                        <span className={`status-pill status-${profile.availability_status}`} style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem', borderRadius: '100px', background: '#f1f5f9', fontWeight: '700', textTransform: 'uppercase' }}>
                          {profile.availability_status}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <button className="btn btn-primary" onClick={() => setIsEditing(true)}>Edit Profile</button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '2rem' }}>
                <div className="info-group">
                  <label>Email Address</label>
                  <p>{baseUser.email}</p>
                </div>
                <div className="info-group">
                  <label>Phone Number</label>
                  <p>{profile.phone || 'Not provided'}</p>
                </div>
                <div className="info-group" style={{ gridColumn: '1 / -1' }}>
                  <label>Complete Address</label>
                  <p>{profile.address || 'Not provided'}</p>
                </div>
                <div className="info-group" style={{ gridColumn: '1 / -1' }}>
                  <label>City</label>
                  <p>{profile.city || 'Not provided'}</p>
                </div>
                
                {baseUser.role === 'provider' && (
                  <>
                    <h4 style={{ gridColumn: '1 / -1', marginTop: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>Professional Capabilities</h4>
                    <div className="info-group">
                      <label>Category</label>
                      <p>{profile.serviceCategory || 'Not set'}</p>
                    </div>
                    <div className="info-group">
                      <label>Price Per Hour</label>
                      <p>{profile.price_per_hour ? `Rs. ${profile.price_per_hour}` : 'Not set'}</p>
                    </div>
                    <div className="info-group">
                      <label>Experience</label>
                      <p>{profile.experienceYears ? `${profile.experienceYears} Years` : 'Not set'}</p>
                    </div>
                    <div className="info-group">
                      <label>Total Rating</label>
                      <p>{profile.rating > 0 ? `⭐ ${profile.rating} (${profile.total_reviews} reviews)` : 'No ratings yet'}</p>
                    </div>
                  </>
                )}
                
                <div className="info-group" style={{ gridColumn: '1 / -1' }}>
                  <label>Professional Bio</label>
                  <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border)', lineHeight: '1.6' }}>
                    {profile.bio || 'Please update your bio to help customers know you better.'}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="profile-edit-form">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h3 style={{ margin: 0 }}>Edit Your Details</h3>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setIsEditing(false)}>Cancel</button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Phone Number</label>
                  <input type="text" name="phone" value={profile.phone} onChange={handleChange} placeholder="+91 99999 99999" />
                </div>
                <div className="form-group">
                  <label>City</label>
                  <input type="text" name="city" value={profile.city} onChange={handleChange} placeholder="Mumbai" />
                </div>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label>Full Address</label>
                  <input type="text" name="address" value={profile.address} onChange={handleChange} placeholder="House No, Street Name..." />
                </div>
                <div className="form-group">
                  <label>Profile Picture</label>
                  <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files[0])} />
                </div>
                
                <div className="form-group">
                  <label>Change Security Password</label>
                  <input 
                    type="password" 
                    name="password" 
                    value={profile.password} 
                    onChange={handleChange} 
                    placeholder="Enter new password (optional)" 
                  />
                </div>
                <div className="form-group">
                  <label>Confirm New Password</label>
                  <input 
                    type="password" 
                    name="confirmPassword" 
                    value={profile.confirmPassword || ''} 
                    onChange={handleChange} 
                    placeholder="Confirm new password" 
                  />
                </div>

                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label>Professional Bio</label>
                  <textarea name="bio" value={profile.bio} onChange={handleChange} placeholder="Tell us about yourself..." style={{ minHeight: '100px' }}></textarea>
                </div>
                
                {baseUser.role === 'provider' && (
                  <>
                    <h4 style={{ gridColumn: '1 / -1', marginTop: '1rem' }}>Expert Settings</h4>
                    <div className="form-group">
                      <label>Availability Status</label>
                      <select name="availability_status" value={profile.availability_status} onChange={handleChange}>
                        <option value="available">Available Now</option>
                        <option value="busy">Busy (In Progress)</option>
                        <option value="offline">Currently Offline</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Price Per Hour (Rs.)</label>
                      <input type="number" name="price_per_hour" value={profile.price_per_hour} onChange={handleChange} />
                    </div>
                    <div className="form-group">
                      <label>Experience (Years)</label>
                      <input type="text" name="experienceYears" value={profile.experienceYears} onChange={handleChange} />
                    </div>
                    <div className="form-group">
                      <label>Service Category</label>
                      <input type="text" name="serviceCategory" value={profile.serviceCategory} onChange={handleChange} />
                    </div>
                  </>
                )}
              </div>

              <button type="submit" className="btn btn-primary w-100" style={{ marginTop: '2rem', padding: '0.85rem' }} disabled={status.type === 'loading'}>
                {status.type === 'loading' ? 'Processing...' : 'Securely Save All Changes'}
              </button>
            </form>
          )}
        </section>
      </div>
      <style>{`
        .info-group label { color: var(--text-muted); font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 700; margin-bottom: 0.25rem; display: block; }
        .info-group p { font-size: 1.1rem; color: var(--text-dark); font-weight: 500; margin: 0; }
        .status-available { color: #10b981; }
        .status-busy { color: #f59e0b; }
        .status-offline { color: #6b7280; }
      `}</style>
    </div>
  );
}

export default Profile;
