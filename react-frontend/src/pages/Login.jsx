import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import './Auth.css';

function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setLoadingMessage('Verifying credentials...');

    try {
      const response = await authService.login(formData.email, formData.password);
      
      if (response.success) {
        // Check if OTP verification is required
        if (response.requires_otp) {
          setLoadingMessage('OTP sent to your email! Redirecting...');
          // Small delay to show the message
          setTimeout(() => {
            navigate('/verify-otp', {
              state: {
                userId: response.user_id,
                email: response.email,
                role: response.role
              }
            });
          }, 800);
        } else {
          // Normal login flow (student, staff, admin)
          setLoadingMessage('Login successful!');
          const role = response.user.role;
          setTimeout(() => {
            navigate(`/dashboard/${role}`);
          }, 500);
        }
      } else {
        setError(response.message || 'Login failed');
        setLoading(false);
        setLoadingMessage('');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred during login');
      setLoading(false);
      setLoadingMessage('');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <img src="/logo.jpg" alt="University Logo" className="auth-logo" />
          <div className="auth-title">
            <h1>Medical Center</h1>
            <p className="university-name">Faculty of Engineering</p>
            <p className="university-name">University of Ruhuna</p>
          </div>
        </div>
        
        <h2 className="login-heading">Welcome Back</h2>
        <p className="login-subtitle">Sign in to your account</p>
        
        <form onSubmit={handleSubmit}>
          {error && <div className="error-message">{error}</div>}
          {loadingMessage && <div className="info-message">✉️ {loadingMessage}</div>}
          
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="auth-links">
          <p>Don't have an account?</p>
          <button onClick={() => navigate('/register/staff')} className="btn-link">
            Register as Student/Staff
          </button>
          <button onClick={() => navigate('/register/medical')} className="btn-link">
            Register as Medical Personnel
          </button>
        </div>
      </div>
    </div>
  );
}

export default Login;
