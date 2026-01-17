import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import appointmentService from '../services/appointmentService';
import './StudentStaffDashboard.css';

function StudentStaffDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [currentAppointment, setCurrentAppointment] = useState(null);
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (!currentUser || !['student', 'staff'].includes(currentUser.role)) {
      navigate('/login');
      return;
    }
    setUser(currentUser);
    fetchAppointments(currentUser.id);
  }, [navigate]);

  const fetchAppointments = async (userId) => {
    setLoading(true);
    try {
      console.log('Fetching appointments for user ID:', userId);
      const appointments = await appointmentService.getHistory(userId);
      console.log('Appointments received:', appointments);
      
      // Get today's date in YYYY-MM-DD format
      const today = new Date();
      const todayString = today.toISOString().split('T')[0];
      console.log('Today\'s date:', todayString);
      
      const todayAppointments = appointments.filter(apt => {
        // Normalize the appointment date
        const aptDate = apt.appointment_date.split('T')[0];
        console.log('Comparing:', aptDate, 'with', todayString, '- Status:', apt.status);
        return aptDate === todayString && !['cancelled', 'completed'].includes(apt.status);
      });
      console.log('Filtered today\'s appointments:', todayAppointments);

      // Find the current active appointment (any pending, checked_in or in_progress)
      const active = todayAppointments.find(apt => 
        ['pending', 'checked_in', 'in_progress'].includes(apt.status)
      );
      console.log('Active appointment:', active);

      // Show other appointments if there are multiple
      const otherAppointments = todayAppointments.filter(apt => apt.id !== active?.id);

      setCurrentAppointment(active || null);
      setUpcomingAppointments(otherAppointments);
    } catch (err) {
      console.error('Failed to fetch appointments:', err);
      console.error('Error details:', err.response?.data);
    } finally {
      setLoading(false);
    }
  };

  // Auto-refresh every 15 seconds
  useEffect(() => {
    if (user) {
      const interval = setInterval(() => {
        fetchAppointments(user.id);
      }, 15000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const handleLogout = async () => {
    await authService.logout();
    navigate('/login');
  };

  const getAppointmentStatus = () => {
    if (!currentAppointment) return null;

    if (currentAppointment.status === 'in_progress') {
      return {
        message: 'MEET DOCTOR NOW',
        icon: '🏥',
        color: 'green',
        pulse: true
      };
    } else if (currentAppointment.status === 'checked_in' || currentAppointment.status === 'pending') {
      return {
        message: 'WAITING',
        icon: '⏳',
        color: 'red',
        pulse: true
      };
    }
    return null;
  };

  const status = getAppointmentStatus();

  return (
    <div className="student-dashboard">
      <nav className="dashboard-nav">
        <h1>{user?.role === 'student' ? '🎓 Student' : '👔 Staff'} Portal</h1>
        <div className="nav-user">
          <span className="user-name">{user?.name}</span>
          <span className="user-id">ID: {user?.staff_id}</span>
          <button onClick={handleLogout} className="btn-logout">Logout</button>
        </div>
      </nav>

      <div className="dashboard-content">
        {loading ? (
          <div className="loading-screen">
            <div className="spinner"></div>
            <p>Loading your appointments...</p>
          </div>
        ) : (
          <>
            {/* Current Appointment Alert */}
            {status && (
              <div className={`appointment-alert ${status.color} ${status.pulse ? 'pulse' : ''}`}>
                <div className="alert-icon">{status.icon}</div>
                <div className="alert-content">
                  <h2>{status.message}</h2>
                  <div className="appointment-details">
                    <p className="appointment-number">Appointment #{currentAppointment.appointment_number}</p>
                    <p className="appointment-time">Time: {currentAppointment.appointment_time}</p>
                    {currentAppointment.reason && (
                      <p className="appointment-reason">Reason: {currentAppointment.reason}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Upcoming Appointments */}
            {upcomingAppointments.length > 0 && (
              <div className="upcoming-section">
                <h2>📅 Your Scheduled Appointments</h2>
                <div className="appointments-list">
                  {upcomingAppointments.map((apt) => (
                    <div key={apt.id} className="appointment-card">
                      <div className="card-header">
                        <span className="apt-number">#{apt.appointment_number}</span>
                        <span className={`priority-badge ${apt.priority}`}>
                          {apt.priority === 'urgent' ? '🔴 Urgent' : '🟢 Normal'}
                        </span>
                      </div>
                      <div className="card-body">
                        <div className="info-row">
                          <span className="icon">🕐</span>
                          <span className="text">{apt.appointment_time}</span>
                        </div>
                        {apt.reason && (
                          <div className="info-row">
                            <span className="icon">📝</span>
                            <span className="text">{apt.reason}</span>
                          </div>
                        )}
                        <div className="info-row">
                          <span className="icon">📊</span>
                          <span className="text status-pending">Pending - Please arrive 10 min early</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* No Appointments */}
            {!currentAppointment && upcomingAppointments.length === 0 && (
              <div className="no-appointments">
                <div className="empty-icon">📋</div>
                <h2>No Appointments Today</h2>
                <p>You don't have any scheduled appointments for today.</p>
                <p className="info-text">Visit the nurse's office to schedule an appointment if needed.</p>
              </div>
            )}

            {/* Quick Info Cards */}
            <div className="quick-info">
              <div className="info-card">
                <div className="card-icon">🏥</div>
                <h3>Medical Center</h3>
                <p>Mon-Fri: 8:00 AM - 5:00 PM</p>
              </div>
              <div className="info-card">
                <div className="card-icon">🚨</div>
                <h3>Emergency</h3>
                <p>Call: 911 (24/7)</p>
              </div>
              <div className="info-card">
                <div className="card-icon">📞</div>
                <h3>Contact Nurse</h3>
                <p>Visit Nurse's Office</p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default StudentStaffDashboard;
