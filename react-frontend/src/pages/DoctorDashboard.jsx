import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import SignatureManager from '../components/SignatureManager';
import {
  getMedicalCertificates,
  approveMedicalCertificate,
  rejectMedicalCertificate,
  viewDocument
} from '../services/medicalService';
import './Dashboard.css';
import './DoctorDashboard.css';

function DoctorDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [certificates, setCertificates] = useState([]);
  const [showCertificates, setShowCertificates] = useState(false);
  const [selectedCert, setSelectedCert] = useState(null);
  const [doctorNotes, setDoctorNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (!currentUser || currentUser.role !== 'doctor') {
      navigate('/login');
      return;
    }
    setUser(currentUser);
    fetchCertificates();
  }, [navigate]);

  const fetchCertificates = async () => {
    try {
      const data = await getMedicalCertificates();
      setCertificates(data);
    } catch (err) {
      console.error('Error fetching certificates:', err);
    }
  };

  const handleApproveCertificate = async (certId) => {
    try {
      setLoading(true);
      setError('');
      await approveMedicalCertificate(certId, doctorNotes);
      setSuccess('Medical certificate approved successfully!');
      setSelectedCert(null);
      setDoctorNotes('');
      fetchCertificates();
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRejectCertificate = async (certId) => {
    if (!rejectionReason.trim()) {
      setError('Please provide a rejection reason');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await rejectMedicalCertificate(certId, rejectionReason);
      setSuccess('Medical certificate rejected');
      setSelectedCert(null);
      setRejectionReason('');
      fetchCertificates();
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const pendingCertificates = certificates.filter(cert => cert.status === 'pending');

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
        {error && (
          <div className="alert alert-error">
            ⚠️ {error}
          </div>
        )}
        {success && (
          <div className="alert alert-success">
            ✓ {success}
          </div>
        )}

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

          <div 
            className="dashboard-card clickable" 
            onClick={() => setShowCertificates(!showCertificates)}
            style={{ cursor: 'pointer' }}
          >
            <h3>Medical Certificates</h3>
            <p>Review and approve student/staff medical certificate requests</p>
            <div className="card-stat">{pendingCertificates.length} Pending</div>
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

        {/* Medical Certificates Section */}
        {showCertificates && (
          <div className="medical-certificates-section">
            <h3>Pending Medical Certificate Requests</h3>
            
            {pendingCertificates.length === 0 ? (
              <div className="no-data">No pending certificate requests</div>
            ) : (
              <div className="certificates-list">
                {pendingCertificates.map(cert => (
                  <div key={cert.id} className="cert-request-card">
                    <div className="cert-header-info">
                      <div>
                        <h4>{cert.user?.name}</h4>
                        <p className="cert-user-role">{cert.user?.role} - {cert.user?.email}</p>
                      </div>
                      <span className="cert-badge pending">Pending Review</span>
                    </div>

                    <div className="cert-details">
                      <div className="cert-detail-item">
                        <label>Period:</label>
                        <span>{formatDate(cert.start_date)} - {formatDate(cert.end_date)}</span>
                      </div>
                      <div className="cert-detail-item">
                        <label>Days:</label>
                        <span>{cert.days_requested} {cert.days_requested === 1 ? 'day' : 'days'}</span>
                      </div>
                      <div className="cert-detail-item">
                        <label>Requested:</label>
                        <span>{formatDate(cert.created_at)}</span>
                      </div>
                    </div>

                    <div className="cert-reason">
                      <label>Reason:</label>
                      <p>{cert.reason}</p>
                    </div>

                    {cert.appointment && (
                      <div className="cert-appointment-info">
                        <label>Related Previous Appointment:</label>
                        <div className="appointment-details">
                          <p><strong>Appointment #{cert.appointment.appointment_number}</strong></p>
                          <p>Date: {formatDate(cert.appointment.appointment_date)}</p>
                          <p>Time: {cert.appointment.appointment_time}</p>
                          {cert.appointment.reason && <p>Reason: {cert.appointment.reason}</p>}
                          {cert.appointment.diagnosis && <p>Diagnosis: {cert.appointment.diagnosis}</p>}
                          {cert.appointment.treatment && <p>Treatment: {cert.appointment.treatment}</p>}
                        </div>
                      </div>
                    )}

                    {cert.document_path && (
                      <div className="cert-document">
                        <label>Supporting Document Uploaded:</label>
                        <a 
                          href={viewDocument(cert.id)} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="view-document-btn"
                        >
                          📎 View Document
                        </a>
                      </div>
                    )}

                    {selectedCert?.id === cert.id ? (
                      <div className="cert-action-form">
                        <div className="form-group">
                          <label>Doctor's Notes (Optional)</label>
                          <textarea
                            value={doctorNotes}
                            onChange={(e) => setDoctorNotes(e.target.value)}
                            placeholder="Add any medical notes or recommendations..."
                            rows="3"
                          />
                        </div>

                        <div className="form-group">
                          <label>Rejection Reason (Required if rejecting)</label>
                          <textarea
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            placeholder="Reason for rejection..."
                            rows="3"
                          />
                        </div>

                        <div className="cert-actions">
                          <button
                            onClick={() => handleApproveCertificate(cert.id)}
                            className="btn-approve"
                            disabled={loading}
                          >
                            {loading ? 'Processing...' : '✓ Approve'}
                          </button>
                          <button
                            onClick={() => handleRejectCertificate(cert.id)}
                            className="btn-reject"
                            disabled={loading}
                          >
                            {loading ? 'Processing...' : '✗ Reject'}
                          </button>
                          <button
                            onClick={() => {
                              setSelectedCert(null);
                              setDoctorNotes('');
                              setRejectionReason('');
                            }}
                            className="btn-cancel"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="cert-actions">
                        <button
                          onClick={() => setSelectedCert(cert)}
                          className="btn-review"
                        >
                          Review & Process
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="info-section" style={{ marginTop: '30px' }}>
          <SignatureManager />
        </div>
      </div>
    </div>
  );
}

export default DoctorDashboard;
