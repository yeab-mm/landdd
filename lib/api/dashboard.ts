// lib/api/dashboard.ts
import { apiClient } from './client';

export const dashboardAPI = {
  // Get dashboard statistics
  getStats: async (token: string) => {
    return apiClient.get('/admin/stats', token);
  },
  
  // Get recent activities
  getRecentActivities: async (token: string) => {
    return apiClient.get('/admin/recent-activities', token);
  }
};