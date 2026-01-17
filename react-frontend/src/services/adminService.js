import api from './api';

export const adminService = {
  getPendingUsers: async () => {
    const response = await api.get('/admin/pending-users');
    return response.data;
  },

  approveUser: async (userId) => {
    const response = await api.post(`/admin/approve-user/${userId}`);
    return response.data;
  },

  rejectUser: async (userId) => {
    const response = await api.delete(`/admin/reject-user/${userId}`);
    return response.data;
  },

  getAllUsers: async () => {
    const response = await api.get('/admin/users');
    return response.data;
  },

  changePassword: async (userId, newPassword) => {
    const response = await api.put(`/admin/change-password/${userId}`, {
      new_password: newPassword,
    });
    return response.data;
  },
};
