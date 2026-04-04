import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../css/Navbar.css';

function Navbar() {
  const navigate = useNavigate();
  const token = sessionStorage.getItem('token');
  const user = JSON.parse(sessionStorage.getItem('user')) || null;

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [profilePic, setProfilePic] = useState('');
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch profile picture on mount when user is logged in
  useEffect(() => {
    if (token && user) {
      axios.get('/api/profiles/me')
        .then(res => {
          if (res.data.profilePicture) {
            setProfilePic(res.data.profilePicture);
          }
        })
        .catch(() => {});
    }
  }, [token]);

  const handleLogout = () => {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    setDropdownOpen(false);
    navigate('/login');
  };

  const getInitials = (name = '') => {
    const parts = name.trim().split(' ');
    return parts.length >= 2
      ? (parts[0][0] + parts[1][0]).toUpperCase()
      : name.slice(0, 2).toUpperCase();
  };

  const roleColors = {
    admin:    '#4f46e5',
    provider: '#10b981',
    customer: '#3b82f6',
  };
  const avatarBg = user ? (roleColors[user.role] || '#6b7280') : '#6b7280';

  const renderAvatar = (size = '') => {
    const sizeClass = size === 'lg' ? 'nav-avatar nav-avatar-lg' : 'nav-avatar';
    if (profilePic) {
      return <img src={profilePic} alt="" className={`${sizeClass} nav-avatar-img`} />;
    }
    return (
      <span className={sizeClass} style={{ background: avatarBg }}>
        {getInitials(user?.name)}
      </span>
    );
  };

  return (
    <nav className="navbar top-navbar">
      <h2 className="brand-logo">
        <Link to="/">
          <svg className="logo-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2L2 7l10 5 10-5-10-5z"/>
            <path d="M22 10V6a2 2 0 0 0-2-2h-4"/>
            <path d="M2 14v4a2 2 0 0 0 2 2h4"/>
            <rect x="9" y="11" width="6" height="6" rx="1"/>
            <path d="M12 17v4"/>
          </svg>
          Service<span style={{ color: 'var(--primary)' }}>Hub</span>
        </Link>
      </h2>

      <div className="nav-links">
        <Link to="/" className="nav-link">Home</Link>
        <Link to="/services" className="nav-link">Services</Link>
        <Link to="/about" className="nav-link">About Us</Link>
        <Link to="/contact" className="nav-link">Contact Us</Link>

        <div className="nav-divider" />

        {token && user ? (
          <>
            <Link to={`/dashboard/${user.role}`} className="nav-btn-primary">
              Dashboard
            </Link>

            <div className="nav-avatar-wrapper" ref={dropdownRef}>
              <button
                className="nav-avatar-btn"
                onClick={() => setDropdownOpen((prev) => !prev)}
                aria-haspopup="true"
                aria-expanded={dropdownOpen}
              >
                {renderAvatar()}
              </button>

              {dropdownOpen && (
                <div className="nav-dropdown animate-dropdown">
                  <div className="nav-dropdown-header">
                    {renderAvatar('lg')}
                    <div className="nav-dropdown-info">
                      <span className="nav-dropdown-name">{user.name}</span>
                      <span className={`nav-dropdown-role role-pill role-${user.role}`}>
                        {user.role}
                      </span>
                    </div>
                  </div>

                  <div className="nav-dropdown-divider" />

                  <Link to="/profile" className="nav-dropdown-item" onClick={() => setDropdownOpen(false)}>
                    <svg className="dropdown-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                    </svg>
                    My Profile
                  </Link>

                  <div className="nav-dropdown-divider" />

                  <button className="nav-dropdown-item nav-dropdown-logout" onClick={handleLogout}>
                    <svg className="dropdown-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
                    </svg>
                    Logout
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <Link to="/login" className="nav-link">Login</Link>
            <Link to="/register" className="nav-btn-primary">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
