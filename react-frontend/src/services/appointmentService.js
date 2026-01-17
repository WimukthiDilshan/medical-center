import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

const appointmentService = {
  // Get all appointments
  getAppointments: async (filters = {}) => {
    const token = localStorage.getItem('token');
    const params = new URLSearchParams(filters).toString();
    const response = await axios.get(`${API_URL}/appointments?${params}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  // Search user by ID number
  searchUser: async (idNumber) => {
    const token = localStorage.getItem('token');
    const response = await axios.post(`${API_URL}/appointments/search-user`, 
      { id_number: idNumber },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  },

  // Create appointment
  createAppointment: async (appointmentData) => {
    const token = localStorage.getItem('token');
    const response = await axios.post(`${API_URL}/appointments`, appointmentData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  // Update appointment
  updateAppointment: async (id, appointmentData) => {
    const token = localStorage.getItem('token');
    const response = await axios.put(`${API_URL}/appointments/${id}`, appointmentData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  // Check-in patient
  checkIn: async (id) => {
    const token = localStorage.getItem('token');
    const response = await axios.post(`${API_URL}/appointments/${id}/check-in`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  // Cancel appointment
  cancelAppointment: async (id) => {
    const token = localStorage.getItem('token');
    const response = await axios.post(`${API_URL}/appointments/${id}/cancel`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  // Delete appointment
  deleteAppointment: async (id) => {
    const token = localStorage.getItem('token');
    const response = await axios.delete(`${API_URL}/appointments/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  // Get appointment history
  getHistory: async (userId) => {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_URL}/appointments/user/${userId}/history`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  // Doctor: Get today's queue
  getQueue: async () => {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_URL}/appointments/queue/today`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  // Doctor: Start consultation
  startConsultation: async (id) => {
    const token = localStorage.getItem('token');
    const response = await axios.post(`${API_URL}/appointments/${id}/start`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  // Doctor: Complete appointment
  completeAppointment: async (id, data) => {
    const token = localStorage.getItem('token');
    const response = await axios.post(`${API_URL}/appointments/${id}/complete`, 
      data,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  },

  // Get daily report
  getReport: async (date) => {
    const token = localStorage.getItem('token');
    const params = date ? `?date=${date}` : '';
    const response = await axios.get(`${API_URL}/appointments/report/daily${params}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  // Get single appointment
  getAppointment: async (id) => {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_URL}/appointments/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  }
};

export default appointmentService;
