import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import './VerifyOtp.css';

const VerifyOtp = () => {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds
  const [resending, setResending] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  const { userId, email, role } = location.state || {};

  useEffect(() => {
    if (!userId) {
      navigate('/login');
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [userId, navigate]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleOtpChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setOtp(value);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (otp.length !== 6) {
      setError('Please enter a 6-digit code');
      return;
    }

    if (timeLeft <= 0) {
      setError('OTP has expired. Please request a new one.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await axios.post('http://localhost:8000/api/verify-otp', {
        user_id: userId,
        otp_code: otp
      });

      // Check if verification was successful
      if (response.data.success && response.data.token && response.data.user) {
        // Store the token and user data in localStorage
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        
        // Get the user's role from the response
        const userRole = response.data.user.role;
        const dashboardPath = `/dashboard/${userRole}`;
        
        // Use window.location for a complete page reload to ensure authentication state is fresh
        window.location.href = dashboardPath;
      } else {
        setError('Invalid response from server');
        setLoading(false);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired OTP');
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    setError('');

    try {
      await axios.post('http://localhost:8000/api/resend-otp', {
        user_id: userId
      });

      setTimeLeft(300); // Reset timer
      setOtp('');
      setError('');
      alert('A new OTP has been sent to your email');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend OTP');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="verify-otp-container">
      <div className="verify-otp-card">
        <div className="verify-otp-header">
          <h2>🔐 Verify Your Identity</h2>
          <p>Enter the 6-digit code sent to</p>
          <p className="email-display">{email}</p>
        </div>

        <form onSubmit={handleSubmit} className="verify-otp-form">
          <div className="otp-input-group">
            <label>Verification Code</label>
            <input
              type="text"
              value={otp}
              onChange={handleOtpChange}
              placeholder="000000"
              maxLength="6"
              className="otp-input"
              autoFocus
              disabled={loading || timeLeft <= 0}
            />
          </div>

          <div className="timer-section">
            <span className={timeLeft <= 60 ? 'timer-warning' : 'timer-normal'}>
              ⏱️ Time remaining: {formatTime(timeLeft)}
            </span>
          </div>

          {error && <div className="error-message">{error}</div>}

          <button 
            type="submit" 
            className="verify-button"
            disabled={loading || otp.length !== 6 || timeLeft <= 0}
          >
            {loading ? 'Verifying...' : 'Verify Code'}
          </button>

          <div className="resend-section">
            <p>Didn't receive the code?</p>
            <button
              type="button"
              onClick={handleResend}
              className="resend-button"
              disabled={resending || timeLeft > 240} // Allow resend after 1 minute
            >
              {resending ? 'Sending...' : 'Resend Code'}
            </button>
          </div>

          <button
            type="button"
            onClick={() => navigate('/login')}
            className="back-button"
          >
            ← Back to Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default VerifyOtp;
