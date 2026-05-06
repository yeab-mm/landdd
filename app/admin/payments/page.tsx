'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/lib/LanguageContext';
import { useTranslation } from '@/lib/useTranslation';
import {
  ShieldCheckIcon,
  KeyIcon,
  UserGroupIcon,
  LockClosedIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  GlobeAltIcon,
  ComputerDesktopIcon,
  DevicePhoneMobileIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const API_URL = 'http://localhost:5000/api';

interface SecurityLog {
  id: number;
  user: string;
  action: string;
  ip: string;
  device?: string;
  location?: string;
  timestamp: string;
  status: 'success' | 'failed' | 'warning';
  details?: string;
}

export default function AdminSecurityPage() {
  const { darkMode, language } = useLanguage();
  const { t } = useTranslation();
  const [selectedPeriod, setSelectedPeriod] = useState('week');
  const [securityLogs, setSecurityLogs] = useState<SecurityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    securityScore: 85,
    activeSessions: 3,
    failedAttempts: 2,
    mfaUsers: 145,
    totalUsers: 234,
    strongPasswords: 78,
    unusualIPs: 3
  });

  const cn = (darkClass: string, lightClass: string): string => {
    return darkMode ? darkClass : lightClass;
  };

  const getText = (enText: string, amText: string) => {
    return language === 'en' ? enText : amText;
  };

  // Fetch security stats from backend
  const fetchSecurityStats = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        window.location.href = '/login';
        return;
      }

      const response = await fetch(`${API_URL}/admin/security/stats`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem('token');
        window.location.href = '/login';
        return;
      }

      if (response.ok) {
        const data = await response.json();
        setStats({
          securityScore: data.securityScore || 85,
          activeSessions: data.activeSessions || 3,
          failedAttempts: data.failedAttempts || 2,
          mfaUsers: data.mfaUsers || 145,
          totalUsers: data.totalUsers || 234,
          strongPasswords: data.strongPasswords || 78,
          unusualIPs: data.unusualIPs || 3
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
      toast.error(getText('Failed to load security stats', 'የደህንነት ስታቲስቲክስ ማምጣት አልተሳካም'));
    }
  };

  // Fetch security logs from backend
  const fetchSecurityLogs = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        window.location.href = '/login';
        return;
      }

      const response = await fetch(`${API_URL}/admin/security/logs?period=${selectedPeriod}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem('token');
        window.location.href = '/login';
        return;
      }

      if (response.ok) {
        const data = await response.json();
        // Add default device and location for display
        const logsWithDevice = (data.logs || []).map((log: any) => ({
          ...log,
          device: log.device || 'Computer',
          location: log.location || getText('Addis Ababa, Ethiopia', 'አዲስ አበባ, ኢትዮጵያ')
        }));
        setSecurityLogs(logsWithDevice);
      }
    } catch (error) {
      console.error('Error fetching logs:', error);
      toast.error(getText('Failed to load security logs', 'የደህንነት ምዝግብ ማምጣት አልተሳካም'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSecurityStats();
    fetchSecurityLogs();
  }, [selectedPeriod]);

  const getStatusBadge = (status: SecurityLog['status']) => {
    switch(status) {
      case 'success':
        return (
          <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
            {getText('Success', 'ተሳክቷል')}
          </span>
        );
      case 'failed':
        return (
          <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
            {getText('Failed', 'አልተሳካም')}
          </span>
        );
      case 'warning':
        return (
          <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
            {getText('Warning', 'ማስጠንቀቂያ')}
          </span>
        );
      default:
        return null;
    }
  };

  if (loading && securityLogs.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Refresh */}
      <div className="flex justify-between items-center">
        <h1 className={`text-2xl font-bold ${cn('text-white', 'text-gray-900')}`}>
          {t('security')}
        </h1>
        <button
          onClick={() => {
            fetchSecurityStats();
            fetchSecurityLogs();
          }}
          className={`p-2 rounded-lg transition-colors ${cn('hover:bg-gray-700', 'hover:bg-gray-100')}`}
          title={getText('Refresh', 'አድስ')}
        >
          <ArrowPathIcon className={`w-5 h-5 ${cn('text-gray-400', 'text-gray-500')}`} />
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className={`${cn('bg-gray-800', 'bg-white')} rounded-xl shadow-sm p-4`}>
          <div className="flex items-center justify-between mb-2">
            <p className={`text-sm ${cn('text-gray-400', 'text-gray-500')}`}>
              {language === 'am' ? 'የደህንነት ደረጃ' : 'Security Score'}
            </p>
            <ShieldCheckIcon className="w-5 h-5 text-green-500" />
          </div>
          <p className="text-2xl font-bold text-green-600">{stats.securityScore}%</p>
          <p className="text-xs text-gray-400 mt-1">
            {language === 'am' ? 'ጥሩ' : 'Good'}
          </p>
        </div>

        <div className={`${cn('bg-gray-800', 'bg-white')} rounded-xl shadow-sm p-4`}>
          <div className="flex items-center justify-between mb-2">
            <p className={`text-sm ${cn('text-gray-400', 'text-gray-500')}`}>
              {language === 'am' ? 'ንቁ ክፍለ ጊዜዎች' : 'Active Sessions'}
            </p>
            <ComputerDesktopIcon className="w-5 h-5 text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-blue-600">{stats.activeSessions}</p>
        </div>

        <div className={`${cn('bg-gray-800', 'bg-white')} rounded-xl shadow-sm p-4`}>
          <div className="flex items-center justify-between mb-2">
            <p className={`text-sm ${cn('text-gray-400', 'text-gray-500')}`}>
              {language === 'am' ? 'ያልተሳኩ ሙከራዎች' : 'Failed Attempts'}
            </p>
            <XCircleIcon className="w-5 h-5 text-red-500" />
          </div>
          <p className="text-2xl font-bold text-red-600">{stats.failedAttempts}</p>
          <p className="text-xs text-gray-400 mt-1">
            {language === 'am' ? 'ባለፉት 24 ሰዓታት' : 'Last 24 hours'}
          </p>
        </div>

        <div className={`${cn('bg-gray-800', 'bg-white')} rounded-xl shadow-sm p-4`}>
          <div className="flex items-center justify-between mb-2">
            <p className={`text-sm ${cn('text-gray-400', 'text-gray-500')}`}>
              {language === 'am' ? 'ኤምኤፍኤ ተጠቃሚዎች' : 'MFA Users'}
            </p>
            <UserGroupIcon className="w-5 h-5 text-purple-500" />
          </div>
          <p className="text-2xl font-bold text-purple-600">{stats.mfaUsers}</p>
          <p className="text-xs text-gray-400 mt-1">
            {language === 'am' ? `ከጠቅላላ ${stats.totalUsers}` : `out of ${stats.totalUsers} total`}
          </p>
        </div>
      </div>

      {/* Security Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className={`${cn('bg-gray-800', 'bg-white')} rounded-xl shadow-sm p-4`}>
          <div className="flex items-center space-x-3 mb-3">
            <div className={`p-2 rounded-lg ${cn('bg-blue-900/30', 'bg-blue-100')}`}>
              <KeyIcon className="w-5 h-5 text-blue-500" />
            </div>
            <h3 className={`font-medium ${cn('text-white', 'text-gray-900')}`}>
              {language === 'am' ? 'ሁለት-ደረጃ ማረጋገጫ' : 'Two-Factor Authentication'}
            </h3>
          </div>
          <p className={`text-sm ${cn('text-gray-400', 'text-gray-600')} mb-2`}>
            {Math.round((stats.mfaUsers / stats.totalUsers) * 100)}% {language === 'am' ? 'የተጠቃሚዎች ኤምኤፍኤ አንቅተዋል' : 'of users have enabled 2FA'}
          </p>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${(stats.mfaUsers / stats.totalUsers) * 100}%` }}></div>
          </div>
        </div>

        <div className={`${cn('bg-gray-800', 'bg-white')} rounded-xl shadow-sm p-4`}>
          <div className="flex items-center space-x-3 mb-3">
            <div className={`p-2 rounded-lg ${cn('bg-green-900/30', 'bg-green-100')}`}>
              <LockClosedIcon className="w-5 h-5 text-green-500" />
            </div>
            <h3 className={`font-medium ${cn('text-white', 'text-gray-900')}`}>
              {language === 'am' ? 'የይለፍ ቃል ጥንካሬ' : 'Password Strength'}
            </h3>
          </div>
          <p className={`text-sm ${cn('text-gray-400', 'text-gray-600')} mb-2`}>
            {stats.strongPasswords}% {language === 'am' ? 'ጠንካራ ይለፍ ቃሎች' : 'strong passwords'}
          </p>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div className="bg-green-500 h-2 rounded-full" style={{ width: `${stats.strongPasswords}%` }}></div>
          </div>
        </div>

        <div className={`${cn('bg-gray-800', 'bg-white')} rounded-xl shadow-sm p-4`}>
          <div className="flex items-center space-x-3 mb-3">
            <div className={`p-2 rounded-lg ${cn('bg-purple-900/30', 'bg-purple-100')}`}>
              <GlobeAltIcon className="w-5 h-5 text-purple-500" />
            </div>
            <h3 className={`font-medium ${cn('text-white', 'text-gray-900')}`}>
              {language === 'am' ? 'የአይፒ መገደብ' : 'IP Restriction'}
            </h3>
          </div>
          <p className={`text-sm ${cn('text-gray-400', 'text-gray-600')} mb-2`}>
            {stats.unusualIPs} {language === 'am' ? 'ያልተለመዱ አይፒዎች ተገኝተዋል' : 'unusual IPs detected'}
          </p>
          {stats.unusualIPs > 0 && (
            <div className="flex items-center space-x-2">
              <span className="text-xs text-red-500 font-medium">⚠️</span>
              <span className={`text-xs ${cn('text-gray-400', 'text-gray-500')}`}>
                {language === 'am' ? 'ትኩረት ያስፈልጋል' : 'Attention needed'}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Security Logs */}
      <div className={`${cn('bg-gray-800', 'bg-white')} rounded-xl shadow-sm overflow-hidden`}>
        <div className={`p-4 border-b ${cn('border-gray-700', 'border-gray-200')} flex justify-between items-center`}>
          <h2 className={`text-lg font-semibold ${cn('text-white', 'text-gray-900')}`}>
            {language === 'am' ? 'የደህንነት ምዝግብ' : 'Security Logs'}
          </h2>
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className={cn(
              'bg-gray-700 border-gray-600 text-white',
              'bg-white border-gray-300 text-gray-900'
            ) + ' px-3 py-1 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500'}
          >
            <option value="today">{language === 'am' ? 'ዛሬ' : 'Today'}</option>
            <option value="week">{language === 'am' ? 'ይህ ሳምንት' : 'This Week'}</option>
            <option value="month">{language === 'am' ? 'ይህ ወር' : 'This Month'}</option>
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className={cn('bg-gray-700', 'bg-gray-50')}>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                  {language === 'am' ? 'ተጠቃሚ' : 'User'}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                  {language === 'am' ? 'ድርጊት' : 'Action'}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                  {language === 'am' ? 'አይፒ አድራሻ' : 'IP Address'}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                  {language === 'am' ? 'መሣሪያ' : 'Device'}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                  {language === 'am' ? 'አካባቢ' : 'Location'}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                  {language === 'am' ? 'ሁኔታ' : 'Status'}
                </th>
              </tr>
            </thead>
            <tbody className={`${cn('bg-gray-800', 'bg-white')} divide-y ${cn('divide-gray-700', 'divide-gray-200')}`}>
              {securityLogs.map((log) => (
                <tr key={log.id} className={cn('hover:bg-gray-700', 'hover:bg-gray-50') + ' transition-colors'}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <p className={`text-sm ${cn('text-white', 'text-gray-900')}`}>
                      {log.user.split('@')[0]}
                    </p>
                    <p className={`text-xs ${cn('text-gray-400', 'text-gray-500')}`}>
                      {new Date(log.timestamp).toLocaleDateString()}
                    </p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <p className={`text-sm ${cn('text-gray-300', 'text-gray-600')}`}>
                      {log.action}
                    </p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                    {log.ip}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-1">
                      {log.device && (log.device.includes('iPhone') || log.device.includes('Samsung')) ? (
                        <DevicePhoneMobileIcon className="w-4 h-4 text-gray-400" />
                      ) : (
                        <ComputerDesktopIcon className="w-4 h-4 text-gray-400" />
                      )}
                      <span className="text-sm text-gray-400">{log.device || 'Computer'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                    {log.location || getText('Addis Ababa, Ethiopia', 'አዲስ አበባ, ኢትዮጵያ')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(log.status)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}