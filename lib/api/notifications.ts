// lib/api/notifications.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const notificationsAPI = {
  // Get all notifications
  async getNotifications(token: string, filter?: string, page?: number) {
    const query = new URLSearchParams();
    if (filter) query.append('filter', filter);
    if (page) query.append('page', page.toString());
    
    const response = await fetch(`${API_URL}/admin/notifications?${query}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Failed to fetch notifications');
    return response.json();
  },

  // Get notification stats
  async getStats(token: string) {
    const response = await fetch(`${API_URL}/admin/notifications/stats`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Failed to fetch stats');
    return response.json();
  },

  // Get unread count (for header badge)
  async getUnreadCount(token: string) {
    const response = await fetch(`${API_URL}/admin/notifications/unread/count`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Failed to fetch unread count');
    return response.json();
  },

  // Mark as read
  async markAsRead(token: string, id: number) {
    const response = await fetch(`${API_URL}/admin/notifications/${id}/read`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Failed to mark as read');
    return response.json();
  },

  // Mark all as read
  async markAllAsRead(token: string) {
    const response = await fetch(`${API_URL}/admin/notifications/read-all`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Failed to mark all as read');
    return response.json();
  },

  // Delete notification
  async deleteNotification(token: string, id: number) {
    const response = await fetch(`${API_URL}/admin/notifications/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Failed to delete notification');
    return response.json();
  },

  // Clear all read notifications
  async clearReadNotifications(token: string) {
    const response = await fetch(`${API_URL}/admin/notifications/clear-read`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Failed to clear read notifications');
    return response.json();
  },

  // Bulk delete
  async bulkDelete(token: string, ids: number[]) {
    const response = await fetch(`${API_URL}/admin/notifications/bulk-delete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ ids })
    });
    if (!response.ok) throw new Error('Failed to bulk delete');
    return response.json();
  }
};