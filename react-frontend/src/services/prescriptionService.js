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
  }
};

export default prescriptionService;
