'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/lib/LanguageContext';
import {
  BellIcon,
  CheckCircleIcon,
  XCircleIcon,
  InformationCircleIcon,
  ExclamationTriangleIcon,
  TrashIcon,
  EyeIcon,
  PlusIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const API_URL = 'http://localhost:5000/api';

interface Notification {
  id: number;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: string;
}

export default function AdminNotificationsPage() {
  const { darkMode, language } = useLanguage();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newNotification, setNewNotification] = useState({
    title: '',
    titleAm: '',
    message: '',
    messageAm: '',
    type: 'info' as 'info' | 'success' | 'warning' | 'error'
  });

  const cn = (darkClass: string, lightClass: string) => darkMode ? darkClass : lightClass;

  const t = (en: string, am: string) => language === 'en' ? en : am;

  // Sample notifications data with Amharic translations
  const getSampleNotifications = (): Notification[] => {
    return [
      {
        id: 1,
        title: t('Welcome to the System', 'እንኳን ደህና መጡ'),
        message: t('You have successfully logged in as Administrator', 'በአስተዳዳሪነት በተሳካ ሁኔታ ገብተዋል'),
        type: 'success',
        read: false,
        createdAt: new Date().toISOString()
      },
      {
        id: 2,
        title: t('New Verification Request', 'አዲስ የማረጋገጫ ጥያቄ'),
        message: t('Abebe Kebede submitted a land verification request', 'አበበ ከበደ የመሬት ማረጋገጫ ጥያቄ አቅርበዋል'),
        type: 'warning',
        read: false,
        createdAt: new Date(Date.now() - 3600000).toISOString()
      },
      {
        id: 3,
        title: t('Payment Received', 'ክፍያ ተቀብሏል'),
        message: t('Payment of 8,500,000 ETB has been received', 'የ8,500,000 ብር ክፍያ ተቀብሏል'),
        type: 'success',
        read: true,
        createdAt: new Date(Date.now() - 86400000).toISOString()
      },
      {
        id: 4,
        title: t('System Update', 'የሲስተም ዝማኔ'),
        message: t('System will be updated on March 25, 2024 at 2:00 AM', 'ሲስተም በመጋቢት 25፣ 2024 ከሌሊት 2:00 ላይ ይዘመናል'),
        type: 'info',
        read: false,
        createdAt: new Date(Date.now() - 7200000).toISOString()
      },
      {
        id: 5,
        title: t('Failed Login Attempt', 'ያልተሳካ የመግቢያ ሙከራ'),
        message: t('Multiple failed login attempts detected from IP 192.168.1.100', 'ከአይፒ አድራሻ 192.168.1.100 ብዙ ያልተሳኩ የመግቢያ ሙከራዎች ተገኝተዋል'),
        type: 'error',
        read: false,
        createdAt: new Date(Date.now() - 1800000).toISOString()
      },
      {
        id: 6,
        title: t('New User Registered', 'አዲስ ተጠቃሚ ተመዝግቧል'),
        message: t('A new user account has been created for Tigist Haile', 'ለጥጊስት ኃይሌ አዲስ የተጠቃሚ መለያ ተፈጥሯል'),
        type: 'info',
        read: true,
        createdAt: new Date(Date.now() - 172800000).toISOString()
      },
      {
        id: 7,
        title: t('Property Listed', 'ንብረት ተዘርዝሯል'),
        message: t('New property listing: Commercial Coffee House', 'አዲስ የንብረት ዝርዝር፡ የንግድ ቡና ቤት'),
        type: 'success',
        read: false,
        createdAt: new Date(Date.now() - 5400000).toISOString()
      }
    ];
  };

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        window.location.href = '/login';
        return;
      }

      const response = await fetch(`${API_URL}/admin/notifications`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem('token');
        window.location.href = '/login';
        return;
      }

      if (response.ok) {
        const data = await response.json();
        if (data.notifications && data.notifications.length > 0) {
          setNotifications(data.notifications);
        } else {
          setNotifications(getSampleNotifications());
        }
      } else {
        setNotifications(getSampleNotifications());
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setNotifications(getSampleNotifications());
      toast(t('Using sample notifications', 'የናሙና ማሳወቂያዎች በመጠቀም ላይ'));
    } finally {
      setLoading(false);
    }
  };

  const addSampleNotification = () => {
    const newNotif: Notification = {
      id: notifications.length + 1,
      title: language === 'en' 
        ? (newNotification.title || 'Sample Notification')
        : (newNotification.titleAm || 'ናሙና ማሳወቂያ'),
      message: language === 'en'
        ? (newNotification.message || 'This is a sample notification')
        : (newNotification.messageAm || 'ይህ የናሙና ማሳወቂያ ነው'),
      type: newNotification.type,
      read: false,
      createdAt: new Date().toISOString()
    };
    setNotifications([newNotif, ...notifications]);
    setShowAddModal(false);
    setNewNotification({ title: '', titleAm: '', message: '', messageAm: '', type: 'info' });
    toast.success(t('Notification added', 'ማሳወቂያ ተጨምሯል'));
  };

  const markAsRead = async (id: number) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
    toast.success(t('Marked as read', 'እንደተነበበ ምልክት ተደርጓል'));
  };

  const markAllAsRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    toast.success(t('All notifications marked as read', 'ሁሉም ማሳወቂያዎች እንደተነበቡ ምልክት ተደርገዋል'));
  };

  const deleteNotification = async (id: number) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    toast.success(t('Notification deleted', 'ማሳወቂያ ተሰርዟል'));
  };

  const getNotificationIcon = (type: string) => {
    switch(type) {
      case 'success':
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
      case 'error':
        return <XCircleIcon className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500" />;
      default:
        return <InformationCircleIcon className="w-5 h-5 text-blue-500" />;
    }
  };

  const getTypeText = (type: string) => {
    switch(type) {
      case 'success':
        return t('Success', 'ስኬት');
      case 'error':
        return t('Error', 'ስህተት');
      case 'warning':
        return t('Warning', 'ማስጠንቀቂያ');
      default:
        return t('Info', 'መረጃ');
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [language]);

  const filteredNotifications = selectedType === 'all' 
    ? notifications 
    : notifications.filter(n => n.type === selectedType);
    
  const unreadCount = notifications.filter(n => !n.read).length;
  
  const typeFilterOptions = [
    { value: 'all', labelEn: 'All', labelAm: 'ሁሉም' },
    { value: 'info', labelEn: 'Info', labelAm: 'መረጃ' },
    { value: 'success', labelEn: 'Success', labelAm: 'ስኬት' },
    { value: 'warning', labelEn: 'Warning', labelAm: 'ማስጠንቀቂያ' },
    { value: 'error', labelEn: 'Error', labelAm: 'ስህተት' },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className={`text-2xl font-bold ${cn('text-white', 'text-gray-900')}`}>
            {t('Notifications', 'ማሳወቂያዎች')}
          </h1>
          <p className={`text-sm mt-1 ${cn('text-gray-400', 'text-gray-500')}`}>
            {unreadCount} {t('unread', 'ያልተነበቡ')}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
          >
            <PlusIcon className="w-4 h-4" />
            {t('Add Sample', 'ናሙና ጨምር')}
          </button>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
            >
              {t('Mark all as read', 'ሁሉንም እንደተነበበ ምልክት አድርግ')}
            </button>
          )}
          <button
            onClick={fetchNotifications}
            className={`p-2 rounded-lg transition-colors ${cn('hover:bg-gray-700', 'hover:bg-gray-100')}`}
            title={t('Refresh', 'አድስ')}
          >
            <ArrowPathIcon className={`w-5 h-5 ${cn('text-gray-400', 'text-gray-500')}`} />
          </button>
        </div>
      </div>

      {/* Type Filter */}
      <div className={`${cn('bg-gray-800', 'bg-white')} rounded-xl shadow-sm p-4`}>
        <div className="flex flex-wrap gap-2">
          {typeFilterOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setSelectedType(option.value)}
              className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                selectedType === option.value
                  ? 'bg-green-600 text-white'
                  : cn('bg-gray-700 text-gray-300 hover:bg-gray-600', 'bg-gray-100 text-gray-700 hover:bg-gray-200')
              }`}
            >
              {language === 'en' ? option.labelEn : option.labelAm}
            </button>
          ))}
        </div>
      </div>

      {/* Add Notification Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`${cn('bg-gray-800', 'bg-white')} rounded-xl p-6 w-96 max-w-full`}>
            <h2 className={`text-xl font-bold mb-4 ${cn('text-white', 'text-gray-900')}`}>
              {t('Add Sample Notification', 'ናሙና ማሳወቂያ ጨምር')}
            </h2>
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${cn('text-gray-300', 'text-gray-700')}`}>
                  {t('Title (English)', 'ርዕስ (እንግሊዝኛ)')}
                </label>
                <input
                  type="text"
                  value={newNotification.title}
                  onChange={(e) => setNewNotification({ ...newNotification, title: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                    darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                  }`}
                  placeholder={t('Enter title', 'ርዕስ ያስገቡ')}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${cn('text-gray-300', 'text-gray-700')}`}>
                  {t('Title (Amharic)', 'ርዕስ (አማርኛ)')}
                </label>
                <input
                  type="text"
                  value={newNotification.titleAm}
                  onChange={(e) => setNewNotification({ ...newNotification, titleAm: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                    darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                  }`}
                  placeholder={t('Enter title in Amharic', 'ርዕስ በአማርኛ ያስገቡ')}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${cn('text-gray-300', 'text-gray-700')}`}>
                  {t('Message (English)', 'መልዕክት (እንግሊዝኛ)')}
                </label>
                <textarea
                  value={newNotification.message}
                  onChange={(e) => setNewNotification({ ...newNotification, message: e.target.value })}
                  rows={2}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                    darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                  }`}
                  placeholder={t('Enter message', 'መልዕክት ያስገቡ')}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${cn('text-gray-300', 'text-gray-700')}`}>
                  {t('Message (Amharic)', 'መልዕክት (አማርኛ)')}
                </label>
                <textarea
                  value={newNotification.messageAm}
                  onChange={(e) => setNewNotification({ ...newNotification, messageAm: e.target.value })}
                  rows={2}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                    darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                  }`}
                  placeholder={t('Enter message in Amharic', 'መልዕክት በአማርኛ ያስገቡ')}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${cn('text-gray-300', 'text-gray-700')}`}>
                  {t('Type', 'አይነት')}
                </label>
                <select
                  value={newNotification.type}
                  onChange={(e) => setNewNotification({ ...newNotification, type: e.target.value as any })}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                    darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  <option value="info">{t('Info', 'መረጃ')}</option>
                  <option value="success">{t('Success', 'ስኬት')}</option>
                  <option value="warning">{t('Warning', 'ማስጠንቀቂያ')}</option>
                  <option value="error">{t('Error', 'ስህተት')}</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className={`px-4 py-2 rounded-lg ${cn('bg-gray-700 hover:bg-gray-600', 'bg-gray-200 hover:bg-gray-300')}`}
              >
                {t('Cancel', 'ሰርዝ')}
              </button>
              <button
                onClick={addSampleNotification}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                {t('Add', 'ጨምር')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notifications List */}
      <div className={`${cn('bg-gray-800', 'bg-white')} rounded-xl shadow-sm overflow-hidden`}>
        {filteredNotifications.length === 0 ? (
          <div className="p-12 text-center">
            <BellIcon className={`w-12 h-12 mx-auto mb-4 ${cn('text-gray-600', 'text-gray-400')}`} />
            <p className={`text-lg ${cn('text-gray-400', 'text-gray-600')}`}>
              {t('No notifications yet', 'ምንም ማሳወቂያዎች የሉም')}
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              {t('Add Sample Notification', 'ናሙና ማሳወቂያ ጨምር')}
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 transition-colors ${
                  !notification.read ? cn('bg-gray-700/30', 'bg-blue-50') : ''
                } ${cn('hover:bg-gray-700', 'hover:bg-gray-50')}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    <div className="mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className={`font-medium ${cn('text-white', 'text-gray-900')}`}>
                          {notification.title}
                        </h3>
                        <span className={`px-2 py-0.5 text-xs rounded-full ${
                          notification.type === 'success' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                          notification.type === 'error' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                          notification.type === 'warning' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                          'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                        }`}>
                          {getTypeText(notification.type)}
                        </span>
                        {!notification.read && (
                          <span className="px-2 py-0.5 text-xs rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                            {t('New', 'አዲስ')}
                          </span>
                        )}
                      </div>
                      <p className={`text-sm mt-1 ${cn('text-gray-400', 'text-gray-600')}`}>
                        {notification.message}
                      </p>
                      <p className={`text-xs mt-2 ${cn('text-gray-500', 'text-gray-400')}`}>
                        {new Date(notification.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1 ml-4">
                    {!notification.read && (
                      <button
                        onClick={() => markAsRead(notification.id)}
                        className={`p-1.5 rounded-lg transition-colors ${cn('hover:bg-gray-600', 'hover:bg-gray-100')}`}
                        title={t('Mark as read', 'እንደተነበበ ምልክት አድርግ')}
                      >
                        <EyeIcon className="w-4 h-4 text-green-500" />
                      </button>
                    )}
                    <button
                      onClick={() => deleteNotification(notification.id)}
                      className={`p-1.5 rounded-lg transition-colors ${cn('hover:bg-gray-600', 'hover:bg-gray-100')}`}
                      title={t('Delete', 'ሰርዝ')}
                    >
                      <TrashIcon className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer Stats */}
      {filteredNotifications.length > 0 && (
        <div className={`${cn('bg-gray-800', 'bg-white')} rounded-xl shadow-sm p-4`}>
          <div className="flex justify-between items-center text-sm">
            <span className={cn('text-gray-400', 'text-gray-500')}>
              {t('Total', 'ጠቅላላ')}: {filteredNotifications.length}
            </span>
            <span className={cn('text-gray-400', 'text-gray-500')}>
              {t('Unread', 'ያልተነበበ')}: {filteredNotifications.filter(n => !n.read).length}
            </span>
            <span className={cn('text-gray-400', 'text-gray-500')}>
              {t('Read', 'የተነበበ')}: {filteredNotifications.filter(n => n.read).length}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}