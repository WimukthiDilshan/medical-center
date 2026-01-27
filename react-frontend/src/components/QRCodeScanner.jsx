import React, { useState, useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import './QRCodeScanner.css';
import qrCodeService from '../services/qrCodeService';

const QRCodeScanner = ({ onAppointmentCreated }) => {
    const [scanning, setScanning] = useState(false);
    const [scanner, setScanner] = useState(null);
    const [patientData, setPatientData] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    
    // Appointment form data
    const [appointmentDate, setAppointmentDate] = useState('');
    const [appointmentTime, setAppointmentTime] = useState('');
    const [reason, setReason] = useState('');
    const [priority, setPriority] = useState('normal');

    useEffect(() => {
        // Set default date and time when patient data is available
        if (patientData) {
            const now = new Date();
            const dateStr = now.toISOString().split('T')[0];
            
            // Add 15 minutes to current time
            now.setMinutes(now.getMinutes() + 15);
            const timeStr = now.toTimeString().slice(0, 5);
            
            setAppointmentDate(dateStr);
            setAppointmentTime(timeStr);
        }
    }, [patientData]);

    const startScanner = () => {
        setScanning(true);
        setError('');
        setPatientData(null);
    };

    const stopScanner = () => {
        setScanning(false);
    };

    // Manage scanner lifecycle
    useEffect(() => {
        let html5QrcodeScanner = null;
        if (scanning) {
            // Only initialize after DOM is ready
            html5QrcodeScanner = new Html5QrcodeScanner(
                "qr-reader",
                {
                    fps: 10,
                    qrbox: 250,
                    aspectRatio: 1.0
                },
                false
            );
            html5QrcodeScanner.render(onScanSuccess, onScanError);
            setScanner(html5QrcodeScanner);
        }
        return () => {
            if (html5QrcodeScanner) {
                html5QrcodeScanner.clear();
            }
            setScanner(null);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [scanning]);

    const onScanSuccess = async (decodedText) => {
        console.log('QR Code scanned:', decodedText);
        
        // Stop scanner immediately after successful scan
        stopScanner();
        setLoading(true);
        
        try {
            const response = await qrCodeService.verifyQRCode(decodedText);
            
            if (response.success) {
                setPatientData(response.user);
                setError('');
            } else {
                setError(response.message || 'Invalid QR code');
            }
        } catch (err) {
            console.error('Verification error:', err);
            setError(err.response?.data?.message || 'Failed to verify QR code');
        } finally {
            setLoading(false);
        }
    };

    const onScanError = (errorMessage) => {
        // Ignore routine scanning errors - only log them
        console.debug('Scan error:', errorMessage);
    };

    const handleCreateAppointment = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const appointmentData = {
                token: patientData.token || scanner?.getState()?.lastDecodedText,
                appointment_date: appointmentDate,
                appointment_time: appointmentTime,
                reason: reason,
                priority: priority
            };

            const response = await qrCodeService.createAppointmentFromQR(appointmentData);

            if (response.success) {
                alert('Appointment created successfully!');
                
                // Reset form
                setPatientData(null);
                setReason('');
                setPriority('normal');
                
                // Notify parent component
                if (onAppointmentCreated) {
                    onAppointmentCreated(response.appointment);
                }
            } else {
                setError(response.message || 'Failed to create appointment');
            }
        } catch (err) {
            console.error('Appointment creation error:', err);
            setError(err.response?.data?.message || 'Failed to create appointment');
        } finally {
            setLoading(false);
        }
    };

    const resetScanner = () => {
        setPatientData(null);
        setReason('');
        setPriority('normal');
        setError('');
    };

    return (
        <div className="qr-scanner-container">
            <div className="qr-scanner-card">
                <h3>🔍 QR Code Scanner</h3>
                <p>Scan patient QR codes to quickly create appointments</p>

                {error && (
                    <div className="error-message">
                        {error}
                    </div>
                )}

                {!scanning && !patientData && (
                    <button onClick={startScanner} className="scan-btn">
                        🔍 Start QR Scanner
                    </button>
                )}

                {scanning && (
                    <div className="scanner-wrapper">
                        <div className="scanner-info">
                            <p>📷 Scanning for QR Code...</p>
                            <p className="small-text">Point camera at patient's QR code</p>
                        </div>
                        <div id="qr-reader"></div>
                        <button onClick={stopScanner} className="stop-btn">
                            ⏹ Stop Scanning
                        </button>
                    </div>
                )}

                {loading && !scanning && (
                    <div className="loading-message">
                        <p>⏳ Processing...</p>
                    </div>
                )}

                {patientData && !scanning && (
                    <div className="patient-identified">
                        <div className="success-banner">
                            <h4>✅ Patient Identified</h4>
                        </div>

                        <div className="patient-info">
                            <div className="info-row">
                                <span className="info-label">👤 Name:</span>
                                <span className="info-value">{patientData.name}</span>
                            </div>
                            <div className="info-row">
                                <span className="info-label">🆔 Student/Staff ID:</span>
                                <span className="info-value">{patientData.student_staff_id}</span>
                            </div>
                            <div className="info-row">
                                <span className="info-label">📋 Role:</span>
                                <span className="info-value">{patientData.role.toUpperCase()}</span>
                            </div>
                            <div className="info-row">
                                <span className="info-label">📧 Email:</span>
                                <span className="info-value">{patientData.email}</span>
                            </div>
                            {patientData.phone && (
                                <div className="info-row">
                                    <span className="info-label">📱 Phone:</span>
                                    <span className="info-value">{patientData.phone}</span>
                                </div>
                            )}
                        </div>

                        <form onSubmit={handleCreateAppointment} className="appointment-form">
                            <h4>📅 Create Appointment</h4>
                            
                            <div className="form-group">
                                <label>📅 Date:</label>
                                <input
                                    type="date"
                                    value={appointmentDate}
                                    onChange={(e) => setAppointmentDate(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>🕐 Time:</label>
                                <input
                                    type="time"
                                    value={appointmentTime}
                                    onChange={(e) => setAppointmentTime(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>📝 Reason for Visit:</label>
                                <textarea
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    placeholder="Enter reason for appointment (optional)"
                                    rows="3"
                                />
                            </div>

                            <div className="form-group priority-group">
                                <label>⚠️ Priority:</label>
                                <div className="radio-group">
                                    <label className="radio-label">
                                        <input
                                            type="radio"
                                            value="normal"
                                            checked={priority === 'normal'}
                                            onChange={(e) => setPriority(e.target.value)}
                                        />
                                        Normal
                                    </label>
                                    <label className="radio-label">
                                        <input
                                            type="radio"
                                            value="urgent"
                                            checked={priority === 'urgent'}
                                            onChange={(e) => setPriority(e.target.value)}
                                        />
                                        Urgent
                                    </label>
                                </div>
                            </div>

                            <div className="form-actions">
                                <button 
                                    type="submit" 
                                    className="create-btn"
                                    disabled={loading}
                                >
                                    {loading ? 'Creating...' : '✅ Create Appointment'}
                                </button>
                                <button 
                                    type="button" 
                                    onClick={resetScanner}
                                    className="cancel-btn"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
};

export default QRCodeScanner;
