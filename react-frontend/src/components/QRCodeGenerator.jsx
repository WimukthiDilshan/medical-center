import React, { useState, useEffect } from 'react';
import './QRCodeGenerator.css';
import qrCodeService from '../services/qrCodeService';

const QRCodeGenerator = () => {
    const [showModal, setShowModal] = useState(false);
    const [qrData, setQrData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [expiresIn, setExpiresIn] = useState(30);

    useEffect(() => {
        let timer;
        if (showModal && expiresIn > 0) {
            timer = setInterval(() => {
                setExpiresIn(prev => prev - 1);
            }, 60000); // Decrease every minute
        }
        return () => clearInterval(timer);
    }, [showModal, expiresIn]);

    const generateQRCode = async () => {
        setLoading(true);
        setError('');
        
        try {
            const response = await qrCodeService.generateQRCode();
            
            if (response.success) {
                setQrData(response);
                setExpiresIn(response.expires_in);
                setShowModal(true);
            } else {
                setError(response.message || 'Failed to generate QR code');
            }
        } catch (err) {
            console.error('QR generation error:', err);
            setError(err.response?.data?.message || 'Failed to generate QR code. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = async () => {
        try {
            await qrCodeService.downloadQRCode();
        } catch (err) {
            console.error('Download error:', err);
            alert('Failed to download QR code');
        }
    };

    const closeModal = () => {
        setShowModal(false);
        setQrData(null);
        setExpiresIn(30);
    };

    return (
        <div className="qr-generator-container">
            <div className="qr-generator-card">
                <h3>📱 Quick Appointment QR Code</h3>
                <p>Generate a QR code to quickly create appointments with nurses</p>
                
                {error && (
                    <div className="error-message">
                        {error}
                    </div>
                )}
                
                <button 
                    onClick={generateQRCode} 
                    disabled={loading}
                    className="generate-btn"
                >
                    {loading ? 'Generating...' : '📱 Generate QR Code'}
                </button>
            </div>

            {showModal && qrData && (
                <div className="qr-modal-overlay" onClick={closeModal}>
                    <div className="qr-modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="qr-modal-header">
                            <h2>Your Medical QR Code</h2>
                            <button className="close-btn" onClick={closeModal}>&times;</button>
                        </div>
                        
                        <div className="qr-modal-body">
                            <div className="qr-code-image">
                                <img src={qrData.qr_code} alt="Medical QR Code" />
                            </div>
                            
                            <div className="qr-user-info">
                                <div className="info-row">
                                    <span className="info-label">👤 Name:</span>
                                    <span className="info-value">{qrData.user_data.name}</span>
                                </div>
                                <div className="info-row">
                                    <span className="info-label">🆔 ID:</span>
                                    <span className="info-value">{qrData.user_data.id}</span>
                                </div>
                                <div className="info-row">
                                    <span className="info-label">📋 Role:</span>
                                    <span className="info-value">{qrData.user_data.role}</span>
                                </div>
                                <div className="info-row">
                                    <span className="info-label">📧 Email:</span>
                                    <span className="info-value">{qrData.user_data.email}</span>
                                </div>
                                <div className="info-row expires">
                                    <span className="info-label">⏰ Expires in:</span>
                                    <span className="info-value">{expiresIn} minutes</span>
                                </div>
                            </div>

                            <div className="qr-actions">
                                <button onClick={handleDownload} className="download-btn">
                                    💾 Download QR Code
                                </button>
                                <button onClick={closeModal} className="close-action-btn">
                                    Close
                                </button>
                            </div>

                            <div className="qr-instructions">
                                <h4>📌 Instructions:</h4>
                                <ol>
                                    <li>Show this QR code to the nurse</li>
                                    <li>Nurse will scan it with their device</li>
                                    <li>Valid for {expiresIn} minutes only</li>
                                </ol>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default QRCodeGenerator;
