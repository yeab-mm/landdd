'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/lib/LanguageContext';
import {
  MagnifyingGlassIcon,
  EyeIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

const API_URL = 'http://localhost:5000/api';

interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: string;
  status: string;
  joinedDate: string;
}

// Sample data for fallback
const sampleUsers: User[] = [
  { id: 1, name: 'Admin User', email: 'admin@land.gov.et', phone: '+251911111111', role: 'admin', status: 'active', joinedDate: '2024-01-01' },
  { id: 2, name: 'Officer User', email: 'officer@land.gov.et', phone: '+251922222222', role: 'officer', status: 'active', joinedDate: '2024-01-02' },
  { id: 3, name: 'Abebe Kebede', email: 'abebe@example.com', phone: '+251933333333', role: 'citizen', status: 'active', joinedDate: '2024-01-15' },
  { id: 4, name: 'Tigist Haile', email: 'tigist@example.com', phone: '+251944444444', role: 'citizen', status: 'pending', joinedDate: '2024-02-01' },
];

export default function OfficerUsersPage() {
  const { darkMode, language } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [users, setUsers] = useState<User[]>(sampleUsers);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const cn = (darkClass: string, lightClass: string) => darkMode ? darkClass : lightClass;

  const t = (en: string, am: string) => language === 'en' ? en : am;

  // Fetch users from backend
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_URL}/admin/users`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.users && data.users.length > 0) {
          setUsers(data.users);
        }
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const getRoleBadge = (role: string) => {
    if (role === 'admin') {
      return <span className="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300">{t('Admin', 'አስተዳዳሪ')}</span>;
    }
    if (role === 'officer') {
      return <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300">{t('Officer', 'ኦፊሰር')}</span>;
    }
    return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300">{t('Citizen', 'ዜጋ')}</span>;
  };

  const getStatusBadge = (status: string) => {
    if (status === 'active') {
      return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300">{t('Active', 'ንቁ')}</span>;
    }
    if (status === 'pending') {
      return <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300">{t('Pending', 'በመጠባበቅ ላይ')}</span>;
    }
    return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">{t('Inactive', 'ንቁ ያልሆነ')}</span>;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(language === 'en' ? 'en-US' : 'am-ET');
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch = searchTerm === '' || 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const stats = {
    total: users.length,
    active: users.filter((u) => u.status === 'active').length,
    pending: users.filter((u) => u.status === 'pending').length,
    citizens: users.filter((u) => u.role === 'citizen').length,
  };

  if (loading) {
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
        <div>
          <h1 className={`text-2xl font-bold ${cn('text-white', 'text-gray-900')}`}>
            {t('User Management', 'የተጠቃሚዎች አስተዳደር')}
          </h1>
          <p className={`text-sm mt-1 ${cn('text-gray-400', 'text-gray-500')}`}>
            {t('Total', 'ጠቅላላ')}: {users.length} {t('users', 'ተጠቃሚዎች')}
          </p>
        </div>
        <button
          onClick={fetchUsers}
          className={`p-2 rounded-lg ${cn('hover:bg-gray-700', 'hover:bg-gray-100')}`}
          title={t('Refresh', 'አድስ')}
        >
          <ArrowPathIcon className={`w-5 h-5 ${cn('text-gray-400', 'text-gray-500')}`} />
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className={`${cn('bg-gray-800', 'bg-white')} rounded-xl shadow-sm p-4`}>
          <p className={`text-sm ${cn('text-gray-400', 'text-gray-500')}`}>{t('Active Users', 'ንቁ ተጠቃሚዎች')}</p>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.active}</p>
        </div>
        <div className={`${cn('bg-gray-800', 'bg-white')} rounded-xl shadow-sm p-4`}>
          <p className={`text-sm ${cn('text-gray-400', 'text-gray-500')}`}>{t('Pending Approval', 'በመጠባበቅ ላይ')}</p>
          <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats.pending}</p>
        </div>
        <div className={`${cn('bg-gray-800', 'bg-white')} rounded-xl shadow-sm p-4`}>
          <p className={`text-sm ${cn('text-gray-400', 'text-gray-500')}`}>{t('Total Citizens', 'ጠቅላላ ዜጎች')}</p>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.citizens}</p>
        </div>
      </div>

      {/* Filters */}
      <div className={`${cn('bg-gray-800', 'bg-white')} rounded-xl shadow-sm p-4`}>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder={t('Search by name or email...', 'በስም ወይም ኢሜይል ፈልግ...')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className={`px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 md:w-40 ${
              darkMode 
                ? 'bg-gray-700 border-gray-600 text-white' 
                : 'bg-white border-gray-300 text-gray-900'
            }`}
          >
            <option value="all">{t('All Roles', 'ሁሉም ሚናዎች')}</option>
            <option value="citizen">{t('Citizen', 'ዜጋ')}</option>
            <option value="officer">{t('Officer', 'ኦፊሰር')}</option>
            <option value="admin">{t('Admin', 'አስተዳዳሪ')}</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={`px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 md:w-40 ${
              darkMode 
                ? 'bg-gray-700 border-gray-600 text-white' 
                : 'bg-white border-gray-300 text-gray-900'
            }`}
          >
            <option value="all">{t('All Status', 'ሁሉም ሁኔታ')}</option>
            <option value="active">{t('Active', 'ንቁ')}</option>
            <option value="pending">{t('Pending', 'በመጠባበቅ ላይ')}</option>
            <option value="inactive">{t('Inactive', 'ንቁ ያልሆነ')}</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className={`${cn('bg-gray-800', 'bg-white')} rounded-xl shadow-sm overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className={cn('bg-gray-700', 'bg-gray-50')}>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  {t('User', 'ተጠቃሚ')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  {t('Contact', 'መገኛ')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  {t('Role', 'ሚና')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  {t('Status', 'ሁኔታ')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  {t('Joined Date', 'የተቀላቀሉበት ቀን')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  {t('Actions', 'ድርጊቶች')}
                </th>
              </tr>
            </thead>
            <tbody className={`${cn('bg-gray-800', 'bg-white')} divide-y ${cn('divide-gray-700', 'divide-gray-200')}`}>
              {filteredUsers.map((user) => (
                <tr key={user.id} className={cn('hover:bg-gray-700', 'hover:bg-gray-50')}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-semibold">
                          {user.name.charAt(0)}
                        </span>
                      </div>
                      <div className="ml-3">
                        <p className={`text-sm font-medium ${cn('text-white', 'text-gray-900')}`}>
                          {user.name}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <p className={`text-sm flex items-center ${cn('text-gray-300', 'text-gray-600')}`}>
                        <EnvelopeIcon className="w-4 h-4 mr-1" />
                        {user.email}
                      </p>
                      <p className={`text-sm flex items-center ${cn('text-gray-400', 'text-gray-500')}`}>
                        <PhoneIcon className="w-4 h-4 mr-1" />
                        {user.phone || 'N/A'}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getRoleBadge(user.role)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(user.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <p className={`text-sm ${cn('text-gray-400', 'text-gray-500')}`}>
                      {formatDate(user.joinedDate)}
                    </p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button 
                      onClick={() => setSelectedUser(user)}
                      className="p-1 hover:bg-gray-600 rounded transition-colors"
                    >
                      <EyeIcon className="w-5 h-5 text-blue-400" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="p-8 text-center">
            <UserIcon className={`w-12 h-12 mx-auto mb-4 ${cn('text-gray-600', 'text-gray-400')}`} />
            <p className={`text-lg ${cn('text-gray-400', 'text-gray-600')}`}>
              {t('No users found', 'ምንም ተጠቃሚዎች አልተገኙም')}
            </p>
          </div>
        )}
      </div>

      {/* User Details Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`${cn('bg-gray-800', 'bg-white')} rounded-xl max-w-md w-full p-6`}>
            <div className="flex justify-between items-center mb-4">
              <h2 className={`text-xl font-bold ${cn('text-white', 'text-gray-900')}`}>
                {t('User Details', 'የተጠቃሚ ዝርዝሮች')}
              </h2>
              <button onClick={() => setSelectedUser(null)} className="text-gray-400 hover:text-gray-600">
                ✕
              </button>
            </div>
            <div className="space-y-3">
              <p><strong>{t('Name', 'ስም')}:</strong> {selectedUser.name}</p>
              <p><strong>{t('Email', 'ኢሜይል')}:</strong> {selectedUser.email}</p>
              <p><strong>{t('Phone', 'ስልክ')}:</strong> {selectedUser.phone || 'N/A'}</p>
              <p><strong>{t('Role', 'ሚና')}:</strong> {selectedUser.role}</p>
              <p><strong>{t('Status', 'ሁኔታ')}:</strong> {selectedUser.status}</p>
              <p><strong>{t('Joined Date', 'የተቀላቀሉበት ቀን')}:</strong> {formatDate(selectedUser.joinedDate)}</p>
            </div>
            <div className="flex justify-end mt-6">
              <button onClick={() => setSelectedUser(null)} className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700">
                {t('Close', 'ዝጋ')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}