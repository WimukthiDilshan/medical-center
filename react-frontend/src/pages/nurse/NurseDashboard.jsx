import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import appointmentService from '../../services/appointmentService';
import { authService } from '../../services/authService';
import QRCodeScanner from '../../components/QRCodeScanner';
import './NurseDashboard.css';

function NurseDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [idNumber, setIdNumber] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Appointment form state
  const [appointmentData, setAppointmentData] = useState({
    appointment_date: '',
    appointment_time: '',
    reason: '',
    priority: 'normal'
  });

  // Edit mode
  const [editingAppointment, setEditingAppointment] = useState(null);

  // Search user by ID number
  const handleSearchUser = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const user = await appointmentService.searchUser(idNumber);
      setSelectedUser(user);
      setSuccess(`Found: ${user.name} (${user.role})`);
    } catch (err) {
      setError(err.response?.data?.message || 'User not found');
      setSelectedUser(null);
    } finally {
      setLoading(false);
    }
  };

  // Create appointment
  const handleCreateAppointment = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const result = await appointmentService.createAppointment({
        ...appointmentData,
        user_id: selectedUser.id
      });
      
      setSuccess(`Appointment created! Number: ${result.appointment.appointment_number}`);
      
      // Reset form
      setAppointmentData({
        appointment_date: '',
        appointment_time: '',
        reason: '',
        priority: 'normal'
      });
      setSelectedUser(null);
      setIdNumber('');
      
      // Refresh appointments list
      fetchAppointments();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create appointment');
    } finally {
      setLoading(false);
    }
  };

  // Fetch all appointments
  const fetchAppointments = async () => {
    try {
      const data = await appointmentService.getAppointments({ today: true });
      setAppointments(data);
    } catch (err) {
      console.error('Failed to fetch appointments', err);
    }
  };

  // Check-in patient
  const handleCheckIn = async (id) => {
    try {
      await appointmentService.checkIn(id);
      setSuccess('Patient checked in successfully');
      fetchAppointments();
    } catch (err) {
      setError('Failed to check in patient');
    }
  };

  // Cancel appointment
  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;
    
    try {
      await appointmentService.cancelAppointment(id);
      setSuccess('Appointment cancelled');
      fetchAppointments();
    } catch (err) {
      setError('Failed to cancel appointment');
    }
  };

  // Delete appointment
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this appointment?')) return;
    
    try {
      await appointmentService.deleteAppointment(id);
      setSuccess('Appointment deleted');
      fetchAppointments();
    } catch (err) {
      setError('Failed to delete appointment');
    }
  };

  // Edit appointment
  const startEdit = (appointment) => {
    setEditingAppointment(appointment);
    setAppointmentData({
      appointment_date: appointment.appointment_date,
      appointment_time: appointment.appointment_time.substring(0, 5),
      reason: appointment.reason || '',
      priority: appointment.priority
    });
  };

  const handleUpdateAppointment = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await appointmentService.updateAppointment(editingAppointment.id, appointmentData);
      setSuccess('Appointment updated successfully');
      setEditingAppointment(null);
      setAppointmentData({
        appointment_date: '',
        appointment_time: '',
        reason: '',
        priority: 'normal'
      });
      fetchAppointments();
    } catch (err) {
      setError('Failed to update appointment');
    } finally {
      setLoading(false);
    }
  };

  // Load user and appointments on mount
  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    }
    fetchAppointments();
  }, []);

  // Handle logout
  const handleLogout = async () => {
    await authService.logout();
    navigate('/login');
  };

  // Calculate stats
  const stats = {
    total: appointments.length,
    pending: appointments.filter(a => a.status === 'pending').length,
    checked_in: appointments.filter(a => a.status === 'checked_in').length,
    completed: appointments.filter(a => a.status === 'completed').length,
    urgent: appointments.filter(a => a.priority === 'urgent').length,
  };

  return (
    <div className="nurse-dashboard">
      {/* Navigation Bar */}
      <nav className="dashboard-nav">
        <h1>Nurse Dashboard - Appointment Management</h1>
        <div className="nav-user">
          <span className="user-name">👤 {user?.name}</span>
          <button onClick={() => navigate('/dashboard/nurse/change-password')} className="btn-change-password">🔐 Change Password</button>
          <button onClick={handleLogout} className="btn-logout">Logout</button>
        </div>
      </nav>

      <div className="dashboard-content">
        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Today</h3>
          <p className="stat-number">{stats.total}</p>
        </div>
        <div className="stat-card">
          <h3>Pending</h3>
          <p className="stat-number">{stats.pending}</p>
        </div>
        <div className="stat-card">
          <h3>Checked In</h3>
          <p className="stat-number">{stats.checked_in}</p>
        </div>
        <div className="stat-card">
          <h3>Completed</h3>
          <p className="stat-number">{stats.completed}</p>
        </div>
        <div className="stat-card urgent-stat">
          <h3>Urgent</h3>
          <p className="stat-number">{stats.urgent}</p>
        </div>
      </div>

      {/* QR Code Scanner Section */}
      <QRCodeScanner onAppointmentCreated={(appointment) => {
        setSuccess(`Appointment created successfully for ${appointment.user.name}`);
        fetchAppointments();
      }} />

      {/* Search Patient Section */}
      <div className="card">
        <h2>Search Patient</h2>
        <form onSubmit={handleSearchUser}>
          <div className="form-group">
            <label>ID Number:</label>
            <input
              type="text"
              value={idNumber}
              onChange={(e) => setIdNumber(e.target.value)}
              placeholder="Enter staff/student ID number"
              required
            />
          </div>
          <button type="submit" disabled={loading}>
            {loading ? 'Searching...' : 'Search'}
          </button>
        </form>

        {selectedUser && (
          <div className="user-info">
            <h3>Selected Patient</h3>
            <p><strong>Name:</strong> {selectedUser.name}</p>
            <p><strong>ID Number:</strong> {selectedUser.staff_id}</p>
            <p><strong>Email:</strong> {selectedUser.email}</p>
            <p><strong>Role:</strong> {selectedUser.role}</p>
          </div>
        )}
      </div>

      {/* Create/Edit Appointment Section */}
      {(selectedUser || editingAppointment) && (
        <div className="card">
          <h2>{editingAppointment ? 'Edit Appointment' : 'Create Appointment'}</h2>
          <form onSubmit={editingAppointment ? handleUpdateAppointment : handleCreateAppointment}>
            <div className="form-group">
              <label>Date:</label>
              <input
                type="date"
                value={appointmentData.appointment_date}
                onChange={(e) => setAppointmentData({...appointmentData, appointment_date: e.target.value})}
                required
              />
            </div>

            <div className="form-group">
              <label>Time:</label>
              <input
                type="time"
                value={appointmentData.appointment_time}
                onChange={(e) => setAppointmentData({...appointmentData, appointment_time: e.target.value})}
                required
              />
            </div>

            <div className="form-group">
              <label>Reason for Visit:</label>
              <textarea
                value={appointmentData.reason}
                onChange={(e) => setAppointmentData({...appointmentData, reason: e.target.value})}
                placeholder="Chief complaint or reason for visit"
                rows="3"
              />
            </div>

            <div className="form-group">
              <label>Priority:</label>
              <select
                value={appointmentData.priority}
                onChange={(e) => setAppointmentData({...appointmentData, priority: e.target.value})}
              >
                <option value="normal">Normal</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            <div className="button-group">
              <button type="submit" disabled={loading}>
                {loading ? 'Processing...' : editingAppointment ? 'Update Appointment' : 'Create Appointment'}
              </button>
              {editingAppointment && (
                <button 
                  type="button" 
                  onClick={() => {
                    setEditingAppointment(null);
                    setAppointmentData({
                      appointment_date: '',
                      appointment_time: '',
                      reason: '',
                      priority: 'normal'
                    });
                  }}
                  className="btn-secondary"
                >
                  Cancel Edit
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      {/* Today's Appointments List */}
      <div className="card">
        <h2>Today's Appointments</h2>
        <button onClick={fetchAppointments} className="btn-refresh">Refresh</button>
        
        {appointments.length === 0 ? (
          <p>No appointments for today</p>
        ) : (
          <table className="appointments-table">
            <thead>
              <tr>
                <th>No.</th>
                <th>Patient</th>
                <th>Staff ID</th>
                <th>Time</th>
                <th>Reason</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((apt) => (
                <tr key={apt.id} className={apt.priority === 'urgent' ? 'urgent-row' : ''}>
                  <td><strong>#{apt.appointment_number}</strong></td>
                  <td>{apt.user?.name}</td>
                  <td>{apt.user?.staff_id}</td>
                  <td>{apt.appointment_time}</td>
                  <td>{apt.reason || 'N/A'}</td>
                  <td>
                    <span className={`badge badge-${apt.priority}`}>
                      {apt.priority}
                    </span>
                  </td>
                  <td>
                    <span className={`badge badge-${apt.status}`}>
                      {apt.status}
                    </span>
                  </td>
                  <td className="action-buttons">
                    {apt.status === 'pending' && (
                      <>
                        <button onClick={() => handleCheckIn(apt.id)} className="btn-small btn-success">
                          Check-in
                        </button>
                        <button onClick={() => startEdit(apt)} className="btn-small btn-info">
                          Edit
                        </button>
                        <button onClick={() => handleCancel(apt.id)} className="btn-small btn-warning">
                          Cancel
                        </button>
                        <button onClick={() => handleDelete(apt.id)} className="btn-small btn-danger">
                          Delete
                        </button>
                      </>
                    )}
                    {apt.status === 'checked_in' && (
                      <span className="status-text">Waiting for doctor</span>
                    )}
                    {apt.status === 'in_progress' && (
                      <span className="status-text">With doctor</span>
                    )}
                    {apt.status === 'completed' && (
                      <span className="status-text">Done</span>
                    )}
                    {apt.status === 'cancelled' && (
                      <span className="status-text">Cancelled</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      </div>
    </div>
  );
}

export default NurseDashboard;
