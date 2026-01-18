import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import prescriptionService from '../services/prescriptionService';
import './PharmacistDashboard.css';

function PharmacistDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [prescriptions, setPrescriptions] = useState([]); // Active prescriptions for display
  const [allPrescriptions, setAllPrescriptions] = useState([]); // All prescriptions for stats
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchId, setSearchId] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (!currentUser || currentUser.role !== 'pharmacist') {
      navigate('/login');
      return;
    }
    setUser(currentUser);
    fetchPrescriptions();
  }, [navigate]);

  // Fetch prescriptions (exclude completed from main view)
  const fetchPrescriptions = async () => {
    setLoading(true);
    try {
      const data = await prescriptionService.getPrescriptions();
      // Store all prescriptions for accurate stats
      setAllPrescriptions(data);
      // Filter out completed prescriptions from main view
      const activePrescriptions = data.filter(p => p.status !== 'completed');
      setPrescriptions(activePrescriptions);
    } catch (err) {
      setError('Failed to fetch prescriptions');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Search patient prescriptions by ID
  const handleSearch = async () => {
    if (!searchId.trim()) {
      setError('Please enter a Student/Staff ID');
      return;
    }
    
    setSearching(true);
    setError('');
    try {
      const data = await prescriptionService.getPatientPrescriptions(searchId);
      setSearchResults(data);
      if (data.length === 0) {
        setError('No prescriptions found for this ID');
      }
    } catch (err) {
      setError('Failed to search prescriptions');
      console.error(err);
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  // Auto-refresh every 20 seconds
  useEffect(() => {
    const interval = setInterval(fetchPrescriptions, 20000);
    return () => clearInterval(interval);
  }, []);

  // Complete prescription
  const handleComplete = async (id) => {
    setError('');
    setSuccess('');
    try {
      await prescriptionService.complete(id);
      setSuccess('Prescription completed successfully');
      fetchPrescriptions();
      setSelectedPrescription(null);
    } catch (err) {
      setError('Failed to complete prescription');
    }
  };

  const handleLogout = async () => {
    await authService.logout();
    navigate('/login');
  };

  // Calculate stats from all prescriptions
  const stats = {
    pending: allPrescriptions.filter(p => p.status === 'pending').length,
    completed: allPrescriptions.filter(p => p.status === 'completed').length,
  };

  return (
    <div className="pharmacist-dashboard">
      <nav className="dashboard-nav">
        <h1>💊 Pharmacist Dashboard</h1>
        <div className="nav-user">
          <span className="user-name">{user?.name}</span>
          <button onClick={() => navigate('/dashboard/pharmacist/change-password')} className="btn-change-password">🔐 Change Password</button>
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
            <h3>Completed</h3>
            <p className="stat-number">{stats.completed}</p>
          </div>
        </div>

        {/* Search Section */}
        <div className="prescriptions-section" style={{ marginBottom: '30px' }}>
          <div className="section-header">
            <h2>🔍 Search Patient Prescriptions</h2>
          </div>
          <div className="search-container">
            <input
              type="text"
              placeholder="Enter Student/Staff ID Number"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="search-input"
            />
            <button 
              onClick={handleSearch} 
              className="btn-search"
              disabled={searching}
            >
              {searching ? 'Searching...' : 'Search'}
            </button>
            {searchResults.length > 0 && (
              <button 
                onClick={() => { setSearchResults([]); setSearchId(''); }}
                className="btn-clear"
              >
                Clear Results
              </button>
            )}
          </div>

          {searchResults.length > 0 && (
            <div className="search-results">
              <h3>Prescription History for ID: {searchId}</h3>
              <div className="prescriptions-grid">
                {searchResults.map((prescription) => (
                  <div 
                    key={prescription.id} 
                    className={`prescription-card ${prescription.status}`}
                    onClick={() => setSelectedPrescription(prescription)}
                  >
                    <div className="card-header">
                      <span className="prescription-id">#{prescription.id}</span>
                      <span className={`status-badge ${prescription.status}`}>
                        {prescription.status}
                      </span>
                    </div>
                    <div className="card-body">
                      <div className="info-row">
                        <span className="label">Patient:</span>
                        <span className="value">{prescription.patient?.name}</span>
                      </div>
                      <div className="info-row">
                        <span className="label">ID Number:</span>
                        <span className="value">{prescription.patient?.staff_id}</span>
                      </div>
                      <div className="info-row">
                        <span className="label">Doctor:</span>
                        <span className="value">{prescription.doctor?.name}</span>
                      </div>
                      <div className="info-row">
                        <span className="label">Diagnosis:</span>
                        <span className="value">{prescription.diagnosis}</span>
                      </div>
                      <div className="info-row">
                        <span className="label">Medications:</span>
                        <span className="value medication">{prescription.medications}</span>
                      </div>
                      <div className="info-row">
                        <span className="label">Date:</span>
                        <span className="value">
                          {new Date(prescription.created_at).toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <div className="card-actions">
                      {prescription.status === 'completed' ? (
                        <span className="completed-text">✓ Completed</span>
                      ) : (
                        <button
                          className="btn-action btn-complete"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleComplete(prescription.id);
                          }}
                        >
                          Complete
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {loading && !prescriptions.length ? (
          <div className="loading">Loading prescriptions...</div>
        ) : (
          <div className="prescriptions-section">
            <div className="section-header">
              <h2>📋 Prescriptions</h2>
              <button onClick={fetchPrescriptions} className="btn-refresh">Refresh</button>
            </div>

            {prescriptions.length === 0 ? (
              <div className="no-data">
                <p>No prescriptions available</p>
              </div>
            ) : (
              <div className="prescriptions-grid">
                {prescriptions.map((prescription) => (
                  <div 
                    key={prescription.id} 
                    className={`prescription-card ${prescription.status}`}
                    onClick={() => setSelectedPrescription(prescription)}
                  >
                    <div className="card-header">
                      <span className="prescription-id">Rx #{prescription.id}</span>
                      <span className={`status-badge ${prescription.status}`}>
                        {prescription.status}
                      </span>
                    </div>

                    <div className="card-body">
                      <div className="info-row">
                        <span className="label">Patient:</span>
                        <span className="value">{prescription.patient?.name}</span>
                      </div>
                      <div className="info-row">
                        <span className="label">ID Number:</span>
                        <span className="value">{prescription.patient?.staff_id}</span>
                      </div>
                      <div className="info-row">
                        <span className="label">Doctor:</span>
                        <span className="value">{prescription.doctor?.name}</span>
                      </div>
                      <div className="info-row">
                        <span className="label">Diagnosis:</span>
                        <span className="value">{prescription.diagnosis}</span>
                      </div>
                      <div className="info-row">
                        <span className="label">Medications:</span>
                        <span className="value medication">{prescription.medications}</span>
                      </div>
                      {prescription.instructions && (
                        <div className="info-row">
                          <span className="label">Instructions:</span>
                          <span className="value">{prescription.instructions}</span>
                        </div>
                      )}
                      <div className="info-row">
                        <span className="label">Date:</span>
                        <span className="value">
                          {new Date(prescription.created_at).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <div className="card-actions">
                      {prescription.status === 'pending' && (
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleComplete(prescription.id);
                          }}
                          className="btn-action btn-complete"
                        >
                          ✓ Complete
                        </button>
                      )}
                      {prescription.status === 'dispensed' && (
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleComplete(prescription.id);
                          }}
                          className="btn-action btn-complete"
                        >
                          ✓ Complete
                        </button>
                      )}
                      {prescription.status === 'completed' && (
                        <span className="completed-text">
                          ✓ Completed by {prescription.pharmacist?.name}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Prescription Details Modal */}
        {selectedPrescription && (
          <div className="modal-overlay" onClick={() => setSelectedPrescription(null)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Prescription Details</h2>
                <button 
                  onClick={() => setSelectedPrescription(null)}
                  className="btn-close"
                >
                  ×
                </button>
              </div>

              <div className="modal-body">
                <div className="detail-section">
                  <h3>Patient Information</h3>
                  <p><strong>Name:</strong> {selectedPrescription.patient?.name}</p>
                  <p><strong>ID:</strong> {selectedPrescription.patient?.staff_id}</p>
                  <p><strong>Email:</strong> {selectedPrescription.patient?.email}</p>
                </div>

                <div className="detail-section">
                  <h3>Prescription Details</h3>
                  <p><strong>Doctor:</strong> {selectedPrescription.doctor?.name}</p>
                  <p><strong>Diagnosis:</strong> {selectedPrescription.diagnosis}</p>
                  <p><strong>Medications:</strong></p>
                  <div className="medication-box">{selectedPrescription.medications}</div>
                  {selectedPrescription.instructions && (
                    <>
                      <p><strong>Instructions:</strong></p>
                      <p>{selectedPrescription.instructions}</p>
                    </>
                  )}
                  <p><strong>Date:</strong> {new Date(selectedPrescription.created_at).toLocaleString()}</p>
                  <p><strong>Status:</strong> <span className={`badge ${selectedPrescription.status}`}>{selectedPrescription.status}</span></p>
                </div>

                {selectedPrescription.status !== 'completed' && (
                  <div className="modal-actions">
                    <button 
                      onClick={() => handleComplete(selectedPrescription.id)}
                      className="btn-primary"
                    >
                      Complete Prescription
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default PharmacistDashboard;
