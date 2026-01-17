import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import './Dashboard.css';

function NurseDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (!currentUser || currentUser.role !== 'nurse') {
      navigate('/login');
      return;
    }
    setUser(currentUser);
  }, [navigate]);

  const handleLogout = async () => {
    await authService.logout();
    navigate('/login');
  };

  return (
    <div className="dashboard-container">
      <nav className="dashboard-nav">
        <h1>Nurse Dashboard</h1>
        <div className="nav-user">
          <span>Welcome, {user?.name}</span>
          <button onClick={handleLogout} className="btn-logout">Logout</button>
        </div>
      </nav>

      <div className="dashboard-content">
        <div className="welcome-section">
          <h2>Welcome to Medical Center System</h2>
          <p>You are logged in as a Nurse</p>
        </div>

        <div className="dashboard-grid">
          <div className="dashboard-card">
            <h3>Patient Care</h3>
            <p>Monitor and record patient vital signs and care activities</p>
            <div className="card-stat">Active</div>
          </div>

          <div className="dashboard-card">
            <h3>Medications</h3>
            <p>Administer and track patient medications</p>
            <div className="card-stat">Track</div>
          </div>

          <div className="dashboard-card">
            <h3>Ward Management</h3>
            <p>Manage ward assignments and patient beds</p>
            <div className="card-stat">Available</div>
          </div>

          <div className="dashboard-card">
            <h3>Patient Records</h3>
            <p>Update patient care records and notes</p>
            <div className="card-stat">Update</div>
          </div>
        </div>

        <div className="info-section">
          <h3>Quick Access</h3>
          <ul>
            <li>Vital Signs Recording</li>
            <li>Medication Administration</li>
            <li>Patient Handover Notes</li>
            <li>Emergency Protocols</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default NurseDashboard;
