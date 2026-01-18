import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import appointmentService from '../../services/appointmentService';
import prescriptionService from '../../services/prescriptionService';
import { authService } from '../../services/authService';
import SignatureManager from '../../components/SignatureManager';
import { getMedicalCertificates } from '../../services/medicalService';
import './DoctorDashboard.css';

function DoctorDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [medicalNotes, setMedicalNotes] = useState('');
  const [medications, setMedications] = useState('');
  const [labReports, setLabReports] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [patientHistory, setPatientHistory] = useState([]);
  const [completedCount, setCompletedCount] = useState(0);
  const [showPrescriptions, setShowPrescriptions] = useState(false);
  const [prescriptions, setPrescriptions] = useState([]);
  const [showReports, setShowReports] = useState(false);
  
  // Medical Certificate count
  const [certificates, setCertificates] = useState([]);

  // Fetch today's queue
  const fetchQueue = async () => {
    try {
      const data = await appointmentService.getQueue();
      setAppointments(data);
      
      // Fetch completed count for today
      const allToday = await appointmentService.getAppointments({ today: true });
      const completed = allToday.filter(apt => apt.status === 'completed').length;
      setCompletedCount(completed);
    } catch (err) {
      setError('Failed to fetch appointments');
    }
  };

  // Fetch doctor's prescriptions
  const fetchPrescriptions = async () => {
    try {
      const data = await prescriptionService.getPrescriptions();
      setPrescriptions(data);
      setShowPrescriptions(true);
    } catch (err) {
      setError('Failed to fetch prescriptions');
    }
  };

  // Fetch medical certificates
  const fetchCertificates = async () => {
    try {
      const data = await getMedicalCertificates();
      setCertificates(data);
    } catch (err) {
      console.error('Error fetching certificates:', err);
    }
  };

  // Start consultation
  const handleStartConsultation = async (appointment) => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const result = await appointmentService.startConsultation(appointment.id);
      // Set the updated appointment with in_progress status
      const updatedAppointment = { ...appointment, status: 'in_progress' };
      setSelectedAppointment(updatedAppointment);
      setSuccess('Consultation started');
      fetchQueue();
    } catch (err) {
      setError('Failed to start consultation');
    } finally {
      setLoading(false);
    }
  };

  // Complete appointment
  const handleCompleteAppointment = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const data = {
        medical_notes: medicalNotes,
        medications: medications,
        lab_reports: labReports
      };
      
      await appointmentService.completeAppointment(selectedAppointment.id, data);
      setSuccess('Appointment completed successfully');
      
      // Reset form
      setMedicalNotes('');
      setMedications('');
      setLabReports('');
      setSelectedAppointment(null);
      
      fetchQueue();
    } catch (err) {
      setError('Failed to complete appointment');
    } finally {
      setLoading(false);
    }
  };

  // View patient details
  const viewPatientDetails = async (appointment) => {
    setSelectedAppointment(appointment);
    setShowHistory(false);
    
    // Fetch patient's appointment history
    try {
      const history = await appointmentService.getHistory(appointment.user_id);
      setPatientHistory(history);
    } catch (err) {
      console.error('Failed to fetch history', err);
    }
  };

  // Load queue on mount and refresh every 30 seconds
  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    }
    fetchQueue();
    fetchCertificates();
    const interval = setInterval(fetchQueue, 30000);
    return () => clearInterval(interval);
  }, []);

  // Handle logout
  const handleLogout = async () => {
    await authService.logout();
    navigate('/login');
  };

  // Count appointments by status
  const stats = {
    pending: appointments.filter(a => a.status === 'pending').length,
    checked_in: appointments.filter(a => a.status === 'checked_in').length,
    in_progress: appointments.filter(a => a.status === 'in_progress').length,
  };

  const pendingCertificates = certificates.filter(cert => cert.status === 'pending');

  return (
    <div className="doctor-dashboard">
      {/* Navigation Bar */}
      <nav className="dashboard-nav">
        <h1>Doctor Dashboard</h1>
        <div className="nav-user">
          <span className="user-name">👨‍⚕️ Dr. {user?.name}</span>
          <button onClick={handleLogout} className="btn-logout">Logout</button>
        </div>
      </nav>

      <div className="dashboard-content">
        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Pending</h3>
          <p className="stat-number">{stats.pending}</p>
        </div>
        <div className="stat-card">
          <h3>Checked In</h3>
          <p className="stat-number">{stats.checked_in}</p>
        </div>
        <div className="stat-card">
          <h3>In Progress</h3>
          <p className="stat-number">{stats.in_progress}</p>
        </div>
        <div className="stat-card">
          <h3>Completed Today</h3>
          <p className="stat-number">{completedCount}</p>
        </div>
        <div 
          className="stat-card clickable" 
          onClick={() => navigate('/dashboard/doctor/medical-certificates')}
          style={{ cursor: 'pointer', background: 'linear-gradient(135deg, #f0fdfa 0%, #ccfbf1 100%)', borderLeft: '4px solid #14b8a6' }}
        >
          <h3>Medical Certificates</h3>
          <p className="stat-number">{pendingCertificates.length}</p>
          <p style={{ fontSize: '0.85rem', color: '#0d9488', marginTop: '0.5rem' }}>Click to Review</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="action-buttons">
        <button onClick={fetchPrescriptions} className="btn-action">
          📋 View My Prescriptions
        </button>
        <button onClick={() => setShowReports(!showReports)} className="btn-action">
          📊 Get Reports
        </button>
        <button onClick={() => navigate('/dashboard/doctor/medical-certificates')} className="btn-action" style={{ background: 'linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)' }}>
          📄 Medical Certificates ({pendingCertificates.length})
        </button>
        <button onClick={() => navigate('/dashboard/doctor/change-password')} className="btn-action" style={{ background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)' }}>
          🔐 Change Password
        </button>
      </div>

      {/* Prescriptions Section */}
      {showPrescriptions && (
        <div className="card prescriptions-card">
          <div className="card-header-flex">
            <h2>My Prescriptions</h2>
            <button onClick={() => setShowPrescriptions(false)} className="btn-close-section">✕</button>
          </div>
          <div className="prescriptions-list">
            {prescriptions.length === 0 ? (
              <p>No prescriptions found</p>
            ) : (
              prescriptions.map((prescription) => (
                <div key={prescription.id} className="prescription-item">
                  <div className="prescription-header">
                    <span className="prescription-id">Prescription #{prescription.id}</span>
                    <span className={`badge badge-${prescription.status}`}>{prescription.status}</span>
                  </div>
                  <div className="prescription-details">
                    <p><strong>Patient:</strong> {prescription.patient?.name} (ID: {prescription.patient?.staff_id})</p>
                    <p><strong>Medications:</strong> {prescription.medications}</p>
                    <p><strong>Date:</strong> {new Date(prescription.created_at).toLocaleString()}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Reports Section */}
      {showReports && (
        <div className="card reports-card">
          <div className="card-header-flex">
            <h2>Reports & Statistics</h2>
            <button onClick={() => setShowReports(false)} className="btn-close-section">✕</button>
          </div>
          <div className="reports-content">
            <div className="report-item">
              <h3>Today's Summary</h3>
              <p>Total Appointments: {appointments.length}</p>
              <p>Completed: {completedCount}</p>
              <p>Pending: {stats.pending}</p>
              <p>In Progress: {stats.in_progress}</p>
            </div>
            <div className="report-item">
              <h3>Prescriptions</h3>
              <p>Total Prescribed: {prescriptions.length}</p>
              <p>Pending: {prescriptions.filter(p => p.status === 'pending').length}</p>
              <p>Dispensed: {prescriptions.filter(p => p.status === 'dispensed').length}</p>
              <p>Completed: {prescriptions.filter(p => p.status === 'completed').length}</p>
            </div>
          </div>
        </div>
      )}

      <div className="dashboard-grid">
        {/* Queue List */}
        <div className="card queue-card">
          <h2>Today's Queue</h2>
          <button onClick={fetchQueue} className="btn-refresh">Refresh Queue</button>

          {appointments.length === 0 ? (
            <p>No appointments in queue</p>
          ) : (
            <div className="queue-list">
              {appointments.map((apt) => (
                <div 
                  key={apt.id} 
                  className={`queue-item ${apt.priority === 'urgent' ? 'urgent' : ''} ${selectedAppointment?.id === apt.id ? 'selected' : ''}`}
                  onClick={() => viewPatientDetails(apt)}
                >
                  <div className="queue-header">
                    <span className="appointment-number">#{apt.appointment_number}</span>
                    <span className={`badge badge-${apt.priority}`}>{apt.priority}</span>
                  </div>
                  
                  <div className="queue-details">
                    <p><strong>{apt.user?.name}</strong></p>
                    <p>ID: {apt.user?.staff_id}</p>
                    <p>Time: {apt.appointment_time}</p>
                    <p>Reason: {apt.reason || 'N/A'}</p>
                  </div>

                  <div className="queue-status">
                    <span className={`badge badge-${apt.status}`}>{apt.status}</span>
                  </div>

                  {apt.status === 'checked_in' && (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStartConsultation(apt);
                      }}
                      className="btn-start"
                      disabled={loading}
                    >
                      Start Consultation
                    </button>
                  )}

                  {apt.status === 'in_progress' && selectedAppointment?.id !== apt.id && (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        viewPatientDetails(apt);
                      }}
                      className="btn-continue"
                    >
                      Continue
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Patient Details & Consultation */}
        <div className="card details-card">
          {selectedAppointment ? (
            <>
              <h2>Patient Details</h2>
              
              <div className="patient-info">
                <div className="info-row">
                  <span className="info-label">Name:</span>
                  <span className="info-value">{selectedAppointment.user?.name}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Staff ID:</span>
                  <span className="info-value">{selectedAppointment.user?.staff_id}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Email:</span>
                  <span className="info-value">{selectedAppointment.user?.email}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Role:</span>
                  <span className="info-value">{selectedAppointment.user?.role}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Appointment #:</span>
                  <span className="info-value">#{selectedAppointment.appointment_number}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Time:</span>
                  <span className="info-value">{selectedAppointment.appointment_time}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Priority:</span>
                  <span className={`badge badge-${selectedAppointment.priority}`}>
                    {selectedAppointment.priority}
                  </span>
                </div>
                <div className="info-row">
                  <span className="info-label">Reason:</span>
                  <span className="info-value">{selectedAppointment.reason || 'N/A'}</span>
                </div>
              </div>

              {/* Patient History */}
              <div className="history-section">
                <button 
                  onClick={() => setShowHistory(!showHistory)}
                  className="btn-history"
                >
                  {showHistory ? 'Hide' : 'Show'} Appointment History
                </button>

                {showHistory && patientHistory.length > 0 && (
                  <div className="history-list">
                    <h3>Previous Appointments</h3>
                    {patientHistory.map((hist) => (
                      <div key={hist.id} className="history-item">
                        <p><strong>Appointment #:</strong> {hist.appointment_number}</p>
                        <p><strong>Date:</strong> {hist.appointment_date} {hist.appointment_time}</p>
                        <p><strong>Status:</strong> {hist.status}</p>
                        {hist.medical_notes && (
                          <p><strong>Notes:</strong> {hist.medical_notes}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Consultation Form */}
              {selectedAppointment.status === 'in_progress' && (
                <form onSubmit={handleCompleteAppointment} className="consultation-form">
                  <h3>Complete Consultation</h3>
                  
                  <div className="form-group">
                    <label>Notes:</label>
                    <textarea
                      value={medicalNotes}
                      onChange={(e) => setMedicalNotes(e.target.value)}
                      placeholder="Enter medical notes and observations..."
                      rows="4"
                    />
                  </div>

                  <div className="form-group">
                    <label>Prescription:</label>
                    <textarea
                      value={medications}
                      onChange={(e) => setMedications(e.target.value)}
                      placeholder="Enter prescribed medications, dosage, and duration... (e.g., Paracetamol 500mg - 2 times daily for 3 days)"
                      rows="4"
                    />
                    <small style={{color: '#7f8c8d', marginTop: '5px', display: 'block'}}>
                      If medications prescribed, it will be sent to pharmacist
                    </small>
                  </div>

                  <div className="form-group lab-reports-group">
                    <label>🩺 Lab Request:</label>
                    <textarea
                      value={labReports}
                      onChange={(e) => setLabReports(e.target.value)}
                      placeholder="Enter required lab tests/blood reports... (e.g., Complete Blood Count (CBC), Blood Sugar Test, Lipid Profile)"
                      rows="3"
                    />
                    <small style={{color: '#7f8c8d', marginTop: '5px', display: 'block'}}>
                      List any blood tests or lab reports required from laboratory
                    </small>
                  </div>

                  <button type="submit" disabled={loading} className="btn-complete">
                    {loading ? 'Completing...' : 'Complete Appointment'}
                  </button>
                </form>
              )}

              {selectedAppointment.status === 'completed' && selectedAppointment.medical_notes && (
                <div className="completed-notes">
                  <h3>Medical Notes</h3>
                  <p>{selectedAppointment.medical_notes}</p>
                  <p className="completed-time">
                    Completed at: {new Date(selectedAppointment.completed_at).toLocaleString()}
                  </p>
                </div>
              )}
            </>
          ) : (
            <div className="no-selection">
              <p>Select an appointment from the queue to view details</p>
            </div>
          )}
        </div>
      </div>

      {/* E-Signature Management Section */}
      <div style={{ margin: '30px auto', maxWidth: '1200px', padding: '0 20px' }}>
        <SignatureManager />
      </div>
      </div>
    </div>
  );
}

export default DoctorDashboard;
