import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import '../css/Auth.css';
function Login() {
  // We use state to store exactly what the user is typing into the inputs
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  // This function runs only when "Submit" is clicked
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevents the browser from doing a full page reload automatically
    
    try {
      // 1. Send our email and password to Express
      const response = await axios.post('/api/auth/login', { email, password });
      
      // 2. The server responds with our Token! Let's securely save it locally
      sessionStorage.setItem('token', response.data.token);
      sessionStorage.setItem('user', JSON.stringify(response.data.user)); // Also save name/role
      
      // 3. Immediately redirect to Dashboard, and force hard refresh to update Navbar
      navigate(`/dashboard/${response.data.user.role}`);
      window.location.reload(); 
    } catch (err) {
      setError(err.response?.data?.error || 'Login Failed. Check credentials.');
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-header">
          <h2>Welcome Back</h2>
          <p>Sign in to your account</p>
        </div>
        {location.state?.message && (
          <div style={{ backgroundColor: '#e0f2fe', color: '#0369a1', padding: '0.75rem', borderRadius: '8px', border: '1px solid #bae6fd', textAlign: 'center', marginBottom: '1.5rem', fontWeight: '500' }}>
            {location.state.message}
          </div>
        )}
        {error && <p className="error-message">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email Address</label>
            {/* The onChange fires off every time they press a key, updating our state! */}
            <input 
               type="email" 
               value={email} 
               onChange={(e) => setEmail(e.target.value)} 
               required 
               placeholder="name@example.com"
            />
          </div>
          
          <div className="form-group">
            <label>Password</label>
            <input 
               type="password" 
               value={password} 
               onChange={(e) => setPassword(e.target.value)} 
               required 
               placeholder="••••••••"
            />
          </div>
          
          <button type="submit" className="btn btn-primary auth-submit">Login</button>
        </form>
      </div>
    </div>
  );
}

export default Login;
