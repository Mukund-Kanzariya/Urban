import React, { useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import '../css/Dashboards.css'; 

function AddReview() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [status, setStatus] = useState({ type: '', msg: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: '', msg: '' });

    if (!comment.trim()) {
      setStatus({ type: 'error', msg: 'Please provide a comment.' });
      setLoading(false);
      return;
    }

    try {
      await axios.post('/api/reviews', { bookingId, rating, comment });
      setStatus({ type: 'success', msg: 'Review seamlessly submitted! Redirecting...' });
      
      // Send them back to their dashboard safely after 2 seconds
      setTimeout(() => navigate('/bookings'), 2000);
    } catch (error) {
      setStatus({ type: 'error', msg: error.response?.data?.message || 'Failed to submit review. Have you already reviewed this?' });
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-container center-form">
      <div className="dashboard-card" style={{ maxWidth: '600px', margin: '4rem auto', width: '100%', padding: '2.5rem' }}>
        <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem', textAlign: 'center', color: 'var(--text-dark)' }}>
          Rate Your Experience
        </h2>
        <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '2rem' }}>
          Your feedback keeps our community safe and helps pros improve!
        </p>

        {status.msg && (
          <div style={{
            padding: '1rem',
            marginBottom: '1.5rem',
            borderRadius: '8px',
            textAlign: 'center',
            backgroundColor: status.type === 'success' ? '#d1fae5' : '#fee2e2',
            color: status.type === 'success' ? '#065f46' : '#991b1b',
            border: `1px solid ${status.type === 'success' ? '#a7f3d0' : '#fecaca'}`
          }}>
            {status.msg}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Star Selection Mechanism */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '2rem' }}>
            <label style={{ fontSize: '1.1rem', fontWeight: '500', marginBottom: '1rem' }}>Overall Rating</label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '3rem',
                    cursor: 'pointer',
                    color: star <= rating ? '#fbbf24' : '#e2e8f0', // Golden yellow if active
                    transition: 'all 0.2s',
                    padding: '0'
                  }}
                >
                  ★
                </button>
              ))}
            </div>
            <p style={{ marginTop: '0.5rem', color: 'var(--text-muted)', fontWeight: '500' }}>
              {rating === 1 && '1 Star - Terrible'}
              {rating === 2 && '2 Stars - Poor'}
              {rating === 3 && '3 Stars - Average'}
              {rating === 4 && '4 Stars - Great!'}
              {rating === 5 && '5 Stars - Excellent!'}
            </p>
          </div>

          {/* Comment Text Area */}
          <div className="form-group" style={{ marginBottom: '2rem' }}>
            <label style={{ fontSize: '1rem', fontWeight: '500' }}>Tell us more about your experience</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Did the professional arrive on time? Were they polite? Would you recommend them to a friend?"
              style={{
                width: '100%',
                minHeight: '150px',
                padding: '1rem',
                marginTop: '0.5rem',
                borderRadius: '8px',
                border: '1px solid var(--border)',
                resize: 'vertical',
                fontSize: '1rem'
              }}
            ></textarea>
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              type="button"
              className="btn"
              onClick={() => navigate('/bookings')}
              style={{ flex: 1, backgroundColor: '#f1f5f9', color: '#475569' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading || status.type === 'success'}
              style={{ flex: 2 }}
            >
              {loading ? 'Submitting...' : 'Post Public Review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddReview;
