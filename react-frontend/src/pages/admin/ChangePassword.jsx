import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import './ChangePassword.css';

const ChangePassword = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(authService.getCurrentUser());
    const [formData, setFormData] = useState({
        current_password: '',
        new_password: '',
        new_password_confirmation: ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validation
        if (!formData.current_password || !formData.new_password || !formData.new_password_confirmation) {
            setError('All fields are required');
            return;
        }

        if (formData.new_password.length < 6) {
            setError('New password must be at least 6 characters');
            return;
        }

        if (formData.new_password !== formData.new_password_confirmation) {
            setError('New passwords do not match');
            return;
        }

        try {
            setLoading(true);
            setError('');
            
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:8000/api/admin/change-own-password', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to change password');
            }

            setSuccess('Password changed successfully!');
            setFormData({
                current_password: '',
                new_password: '',
                new_password_confirmation: ''
            });

            // Redirect to dashboard after 2 seconds
            setTimeout(() => {
                navigate('/dashboard/admin');
            }, 2000);

        } catch (err) {
            setError(err.message || 'Failed to change password');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        authService.logout();
        navigate('/login');
    };

    return (
        <div className="change-password-page">
            {/* Navigation Bar */}
            <div className="change-password-nav">
                <div className="nav-left">
                    <button onClick={() => navigate('/dashboard/admin')} className="back-btn">
                        ← Back
                    </button>
                    <h1>Change Password</h1>
                </div>
                <div className="nav-user">
                    <span className="user-name">{user?.name}</span>
                    <button onClick={handleLogout} className="btn-logout">
                        Logout
                    </button>
                </div>
            </div>

            <div className="change-password-content">
                <div className="password-form-container">
                    <div className="form-header">
                        <div className="icon">🔐</div>
                        <h2>Update Your Password</h2>
                        <p>Keep your account secure by using a strong password</p>
                    </div>

                    {/* Messages */}
                    {error && (
                        <div className="alert alert-error">
                            ⚠️ {error}
                        </div>
                    )}
                    {success && (
                        <div className="alert alert-success">
                            ✓ {success}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="password-form">
                        <div className="form-group">
                            <label htmlFor="current_password">Current Password</label>
                            <input
                                type="password"
                                id="current_password"
                                name="current_password"
                                value={formData.current_password}
                                onChange={handleChange}
                                placeholder="Enter your current password"
                                disabled={loading}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="new_password">New Password</label>
                            <input
                                type="password"
                                id="new_password"
                                name="new_password"
                                value={formData.new_password}
                                onChange={handleChange}
                                placeholder="Enter new password (min 6 characters)"
                                disabled={loading}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="new_password_confirmation">Confirm New Password</label>
                            <input
                                type="password"
                                id="new_password_confirmation"
                                name="new_password_confirmation"
                                value={formData.new_password_confirmation}
                                onChange={handleChange}
                                placeholder="Re-enter new password"
                                disabled={loading}
                            />
                        </div>

                        <div className="form-actions">
                            <button
                                type="button"
                                onClick={() => navigate('/dashboard/admin')}
                                className="btn-cancel"
                                disabled={loading}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="btn-submit"
                                disabled={loading}
                            >
                                {loading ? 'Changing Password...' : 'Change Password'}
                            </button>
                        </div>
                    </form>

                    <div className="password-tips">
                        <h4>Password Tips:</h4>
                        <ul>
                            <li>Use at least 6 characters</li>
                            <li>Mix uppercase and lowercase letters</li>
                            <li>Include numbers and special characters</li>
                            <li>Don't use common words or personal information</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChangePassword;
