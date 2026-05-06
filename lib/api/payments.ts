// lib/api/payments.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const paymentsAPI = {
  // Get all payments with filters
  async getPayments(token: string, params?: {
    search?: string;
    status?: string;
    type?: string;
    method?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }) {
    const query = new URLSearchParams(params as any).toString();
    const response = await fetch(`${API_URL}/admin/payments?${query}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Failed to fetch payments');
    return response.json();
  },

  // Get payment statistics
  async getStats(token: string) {
    const response = await fetch(`${API_URL}/admin/payments/stats`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Failed to fetch stats');
    return response.json();
  },

  // Get single payment
  async getPayment(token: string, id: number) {
    const response = await fetch(`${API_URL}/admin/payments/${id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Failed to fetch payment');
    return response.json();
  },

  // Update payment status
  async updateStatus(token: string, id: number, status: string, notes?: string) {
    const response = await fetch(`${API_URL}/admin/payments/${id}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ status, notes })
    });
    if (!response.ok) throw new Error('Failed to update status');
    return response.json();
  },

  // Update payment
  async updatePayment(token: string, id: number, data: any) {
    const response = await fetch(`${API_URL}/admin/payments/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to update payment');
    return response.json();
  },

  // Delete payment
  async deletePayment(token: string, id: number) {
    const response = await fetch(`${API_URL}/admin/payments/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Failed to delete payment');
    return response.json();
  },

  // Export payments
  async exportPayments(token: string, filters?: any, format: string = 'csv') {
    const response = await fetch(`${API_URL}/admin/payments/export`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ filters, format })
    });
    if (!response.ok) throw new Error('Failed to export payments');
    return response.json();
  },

  // Get daily summary
  async getDailySummary(token: string, days?: number) {
    const query = days ? `?days=${days}` : '';
    const response = await fetch(`${API_URL}/admin/payments/summary/daily${query}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Failed to fetch daily summary');
    return response.json();
  }
};