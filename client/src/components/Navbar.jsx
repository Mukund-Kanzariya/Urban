// Step 6: Navbar Component
import React from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Tools to navigate between URLs
import '../css/Navbar.css';

function Navbar() {
  const navigate = useNavigate();
  // We check sessionStorage to see if a token exists for a logged-in user
  const token = sessionStorage.getItem('token'); 

  const user = JSON.parse(sessionStorage.getItem('user')) || null;

  // Simple function to destroy the session
  const handleLogout = () => {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    navigate('/login'); // Redirect them!
  };

  return (
    <nav className="navbar top-navbar">
      <h2 className="brand-logo"><Link to="/">LocalService</Link></h2>
      
      <div className="nav-links">
        <Link to="/" className="nav-link">Home</Link>
        <Link to="/services" className="nav-link">Services</Link>
        <Link to="/about" className="nav-link">About Us</Link>
        <Link to="/contact" className="nav-link">Contact Us</Link>
        <div style={{ marginLeft: '1rem', borderLeft: '1px solid var(--border)', height: '20px' }}></div>
        {/* Conditional Rendering: Show different links based on whether the token exists */}
        {token && user ? (
           <>
             <Link to={`/dashboard/${user.role}`} className="nav-link nav-btn-primary">Dashboard</Link>
             <Link to="/profile" className="nav-link" style={{ fontWeight: '600' }}>My Profile</Link>
             <button onClick={handleLogout} className="btn-logout">Logout</button>
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
