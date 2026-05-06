// app/officer/notifications/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/lib/LanguageContext';
import {
  BellIcon,
  CheckCircleIcon,
  XCircleIcon,
  InformationCircleIcon,
  ExclamationTriangleIcon,
  StarIcon,
  TrashIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const API_URL = 'http://localhost:5000/api';

interface Notification {
  id: number;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'info' | 'success' | 'warning' | 'error' | 'achievement';
  createdAt?: string;
}

// Demo notifications for fallback
const getDemoNotifications = (): Notification[] => {
  const now = new Date();
  return [
    {
      id: 1,
      title: 'New Verification Request',
      message: 'Abebe Kebede has submitted a new land verification request',
      time: '5 min ago',
      read: false,
      type: 'info',
      createdAt: new Date(now.getTime() - 5 * 60000).toISOString()
    },
    {
      id: 2,
      title: 'Payment Received',
      message: 'Payment of 8,500,000 ETB has been received',
      time: '15 min ago',
      read: false,
      type: 'success',
      createdAt: new Date(now.getTime() - 15 * 60000).toISOString()
    },
    {
      id: 3,
      title: 'Verification Approved',
      message: 'Land verification for parcel BD-2024-089 has been approved',
      time: '1 hour ago',
      read: true,
      type: 'success',
      createdAt: new Date(now.getTime() - 1 * 3600000).toISOString()
    },
    {
      id: 4,
      title: 'System Alert',
      message: 'Database backup completed successfully',
      time: '2 hours ago',
      read: false,
      type: 'warning',
      createdAt: new Date(now.getTime() - 2 * 3600000).toISOString()
    },
    {
      id: 5,
      title: 'Verification Rejected',
      message: 'Land verification for parcel BD-2024-045 has been rejected',
      time: '3 hours ago',
      read: true,
      type: 'error',
      createdAt: new Date(now.getTime() - 3 * 3600000).toISOString()
    }
  ];
};

export default function OfficerNotificationsPage() {
  const { darkMode, language } = useLanguage();
  const router = useRouter();
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  const cn = (darkClass: string, lightClass: string): string => {
    return darkMode ? darkClass : lightClass;
  };

  const getAuthToken = () => localStorage.getItem('token');
  const getText = (en: string, am: string) => language === 'en' ? en : am;

  // Format relative time
  const formatRelativeTime = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return getText('Just now', 'አሁን');
    if (diffMins < 60) return `${diffMins} ${getText('min ago', 'ደቂቃ በፊት')}`;
    if (diffHours < 24) return `${diffHours} ${getText('hour ago', 'ሰዓት በፊት')}`;
    if (diffDays < 7) return `${diffDays} ${getText('day ago', 'ቀን በፊት')}`;
    return date.toLocaleDateString();
  };

  // Fetch notifications from API
  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const token = getAuthToken();
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch(`${API_URL}/notifications?filter=${filter}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem('token');
        router.push('/login');
        return;
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      
      const formattedNotifications = (data.notifications || []).map((n: any) => ({
        id: n.id,
        title: n.title,
        message: n.message,
        time: formatRelativeTime(n.createdAt || new Date().toISOString()),
        read: n.read || false,
        type: n.type || 'info',
        createdAt: n.createdAt
      }));

      setNotifications(formattedNotifications);
      setUnreadCount(data.unreadCount || 0);
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError(getText('Using demo data', 'የማሳያ ውሂብ በመጠቀም ላይ'));
      const demoNotifications = getDemoNotifications();
      setNotifications(demoNotifications);
      setUnreadCount(demoNotifications.filter(n => !n.read).length);
    } finally {
      setLoading(false);
    }
  }, [filter, router]);

  // Mark single notification as read
  const markAsRead = async (id: number) => {
    try {
      const token = getAuthToken();
      if (!token) {
        setNotifications(notifications.map(n => 
          n.id === id ? { ...n, read: true } : n
        ));
        setUnreadCount(prev => Math.max(0, prev - 1));
        toast.success(getText('Marked as read', 'እንደተነበበ ምልክት ተደርጓል'));
        return;
      }

      const response = await fetch(`${API_URL}/notifications/${id}/read`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        setNotifications(notifications.map(n => 
          n.id === id ? { ...n, read: true } : n
        ));
        setUnreadCount(prev => Math.max(0, prev - 1));
        toast.success(getText('Marked as read', 'እንደተነበበ ምልክት ተደርጓል'));
      }
    } catch (err) {
      console.error('Error marking as read:', err);
      setNotifications(notifications.map(n => 
        n.id === id ? { ...n, read: true } : n
      ));
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      const token = getAuthToken();
      if (!token) {
        setNotifications(notifications.map(n => ({ ...n, read: true })));
        setUnreadCount(0);
        toast.success(getText('All marked as read', 'ሁሉም እንደተነበበ ምልክት ተደርጓል'));
        return;
      }

      const response = await fetch(`${API_URL}/notifications/read-all`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        setNotifications(notifications.map(n => ({ ...n, read: true })));
        setUnreadCount(0);
        toast.success(getText('All marked as read', 'ሁሉም እንደተነበበ ምልክት ተደርጓል'));
      }
    } catch (err) {
      console.error('Error marking all as read:', err);
      setNotifications(notifications.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    }
  };

  // Delete notification
  const deleteNotification = async (id: number) => {
    try {
      const token = getAuthToken();
      if (!token) {
        const deletedNotif = notifications.find(n => n.id === id);
        setNotifications(notifications.filter(n => n.id !== id));
        if (deletedNotif && !deletedNotif.read) {
          setUnreadCount(prev => Math.max(0, prev - 1));
        }
        toast.success(getText('Notification deleted', 'ማሳወቂያ ተሰርዟል'));
        return;
      }

      const response = await fetch(`${API_URL}/notifications/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const deletedNotif = notifications.find(n => n.id === id);
        setNotifications(notifications.filter(n => n.id !== id));
        if (deletedNotif && !deletedNotif.read) {
          setUnreadCount(prev => Math.max(0, prev - 1));
        }
        toast.success(getText('Notification deleted', 'ማሳወቂያ ተሰርዟል'));
      }
    } catch (err) {
      console.error('Error deleting notification:', err);
      const deletedNotif = notifications.find(n => n.id === id);
      setNotifications(notifications.filter(n => n.id !== id));
      if (deletedNotif && !deletedNotif.read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const getIcon = (type: string) => {
    switch(type) {
      case 'success':
        return <CheckCircleIcon className="w-6 h-6 text-green-500" />;
      case 'error':
        return <XCircleIcon className="w-6 h-6 text-red-500" />;
      case 'warning':
        return <ExclamationTriangleIcon className="w-6 h-6 text-yellow-500" />;
      case 'achievement':
        return <StarIcon className="w-6 h-6 text-purple-500" />;
      default:
        return <InformationCircleIcon className="w-6 h-6 text-blue-500" />;
    }
  };

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread') return !n.read;
    if (filter === 'read') return n.read;
    return true;
  });

  if (loading && notifications.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <h1 className={`text-2xl font-bold ${cn('text-white', 'text-gray-900')}`}>
            {getText('Notifications', 'ማስታወቂያዎች')}
          </h1>
          {unreadCount > 0 && (
            <span className="px-2.5 py-1 text-xs font-medium bg-red-500 text-white rounded-full">
              {unreadCount} {getText('new', 'አዲስ')}
            </span>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchNotifications}
            className={`p-2 rounded-lg ${cn('hover:bg-gray-700', 'hover:bg-gray-100')}`}
            title={getText('Refresh', 'አድስ')}
          >
            <ArrowPathIcon className={`w-5 h-5 ${cn('text-gray-400', 'text-gray-500')}`} />
          </button>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
            >
              {getText('Mark all as read', 'ሁሉንም እንደተነበበ ምልክት አድርግ')}
            </button>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className={`${cn('bg-yellow-900/30', 'bg-yellow-50')} border border-yellow-500 rounded-lg p-3 text-yellow-600 text-sm flex items-center justify-between`}>
          <span>⚠️ {error}</span>
        </div>
      )}

      {/* Filter Tabs */}
      <div className={`${cn('bg-gray-800', 'bg-white')} rounded-xl shadow-sm p-1 inline-flex`}>
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
            filter === 'all'
              ? cn('bg-green-900/30 text-green-400', 'bg-green-100 text-green-700')
              : cn('text-gray-400 hover:text-gray-300', 'text-gray-600 hover:text-gray-800')
          }`}
        >
          {getText('All', 'ሁሉም')}
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
            filter === 'unread'
              ? cn('bg-green-900/30 text-green-400', 'bg-green-100 text-green-700')
              : cn('text-gray-400 hover:text-gray-300', 'text-gray-600 hover:text-gray-800')
          }`}
        >
          {getText('Unread', 'ያልተነበበ')}
        </button>
        <button
          onClick={() => setFilter('read')}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
            filter === 'read'
              ? cn('bg-green-900/30 text-green-400', 'bg-green-100 text-green-700')
              : cn('text-gray-400 hover:text-gray-300', 'text-gray-600 hover:text-gray-800')
          }`}
        >
          {getText('Read', 'የተነበበ')}
        </button>
      </div>

      {/* Notifications List */}
      <div className={`${cn('bg-gray-800', 'bg-white')} rounded-xl shadow-sm overflow-hidden`}>
        {filteredNotifications.length > 0 ? (
          <div className={`divide-y ${cn('divide-gray-700', 'divide-gray-200')}`}>
            {filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-6 transition-colors relative ${
                  !notification.read ? cn('bg-gray-700/30', 'bg-blue-50/50') : ''
                } ${cn('hover:bg-gray-700', 'hover:bg-gray-50')}`}
              >
                {!notification.read && (
                  <span className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-green-500 rounded-r-full"></span>
                )}
                <div className="flex items-start space-x-4">
                  {/* Icon */}
                  <div className="flex-shrink-0">
                    {getIcon(notification.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <h3 className={`text-sm font-semibold ${cn('text-white', 'text-gray-900')}`}>
                        {notification.title}
                      </h3>
                      <span className={`text-xs ${cn('text-gray-400', 'text-gray-500')}`}>
                        {notification.time}
                      </span>
                    </div>
                    <p className={`text-sm mt-1 ${cn('text-gray-300', 'text-gray-600')}`}>
                      {notification.message}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2">
                    {!notification.read && (
                      <button
                        onClick={() => markAsRead(notification.id)}
                        className="p-2 rounded-lg hover:bg-gray-600 transition-colors"
                        title={getText('Mark as read', 'እንደተነበበ ምልክት አድርግ')}
                      >
                        <CheckCircleIcon className="w-5 h-5 text-green-500" />
                      </button>
                    )}
                    <button
                      onClick={() => deleteNotification(notification.id)}
                      className="p-2 rounded-lg hover:bg-gray-600 transition-colors"
                      title={getText('Delete', 'ሰርዝ')}
                    >
                      <TrashIcon className="w-5 h-5 text-red-500" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center">
            <BellIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className={`text-lg ${cn('text-gray-300', 'text-gray-600')}`}>
              {filter === 'all' ? getText('No notifications', 'ምንም ማስታወቂያዎች የሉም') : 
               filter === 'unread' ? getText('No unread notifications', 'ምንም ያልተነበበ ማስታወቂያ የለም') : 
               getText('No read notifications', 'ምንም የተነበበ ማስታወቂያ የለም')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}