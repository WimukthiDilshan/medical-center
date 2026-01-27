import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import appointmentService from '../services/appointmentService';
import prescriptionService from '../services/prescriptionService';
import QRCodeGenerator from '../components/QRCodeGenerator';
import './StudentStaffDashboard.css';

function StudentStaffDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [currentAppointment, setCurrentAppointment] = useState(null);
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [labReports, setLabReports] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [allAppointments, setAllAppointments] = useState([]);
  const [selectedAppointment, setSelectedAppointment] = useState('latest');
  const [filteredLabReports, setFilteredLabReports] = useState([]);
  const [filteredPrescriptions, setFilteredPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (!currentUser || !['student', 'staff'].includes(currentUser.role)) {
      navigate('/login');
      return;
    }
    setUser(currentUser);
    fetchAppointments(currentUser.id);
    fetchAllAppointments();
    fetchLabReports();
    fetchPrescriptions();
  }, [navigate]);

  const fetchLabReports = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/api/lab-reports/my-reports', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setLabReports(data);
      setFilteredLabReports(data.slice(0, 1)); // Show only latest by default
    } catch (err) {
      console.error('Failed to fetch lab reports:', err);
    }
  };

  const fetchPrescriptions = async () => {
    try {
      const data = await prescriptionService.getMyPrescriptions();
      setPrescriptions(data);
      setFilteredPrescriptions(data.slice(0, 1)); // Show only latest by default
    } catch (err) {
      console.error('Failed to fetch prescriptions:', err);
    }
  };

  const fetchAllAppointments = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/api/appointments/my-appointments', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      // Filter only completed appointments that might have lab reports or prescriptions
      const completedAppts = data.filter(apt => apt.status === 'completed');
      setAllAppointments(completedAppts);
    } catch (err) {
      console.error('Failed to fetch all appointments:', err);
    }
  };

  const handleAppointmentFilter = (value) => {
    setSelectedAppointment(value);
    
    if (value === 'latest') {
      // Show only latest prescription and lab report
      setFilteredPrescriptions(prescriptions.slice(0, 1));
      setFilteredLabReports(labReports.slice(0, 1));
    } else if (value === 'all') {
      // Show all prescriptions and lab reports
      setFilteredPrescriptions(prescriptions);
      setFilteredLabReports(labReports);
    } else {
      // Filter by specific appointment ID
      const appointmentId = parseInt(value);
      const filteredPrescr = prescriptions.filter(p => p.appointment_id === appointmentId);
      const filteredLab = labReports.filter(l => l.id === appointmentId);
      setFilteredPrescriptions(filteredPrescr);
      setFilteredLabReports(filteredLab);
    }
  };

  const handleDownloadPrescription = async (prescriptionId) => {
    try {
      await prescriptionService.downloadPrescription(prescriptionId);
    } catch (err) {
      console.error('Failed to download prescription:', err);
      alert('Failed to download prescription. Please try again.');
    }
  };

  const downloadLabReport = async (appointmentId) => {
    try {
      const token = localStorage.getItem('token');
      
      console.log('Downloading report for appointment:', appointmentId);
      
      // Create a form and submit it to download the file
      const url = `http://localhost:8000/api/lab-reports/download/${appointmentId}`;
      
      // Use fetch with proper blob handling
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/pdf'
        }
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', [...response.headers.entries()]);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`Download failed: ${response.status}`);
      }
      
      // Check content type
      const contentType = response.headers.get('content-type');
      console.log('Content-Type:', contentType);
      
      if (!contentType || !contentType.includes('application/pdf')) {
        console.error('Invalid content type:', contentType);
        const text = await response.text();
        console.error('Response body:', text);
        throw new Error('Server did not return a PDF file');
      }
      
      // Convert response to blob
      const blob = await response.blob();
      console.log('Blob size:', blob.size, 'type:', blob.type);
      
      if (blob.size === 0) {
        throw new Error('Received empty PDF file');
      }
      
      // Create download link
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = `Lab_Report_${appointmentId}.pdf`;
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      
      // Cleanup
      setTimeout(() => {
        window.URL.revokeObjectURL(blobUrl);
        document.body.removeChild(a);
      }, 100);
      
      console.log('Download initiated successfully');
      
    } catch (err) {
      console.error('Failed to download lab report:', err);
      alert('Failed to download lab report: ' + err.message);
    }
  };

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
          <button onClick={() => navigate(`/dashboard/${user?.role}/change-password`)} className="btn-change-password">🔐 Change Password</button>
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
              <div className="info-card clickable" onClick={() => navigate('/medical-certificate')}>
                <div className="card-icon">📄</div>
                <h3>Medical Certificate</h3>
                <p>Request Medical Certificate</p>
              </div>
            </div>

            {/* QR Code Generator Section */}
            <QRCodeGenerator />

            {/* Lab Reports Section */}
            {labReports.length > 0 && (
              <div className="lab-reports-section">
                <div className="section-header">
                  <h2>📋 My Lab Reports</h2>
                  <div className="filter-container">
                    <label htmlFor="lab-filter">Filter by Appointment:</label>
                    <select 
                      id="lab-filter"
                      value={selectedAppointment} 
                      onChange={(e) => handleAppointmentFilter(e.target.value)}
                      className="appointment-filter"
                    >
                      <option value="latest">Latest Only</option>
                      <option value="all">All Lab Reports</option>
                      <optgroup label="By Appointment">
                        {allAppointments.map((apt) => (
                          <option key={apt.id} value={apt.id}>
                            Appointment #{apt.appointment_number} - {new Date(apt.appointment_date).toLocaleDateString()}
                          </option>
                        ))}
                      </optgroup>
                    </select>
                  </div>
                </div>
                <div className="lab-reports-grid">
                  {filteredLabReports.length === 0 ? (
                    <div className="no-results-message">
                      <p>No lab reports found for the selected appointment.</p>
                    </div>
                  ) : (
                    filteredLabReports.map((appointment) => (
                      <div key={appointment.id} className="lab-report-card">
                        <div className="report-header">
                          <div className="report-id">Appointment #{appointment.appointment_number}</div>
                          <div className="report-date">
                            {new Date(appointment.completed_at).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="report-content">
                          <p className="report-label">Lab Tests Required:</p>
                          <p className="report-text">{appointment.lab_reports}</p>
                        </div>
                        <div className="report-footer">
                          <span className="approved-badge">✓ Doctor Approved</span>
                          <button 
                            onClick={() => downloadLabReport(appointment.id)}
                            className="btn-download"
                          >
                            📥 Download PDF
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Prescriptions Section */}
            {prescriptions.length > 0 && (
              <div className="prescriptions-section">
                <div className="section-header">
                  <h2>💊 My Prescriptions</h2>
                  <div className="filter-container">
                    <label htmlFor="prescription-filter">Filter by Appointment:</label>
                    <select 
                      id="prescription-filter"
                      value={selectedAppointment} 
                      onChange={(e) => handleAppointmentFilter(e.target.value)}
                      className="appointment-filter"
                    >
                      <option value="latest">Latest Only</option>
                      <option value="all">All Prescriptions</option>
                      <optgroup label="By Appointment">
                        {allAppointments.map((apt) => (
                          <option key={apt.id} value={apt.id}>
                            Appointment #{apt.appointment_number} - {new Date(apt.appointment_date).toLocaleDateString()}
                          </option>
                        ))}
                      </optgroup>
                    </select>
                  </div>
                </div>
                <p className="section-subtitle">Download prescriptions for medications not available in campus pharmacy</p>
                <div className="prescriptions-grid">
                  {filteredPrescriptions.length === 0 ? (
                    <div className="no-results-message">
                      <p>No prescriptions found for the selected appointment.</p>
                    </div>
                  ) : (
                    filteredPrescriptions.map((prescription) => (
                      <div key={prescription.id} className="prescription-card">
                        <div className="prescription-header">
                          <div className="rx-symbol">℞</div>
                          <div className="prescription-info">
                            <div className="prescription-id">Prescription #{prescription.id}</div>
                          <div className="prescription-date">
                            {new Date(prescription.created_at).toLocaleDateString()}
                          </div>
                        </div>
                        <div className={`status-badge status-${prescription.status}`}>
                          {prescription.status === 'pending' && '⏳ Pending'}
                          {prescription.status === 'dispensed' && '✓ Dispensed'}
                          {prescription.status === 'completed' && '✓ Completed'}
                        </div>
                      </div>
                      
                      <div className="prescription-body">
                        <div className="doctor-info">
                          <div className="doctor-label">Prescribed by:</div>
                          <div className="doctor-name">Dr. {prescription.doctor?.name || 'Unknown'}</div>
                          {prescription.doctor?.email && (
                            <div className="doctor-contact">{prescription.doctor.email}</div>
                          )}
                        </div>

                        <div className="medications-preview">
                          <div className="medications-label">Medications:</div>
                          <div className="medications-list">
                            {prescription.medications?.substring(0, 100)}
                            {prescription.medications?.length > 100 && '...'}
                          </div>
                        </div>

                        {prescription.instructions && (
                          <div className="instructions-preview">
                            <div className="instructions-label">Instructions:</div>
                            <div className="instructions-text">
                              {prescription.instructions.substring(0, 80)}
                              {prescription.instructions.length > 80 && '...'}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="prescription-footer">
                        <div className="signature-badge">
                          <span className="signature-icon">✍️</span>
                          <span>Doctor's E-Signature Included</span>
                        </div>
                        <button 
                          onClick={() => handleDownloadPrescription(prescription.id)}
                          className="btn-download-prescription"
                        >
                          <span className="download-icon">📄</span>
                          <span>Download PDF</span>
                        </button>
                      </div>
                    </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default StudentStaffDashboard;
