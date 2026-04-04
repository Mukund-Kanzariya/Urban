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
        .catch(() => {}); // Silently fail if profile doesn't exist yet
    }
  }, [token]);

  const handleLogout = () => {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    setDropdownOpen(false);
    navigate('/login');
  };

  // Generate initials avatar from name
  const getInitials = (name = '') => {
    const parts = name.trim().split(' ');
    return parts.length >= 2
      ? (parts[0][0] + parts[1][0]).toUpperCase()
      : name.slice(0, 2).toUpperCase();
  };

  // Pick avatar background based on role
  const roleColors = {
    admin:    '#4f46e5',
    provider: '#059669',
    customer: '#0284c7',
  };
  const avatarBg = user ? (roleColors[user.role] || '#6b7280') : '#6b7280';

  // Determine what to render as the avatar
  const renderAvatar = (size = '') => {
    const sizeClass = size === 'lg' ? 'nav-avatar nav-avatar-lg' : 'nav-avatar';

    if (profilePic) {
      return (
        <img
          src={profilePic}
          alt={user?.name || 'User'}
          className={`${sizeClass} nav-avatar-img`}
        />
      );
    }

    return (
      <span className={sizeClass} style={{ background: avatarBg }}>
        {getInitials(user?.name)}
      </span>
    );
  };

  return (
    <nav className="navbar top-navbar">
      <h2 className="brand-logo"><Link to="/">LocalService</Link></h2>

      <div className="nav-links">
        <Link to="/"        className="nav-link">Home</Link>
        <Link to="/services" className="nav-link">Services</Link>
        <Link to="/about"   className="nav-link">About Us</Link>
        <Link to="/contact" className="nav-link">Contact Us</Link>

        <div className="nav-divider" />

        {token && user ? (
          <>
            {/* Dashboard button */}
            <Link to={`/dashboard/${user.role}`} className="nav-btn-primary">
              Dashboard
            </Link>

            {/* Profile Avatar with dropdown */}
            <div className="nav-avatar-wrapper" ref={dropdownRef}>
              <button
                className="nav-avatar-btn"
                onClick={() => setDropdownOpen((prev) => !prev)}
                aria-label="User menu"
                aria-expanded={dropdownOpen}
              >
                {renderAvatar()}
              </button>

              {dropdownOpen && (
                <div className="nav-dropdown">
                  {/* User info header */}
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

                  <Link
                    to="/profile"
                    className="nav-dropdown-item"
                    onClick={() => setDropdownOpen(false)}
                  >
                    <span className="nav-dropdown-icon">👤</span>My Profile
                  </Link>

                  <div className="nav-dropdown-divider" />

                  <button className="nav-dropdown-item nav-dropdown-logout" onClick={handleLogout}>
                    <span className="nav-dropdown-icon">🚪</span>Logout
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <Link to="/login"    className="nav-link">Login</Link>
            <Link to="/register" className="nav-btn-primary">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
