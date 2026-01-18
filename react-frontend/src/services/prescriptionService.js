import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

const prescriptionService = {
  // Get all prescriptions
  getPrescriptions: async (filters = {}) => {
    const token = localStorage.getItem('token');
    const params = new URLSearchParams(filters).toString();
    const response = await axios.get(`${API_URL}/prescriptions?${params}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  // Get pending prescriptions (for pharmacist)
  getPending: async () => {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_URL}/prescriptions/pending/today`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  // Get single prescription
  getPrescription: async (id) => {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_URL}/prescriptions/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  // Create prescription (doctor)
  createPrescription: async (prescriptionData) => {
    const token = localStorage.getItem('token');
    const response = await axios.post(`${API_URL}/prescriptions`, prescriptionData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  // Dispense medicine (pharmacist)
  dispense: async (id) => {
    const token = localStorage.getItem('token');
    const response = await axios.post(`${API_URL}/prescriptions/${id}/dispense`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  // Complete prescription (pharmacist)
  complete: async (id) => {
    const token = localStorage.getItem('token');
    const response = await axios.post(`${API_URL}/prescriptions/${id}/complete`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  // Get patient prescriptions
  getPatientPrescriptions: async (patientId) => {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_URL}/prescriptions/patient/${patientId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  // Get my prescriptions (for logged-in patient)
  getMyPrescriptions: async () => {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_URL}/prescriptions/my/list`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  // Download prescription PDF
  downloadPrescription: async (prescriptionId) => {
    const token = localStorage.getItem('token');
    const url = `${API_URL}/prescriptions/download/${prescriptionId}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/pdf'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to download prescription');
    }

    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = `Prescription_${prescriptionId}.pdf`;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    
    setTimeout(() => {
      window.URL.revokeObjectURL(blobUrl);
      document.body.removeChild(a);
    }, 100);
  }
};

export default prescriptionService;
