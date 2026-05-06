// lib/api/auth.ts
import { apiClient } from './client';

export const authAPI = {
  login: async (email: string, password: string) => {
    return apiClient.post('/auth/login', { email, password });
  },
  
  register: async (userData: {
    email: string;
    password: string;
    fullName: string;
    phone?: string;
    kebeleId?: string;
    role?: string;
  }) => {
    return apiClient.post('/auth/register', userData);
  },
  
  forgotPassword: async (email: string) => {
    return apiClient.post('/auth/forgot-password', { email });
  },
  
  resetPassword: async (token: string, newPassword: string) => {
    return apiClient.post('/auth/reset-password', { token, newPassword });
  },
  
  changePassword: async (token: string, currentPassword: string, newPassword: string) => {
    return apiClient.post('/auth/change-password', { currentPassword, newPassword }, token);
  },
  
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
  },
  
  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      return JSON.parse(userStr);
    }
    return null;
  },
  
  getToken: () => {
    return localStorage.getItem('token');
  }
};