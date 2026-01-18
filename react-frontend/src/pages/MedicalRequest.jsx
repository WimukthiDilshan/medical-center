import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    getMedicalCertificates,
    createMedicalCertificate,
    downloadMedicalCertificate,
    viewDocument
} from '../services/medicalService';
import appointmentService from '../services/appointmentService';
import './MedicalRequest.css';

const MedicalRequest = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [certificates, setCertificates] = useState([]);
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [filePreview, setFilePreview] = useState(null);

    // Form state
    const [formData, setFormData] = useState({
        reason: '',
        start_date: '',
        end_date: '',
        appointment_id: ''
    });

    useEffect(() => {
        const userData = JSON.parse(localStorage.getItem('user'));
        if (!userData || (userData.role !== 'student' && userData.role !== 'staff')) {
            navigate('/login');
            return;
        }
        setUser(userData);
        fetchCertificates();
        fetchAppointments(userData.id);
    }, [navigate]);

    const fetchAppointments = async (userId) => {
        try {
            const history = await appointmentService.getHistory(userId);
            // Only show completed appointments
            const completed = history.filter(apt => apt.status === 'completed');
            setAppointments(completed);
        } catch (err) {
            console.error('Error fetching appointments:', err);
        }
    };

    const fetchCertificates = async () => {
        try {
            setLoading(true);
            const data = await getMedicalCertificates();
            setCertificates(data);
        } catch (err) {
            setError(err);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Check file size (5MB max)
            if (file.size > 5 * 1024 * 1024) {
                setError('File size must be less than 5MB');
                return;
            }
            
            // Check file type
            const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
            if (!allowedTypes.includes(file.type)) {
                setError('Only JPG, PNG, and PDF files are allowed');
                return;
            }

            setSelectedFile(file);
            
            // Create preview for images
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setFilePreview(reader.result);
                };
                reader.readAsDataURL(file);
            } else {
                setFilePreview('pdf');
            }
        }
    };

    const removeFile = () => {
        setSelectedFile(null);
        setFilePreview(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {
            const submitData = {
                ...formData,
                document: selectedFile
            };
            
            await createMedicalCertificate(submitData);
            setSuccess('Medical certificate request submitted successfully!');
            setFormData({ reason: '', start_date: '', end_date: '', appointment_id: '' });
            setSelectedFile(null);
            setFilePreview(null);
            setShowForm(false);
            fetchCertificates();
        } catch (err) {
            setError(err);
        }
    };

    const handleDownload = async (id) => {
        try {
            await downloadMedicalCertificate(id);
            setSuccess('Certificate downloaded successfully!');
        } catch (err) {
            setError(err);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    const getStatusBadge = (status) => {
        const badges = {
            pending: { class: 'status-pending', text: 'Pending' },
            approved: { class: 'status-approved', text: 'Approved' },
            rejected: { class: 'status-rejected', text: 'Rejected' }
        };
        return badges[status] || badges.pending;
    };

    const handleViewDocument = async (certId) => {
        try {
            await viewDocument(certId);
        } catch (err) {
            setError(err || 'Failed to view document');
            setTimeout(() => setError(''), 3000);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className="medical-request-container">
                <div className="loading">Loading...</div>
            </div>
        );
    }

    return (
        <div className="medical-request-container">
            {/* Navigation Bar */}
            <div className="medical-nav">
                <div className="nav-left">
                    <button onClick={() => navigate(`/dashboard/${user?.role}`)} className="back-btn">
                        ← Back to Dashboard
                    </button>
                    <h2>Medical Certificates</h2>
                </div>
                <div className="nav-right">
                    <span className="user-name">{user?.name}</span>
                    <button onClick={handleLogout} className="logout-btn">
                        Logout
                    </button>
                </div>
            </div>

            {/* Messages */}
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

            {/* Main Content */}
            <div className="medical-content">
                {/* Header with Request Button */}
                <div className="content-header">
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="request-btn"
                    >
                        {showForm ? 'Cancel' : '+ New Request'}
                    </button>
                </div>

                {/* Request Form */}
                {showForm && (
                    <div className="request-form-card">
                        <h3>Request Medical Certificate</h3>
                        <form onSubmit={handleSubmit} className="request-form">
                            <div className="form-group">
                                <label htmlFor="reason">Reason for Certificate *</label>
                                <textarea
                                    id="reason"
                                    name="reason"
                                    value={formData.reason}
                                    onChange={handleInputChange}
                                    placeholder="Please describe your medical condition or reason..."
                                    required
                                    rows="4"
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="start_date">Start Date *</label>
                                    <input
                                        type="date"
                                        id="start_date"
                                        name="start_date"
                                        value={formData.start_date}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="end_date">End Date *</label>
                                    <input
                                        type="date"
                                        id="end_date"
                                        name="end_date"
                                        value={formData.end_date}
                                        onChange={handleInputChange}
                                        min={formData.start_date}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label htmlFor="appointment_id">Link to Previous Appointment (Optional)</label>
                                <select
                                    id="appointment_id"
                                    name="appointment_id"
                                    value={formData.appointment_id}
                                    onChange={handleInputChange}
                                >
                                    <option value="">-- Select Previous Appointment --</option>
                                    {appointments.map(apt => (
                                        <option key={apt.id} value={apt.id}>
                                            #{apt.appointment_number} - {formatDate(apt.appointment_date)} - {apt.reason || 'General Consultation'}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label htmlFor="document">Upload Supporting Document (Optional)</label>
                                <p className="help-text">Upload medical prescription, doctor's note, or test results (JPG, PNG, PDF - Max 5MB)</p>
                                
                                {!selectedFile ? (
                                    <div className="file-upload-area">
                                        <input
                                            type="file"
                                            id="document"
                                            name="document"
                                            accept="image/jpeg,image/jpg,image/png,application/pdf"
                                            onChange={handleFileChange}
                                            style={{ display: 'none' }}
                                        />
                                        <label htmlFor="document" className="file-upload-label">
                                            <span className="upload-icon">📎</span>
                                            <span>Click to upload or drag and drop</span>
                                        </label>
                                    </div>
                                ) : (
                                    <div className="file-preview">
                                        {filePreview === 'pdf' ? (
                                            <div className="pdf-preview">
                                                <span className="pdf-icon">📄</span>
                                                <span className="file-name">{selectedFile.name}</span>
                                            </div>
                                        ) : (
                                            <img src={filePreview} alt="Preview" className="image-preview" />
                                        )}
                                        <button type="button" onClick={removeFile} className="remove-file-btn">
                                            ✕ Remove
                                        </button>
                                    </div>
                                )}
                            </div>

                            <button type="submit" className="submit-btn">
                                Submit Request
                            </button>
                        </form>
                    </div>
                )}

                {/* Certificates List */}
                <div className="certificates-section">
                    <h3>My Certificate Requests</h3>
                    {certificates.length === 0 ? (
                        <div className="no-data">
                            No medical certificate requests found.
                        </div>
                    ) : (
                        <div className="certificates-grid">
                            {certificates.map(cert => {
                                const status = getStatusBadge(cert.status);
                                return (
                                    <div key={cert.id} className="certificate-card">
                                        <div className="cert-header">
                                            <span className={`status-badge ${status.class}`}>
                                                {status.text}
                                            </span>
                                            <span className="cert-id">#{cert.id}</span>
                                        </div>

                                        <div className="cert-body">
                                            <div className="cert-info">
                                                <label>Period:</label>
                                                <p>{formatDate(cert.start_date)} - {formatDate(cert.end_date)}</p>
                                            </div>

                                            <div className="cert-info">
                                                <label>Days:</label>
                                                <p>{cert.days_requested} {cert.days_requested === 1 ? 'day' : 'days'}</p>
                                            </div>

                                            <div className="cert-info">
                                                <label>Reason:</label>
                                                <p>{cert.reason}</p>
                                            </div>

                                            {cert.appointment && (
                                                <div className="cert-info">
                                                    <label>Related Appointment:</label>
                                                    <p>#{cert.appointment.appointment_number} - {formatDate(cert.appointment.appointment_date)}</p>
                                                </div>
                                            )}

                                            {cert.document_path && (
                                                <div className="cert-info">
                                                    <label>Supporting Document:</label>
                                                    <button 
                                                        onClick={() => handleViewDocument(cert.id)}
                                                        className="document-link"
                                                    >
                                                        📎 View Uploaded Document
                                                    </button>
                                                </div>
                                            )}

                                            {cert.doctor && (
                                                <div className="cert-info">
                                                    <label>Reviewed by:</label>
                                                    <p>{cert.doctor.name}</p>
                                                </div>
                                            )}

                                            {cert.doctor_notes && (
                                                <div className="cert-info">
                                                    <label>Doctor's Notes:</label>
                                                    <p>{cert.doctor_notes}</p>
                                                </div>
                                            )}

                                            {cert.rejection_reason && (
                                                <div className="cert-info rejection">
                                                    <label>Rejection Reason:</label>
                                                    <p>{cert.rejection_reason}</p>
                                                </div>
                                            )}

                                            <div className="cert-info">
                                                <label>Requested:</label>
                                                <p>{formatDate(cert.created_at)}</p>
                                            </div>
                                        </div>

                                        {cert.status === 'approved' && (
                                            <div className="cert-footer">
                                                <button
                                                    onClick={() => handleDownload(cert.id)}
                                                    className="download-btn"
                                                >
                                                    📥 Download PDF
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MedicalRequest;
