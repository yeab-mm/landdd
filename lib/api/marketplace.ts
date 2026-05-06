// lib/api/marketplace.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const marketplaceAPI = {
  // Get all listings with filters
  async getListings(token: string, params?: {
    search?: string;
    type?: string;
    status?: string;
    minPrice?: number;
    maxPrice?: number;
    sortBy?: string;
    page?: number;
    limit?: number;
  }) {
    const query = new URLSearchParams(params as any).toString();
    const response = await fetch(`${API_URL}/admin/marketplace/listings?${query}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Failed to fetch listings');
    return response.json();
  },

  // Get listing by ID
  async getListingById(token: string, id: number) {
    const response = await fetch(`${API_URL}/admin/marketplace/listings/${id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Failed to fetch listing');
    return response.json();
  },

  // Create new listing
  async createListing(token: string, listingData: any) {
    const response = await fetch(`${API_URL}/admin/marketplace/listings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(listingData)
    });
    if (!response.ok) throw new Error('Failed to create listing');
    return response.json();
  },

  // Update listing
  async updateListing(token: string, id: number, listingData: any) {
    const response = await fetch(`${API_URL}/admin/marketplace/listings/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(listingData)
    });
    if (!response.ok) throw new Error('Failed to update listing');
    return response.json();
  },

  // Delete listing
  async deleteListing(token: string, id: number) {
    const response = await fetch(`${API_URL}/admin/marketplace/listings/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Failed to delete listing');
    return response.json();
  },

  // Update listing status (approve/reject)
  async updateListingStatus(token: string, id: number, status: string, notes?: string) {
    const response = await fetch(`${API_URL}/admin/marketplace/listings/${id}/status`, {
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

  // Get marketplace statistics
  async getStats(token: string) {
    const response = await fetch(`${API_URL}/admin/marketplace/stats`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Failed to fetch stats');
    return response.json();
  },

  // Bulk update status
  async bulkUpdateStatus(token: string, listingIds: number[], status: string) {
    const response = await fetch(`${API_URL}/admin/marketplace/listings/bulk-status`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ listingIds, status })
    });
    if (!response.ok) throw new Error('Failed to bulk update');
    return response.json();
  },

  // Get analytics
  async getAnalytics(token: string, period?: string) {
    const query = period ? `?period=${period}` : '';
    const response = await fetch(`${API_URL}/admin/marketplace/analytics${query}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Failed to fetch analytics');
    return response.json();
  }
};