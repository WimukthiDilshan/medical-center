import { useState, useEffect } from 'react';
import appointmentService from '../../services/appointmentService';
import './DoctorDashboard.css';

function DoctorDashboard() {
  const [appointments, setAppointments] = useState([]);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [medicalNotes, setMedicalNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [patientHistory, setPatientHistory] = useState([]);
  const [completedCount, setCompletedCount] = useState(0);

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
    if (!medicalNotes.trim()) {
      setError('Please enter medical notes');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await appointmentService.completeAppointment(selectedAppointment.id, medicalNotes);
      setSuccess('Appointment completed successfully');
      setMedicalNotes('');
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
    fetchQueue();
    const interval = setInterval(fetchQueue, 30000);
    return () => clearInterval(interval);
  }, []);

  // Count appointments by status
  const stats = {
    pending: appointments.filter(a => a.status === 'pending').length,
    checked_in: appointments.filter(a => a.status === 'checked_in').length,
    in_progress: appointments.filter(a => a.status === 'in_progress').length,
  };

  return (
    <div className="doctor-dashboard">
      <h1>Doctor Dashboard</h1>

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
      </div>

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
                    <label>Medical Notes / Prescription:</label>
                    <textarea
                      value={medicalNotes}
                      onChange={(e) => setMedicalNotes(e.target.value)}
                      placeholder="Enter diagnosis, prescription, and recommendations..."
                      rows="8"
                      required
                    />
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
    </div>
  );
}

export default DoctorDashboard;
