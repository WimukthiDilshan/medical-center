import axios from 'axios';

const API_URL = 'http://localhost:8000/api/medical-certificates';

// Get authentication token
const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    };
};

// Get all medical certificates (filtered by user role)
export const getMedicalCertificates = async () => {
    try {
        const response = await axios.get(API_URL, getAuthHeader());
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Failed to fetch medical certificates';
    }
};

// Get a specific medical certificate
export const getMedicalCertificate = async (id) => {
    try {
        const response = await axios.get(`${API_URL}/${id}`, getAuthHeader());
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Failed to fetch medical certificate';
    }
};

// Create new medical certificate request
export const createMedicalCertificate = async (certificateData) => {
    try {
        const formData = new FormData();
        formData.append('reason', certificateData.reason);
        formData.append('start_date', certificateData.start_date);
        formData.append('end_date', certificateData.end_date);
        
        if (certificateData.appointment_id) {
            formData.append('appointment_id', certificateData.appointment_id);
        }
        
        if (certificateData.document) {
            formData.append('document', certificateData.document);
        }

        const token = localStorage.getItem('token');
        const response = await axios.post(API_URL, formData, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Failed to create medical certificate request';
    }
};

// Approve medical certificate (doctor only)
export const approveMedicalCertificate = async (id, doctorNotes = '') => {
    try {
        const response = await axios.post(
            `${API_URL}/${id}/approve`,
            { doctor_notes: doctorNotes },
            getAuthHeader()
        );
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Failed to approve medical certificate';
    }
};

// Reject medical certificate (doctor only)
export const rejectMedicalCertificate = async (id, rejectionReason) => {
    try {
        const response = await axios.post(
            `${API_URL}/${id}/reject`,
            { rejection_reason: rejectionReason },
            getAuthHeader()
        );
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Failed to reject medical certificate';
    }
};

// Download approved medical certificate as PDF
export const downloadMedicalCertificate = async (id) => {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.get(
            `${API_URL}/${id}/download`,
            {
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                responseType: 'blob'
            }
        );
        
        // Create blob link to download
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `medical_certificate_${id}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        
        return true;
    } catch (error) {
        throw error.response?.data?.message || 'Failed to download medical certificate';
    }
};

// Get statistics (admin only)
export const getMedicalCertificateStats = async () => {
    try {
        const response = await axios.get(`${API_URL}/stats/overview`, getAuthHeader());
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Failed to fetch statistics';
    }
};

// View uploaded document
export const viewDocument = async (id) => {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.get(
            `${API_URL}/${id}/document`,
            {
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                responseType: 'blob'
            }
        );
        
        // Get the content type from response headers, or use the blob's type
        const contentType = response.headers['content-type'] || response.data.type;
        
        // Create blob URL with proper content type and open in new tab
        const blob = new Blob([response.data], { type: contentType });
        const url = window.URL.createObjectURL(blob);
        window.open(url, '_blank');
        
        // Clean up after a delay
        setTimeout(() => window.URL.revokeObjectURL(url), 100);
        
        return true;
    } catch (error) {
        throw error.response?.data?.message || 'Failed to view document';
    }
};

// Download medical certificate PDF
export const downloadCertificatePDF = async (id) => {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.get(
            `${API_URL}/${id}/download`,
            {
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                responseType: 'blob'
            }
        );
        
        // Create blob URL and open in new tab
        const blob = new Blob([response.data], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        window.open(url, '_blank');
        
        // Clean up after a delay
        setTimeout(() => window.URL.revokeObjectURL(url), 100);
        
        return true;
    } catch (error) {
        throw error.response?.data?.message || 'Failed to download certificate PDF';
    }
};
