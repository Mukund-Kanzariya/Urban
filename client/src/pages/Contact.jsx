import React, { useState } from 'react';
import axios from 'axios';
import '../css/StaticPages.css';

function Contact() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState({ type: '', msg: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: 'loading', msg: 'Sending message...' });
    try {
      await axios.post('/api/contacts', formData);
      setStatus({ type: 'success', msg: 'Your message has been sent successfully!' });
      setFormData({ name: '', email: '', message: '' }); // Reset form
    } catch (err) {
      setStatus({ type: 'error', msg: 'Failed to send message. Please try again.' });
    }
  };

  return (
    <div className="static-page-container">
      <div className="static-header">
        <h1>Contact Us</h1>
        <p>Have a question or need support? Send us a message and our team will get back to you within 24 hours.</p>
      </div>

      <div className="contact-grid">
        <div className="contact-info">
          <h3>Get in Touch</h3>
          <div className="info-item">
            <h4>Customer Support</h4>
            <p>support@localservice.com</p>
            <p>+1 (800) 123-4567</p>
          </div>
          
          <div className="info-item">
            <h4>Business Hours</h4>
            <p>Monday - Friday</p>
            <p>9:00 AM - 6:00 PM (EST)</p>
          </div>

          <div className="info-item">
            <h4>Headquarters</h4>
            <p>123 Service Blvd, Suite 400</p>
            <p>New York, NY 10001</p>
          </div>
        </div>

        <div className="contact-form">
          <form onSubmit={handleSubmit}>
            {status.msg && (
              <div style={{
                padding: '1rem',
                marginBottom: '1rem',
                borderRadius: '8px',
                backgroundColor: status.type === 'success' ? '#d1fae5' : '#fee2e2',
                color: status.type === 'success' ? '#065f46' : '#991b1b',
              }}>
                {status.msg}
              </div>
            )}
            
            <div className="form-group">
              <label>Full Name</label>
              <input 
                type="text" 
                required 
                placeholder="John Doe"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>
            
            <div className="form-group">
              <label>Email Address</label>
              <input 
                type="email" 
                required 
                placeholder="name@example.com"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>
            
            <div className="form-group">
              <label>Message</label>
              <textarea 
                required 
                placeholder="How can we help you?"
                value={formData.message}
                onChange={(e) => setFormData({...formData, message: e.target.value})}
              ></textarea>
            </div>
            
            <button type="submit" className="btn btn-primary w-100" disabled={status.type === 'loading'}>
              {status.type === 'loading' ? 'Sending...' : 'Send Message'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Contact;
