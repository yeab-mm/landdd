'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/lib/LanguageContext';
import { useTranslation } from '@/lib/useTranslation';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const API_URL = 'http://localhost:5000/api';

interface Verification {
  id: number;
  applicant: string;
  parcelId: string;
  location: string;
  submittedDate: string;
  status: 'pending' | 'approved' | 'rejected';
  documents: number;
}

export default function AdminVerificationsPage() {
  const { darkMode, language } = useLanguage();
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [verifications, setVerifications] = useState<Verification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cn = (darkClass: string, lightClass: string): string => {
    return darkMode ? darkClass : lightClass;
  };

  const getText = (enText: string, amText: string) => {
    return language === 'en' ? enText : amText;
  };

  // Fetch verifications from backend
  const fetchVerifications = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      if (!token) {
        window.location.href = '/login';
        return;
      }

      const response = await fetch(`${API_URL}/admin/verifications`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem('token');
        window.location.href = '/login';
        return;
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      setVerifications(data.verifications || []);
    } catch (error) {
      console.error('Fetch error:', error);
      setError(getText('Failed to load verifications', 'ማረጋገጫዎችን ማምጣት አልተሳካም'));
      toast.error(getText('Failed to load verifications', 'ማረጋገጫዎችን ማምጣት አልተሳካም'));
    } finally {
      setLoading(false);
    }
  };

  // Update verification status (approve/reject)
  const updateStatus = async (id: number, status: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/admin/verifications/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });

      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem('token');
        window.location.href = '/login';
        return;
      }

      if (response.ok) {
        const msg = status === 'approved' 
          ? getText('Verification approved', 'ማረጋገጫው ጸድቋል')
          : getText('Verification rejected', 'ማረጋገጫው ውድቅ ተደርጓል');
        toast.success(msg);
        fetchVerifications(); // Refresh the list
      } else {
        toast.error(getText('Failed to update status', 'ሁኔታውን ማዘመን አልተሳካም'));
      }
    } catch (error) {
      toast.error(getText('Error updating status', 'ሁኔታውን በማዘመን ላይ ስህተት'));
    }
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'approved':
        return (
          <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
            {getText('Approved', 'የጸደቀ')}
          </span>
        );
      case 'rejected':
        return (
          <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
            {getText('Rejected', 'ውድቅ ተደርጓል')}
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
            {getText('Pending', 'በመጠባበቅ ላይ')}
          </span>
        );
    }
  };

  useEffect(() => {
    fetchVerifications();
  }, []);

  const filteredVerifications = verifications.filter(v => {
    const matchesSearch = searchTerm === '' || 
      v.applicant.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.parcelId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || v.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: verifications.length,
    pending: verifications.filter(v => v.status === 'pending').length,
    approved: verifications.filter(v => v.status === 'approved').length,
    rejected: verifications.filter(v => v.status === 'rejected').length
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className={`text-sm ${cn('text-gray-400', 'text-gray-600')}`}>
            {getText('Loading verifications...', 'ማረጋገጫዎችን በማምጣት ላይ...')}
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg">
          <p className="font-bold">{getText('Error', 'ስህተት')}</p>
          <p>{error}</p>
          <button 
            onClick={fetchVerifications}
            className="mt-2 bg-red-600 dark:bg-red-700 text-white px-3 py-1 rounded text-sm flex items-center gap-2"
          >
            <ArrowPathIcon className="w-4 h-4" />
            {getText('Try Again', 'እንደገና ሞክር')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Refresh */}
      <div className="flex justify-between items-center">
        <h1 className={`text-2xl font-bold ${cn('text-white', 'text-gray-900')}`}>
          {getText('Verifications', 'ማረጋገጫዎች')}
        </h1>
        <button
          onClick={fetchVerifications}
          className={`p-2 rounded-lg transition-colors ${cn('hover:bg-gray-700', 'hover:bg-gray-100')}`}
          title={getText('Refresh', 'አድስ')}
        >
          <ArrowPathIcon className={`w-5 h-5 ${cn('text-gray-400', 'text-gray-500')}`} />
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className={`${cn('bg-gray-800', 'bg-white')} rounded-xl shadow-sm p-4`}>
          <p className={`text-sm ${cn('text-gray-400', 'text-gray-500')}`}>{getText('Total', 'ጠቅላላ')}</p>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.total}</p>
        </div>
        <div className={`${cn('bg-gray-800', 'bg-white')} rounded-xl shadow-sm p-4`}>
          <p className={`text-sm ${cn('text-gray-400', 'text-gray-500')}`}>{getText('Approved', 'የጸደቀ')}</p>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.approved}</p>
        </div>
        <div className={`${cn('bg-gray-800', 'bg-white')} rounded-xl shadow-sm p-4`}>
          <p className={`text-sm ${cn('text-gray-400', 'text-gray-500')}`}>{getText('Pending', 'በመጠባበቅ ላይ')}</p>
          <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats.pending}</p>
        </div>
        <div className={`${cn('bg-gray-800', 'bg-white')} rounded-xl shadow-sm p-4`}>
          <p className={`text-sm ${cn('text-gray-400', 'text-gray-500')}`}>{getText('Rejected', 'ውድቅ ተደርጓል')}</p>
          <p className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.rejected}</p>
        </div>
      </div>

      {/* Filters */}
      <div className={`${cn('bg-gray-800', 'bg-white')} rounded-xl shadow-sm p-4`}>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder={getText('Search by name or parcel ID...', 'በስም ወይም በመሬት ቁጥር ፈልግ...')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`
                w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500
                ${darkMode 
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                  : 'bg-white border-gray-300 text-gray-900'
                }
              `}
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={`
              px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500
              ${darkMode 
                ? 'bg-gray-700 border-gray-600 text-white' 
                : 'bg-white border-gray-300 text-gray-900'
              } md:w-48
            `}
          >
            <option value="all">{getText('All Status', 'ሁሉም ሁኔታ')}</option>
            <option value="pending">{getText('Pending', 'በመጠባበቅ ላይ')}</option>
            <option value="approved">{getText('Approved', 'የጸደቀ')}</option>
            <option value="rejected">{getText('Rejected', 'ውድቅ ተደርጓል')}</option>
          </select>
          <button 
            onClick={fetchVerifications}
            className="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 md:w-24"
          >
            <ArrowPathIcon className="w-4 h-4 mr-2" />
            {getText('Refresh', 'አድስ')}
          </button>
        </div>
      </div>

      {/* Verifications Table */}
      <div className={`${cn('bg-gray-800', 'bg-white')} rounded-xl shadow-sm overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className={cn('bg-gray-700', 'bg-gray-50')}>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  {getText('Applicant', 'አመልካች')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  {getText('Parcel ID', 'የመሬት ቁጥር')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  {getText('Location', 'አካባቢ')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  {getText('Submitted Date', 'የቀረበበት ቀን')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  {getText('Documents', 'ሰነዶች')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  {getText('Status', 'ሁኔታ')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  {getText('Actions', 'ድርጊቶች')}
                </th>
              </tr>
            </thead>
            <tbody className={`${cn('bg-gray-800', 'bg-white')} divide-y ${cn('divide-gray-700', 'divide-gray-200')}`}>
              {filteredVerifications.map((verification) => (
                <tr key={verification.id} className={cn('hover:bg-gray-700', 'hover:bg-gray-50') + ' transition-colors'}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-semibold">
                          {verification.applicant.charAt(0)}
                        </span>
                      </div>
                      <div className="ml-3">
                        <p className={`${cn('text-white', 'text-gray-900')} text-sm font-medium`}>
                          {verification.applicant}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                    {verification.parcelId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                    {verification.location || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                    {verification.submittedDate}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs bg-gray-700 text-gray-300 rounded-full">
                      {verification.documents} {getText('documents', 'ሰነዶች')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(verification.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <button className="p-1 hover:bg-gray-700 rounded-lg transition-colors">
                        <EyeIcon className="w-5 h-5 text-blue-400" />
                      </button>
                      {verification.status === 'pending' && (
                        <>
                          <button 
                            onClick={() => updateStatus(verification.id, 'approved')}
                            className="p-1 hover:bg-gray-700 rounded-lg transition-colors"
                          >
                            <CheckCircleIcon className="w-5 h-5 text-green-400" />
                          </button>
                          <button 
                            onClick={() => updateStatus(verification.id, 'rejected')}
                            className="p-1 hover:bg-gray-700 rounded-lg transition-colors"
                          >
                            <XCircleIcon className="w-5 h-5 text-red-400" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* No Results */}
        {filteredVerifications.length === 0 && (
          <div className="p-8 text-center">
            <p className={`text-lg ${cn('text-gray-300', 'text-gray-600')}`}>
              {getText('No verifications found', 'ምንም ማረጋገጫዎች አልተገኙም')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}