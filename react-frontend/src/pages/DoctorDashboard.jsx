import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import './Dashboard.css';

function DoctorDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (!currentUser || currentUser.role !== 'doctor') {
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
        <h1>Doctor Dashboard</h1>
        <div className="nav-user">
          <span>Welcome, Dr. {user?.name}</span>
          <button onClick={handleLogout} className="btn-logout">Logout</button>
        </div>
      </nav>

      <div className="dashboard-content">
        <div className="welcome-section">
          <h2>Welcome to Medical Center System</h2>
          <p>You are logged in as a Doctor</p>
        </div>

        <div className="dashboard-grid">
          <div className="dashboard-card">
            <h3>Patient Consultations</h3>
            <p>View and manage your patient appointments and consultations</p>
            <div className="card-stat">0 Today</div>
          </div>

          <div className="dashboard-card">
            <h3>Medical Records</h3>
            <p>Access patient medical records and history</p>
            <div className="card-stat">Available</div>
          </div>

          <div className="dashboard-card">
            <h3>Prescriptions</h3>
            <p>Create and manage patient prescriptions</p>
            <div className="card-stat">Ready</div>
          </div>

          <div className="dashboard-card">
            <h3>Schedule</h3>
            <p>View your schedule and appointments</p>
            <div className="card-stat">View</div>
          </div>
        </div>

        <div className="info-section">
          <h3>Quick Access</h3>
          <ul>
            <li>Patient Management</li>
            <li>Appointment Scheduling</li>
            <li>Medical Reports</li>
            <li>Laboratory Results</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default DoctorDashboard;
