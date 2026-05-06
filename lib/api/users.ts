// lib/api/users.ts
import { apiClient } from './client';

export interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  kebeleId: string;
  role: 'citizen' | 'officer' | 'admin';
  status: 'active' | 'inactive' | 'pending';
  joinedDate: string;
  properties: number;
}

export const usersAPI = {
  // Get all users with filters
  getAll: async (token: string, params?: {
    search?: string;
    role?: string;
    status?: string;
    page?: number;
    limit?: number;
  }) => {
    const query = new URLSearchParams();
    if (params?.search) query.append('search', params.search);
    if (params?.role && params.role !== 'all') query.append('role', params.role);
    if (params?.status && params.status !== 'all') query.append('status', params.status);
    if (params?.page) query.append('page', params.page.toString());
    if (params?.limit) query.append('limit', params.limit.toString());
    
    const url = `/admin/users${query.toString() ? `?${query}` : ''}`;
    return apiClient.get(url, token);
  },
  
  // Get single user
  getById: async (token: string, id: number) => {
    return apiClient.get(`/admin/users/${id}`, token);
  },
  
  // Create new user
  create: async (token: string, userData: {
    name: string;
    email: string;
    phone: string;
    kebeleId: string;
    role?: string;
    status?: string;
    password?: string;
  }) => {
    return apiClient.post('/admin/users', userData, token);
  },
  
  // Update user
  update: async (token: string, id: number, userData: Partial<User>) => {
    return apiClient.put(`/admin/users/${id}`, userData, token);
  },
  
  // Delete user
  delete: async (token: string, id: number) => {
    return apiClient.delete(`/admin/users/${id}`, token);
  },
  
  // Update user status
  updateStatus: async (token: string, id: number, status: string) => {
    return apiClient.patch(`/admin/users/${id}/status`, { status }, token);
  },
  
  // Reset user password
  resetPassword: async (token: string, id: number, newPassword?: string) => {
    return apiClient.post(`/admin/users/${id}/reset-password`, { newPassword }, token);
  },
  
  // Get user statistics
  getStats: async (token: string) => {
    return apiClient.get('/admin/users/stats/summary', token);
  },
  
  // Bulk update status
  bulkUpdateStatus: async (token: string, userIds: number[], status: string) => {
    return apiClient.post('/admin/users/bulk/update-status', { userIds, status }, token);
  },
  
  // Bulk delete
  bulkDelete: async (token: string, userIds: number[]) => {
    return apiClient.post('/admin/users/bulk/delete', { userIds }, token);
  },
  
  // Export to CSV
  exportToCSV: async (token: string, params?: { role?: string; status?: string }) => {
    const query = new URLSearchParams();
    if (params?.role) query.append('role', params.role);
    if (params?.status) query.append('status', params.status);
    
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/users/export/csv?${query}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.blob();
  }
};