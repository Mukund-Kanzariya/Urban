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
      setStatus({ type: 'success', msg: 'Your message has been sent successfully! We will get back to you within 24 hours.' });
      setFormData({ name: '', email: '', message: '' });
    } catch (err) {
      setStatus({ type: 'error', msg: 'Failed to send message. Please try again.' });
    }
  };

  return (
    <div>
      {/* Hero Banner */}
      <div style={{
        position: 'relative',
        height: '280px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        overflow: 'hidden'
      }}>
        <img
          src="https://images.unsplash.com/photo-1423666639041-f56000c27a9a?w=1400&auto=format&fit=crop"
          alt="Contact Us"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(15,23,42,0.68)' }} />
        <div style={{ position: 'relative', zIndex: 2, padding: '0 1rem' }}>
          <h1 style={{ color: '#fff', fontSize: '2.2rem', fontWeight: 700, marginBottom: '0.6rem', letterSpacing: '-0.5px' }}>
            Contact Us
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.82)', fontSize: '1rem', maxWidth: '500px', margin: '0 auto', lineHeight: 1.65 }}>
            Have a question or need support? Send us a message and our team will get back to you within 24 hours.
          </p>
        </div>
      </div>

      {/* Contact Content */}
      <div className="static-page-container">
        <div className="contact-grid">
          <div className="contact-info">
            <h3>Get in Touch</h3>

            <div className="info-item">
              <h4>📧 Customer Support</h4>
              <p>support@servicehub.in</p>
              <p>+91 98765 43210</p>
            </div>

            <div className="info-item">
              <h4>🕐 Business Hours</h4>
              <p>Monday – Saturday</p>
              <p>9:00 AM – 7:00 PM (IST)</p>
            </div>

            <div className="info-item">
              <h4>🏢 Headquarters</h4>
              <p>ServiceHub India Pvt. Ltd.</p>
              <p>Surat, Gujarat – 395003</p>
            </div>

            <div className="info-item">
              <h4>🤝 Provider Partnership</h4>
              <p>partner@servicehub.in</p>
              <p>Become a verified provider today</p>
            </div>
          </div>

          <div className="contact-form">
            <form onSubmit={handleSubmit}>
              {status.msg && (
                <div style={{
                  padding: '1rem',
                  marginBottom: '1rem',
                  borderRadius: '8px',
                  backgroundColor: status.type === 'success' ? '#d1fae5' : status.type === 'error' ? '#fee2e2' : '#fef9c3',
                  color: status.type === 'success' ? '#065f46' : status.type === 'error' ? '#991b1b' : '#92400e',
                  fontSize: '0.9rem'
                }}>
                  {status.msg}
                </div>
              )}

              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="Rahul Sharma"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="rahul@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Message</label>
                <textarea
                  required
                  placeholder="How can we help you?"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                ></textarea>
              </div>

              <button type="submit" className="btn btn-primary w-100" disabled={status.type === 'loading'}>
                {status.type === 'loading' ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Contact;
