import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../css/Dashboards.css'; // Leverage existing dashboard styles!

function Profile() {
  const [profile, setProfile] = useState({
    phone: '',
    address: '',
    city: '',
    bio: '',
    serviceCategory: '',
    hourlyRate: '',
    experienceYears: '',
    preferredContact: 'Email',
    department: '',
    profilePicture: ''
  });
  const [baseUser, setBaseUser] = useState({ name: '', email: '', role: '' });
  const [status, setStatus] = useState({ type: '', msg: '' });
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [file, setFile] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    // If no token exists, immediately kick them out to login!
    if (!sessionStorage.getItem('token')) {
      navigate('/login');
      return;
    }

    // Fetch their profile. The backend will automatically create one if it's their first time here.
    const fetchProfile = async () => {
      try {
        const response = await axios.get('/api/profiles/me');
        const data = response.data;

        // Extract the base user fields populated from the User collection
        if (data.userId) {
          setBaseUser({
            id: data.userId._id,
            name: data.userId.name,
            email: data.userId.email,
            role: data.userId.role
          });
        }

        // Extract the mutable profile fields
        setProfile({
          phone: data.phone || '',
          address: data.address || '',
          city: data.city || '',
          bio: data.bio || '',
          serviceCategory: data.serviceCategory || '',
          hourlyRate: data.hourlyRate || '',
          experienceYears: data.experienceYears || '',
          preferredContact: data.preferredContact || 'Email',
          department: data.department || '',
          profilePicture: data.profilePicture || ''
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
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: 'loading', msg: 'Saving changes...' });

    try {
      // Build FormData for multipart request
      const formData = new FormData();
      Object.keys(profile).forEach((key) => {
        formData.append(key, profile[key]);
      });
      // Append the physical file buffer if they chose one
      if (file) {
        formData.append('profilePicture', file);
      }

      const res = await axios.put('/api/profiles/me', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      // Update our local state with the exact URL mapped by the server
      if (res.data.profilePicture) {
        setProfile(prev => ({...prev, profilePicture: res.data.profilePicture}));
      }

      setStatus({ type: 'success', msg: 'Profile updated successfully!' });
      setIsEditing(false);

      // Clear success message after 3 seconds
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
        <p>Manage your account settings and personal details.</p>
      </header>

      <div className="dashboard-grid center-form">
        <section className="dashboard-card" style={{ maxWidth: '800px', margin: '0 auto', width: '100%' }}>

          {/* Status Messages */}
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
                      src={`http://localhost:5000${profile.profilePicture}`} 
                      alt="Profile" 
                      style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }} 
                    />
                  ) : (
                    <div style={{
                      width: '80px',
                      height: '80px',
                      borderRadius: '50%',
                      backgroundColor: '#0ea5e9',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '2rem',
                      fontWeight: 'bold',
                      boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                    }}>
                      {baseUser.name ? baseUser.name.charAt(0).toUpperCase() : '?'}
                    </div>
                  )}
                  <div>
                    <h3 style={{ margin: '0 0 0.25rem 0', fontSize: '1.5rem' }}>Account Overview</h3>
                    <p style={{ margin: 0, color: 'var(--text-muted)' }}>
                      Joined {baseUser.id ? new Date(parseInt(baseUser.id.substring(0, 8), 16) * 1000).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'Recently'}
                    </p>
                  </div>
                </div>
                <button className="btn btn-primary btn-sm" onClick={() => setIsEditing(true)}>Edit Profile</button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
                <div>
                  <label style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Full Name</label>
                  <p style={{ fontSize: '1.1rem', fontWeight: '500', color: 'var(--text-dark)', marginTop: '0.25rem' }}>{baseUser.name}</p>
                </div>
                <div>
                  <label style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Email Address</label>
                  <p style={{ fontSize: '1.1rem', fontWeight: '500', color: 'var(--text-dark)', marginTop: '0.25rem' }}>{baseUser.email}</p>
                </div>
                <div>
                  <label style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Account Role</label>
                  <p style={{ fontSize: '1.1rem', fontWeight: '500', color: 'var(--text-dark)', marginTop: '0.25rem' }}>
                    <span className={`role-badge role-${baseUser.role}`}>{baseUser.role}</span>
                  </p>
                </div>
                <div>
                  <label style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Phone Number</label>
                  <p style={{ fontSize: '1.1rem', fontWeight: '500', color: profile.phone ? 'var(--text-dark)' : 'var(--text-muted)', marginTop: '0.25rem' }}>
                    {profile.phone || 'Not provided'}
                  </p>
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Location</label>
                  <p style={{ fontSize: '1.1rem', fontWeight: '500', color: (profile.address || profile.city) ? 'var(--text-dark)' : 'var(--text-muted)', marginTop: '0.25rem' }}>
                    {profile.address || profile.city ? `${profile.address}${profile.address && profile.city ? ', ' : ''}${profile.city}` : 'Not provided'}
                  </p>
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>About Me</label>
                  <p style={{ fontSize: '1.05rem', lineHeight: '1.6', color: profile.bio ? 'var(--text-dark)' : 'var(--text-muted)', marginTop: '0.25rem', background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
                    {profile.bio || 'Tell us about yourself...'}
                  </p>
                </div>

                {/* Role Specific Data View */}
                {baseUser.role === 'provider' && (
                  <>
                    <h4 style={{ gridColumn: '1 / -1', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem', marginTop: '1rem' }}>Professional Details</h4>
                    <div>
                      <label style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Service Category</label>
                      <p style={{ fontSize: '1.1rem', fontWeight: '500', color: profile.serviceCategory ? 'var(--text-dark)' : 'var(--text-muted)', marginTop: '0.25rem' }}>{profile.serviceCategory || 'Not provided'}</p>
                    </div>
                    <div>
                      <label style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Hourly Rate</label>
                      <p style={{ fontSize: '1.1rem', fontWeight: '500', color: profile.hourlyRate ? 'var(--text-dark)' : 'var(--text-muted)', marginTop: '0.25rem' }}>{profile.hourlyRate ? `$${profile.hourlyRate}/hr` : 'Not provided'}</p>
                    </div>
                    <div>
                      <label style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Experience</label>
                      <p style={{ fontSize: '1.1rem', fontWeight: '500', color: profile.experienceYears ? 'var(--text-dark)' : 'var(--text-muted)', marginTop: '0.25rem' }}>{profile.experienceYears ? `${profile.experienceYears} Years` : 'Not provided'}</p>
                    </div>
                  </>
                )}

                {baseUser.role === 'customer' && (
                  <>
                    <h4 style={{ gridColumn: '1 / -1', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem', marginTop: '1rem' }}>Preferences</h4>
                    <div style={{ gridColumn: '1 / -1' }}>
                      <label style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Preferred Contact Method</label>
                      <p style={{ fontSize: '1.1rem', fontWeight: '500', color: profile.preferredContact ? 'var(--text-dark)' : 'var(--text-muted)', marginTop: '0.25rem' }}>{profile.preferredContact || 'Email'}</p>
                    </div>
                  </>
                )}

                {baseUser.role === 'admin' && (
                  <>
                    <h4 style={{ gridColumn: '1 / -1', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem', marginTop: '1rem' }}>Admin Details</h4>
                    <div style={{ gridColumn: '1 / -1' }}>
                      <label style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Department</label>
                      <p style={{ fontSize: '1.1rem', fontWeight: '500', color: profile.department ? 'var(--text-dark)' : 'var(--text-muted)', marginTop: '0.25rem' }}>{profile.department || 'Not specified'}</p>
                    </div>
                  </>
                )}

              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
                <h3 style={{ margin: 0 }}>Update Profile</h3>
                <button type="button" className="btn btn-sm" onClick={() => setIsEditing(false)}>Cancel</button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Full Name 🔒</label>
                  <input type="text" value={baseUser.name} disabled style={{ backgroundColor: '#f1f5f9', color: '#64748b' }} />
                </div>
                <div className="form-group">
                  <label>Email Address 🔒</label>
                  <input type="email" value={baseUser.email} disabled style={{ backgroundColor: '#f1f5f9', color: '#64748b' }} />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '2rem' }}>
                <label>Account Role 🔒</label>
                <input type="text" value={baseUser.role.toUpperCase()} disabled style={{ backgroundColor: '#f1f5f9', color: '#64748b', fontWeight: 'bold' }} />
              </div>

              <h4 style={{ marginBottom: '1rem', color: 'var(--text-dark)' }}>Public Details</h4>

              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label>Profile Photo</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={(e) => setFile(e.target.files[0])} 
                    style={{ padding: '0.5rem', background: '#f8fafc', border: '1px solid var(--border)', borderRadius: '6px', width: '100%' }}
                  />
                  {profile.profilePicture && !file && (
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>Current photo saved</span>
                  )}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Phone Number</label>
                  <input
                    type="text"
                    name="phone"
                    value={profile.phone}
                    onChange={handleChange}
                    placeholder="(123) 456-7890"
                  />
                </div>
                <div className="form-group">
                  <label>City</label>
                  <input
                    type="text"
                    name="city"
                    value={profile.city}
                    onChange={handleChange}
                    placeholder="New York, NY"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Full Address</label>
                <input
                  type="text"
                  name="address"
                  value={profile.address}
                  onChange={handleChange}
                  placeholder="123 Main St, Apt 4"
                />
              </div>

              <div className="form-group">
                <label>About Me (Bio)</label>
                <textarea
                  name="bio"
                  value={profile.bio}
                  onChange={handleChange}
                  placeholder="Tell us a bit about yourself..."
                  style={{ minHeight: '120px', resize: 'vertical' }}
                ></textarea>
              </div>

              {/* Role Specific Data Edit */}
              {baseUser.role === 'provider' && (
                <>
                  <h4 style={{ marginTop: '2rem', marginBottom: '1rem', color: 'var(--text-dark)' }}>Professional Details</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="form-group">
                      <label>Service Category</label>
                      <input type="text" name="serviceCategory" value={profile.serviceCategory} onChange={handleChange} placeholder="e.g. Plumbing, Cleaning" />
                    </div>
                    <div className="form-group">
                      <label>Hourly Rate ($)</label>
                      <input type="number" name="hourlyRate" value={profile.hourlyRate} onChange={handleChange} placeholder="e.g. 50" />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Years of Experience</label>
                    <input type="number" name="experienceYears" value={profile.experienceYears} onChange={handleChange} placeholder="e.g. 5" />
                  </div>
                </>
              )}

              {baseUser.role === 'customer' && (
                <>
                  <h4 style={{ marginTop: '2rem', marginBottom: '1rem', color: 'var(--text-dark)' }}>Preferences</h4>
                  <div className="form-group">
                    <label>Preferred Contact Method</label>
                    <select name="preferredContact" value={profile.preferredContact} onChange={handleChange} style={{ width: '100%', padding: '0.875rem' }}>
                      <option value="Email">Email</option>
                      <option value="Phone">Phone</option>
                      <option value="SMS">SMS / Text Message</option>
                    </select>
                  </div>
                </>
              )}

              {baseUser.role === 'admin' && (
                <>
                  <h4 style={{ marginTop: '2rem', marginBottom: '1rem', color: 'var(--text-dark)' }}>Admin Details</h4>
                  <div className="form-group">
                    <label>Department</label>
                    <input type="text" name="department" value={profile.department} onChange={handleChange} placeholder="e.g. Platform Security" />
                  </div>
                </>
              )}

              <button type="submit" className="btn btn-primary w-100" style={{ marginTop: '1rem', padding: '0.8rem' }} disabled={status.type === 'loading'}>
                {status.type === 'loading' ? 'Saving...' : 'Save Profile Changes'}
              </button>
            </form>
          )}
        </section>
      </div>
    </div>
  );
}

export default Profile;
