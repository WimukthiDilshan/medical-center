import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import {
    getMedicalCertificates,
    approveMedicalCertificate,
    rejectMedicalCertificate,
    viewDocument,
    downloadCertificatePDF
} from '../../services/medicalService';
import './MedicalCertificates.css';

const MedicalCertificates = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [certificates, setCertificates] = useState([]);
    const [selectedCert, setSelectedCert] = useState(null);
    const [doctorNotes, setDoctorNotes] = useState('');
    const [rejectionReason, setRejectionReason] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('pending');

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
            setLoading(true);
            const data = await getMedicalCertificates();
            setCertificates(data);
        } catch (err) {
            setError('Failed to fetch medical certificates');
        } finally {
            setLoading(false);
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
            setTimeout(() => setSuccess(''), 3000);
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
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        await authService.logout();
        navigate('/login');
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

    const filteredCertificates = certificates.filter(cert => {
        if (filterStatus === 'all') return true;
        return cert.status === filterStatus;
    });

    const stats = {
        pending: certificates.filter(c => c.status === 'pending').length,
        approved: certificates.filter(c => c.status === 'approved').length,
        rejected: certificates.filter(c => c.status === 'rejected').length,
        total: certificates.length
    };

    return (
        <div className="medical-certificates-page">
            {/* Navigation Bar */}
            <nav className="dashboard-nav">
                <div className="nav-left">
                    <button onClick={() => navigate('/dashboard/doctor')} className="back-btn">
                        ← Back to Dashboard
                    </button>
                    <h1>Medical Certificate Requests</h1>
                </div>
                <div className="nav-user">
                    <span className="user-name">👨‍⚕️ Dr. {user?.name}</span>
                    <button onClick={handleLogout} className="btn-logout">Logout</button>
                </div>
            </nav>

            <div className="certificates-content">
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

                {/* Stats Cards */}
                <div className="stats-grid">
                    <div className="stat-card">
                        <h3>Pending</h3>
                        <p className="stat-number pending">{stats.pending}</p>
                    </div>
                    <div className="stat-card">
                        <h3>Approved</h3>
                        <p className="stat-number approved">{stats.approved}</p>
                    </div>
                    <div className="stat-card">
                        <h3>Rejected</h3>
                        <p className="stat-number rejected">{stats.rejected}</p>
                    </div>
                    <div className="stat-card">
                        <h3>Total</h3>
                        <p className="stat-number">{stats.total}</p>
                    </div>
                </div>

                {/* Filter Tabs */}
                <div className="filter-tabs">
                    <button
                        className={`filter-tab ${filterStatus === 'pending' ? 'active' : ''}`}
                        onClick={() => setFilterStatus('pending')}
                    >
                        Pending ({stats.pending})
                    </button>
                    <button
                        className={`filter-tab ${filterStatus === 'approved' ? 'active' : ''}`}
                        onClick={() => setFilterStatus('approved')}
                    >
                        Approved ({stats.approved})
                    </button>
                    <button
                        className={`filter-tab ${filterStatus === 'rejected' ? 'active' : ''}`}
                        onClick={() => setFilterStatus('rejected')}
                    >
                        Rejected ({stats.rejected})
                    </button>
                    <button
                        className={`filter-tab ${filterStatus === 'all' ? 'active' : ''}`}
                        onClick={() => setFilterStatus('all')}
                    >
                        All ({stats.total})
                    </button>
                </div>

                {/* Certificates List */}
                {loading ? (
                    <div className="loading">Loading certificates...</div>
                ) : filteredCertificates.length === 0 ? (
                    <div className="no-data">
                        No {filterStatus !== 'all' ? filterStatus : ''} certificate requests found
                    </div>
                ) : (
                    <div className="certificates-list">
                        {filteredCertificates.map(cert => (
                            <div key={cert.id} className={`cert-request-card status-${cert.status}`}>
                                <div className="cert-header-info">
                                    <div>
                                        <h4>{cert.user?.name}</h4>
                                        <p className="cert-user-role">
                                            {cert.user?.role} - {cert.user?.email}
                                        </p>
                                        <p className="cert-user-id">ID: {cert.user?.staff_id}</p>
                                    </div>
                                    <span className={`cert-badge ${cert.status}`}>
                                        {cert.status === 'pending' && '⏳ Pending Review'}
                                        {cert.status === 'approved' && '✓ Approved'}
                                        {cert.status === 'rejected' && '✗ Rejected'}
                                    </span>
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
                                            <div className="appointment-header">
                                                <p><strong>Appointment #{cert.appointment.appointment_number}</strong></p>
                                                <p>Date: {formatDate(cert.appointment.appointment_date)} at {cert.appointment.appointment_time}</p>
                                                <p>Status: <span className={`status-tag ${cert.appointment.status}`}>{cert.appointment.status}</span></p>
                                            </div>

                                            {cert.appointment.reason && (
                                                <div className="appointment-field">
                                                    <strong>Reason for Visit:</strong>
                                                    <p>{cert.appointment.reason}</p>
                                                </div>
                                            )}

                                            {cert.appointment.diagnosis && (
                                                <div className="appointment-field">
                                                    <strong>Diagnosis:</strong>
                                                    <p>{cert.appointment.diagnosis}</p>
                                                </div>
                                            )}

                                            {cert.appointment.treatment && (
                                                <div className="appointment-field">
                                                    <strong>Treatment Given:</strong>
                                                    <p>{cert.appointment.treatment}</p>
                                                </div>
                                            )}

                                            {cert.appointment.medical_notes && (
                                                <div className="appointment-field highlight">
                                                    <strong>📋 Medical Notes:</strong>
                                                    <p>{cert.appointment.medical_notes}</p>
                                                </div>
                                            )}

                                            {cert.appointment.medications && (
                                                <div className="appointment-field highlight">
                                                    <strong>💊 Prescribed Medications:</strong>
                                                    <p>{cert.appointment.medications}</p>
                                                </div>
                                            )}

                                            {cert.appointment.lab_reports && (
                                                <div className="appointment-field highlight">
                                                    <strong>🧪 Lab Test Requests:</strong>
                                                    <p>{cert.appointment.lab_reports}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {cert.document_path && (
                                    <div className="cert-document">
                                        <label>Supporting Document Uploaded:</label>
                                        <button 
                                            onClick={() => handleViewDocument(cert.id)}
                                            className="view-document-btn"
                                        >
                                            📎 View Document
                                        </button>
                                    </div>
                                )}

                                {cert.doctor_notes && (
                                    <div className="cert-notes approved-notes">
                                        <label>Doctor's Notes:</label>
                                        <p>{cert.doctor_notes}</p>
                                    </div>
                                )}

                                {cert.rejection_reason && (
                                    <div className="cert-notes rejection-notes">
                                        <label>Rejection Reason:</label>
                                        <p>{cert.rejection_reason}</p>
                                    </div>
                                )}

                                {cert.doctor && (
                                    <div className="cert-reviewer">
                                        <label>Reviewed by:</label>
                                        <p>Dr. {cert.doctor.name} on {formatDate(cert.updated_at)}</p>
                                    </div>
                                )}

                                {cert.status === 'pending' && (
                                    selectedCert?.id === cert.id ? (
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
                                                        setError('');
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
                                    )
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MedicalCertificates;
