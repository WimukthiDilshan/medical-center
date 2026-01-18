import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import { getMedicalCertificates, viewDocument, downloadCertificatePDF } from '../../services/medicalService';
import './AdminMedicalCertificates.css';

const AdminMedicalCertificates = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [certificates, setCertificates] = useState([]);
    const [filteredCertificates, setFilteredCertificates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Filter states
    const [filters, setFilters] = useState({
        status: 'all',
        user_type: 'all',
        start_date: '',
        end_date: '',
        search: ''
    });

    useEffect(() => {
        const currentUser = authService.getCurrentUser();
        if (!currentUser || currentUser.role !== 'admin') {
            navigate('/login');
            return;
        }
        setUser(currentUser);
        fetchCertificates();
    }, [navigate]);

    const fetchCertificates = async () => {
        try {
            setLoading(true);
            setError('');
            const data = await getMedicalCertificates();
            setCertificates(data);
            setFilteredCertificates(data);
        } catch (err) {
            setError('Failed to fetch medical certificates');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const applyFilters = () => {
        let filtered = [...certificates];

        // Filter by status
        if (filters.status !== 'all') {
            filtered = filtered.filter(cert => cert.status === filters.status);
        }

        // Filter by user type
        if (filters.user_type !== 'all') {
            filtered = filtered.filter(cert => cert.user?.role === filters.user_type);
        }

        // Filter by date range
        if (filters.start_date) {
            filtered = filtered.filter(cert => 
                new Date(cert.created_at) >= new Date(filters.start_date)
            );
        }
        if (filters.end_date) {
            const endDate = new Date(filters.end_date);
            endDate.setHours(23, 59, 59, 999);
            filtered = filtered.filter(cert => 
                new Date(cert.created_at) <= endDate
            );
        }

        // Search filter
        if (filters.search) {
            const searchLower = filters.search.toLowerCase();
            filtered = filtered.filter(cert =>
                cert.user?.name?.toLowerCase().includes(searchLower) ||
                cert.user?.staff_id?.toLowerCase().includes(searchLower) ||
                cert.id.toString().includes(searchLower)
            );
        }

        setFilteredCertificates(filtered);
    };

    const clearFilters = () => {
        setFilters({
            status: 'all',
            user_type: 'all',
            start_date: '',
            end_date: '',
            search: ''
        });
        setFilteredCertificates(certificates);
    };

    const exportToCSV = () => {
        const headers = ['ID', 'Patient Name', 'Staff ID', 'Role', 'Reason', 'Start Date', 'End Date', 'Days', 'Status', 'Doctor', 'Requested Date'];
        
        const csvData = filteredCertificates.map(cert => [
            cert.id,
            cert.user?.name || '',
            cert.user?.staff_id || '',
            cert.user?.role || '',
            cert.reason.replace(/,/g, ';'),
            formatDate(cert.start_date),
            formatDate(cert.end_date),
            cert.days_requested,
            cert.status,
            cert.doctor?.name || 'Pending',
            formatDate(cert.created_at)
        ]);

        const csv = [
            headers.join(','),
            ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `medical_certificates_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
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

    const handleDownloadPDF = async (certId) => {
        try {
            await downloadCertificatePDF(certId);
        } catch (err) {
            setError(err || 'Failed to download certificate PDF');
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

    const getStats = () => {
        return {
            total: certificates.length,
            pending: certificates.filter(c => c.status === 'pending').length,
            approved: certificates.filter(c => c.status === 'approved').length,
            rejected: certificates.filter(c => c.status === 'rejected').length,
            students: certificates.filter(c => c.user?.role === 'student').length,
            staff: certificates.filter(c => c.user?.role === 'staff').length
        };
    };

    const stats = getStats();

    return (
        <div className="admin-medical-certificates-page">
            {/* Navigation */}
            <div className="dashboard-nav">
                <div className="nav-left">
                    <button onClick={() => navigate('/dashboard/admin')} className="back-btn">
                        ← Back
                    </button>
                    <h1>Medical Certificates Management</h1>
                </div>
                <div className="nav-user">
                    <span className="user-name">{user?.name}</span>
                    <button onClick={handleLogout} className="btn-logout">
                        Logout
                    </button>
                </div>
            </div>

            <div className="admin-certificates-content">
                {/* Error Message */}
                {error && (
                    <div className="alert alert-error">
                        ⚠️ {error}
                    </div>
                )}

                {/* Statistics */}
                <div className="stats-grid">
                    <div className="stat-card">
                        <h3>Total Certificates</h3>
                        <p className="stat-number">{stats.total}</p>
                    </div>
                    <div className="stat-card pending">
                        <h3>Pending</h3>
                        <p className="stat-number">{stats.pending}</p>
                    </div>
                    <div className="stat-card approved">
                        <h3>Approved</h3>
                        <p className="stat-number">{stats.approved}</p>
                    </div>
                    <div className="stat-card rejected">
                        <h3>Rejected</h3>
                        <p className="stat-number">{stats.rejected}</p>
                    </div>
                    <div className="stat-card info">
                        <h3>Students</h3>
                        <p className="stat-number">{stats.students}</p>
                    </div>
                    <div className="stat-card info">
                        <h3>Staff</h3>
                        <p className="stat-number">{stats.staff}</p>
                    </div>
                </div>

                {/* Filters Section */}
                <div className="filters-section">
                    <h3>🔍 Filters & Search</h3>
                    
                    <div className="filters-grid">
                        <div className="filter-group">
                            <label>Status</label>
                            <select name="status" value={filters.status} onChange={handleFilterChange}>
                                <option value="all">All Status</option>
                                <option value="pending">Pending</option>
                                <option value="approved">Approved</option>
                                <option value="rejected">Rejected</option>
                            </select>
                        </div>

                        <div className="filter-group">
                            <label>User Type</label>
                            <select name="user_type" value={filters.user_type} onChange={handleFilterChange}>
                                <option value="all">All Users</option>
                                <option value="student">Students</option>
                                <option value="staff">Staff</option>
                            </select>
                        </div>

                        <div className="filter-group">
                            <label>Start Date</label>
                            <input
                                type="date"
                                name="start_date"
                                value={filters.start_date}
                                onChange={handleFilterChange}
                            />
                        </div>

                        <div className="filter-group">
                            <label>End Date</label>
                            <input
                                type="date"
                                name="end_date"
                                value={filters.end_date}
                                onChange={handleFilterChange}
                            />
                        </div>

                        <div className="filter-group search-group">
                            <label>Search</label>
                            <input
                                type="text"
                                name="search"
                                value={filters.search}
                                onChange={handleFilterChange}
                                placeholder="Name, ID, or Certificate No..."
                            />
                        </div>
                    </div>

                    <div className="filter-actions">
                        <button onClick={applyFilters} className="btn-apply">
                            Apply Filters
                        </button>
                        <button onClick={clearFilters} className="btn-clear">
                            Clear All
                        </button>
                        <button onClick={exportToCSV} className="btn-export">
                            📊 Export to CSV
                        </button>
                    </div>

                    <div className="results-info">
                        Showing {filteredCertificates.length} of {certificates.length} certificates
                    </div>
                </div>

                {/* Certificates Table */}
                {loading ? (
                    <div className="loading">Loading certificates...</div>
                ) : filteredCertificates.length === 0 ? (
                    <div className="no-data">
                        No certificates found matching your filters
                    </div>
                ) : (
                    <div className="certificates-table-container">
                        <table className="certificates-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Patient</th>
                                    <th>Role</th>
                                    <th>Period</th>
                                    <th>Days</th>
                                    <th>Status</th>
                                    <th>Doctor</th>
                                    <th>Requested</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredCertificates.map(cert => (
                                    <React.Fragment key={cert.id}>
                                        <tr className={`row-${cert.status}`}>
                                            <td>#{cert.id}</td>
                                            <td>
                                                <div className="patient-info">
                                                    <strong>{cert.user?.name}</strong>
                                                    <span className="staff-id">{cert.user?.staff_id}</span>
                                                </div>
                                            </td>
                                            <td>
                                                <span className={`role-badge ${cert.user?.role}`}>
                                                    {cert.user?.role}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="date-range">
                                                    {formatDate(cert.start_date)}
                                                    <span className="to">to</span>
                                                    {formatDate(cert.end_date)}
                                                </div>
                                            </td>
                                            <td>{cert.days_requested}</td>
                                            <td>
                                                <span className={`status-badge ${cert.status}`}>
                                                    {cert.status === 'pending' && '⏳ Pending'}
                                                    {cert.status === 'approved' && '✓ Approved'}
                                                    {cert.status === 'rejected' && '✗ Rejected'}
                                                </span>
                                            </td>
                                            <td>{cert.doctor?.name || '-'}</td>
                                            <td>{formatDate(cert.created_at)}</td>
                                            <td>
                                                <div className="action-buttons">
                                                    <button
                                                        className="btn-view"
                                                        onClick={() => {
                                                            const details = document.getElementById(`details-${cert.id}`);
                                                            details.style.display = details.style.display === 'none' ? 'table-row' : 'none';
                                                        }}
                                                        title="View Details"
                                                    >
                                                        👁️
                                                    </button>
                                                    {cert.document_path && (
                                                        <button
                                                            onClick={() => handleViewDocument(cert.id)}
                                                            className="btn-document"
                                                            title="View Uploaded Document"
                                                        >
                                                            📎
                                                        </button>
                                                    )}
                                                    {cert.status === 'approved' && (
                                                        <button
                                                            onClick={() => handleDownloadPDF(cert.id)}
                                                            className="btn-pdf"
                                                            title="Download Medical Certificate PDF"
                                                        >
                                                            📄
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                        <tr id={`details-${cert.id}`} className="details-row" style={{ display: 'none' }}>
                                            <td colSpan="9">
                                                <div className="certificate-details">
                                                    <div className="detail-section">
                                                        <h4>Medical Reason:</h4>
                                                        <p>{cert.reason}</p>
                                                    </div>

                                                    {cert.appointment && (
                                                        <div className="detail-section">
                                                            <h4>Related Appointment:</h4>
                                                            <p>
                                                                Appointment #{cert.appointment.appointment_number} - 
                                                                {formatDate(cert.appointment.appointment_date)} at {cert.appointment.appointment_time}
                                                            </p>
                                                            {cert.appointment.diagnosis && <p><strong>Diagnosis:</strong> {cert.appointment.diagnosis}</p>}
                                                        </div>
                                                    )}

                                                    {cert.doctor_notes && (
                                                        <div className="detail-section approved-notes">
                                                            <h4>Doctor's Notes:</h4>
                                                            <p>{cert.doctor_notes}</p>
                                                        </div>
                                                    )}

                                                    {cert.rejection_reason && (
                                                        <div className="detail-section rejection-notes">
                                                            <h4>Rejection Reason:</h4>
                                                            <p>{cert.rejection_reason}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    </React.Fragment>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminMedicalCertificates;
