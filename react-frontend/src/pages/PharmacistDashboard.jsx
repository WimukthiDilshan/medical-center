import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import './Dashboard.css';

function PharmacistDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (!currentUser || currentUser.role !== 'pharmacist') {
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
        <h1>Pharmacist Dashboard</h1>
        <div className="nav-user">
          <span>Welcome, {user?.name}</span>
          <button onClick={handleLogout} className="btn-logout">Logout</button>
        </div>
      </nav>

      <div className="dashboard-content">
        <div className="welcome-section">
          <h2>Welcome to Medical Center System</h2>
          <p>You are logged in as a Pharmacist</p>
        </div>

        <div className="dashboard-grid">
          <div className="dashboard-card">
            <h3>Prescriptions</h3>
            <p>View and dispense patient prescriptions</p>
            <div className="card-stat">0 Pending</div>
          </div>

          <div className="dashboard-card">
            <h3>Inventory</h3>
            <p>Manage pharmacy inventory and stock levels</p>
            <div className="card-stat">Monitor</div>
          </div>

          <div className="dashboard-card">
            <h3>Drug Information</h3>
            <p>Access drug database and interaction information</p>
            <div className="card-stat">Search</div>
          </div>

          <div className="dashboard-card">
            <h3>Dispensing Log</h3>
            <p>Track medication dispensing history</p>
            <div className="card-stat">View</div>
          </div>
        </div>

        <div className="info-section">
          <h3>Quick Access</h3>
          <ul>
            <li>Prescription Processing</li>
            <li>Stock Management</li>
            <li>Drug Interactions Checker</li>
            <li>Order Supplies</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default PharmacistDashboard;
