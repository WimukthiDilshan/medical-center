import { useState, useEffect } from 'react';
import appointmentService from '../../services/appointmentService';
import './PatientAppointments.css';

function PatientAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const user = JSON.parse(localStorage.getItem('user'));

  // Fetch patient's appointments
  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const data = await appointmentService.getHistory(user.id);
      setAppointments(data);
    } catch (err) {
      setError('Failed to fetch appointments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchAppointments();
    }
  }, []);

  // Separate appointments by status
  const upcomingAppointments = appointments.filter(
    apt => ['pending', 'checked_in', 'in_progress'].includes(apt.status)
  );
  
  const pastAppointments = appointments.filter(
    apt => ['completed', 'cancelled'].includes(apt.status)
  );

  return (
    <div className="patient-appointments">
      <h1>My Appointments</h1>

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <div className="loading">Loading appointments...</div>
      ) : (
        <>
          {/* Upcoming/Active Appointments */}
          <div className="card">
            <h2>Current Appointments</h2>
            {upcomingAppointments.length === 0 ? (
              <p className="no-appointments">No current appointments</p>
            ) : (
              <div className="appointments-grid">
                {upcomingAppointments.map((apt) => (
                  <div key={apt.id} className={`appointment-card ${apt.priority === 'urgent' ? 'urgent' : ''}`}>
                    <div className="card-header">
                      <span className="appointment-number">Appointment #{apt.appointment_number}</span>
                      <span className={`badge badge-${apt.status}`}>{apt.status}</span>
                    </div>

                    <div className="card-body">
                      <div className="detail-row">
                        <span className="label">Date:</span>
                        <span className="value">{new Date(apt.appointment_date).toLocaleDateString()}</span>
                      </div>
                      
                      <div className="detail-row">
                        <span className="label">Time:</span>
                        <span className="value">{apt.appointment_time}</span>
                      </div>

                      {apt.reason && (
                        <div className="detail-row">
                          <span className="label">Reason:</span>
                          <span className="value">{apt.reason}</span>
                        </div>
                      )}

                      <div className="detail-row">
                        <span className="label">Priority:</span>
                        <span className={`badge badge-${apt.priority}`}>{apt.priority}</span>
                      </div>

                      {apt.checked_in_at && (
                        <div className="detail-row">
                          <span className="label">Checked In:</span>
                          <span className="value">{new Date(apt.checked_in_at).toLocaleTimeString()}</span>
                        </div>
                      )}

                      <div className="created-by">
                        <small>Created by: {apt.created_by?.name || 'Nurse'}</small>
                      </div>
                    </div>

                    {apt.status === 'pending' && (
                      <div className="card-footer">
                        <div className="info-message">
                          Please arrive 10 minutes before your scheduled time
                        </div>
                      </div>
                    )}

                    {apt.status === 'checked_in' && (
                      <div className="card-footer">
                        <div className="info-message waiting">
                          You are in the queue. Please wait to be called.
                        </div>
                      </div>
                    )}

                    {apt.status === 'in_progress' && (
                      <div className="card-footer">
                        <div className="info-message in-progress">
                          Your consultation is in progress
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Past Appointments */}
          <div className="card">
            <h2>Appointment History</h2>
            {pastAppointments.length === 0 ? (
              <p className="no-appointments">No past appointments</p>
            ) : (
              <div className="history-table-container">
                <table className="history-table">
                  <thead>
                    <tr>
                      <th>No.</th>
                      <th>Date</th>
                      <th>Time</th>
                      <th>Reason</th>
                      <th>Status</th>
                      <th>Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pastAppointments.map((apt) => (
                      <tr key={apt.id}>
                        <td>#{apt.appointment_number}</td>
                        <td>{new Date(apt.appointment_date).toLocaleDateString()}</td>
                        <td>{apt.appointment_time}</td>
                        <td>{apt.reason || 'N/A'}</td>
                        <td>
                          <span className={`badge badge-${apt.status}`}>{apt.status}</span>
                        </td>
                        <td>
                          {apt.medical_notes ? (
                            <details>
                              <summary>View Notes</summary>
                              <div className="notes-content">{apt.medical_notes}</div>
                            </details>
                          ) : (
                            'N/A'
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Summary Stats */}
          <div className="summary-stats">
            <div className="stat-box">
              <span className="stat-label">Total Appointments</span>
              <span className="stat-value">{appointments.length}</span>
            </div>
            <div className="stat-box">
              <span className="stat-label">Completed</span>
              <span className="stat-value">
                {appointments.filter(a => a.status === 'completed').length}
              </span>
            </div>
            <div className="stat-box">
              <span className="stat-label">Upcoming</span>
              <span className="stat-value">{upcomingAppointments.length}</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default PatientAppointments;
