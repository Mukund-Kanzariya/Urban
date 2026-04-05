import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

function ForgotPassword() {
    const [step, setStep] = useState(1); // 1: Email, 2: New Password
    const [email, setEmail] = useState('');
    const [passwords, setPasswords] = useState({ new: '', confirm: '' });
    const [status, setStatus] = useState({ type: '', msg: '' });
    const navigate = useNavigate();

    // Step 1: Verify Email
    const handleCheckEmail = async (e) => {
        e.preventDefault();
        setStatus({ type: 'loading', msg: 'Verifying account...' });
        try {
            const res = await axios.post('/api/auth/check-email', { email });
            if (res.data.success) {
                setStep(2);
                setStatus({ type: 'success', msg: `Account verified for ${res.data.name}. Please enter your new password.` });
            }
        } catch (err) {
            setStatus({ type: 'error', msg: err.response?.data?.message || 'Email not found.' });
        }
    };

    // Step 2: Reset Password
    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (passwords.new !== passwords.confirm) {
            return setStatus({ type: 'error', msg: 'Passwords do not match!' });
        }

        setStatus({ type: 'loading', msg: 'Updating password...' });
        try {
            const res = await axios.post('/api/auth/reset-password-simple', {
                email,
                password: passwords.new
            });
            if (res.data.success) {
                setStatus({ type: 'success', msg: 'Password reset successful! Redirecting to login...' });
                setTimeout(() => navigate('/login'), 3000);
            }
        } catch (err) {
            setStatus({ type: 'error', msg: 'Failed to reset password.' });
        }
    };

    return (
        <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
            <div className="card" style={{ maxWidth: '400px', width: '100%', padding: '2rem' }}>
                <h2 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>Forgot Password</h2>

                {status.msg && (
                    <div className={`alert alert-${status.type}`} style={{
                        padding: '1rem', marginBottom: '1.5rem', borderRadius: '8px', textAlign: 'center',
                        backgroundColor: status.type === 'success' ? '#d1fae5' : '#fee2e2',
                        color: status.type === 'success' ? '#065f46' : '#991b1b'
                    }}>
                        {status.msg}
                    </div>
                )}

                {step === 1 ? (
                    <form onSubmit={handleCheckEmail}>
                        <div className="form-group">
                            <label>Registered Email Address</label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="name@gmail.com"
                            />
                        </div>
                        <button type="submit" className="btn btn-primary w-100" style={{ marginTop: '1rem' }}>
                            Verify Account
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleResetPassword}>
                        <div className="form-group">
                            <label>New Password</label>
                            <input
                                type="password"
                                required
                                value={passwords.new}
                                onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                                placeholder="••••••••"
                            />
                        </div>
                        <div className="form-group" style={{ marginTop: '1rem' }}>
                            <label>Confirm New Password</label>
                            <input
                                type="password"
                                required
                                value={passwords.confirm}
                                onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                                placeholder="••••••••"
                            />
                        </div>
                        <button type="submit" className="btn btn-primary w-100" style={{ marginTop: '1.5rem' }}>
                            Reset Password
                        </button>
                    </form>
                )}

                <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
                    <Link to="/login" style={{ color: 'var(--primary)', textDecoration: 'none' }}>Back to Login</Link>
                </div>
            </div>
        </div>
    );
}

export default ForgotPassword;
