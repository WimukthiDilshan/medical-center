import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { adminService } from '../services/adminService';
import './Dashboard.css';

function AdminDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');
  const [selectedUser, setSelectedUser] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (!currentUser || currentUser.role !== 'admin') {
      navigate('/login');
      return;
    }
    setUser(currentUser);
    loadData();
  }, [navigate]);

  const loadData = async () => {
    try {
      const [pendingResponse, usersResponse] = await Promise.all([
        adminService.getPendingUsers(),
        adminService.getAllUsers(),
      ]);
      
      if (pendingResponse.success) {
        setPendingUsers(pendingResponse.users);
      }
      if (usersResponse.success) {
        setAllUsers(usersResponse.users);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (userId) => {
    try {
      const response = await adminService.approveUser(userId);
      if (response.success) {
        setMessage('User approved successfully');
        loadData();
      }
    } catch (error) {
      setMessage('Error approving user');
    }
  };

  const handleReject = async (userId) => {
    if (window.confirm('Are you sure you want to reject this user?')) {
      try {
        const response = await adminService.rejectUser(userId);
        if (response.success) {
          setMessage('User rejected successfully');
          loadData();
        }
      } catch (error) {
        setMessage('Error rejecting user');
      }
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!selectedUser || !newPassword) return;

    try {
      const response = await adminService.changePassword(selectedUser.id, newPassword);
      if (response.success) {
        setMessage('Password changed successfully');
        setSelectedUser(null);
        setNewPassword('');
      }
    } catch (error) {
      setMessage('Error changing password');
    }
  };

  const handleLogout = async () => {
    await authService.logout();
    navigate('/login');
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="dashboard-container">
      <nav className="dashboard-nav">
        <h1>Admin Dashboard</h1>
        <div className="nav-user">
          <span>Welcome, {user?.name}</span>
          <button onClick={handleLogout} className="btn-logout">Logout</button>
        </div>
      </nav>

      <div className="dashboard-content">
        {message && (
          <div className="message-banner">
            {message}
            <button onClick={() => setMessage('')}>×</button>
          </div>
        )}

        {/* Quick Access Cards */}
        <div className="quick-access-cards">
          <div className="quick-card" onClick={() => navigate('/dashboard/admin/medical-certificates')}>
            <div className="card-icon">📋</div>
            <h3>Medical Certificates</h3>
            <p>View and manage all medical certificate requests</p>
          </div>
          <div className="quick-card" onClick={() => navigate('/dashboard/admin/change-password')}>
            <div className="card-icon">🔐</div>
            <h3>Change Password</h3>
            <p>Update your admin account password</p>
          </div>
        </div>

        <div className="tabs">
          <button
            className={activeTab === 'pending' ? 'tab active' : 'tab'}
            onClick={() => setActiveTab('pending')}
          >
            Pending Approvals ({pendingUsers.length})
          </button>
          <button
            className={activeTab === 'users' ? 'tab active' : 'tab'}
            onClick={() => setActiveTab('users')}
          >
            All Users ({allUsers.length})
          </button>
          <button
            className={activeTab === 'password' ? 'tab active' : 'tab'}
            onClick={() => setActiveTab('password')}
          >
            Change Password
          </button>
        </div>

        {activeTab === 'pending' && (
          <div className="tab-content">
            <h2>Pending Approvals</h2>
            {pendingUsers.length === 0 ? (
              <p>No pending approvals</p>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Phone</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingUsers.map((pendingUser) => (
                    <tr key={pendingUser.id}>
                      <td>{pendingUser.name}</td>
                      <td>{pendingUser.email}</td>
                      <td><span className="role-badge">{pendingUser.role}</span></td>
                      <td>{pendingUser.phone || 'N/A'}</td>
                      <td>
                        <button
                          onClick={() => handleApprove(pendingUser.id)}
                          className="btn-approve"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleReject(pendingUser.id)}
                          className="btn-reject"
                        >
                          Reject
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {activeTab === 'users' && (
          <div className="tab-content">
            <h2>All Users</h2>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Staff ID</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {allUsers.map((userData) => (
                  <tr key={userData.id}>
                    <td>{userData.name}</td>
                    <td>{userData.email}</td>
                    <td><span className="role-badge">{userData.role}</span></td>
                    <td>{userData.staff_id || 'N/A'}</td>
                    <td>
                      <span className={userData.is_approved ? 'status-approved' : 'status-pending'}>
                        {userData.is_approved ? 'Approved' : 'Pending'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'password' && (
          <div className="tab-content">
            <h2>Change User Password</h2>
            <p>Select a user (Doctor, Nurse, or Pharmacist) to change their password</p>
            
            <div className="password-form">
              <select
                value={selectedUser?.id || ''}
                onChange={(e) => {
                  const user = allUsers.find(u => u.id === parseInt(e.target.value));
                  setSelectedUser(user);
                }}
                className="user-select"
              >
                <option value="">Select a user</option>
                {allUsers
                  .filter(u => ['doctor', 'nurse', 'pharmacist'].includes(u.role))
                  .map(u => (
                    <option key={u.id} value={u.id}>
                      {u.name} - {u.role}
                    </option>
                  ))}
              </select>

              {selectedUser && (
                <form onSubmit={handleChangePassword}>
                  <input
                    type="password"
                    placeholder="New Password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength="6"
                  />
                  <button type="submit" className="btn-primary">
                    Change Password
                  </button>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;
