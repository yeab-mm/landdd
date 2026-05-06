'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/lib/LanguageContext';
import { useTranslation } from '@/lib/useTranslation';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  UserPlusIcon,
  EnvelopeIcon,
  PhoneIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface User {
  id: number;
  name: string;
  nameAm: string;
  email: string;
  phone: string;
  kebeleId: string;
  role: 'citizen' | 'officer' | 'admin';
  status: 'active' | 'inactive' | 'pending';
  joinedDate: string;
  properties: number;
}

export default function AdminUsersPage() {
  const { darkMode, language } = useLanguage();
  const { t } = useTranslation();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    pending: 0,
    totalProperties: 0
  });

  const cn = (darkClass: string, lightClass: string) => darkMode ? darkClass : lightClass;

  const getText = (enText: string, amText: string) => {
    return language === 'en' ? enText : amText;
  };

  // Fetch users from backend
  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        window.location.href = '/login';
        return;
      }

      const response = await fetch(`${API_URL}/admin/users`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      setUsers(data.users || []);
      setStats(data.stats || { total: 0, active: 0, pending: 0, totalProperties: 0 });
    } catch (error) {
      console.error('Fetch users error:', error);
      toast.error(getText('Failed to load users', 'ተጠቃሚዎችን ማምጣት አልተሳካም'));
      // Set fallback empty data
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const deleteUser = async (id: number) => {
    if (!confirm(getText('Are you sure you want to delete this user?', 'ይህን ተጠቃሚ መሰረዝ እንደሚፈልጉ እርግጠኛ ነዎት?'))) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/admin/users/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        toast.success(getText('User deleted successfully', 'ተጠቃሚው በተሳካ ሁኔታ ተሰርዟል'));
        fetchUsers();
      } else {
        toast.error(getText('Failed to delete user', 'ተጠቃሚውን መሰረዝ አልተሳካም'));
      }
    } catch (error) {
      toast.error(getText('Error deleting user', 'ተጠቃሚውን በመሰረዝ ላይ ስህተት'));
    }
  };

  const getRoleBadge = (role: string) => {
    const config: any = {
      admin: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
      officer: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      citizen: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
    };
    const roleText: any = {
      admin: getText('Admin', 'አስተዳዳሪ'),
      officer: getText('Officer', 'ኦፊሰር'),
      citizen: getText('Citizen', 'ዜጋ')
    };
    return (
      <span className={`px-2 py-1 text-xs rounded-full ${config[role] || config.citizen}`}>
        {roleText[role] || role}
      </span>
    );
  };

  const getStatusBadge = (status: string) => {
    const config: any = {
      active: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      inactive: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400',
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
    };
    const statusText: any = {
      active: getText('Active', 'ንቁ'),
      inactive: getText('Inactive', 'ንቁ ያልሆነ'),
      pending: getText('Pending', 'በመጠባበቅ ላይ')
    };
    return (
      <span className={`px-2 py-1 text-xs rounded-full ${config[status] || config.pending}`}>
        {statusText[status] || status}
      </span>
    );
  };

  const filteredUsers = users.filter(user => {
    const name = language === 'am' ? (user.nameAm || user.name) : user.name;
    const matchesSearch = searchTerm === '' || 
      name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.kebeleId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p>{getText('Loading users...', 'ተጠቃሚዎችን በማምጣት ላይ...')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className={`text-2xl font-bold ${cn('text-white', 'text-gray-900')}`}>
            {getText('User Management', 'የተጠቃሚዎች አስተዳደር')}
          </h1>
          <p className={`text-sm mt-1 ${cn('text-gray-400', 'text-gray-500')}`}>
            {getText('Total', 'ጠቅላላ')}: {users.length} {getText('users', 'ተጠቃሚዎች')}
          </p>
        </div>
        <Link href="/admin/users/new">
          <button className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
            <UserPlusIcon className="w-5 h-5 mr-2" />
            {getText('Add New User', 'አዲስ ተጠቃሚ ጨምር')}
          </button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className={`${cn('bg-gray-800', 'bg-white')} rounded-xl shadow-sm p-4`}>
          <p className={`text-sm ${cn('text-gray-400', 'text-gray-500')}`}>{getText('Total Users', 'ጠቅላላ ተጠቃሚዎች')}</p>
          <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
        </div>
        <div className={`${cn('bg-gray-800', 'bg-white')} rounded-xl shadow-sm p-4`}>
          <p className={`text-sm ${cn('text-gray-400', 'text-gray-500')}`}>{getText('Active Users', 'ንቁ ተጠቃሚዎች')}</p>
          <p className="text-2xl font-bold text-green-600">{stats.active}</p>
        </div>
        <div className={`${cn('bg-gray-800', 'bg-white')} rounded-xl shadow-sm p-4`}>
          <p className={`text-sm ${cn('text-gray-400', 'text-gray-500')}`}>{getText('Pending Approval', 'በመጠባበቅ ላይ')}</p>
          <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
        </div>
        <div className={`${cn('bg-gray-800', 'bg-white')} rounded-xl shadow-sm p-4`}>
          <p className={`text-sm ${cn('text-gray-400', 'text-gray-500')}`}>{getText('Total Properties', 'ጠቅላላ ንብረቶች')}</p>
          <p className="text-2xl font-bold text-purple-600">{stats.totalProperties}</p>
        </div>
      </div>

      {/* Filters */}
      <div className={`${cn('bg-gray-800', 'bg-white')} rounded-xl shadow-sm p-4`}>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder={getText('Search by name or email...', 'በስም ወይም ኢሜይል ፈልግ...')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500
                ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}
              `}
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className={`px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500
              ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} md:w-40
            `}
          >
            <option value="all">{getText('All Roles', 'ሁሉም ሚናዎች')}</option>
            <option value="citizen">{getText('Citizen', 'ዜጋ')}</option>
            <option value="officer">{getText('Officer', 'ኦፊሰር')}</option>
            <option value="admin">{getText('Admin', 'አስተዳዳሪ')}</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={`px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500
              ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} md:w-40
            `}
          >
            <option value="all">{getText('All Status', 'ሁሉም ሁኔታ')}</option>
            <option value="active">{getText('Active', 'ንቁ')}</option>
            <option value="pending">{getText('Pending', 'በመጠባበቅ ላይ')}</option>
            <option value="inactive">{getText('Inactive', 'ንቁ ያልሆነ')}</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className={`${cn('bg-gray-800', 'bg-white')} rounded-xl shadow-sm overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className={cn('bg-gray-700', 'bg-gray-50')}>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">{getText('User', 'ተጠቃሚ')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">{getText('Contact', 'መገኛ')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">{getText('Kebele ID', 'ቀበሌ መታወቂያ')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">{getText('Role', 'ሚና')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">{getText('Status', 'ሁኔታ')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">{getText('Properties', 'ንብረቶች')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">{getText('Actions', 'ድርጊቶች')}</th>
              </tr>
            </thead>
            <tbody className={`${cn('bg-gray-800', 'bg-white')} divide-y ${cn('divide-gray-700', 'divide-gray-200')}`}>
              {filteredUsers.map((user) => (
                <tr key={user.id} className={cn('hover:bg-gray-700', 'hover:bg-gray-50')}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-semibold">
                          {(language === 'am' ? (user.nameAm || user.name) : user.name).charAt(0)}
                        </span>
                      </div>
                      <div className="ml-3">
                        <p className={`text-sm font-medium ${cn('text-white', 'text-gray-900')}`}>
                          {language === 'am' ? (user.nameAm || user.name) : user.name}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="space-y-1">
                      <p className="text-sm text-gray-400 flex items-center">
                        <EnvelopeIcon className="w-4 h-4 mr-1" />
                        {user.email}
                      </p>
                      <p className="text-sm text-gray-400 flex items-center">
                        <PhoneIcon className="w-4 h-4 mr-1" />
                        {user.phone}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                    {user.kebeleId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getRoleBadge(user.role)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(user.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                    {user.properties}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <button className="p-1 hover:bg-gray-700 rounded-lg transition-colors">
                        <EyeIcon className="w-5 h-5 text-blue-400" />
                      </button>
                      <Link href={`/admin/users/edit/${user.id}`}>
                        <button className="p-1 hover:bg-gray-700 rounded-lg transition-colors">
                          <PencilIcon className="w-5 h-5 text-green-400" />
                        </button>
                      </Link>
                      <button onClick={() => deleteUser(user.id)} className="p-1 hover:bg-gray-700 rounded-lg transition-colors">
                        <TrashIcon className="w-5 h-5 text-red-400" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="p-8 text-center">
            <p className={`text-lg ${cn('text-gray-300', 'text-gray-600')}`}>
              {getText('No users found', 'ምንም ተጠቃሚዎች አልተገኙም')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}