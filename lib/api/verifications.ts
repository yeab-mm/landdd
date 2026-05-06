// lib/api/verifications.ts
import { apiClient } from './client';

export interface Verification {
  id: number;
  applicant: string;
  parcelId: string;
  location: string;
  submittedDate: string;
  status: 'pending' | 'approved' | 'rejected';
  documentsCount: number;
}

export const verificationsAPI = {
  // Get all verifications
  getAll: async (token: string, params?: {
    search?: string;
    status?: string;
    page?: number;
    limit?: number;
  }) => {
    const query = new URLSearchParams();
    if (params?.search) query.append('search', params.search);
    if (params?.status && params.status !== 'all') query.append('status', params.status);
    if (params?.page) query.append('page', params.page.toString());
    if (params?.limit) query.append('limit', params.limit.toString());
    
    const url = `/admin/verifications${query.toString() ? `?${query}` : ''}`;
    return apiClient.get(url, token);
  },
  
  // Get single verification
  getById: async (token: string, id: number) => {
    return apiClient.get(`/admin/verifications/${id}`, token);
  },
  
  // Create verification
  create: async (token: string, data: {
    applicant: string;
    parcelId: string;
    location: string;
    documents?: any[];
    purpose?: string;
  }) => {
    return apiClient.post('/admin/verifications', data, token);
  },
  
  // Update verification status (approve/reject)
  updateStatus: async (token: string, id: number, status: string, notes?: string) => {
    return apiClient.put(`/admin/verifications/${id}/status`, { status, notes }, token);
  },
  
  // Update verification
  update: async (token: string, id: number, data: Partial<Verification>) => {
    return apiClient.put(`/admin/verifications/${id}`, data, token);
  },
  
  // Delete verification
  delete: async (token: string, id: number) => {
    return apiClient.delete(`/admin/verifications/${id}`, token);
  },
  
  // Get statistics
  getStats: async (token: string) => {
    return apiClient.get('/admin/verifications/stats/summary', token);
  },
  
  // Bulk update status
  bulkUpdateStatus: async (token: string, verificationIds: number[], status: string, notes?: string) => {
    return apiClient.post('/admin/verifications/bulk/status', { verificationIds, status, notes }, token);
  },
  
  // Bulk delete
  bulkDelete: async (token: string, verificationIds: number[]) => {
    return apiClient.post('/admin/verifications/bulk/delete', { verificationIds }, token);
  },
  
  // Export to CSV
  exportToCSV: async (token: string, status?: string) => {
    const url = status ? `/admin/verifications/export/csv?status=${status}` : '/admin/verifications/export/csv';
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${url}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.blob();
  }
};