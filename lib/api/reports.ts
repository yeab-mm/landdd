// lib/api/reports.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const reportsAPI = {
  // Generate report by type
  async generateReport(token: string, type: string, params?: {
    startDate?: string;
    endDate?: string;
    format?: string;
  }) {
    const query = new URLSearchParams(params as any).toString();
    const response = await fetch(`${API_URL}/admin/reports/${type}?${query}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Failed to generate report');
    return response.json();
  },

  // Get saved reports
  async getSavedReports(token: string, page?: number, limit?: number) {
    const query = new URLSearchParams();
    if (page) query.append('page', page.toString());
    if (limit) query.append('limit', limit.toString());
    const response = await fetch(`${API_URL}/admin/reports/saved?${query}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Failed to fetch saved reports');
    return response.json();
  },

  // Get single saved report
  async getReportById(token: string, id: number) {
    const response = await fetch(`${API_URL}/admin/reports/saved/${id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Failed to fetch report');
    return response.json();
  },

  // Create new report
  async createReport(token: string, data: {
    type: string;
    name: string;
    nameAm?: string;
    startDate?: string;
    endDate?: string;
    format?: string;
  }) {
    const response = await fetch(`${API_URL}/admin/reports/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to create report');
    return response.json();
  },

  // Delete saved report
  async deleteReport(token: string, id: number) {
    const response = await fetch(`${API_URL}/admin/reports/saved/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Failed to delete report');
    return response.json();
  },

  // Get available report templates
  async getAvailableReports(token: string) {
    const response = await fetch(`${API_URL}/admin/reports/available`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Failed to fetch available reports');
    return response.json();
  },

  // Get report statistics
  async getReportStats(token: string) {
    const response = await fetch(`${API_URL}/admin/reports/statistics`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Failed to fetch report statistics');
    return response.json();
  },

  // Download report file
  async downloadReport(token: string, reportId: number) {
    const response = await fetch(`${API_URL}/admin/reports/saved/${reportId}/download`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Failed to download report');
    return response.blob();
  }
};