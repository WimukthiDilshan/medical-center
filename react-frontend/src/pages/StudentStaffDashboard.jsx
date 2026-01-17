import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import './Dashboard.css';

function StudentStaffDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (!currentUser || !['student', 'staff'].includes(currentUser.role)) {
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
        <h1>{user?.role === 'student' ? 'Student' : 'Staff'} Dashboard</h1>
        <div className="nav-user">
          <span>Welcome, {user?.name}</span>
          <button onClick={handleLogout} className="btn-logout">Logout</button>
        </div>
      </nav>

      <div className="dashboard-content">
        <div className="welcome-section">
          <h2>Welcome to Campus Medical Center</h2>
          <p>You are logged in as {user?.role === 'student' ? 'a Student' : 'Staff'}</p>
          <p className="id-display">ID: {user?.staff_id}</p>
        </div>

        <div className="dashboard-grid">
          <div className="dashboard-card">
            <h3>Book Appointment</h3>
            <p>Schedule an appointment with campus medical services</p>
            <button className="card-button">Book Now</button>
          </div>

          <div className="dashboard-card">
            <h3>My Appointments</h3>
            <p>View your upcoming and past medical appointments</p>
            <div className="card-stat">0 Upcoming</div>
          </div>

          <div className="dashboard-card">
            <h3>Medical History</h3>
            <p>Access your medical records and visit history</p>
            <button className="card-button">View</button>
          </div>

          <div className="dashboard-card">
            <h3>Prescriptions</h3>
            <p>View your active prescriptions and medication history</p>
            <div className="card-stat">0 Active</div>
          </div>

          <div className="dashboard-card">
            <h3>Health Resources</h3>
            <p>Access health information and wellness resources</p>
            <button className="card-button">Explore</button>
          </div>

          <div className="dashboard-card">
            <h3>Emergency Contact</h3>
            <p>Campus medical emergency hotline</p>
            <div className="card-stat emergency">Call: 911</div>
          </div>
        </div>

        <div className="info-section">
          <h3>Important Information</h3>
          <ul>
            <li>Medical Center Hours: Mon-Fri 8:00 AM - 5:00 PM</li>
            <li>Emergency services available 24/7</li>
            <li>Bring your student/staff ID for appointments</li>
            <li>Cancel appointments at least 24 hours in advance</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default StudentStaffDashboard;
