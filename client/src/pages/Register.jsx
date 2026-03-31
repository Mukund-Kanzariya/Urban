import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../css/Auth.css';

function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('customer');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // 1. Ask Express to safely register our new user in MongoDB!
      await axios.post('/api/auth/register', { name, email, password, role });
      
      // 2. Registration successful! Redirect them to the Login page automatically
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration Failed');
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-header">
          <h2>Create an Account</h2>
          <p>Join our platform today</p>
        </div>
        {error && <p className="error-message">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} required placeholder="John Doe" />
          </div>

          <div className="form-group">
            <label>Email Address</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="name@example.com" />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="••••••••" />
          </div>

          <div className="form-group">
            <label>I am a:</label>
            <select value={role} onChange={e => setRole(e.target.value)}>
              <option value="customer">Customer (Looking for services)</option>
              <option value="provider">Provider (Offering services)</option>
              <option value="admin">Admin (System Management)</option>
            </select>
          </div>

          <button type="submit" className="btn btn-primary auth-submit">Register Now</button>
        </form>
      </div>
    </div>
  );
}

export default Register;
