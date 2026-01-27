import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

// Get auth token from localStorage
const getAuthToken = () => {
    const token = localStorage.getItem('token');
    return token ? `Bearer ${token}` : '';
};

const qrCodeService = {
    // Generate QR code for current user
    generateQRCode: async () => {
        const response = await axios.get(`${API_URL}/qr-code/generate`, {
            headers: {
                'Authorization': getAuthToken()
            }
        });
        return response.data;
    },

    // Download QR code as PNG file
    downloadQRCode: async () => {
        const response = await axios.get(`${API_URL}/qr-code/download`, {
            headers: {
                'Authorization': getAuthToken()
            },
            responseType: 'blob'
        });
        
        // Create download link
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'medical-qr-code.png');
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
        
        return { success: true, message: 'QR code downloaded successfully' };
    },

    // Verify QR code token (for nurses)
    verifyQRCode: async (token) => {
        const response = await axios.post(`${API_URL}/qr-code/verify`, 
            { token },
            {
                headers: {
                    'Authorization': getAuthToken()
                }
            }
        );
        return response.data;
    },

    // Create appointment from QR code
    createAppointmentFromQR: async (appointmentData) => {
        const response = await axios.post(`${API_URL}/qr-code/create-appointment`, 
            appointmentData,
            {
                headers: {
                    'Authorization': getAuthToken()
                }
            }
        );
        return response.data;
    }
};

export default qrCodeService;
