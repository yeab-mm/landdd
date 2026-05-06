// app/officer/verifications/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/lib/LanguageContext';
import { useTranslation } from '@/lib/useTranslation';
import {
  MagnifyingGlassIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  UserIcon,
  CalendarIcon,
  DocumentTextIcon,
  EyeIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ArrowDownTrayIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

interface Verification {
  id: number;
  verificationId?: string;
  applicant: string;
  applicantAm?: string;
  parcelId: string;
  location?: string;
  submittedDate: string;
  status: string;
  documents: number;
  documentsList?: string[];
}

export default function OfficerVerificationsPage() {
  const { darkMode, language } = useLanguage();
  const { t } = useTranslation();
  const router = useRouter();
  const [verifications, setVerifications] = useState<Verification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDateRange, setFilterDateRange] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [stats, setStats] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
    total: 0
  });

  const itemsPerPage = 5;

  const cn = (darkClass: string, lightClass: string) => darkMode ? darkClass : lightClass;

  // Fallback data for when API is not available
  const fallbackVerifications: Verification[] = [
    {
      id: 1,
      verificationId: 'VER-001',
      applicant: 'Abebe Kebede',
      applicantAm: 'አበበ ከበደ',
      parcelId: 'BD-2024-001',
      location: 'Zone 1, Bahir Dar',
      submittedDate: '2024-03-15',
      status: 'pending',
      documents: 3
    },
    {
      id: 2,
      verificationId: 'VER-002',
      applicant: 'Tigist Haile',
      applicantAm: 'ትግስት ኃይሉ',
      parcelId: 'BD-2024-089',
      location: 'Zone 3, Bahir Dar',
      submittedDate: '2024-03-14',
      status: 'pending',
      documents: 5
    },
    {
      id: 3,
      verificationId: 'VER-003',
      applicant: 'Biruk Alemu',
      applicantAm: 'ብሩክ አለሙ',
      parcelId: 'BD-2024-045',
      location: 'Zone 2, Bahir Dar',
      submittedDate: '2024-03-13',
      status: 'pending',
      documents: 2
    },
    {
      id: 4,
      verificationId: 'VER-004',
      applicant: 'Meron Tadesse',
      applicantAm: 'መሮን ታደሰ',
      parcelId: 'BD-2024-123',
      location: 'Zone 4, Bahir Dar',
      submittedDate: '2024-03-12',
      status: 'approved',
      documents: 4
    },
    {
      id: 5,
      verificationId: 'VER-005',
      applicant: 'Tekle Berhan',
      applicantAm: 'ተክሌ ብርሃን',
      parcelId: 'BD-2024-067',
      location: 'Zone 1, Bahir Dar',
      submittedDate: '2024-03-11',
      status: 'rejected',
      documents: 2
    }
  ];

  const fetchVerifications = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch('http://localhost:5000/api/officer/verifications', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch verifications');
      }

      const data = await response.json();
      const verificationsData = data.verifications || [];
      setVerifications(verificationsData);
      
      setStats({
        pending: verificationsData.filter((v: Verification) => v.status === 'pending').length,
        approved: verificationsData.filter((v: Verification) => v.status === 'approved').length,
        rejected: verificationsData.filter((v: Verification) => v.status === 'rejected').length,
        total: verificationsData.length
      });
    } catch (err) {
      console.error('Error fetching verifications:', err);
      setError('Unable to connect to server. Using demo data.');
      setVerifications(fallbackVerifications);
      setStats({
        pending: fallbackVerifications.filter(v => v.status === 'pending').length,
        approved: fallbackVerifications.filter(v => v.status === 'approved').length,
        rejected: fallbackVerifications.filter(v => v.status === 'rejected').length,
        total: fallbackVerifications.length
      });
    } finally {
      setLoading(false);
    }
  };

  const approveVerification = async (id: number) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/officer/verifications/${id}/approve`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setVerifications(verifications.map(v => 
          v.id === id ? { ...v, status: 'approved' } : v
        ));
        alert('Verification approved successfully!');
        fetchVerifications();
      } else {
        throw new Error('Failed to approve');
      }
    } catch (err) {
      console.error('Error approving verification:', err);
      alert('Failed to approve verification. Please try again.');
    }
  };

  const rejectVerification = async (id: number) => {
    const reason = prompt('Please enter reason for rejection:');
    if (!reason) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/officer/verifications/${id}/reject`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason })
      });

      if (response.ok) {
        setVerifications(verifications.map(v => 
          v.id === id ? { ...v, status: 'rejected' } : v
        ));
        alert('Verification rejected!');
        fetchVerifications();
      } else {
        throw new Error('Failed to reject');
      }
    } catch (err) {
      console.error('Error rejecting verification:', err);
      alert('Failed to reject verification. Please try again.');
    }
  };

  // Export to CSV
  const exportToCSV = () => {
    const filtered = getFilteredVerifications();
    
    const headers = ['ID', 'Applicant', 'Parcel ID', 'Location', 'Submitted Date', 'Status', 'Documents'];
    const rows = filtered.map(v => [
      v.verificationId || `VER-${v.id}`,
      v.applicant,
      v.parcelId,
      v.location || 'N/A',
      v.submittedDate,
      v.status,
      v.documents
    ]);
    
    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `verifications_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    
    alert('Exported successfully!');
  };

  // Apply date filter
  const getDateFiltered = (items: Verification[]) => {
    if (filterDateRange === 'all') return items;
    
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const thisWeek = new Date(now.setDate(now.getDate() - 7));
    const thisMonth = new Date(now.setMonth(now.getMonth() - 1));
    
    return items.filter(item => {
      const itemDate = new Date(item.submittedDate);
      if (filterDateRange === 'today') {
        return itemDate >= today;
      } else if (filterDateRange === 'week') {
        return itemDate >= thisWeek;
      } else if (filterDateRange === 'month') {
        return itemDate >= thisMonth;
      }
      return true;
    });
  };

  const getFilteredVerifications = () => {
    let filtered = verifications;
    
    // Apply status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(v => v.status === filterStatus);
    }
    
    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(v => {
        const applicantName = language === 'am' && v.applicantAm ? v.applicantAm : v.applicant;
        return applicantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
               v.parcelId.toLowerCase().includes(searchQuery.toLowerCase()) ||
               (v.verificationId || '').toLowerCase().includes(searchQuery.toLowerCase());
      });
    }
    
    // Apply date filter
    filtered = getDateFiltered(filtered);
    
    return filtered;
  };

  const clearFilters = () => {
    setFilterStatus('all');
    setFilterDateRange('all');
    setSearchQuery('');
    setCurrentPage(1);
  };

  useEffect(() => {
    fetchVerifications();
  }, []);

  const filteredVerifications = getFilteredVerifications();
  const totalPages = Math.ceil(filteredVerifications.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedVerifications = filteredVerifications.slice(startIndex, startIndex + itemsPerPage);

  const getStatusBadge = (status: string) => {
    const config: Record<string, { color: string; text: string; icon: any }> = {
      pending: { color: 'yellow', text: 'Pending', icon: ClockIcon },
      approved: { color: 'green', text: 'Approved', icon: CheckCircleIcon },
      rejected: { color: 'red', text: 'Rejected', icon: XCircleIcon }
    };
    const { color, text, icon: Icon } = config[status] || config.pending;
    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-${color}-100 text-${color}-800`}>
        <Icon className="w-3 h-3 mr-1" />
        {text}
      </span>
    );
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString(language === 'am' ? 'am-ET' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
          <p className={`${cn('text-gray-400', 'text-gray-600')} mt-4`}>
            Loading verifications...
          </p>
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
            {language === 'am' ? 'የመሬት ማረጋገጫ ጥያቄዎች' : 'Land Verifications'}
          </h1>
          <p className={`${cn('text-gray-400', 'text-gray-600')} mt-1`}>
            {language === 'am' 
              ? `በአጠቃላይ ${stats.total} ጥያቄዎች`
              : `Total ${stats.total} requests`}
          </p>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={exportToCSV}
            className={`${cn('bg-gray-700 hover:bg-gray-600', 'bg-gray-100 hover:bg-gray-200')} px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center`}
          >
            <ArrowDownTrayIcon className="w-4 h-4 mr-2" />
            {language === 'am' ? 'ላክ' : 'Export'}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className={`${cn('bg-gray-800', 'bg-white')} rounded-lg p-4`}>
          <p className={`${cn('text-gray-400', 'text-gray-600')} text-sm`}>Total</p>
          <p className={`${cn('text-white', 'text-gray-900')} text-2xl font-bold`}>{stats.total}</p>
        </div>
        <div className={`${cn('bg-gray-800', 'bg-white')} rounded-lg p-4`}>
          <p className={`${cn('text-gray-400', 'text-gray-600')} text-sm`}>Pending</p>
          <p className="text-yellow-600 text-2xl font-bold">{stats.pending}</p>
        </div>
        <div className={`${cn('bg-gray-800', 'bg-white')} rounded-lg p-4`}>
          <p className={`${cn('text-gray-400', 'text-gray-600')} text-sm`}>Approved</p>
          <p className="text-green-600 text-2xl font-bold">{stats.approved}</p>
        </div>
        <div className={`${cn('bg-gray-800', 'bg-white')} rounded-lg p-4`}>
          <p className={`${cn('text-gray-400', 'text-gray-600')} text-sm`}>Rejected</p>
          <p className="text-red-600 text-2xl font-bold">{stats.rejected}</p>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-yellow-500/20 border border-yellow-500 rounded-lg p-4 text-yellow-500 text-sm">
          {error}
        </div>
      )}

      {/* Search and Filters */}
      <div className={`${cn('bg-gray-800', 'bg-white')} rounded-lg shadow-lg p-4`}>
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder={language === 'am' ? 'በስም ወይም በመሬት መታወቂያ ፈልግ...' : 'Search by name or land ID...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full pl-9 pr-4 py-2 rounded-lg text-sm ${
                  darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-100 border-gray-300 text-gray-900'
                } border focus:outline-none focus:ring-2 focus:ring-green-500`}
              />
            </div>
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className={`px-4 py-2 rounded-lg text-sm ${
              darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
            } border focus:outline-none focus:ring-2 focus:ring-green-500`}
          >
            <option value="all">{language === 'am' ? 'ሁሉም ሁኔታ' : 'All Status'}</option>
            <option value="pending">{language === 'am' ? 'በመጠባበቅ ላይ' : 'Pending'}</option>
            <option value="approved">{language === 'am' ? 'የጸደቀ' : 'Approved'}</option>
            <option value="rejected">{language === 'am' ? 'ውድቅ የሆነ' : 'Rejected'}</option>
          </select>
          <select
            value={filterDateRange}
            onChange={(e) => setFilterDateRange(e.target.value)}
            className={`px-4 py-2 rounded-lg text-sm ${
              darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
            } border focus:outline-none focus:ring-2 focus:ring-green-500`}
          >
            <option value="all">{language === 'am' ? 'ሁሉም ጊዜ' : 'All Time'}</option>
            <option value="today">{language === 'am' ? 'ዛሬ' : 'Today'}</option>
            <option value="week">{language === 'am' ? 'በዚህ ሳምንት' : 'This Week'}</option>
            <option value="month">{language === 'am' ? 'በዚህ ወር' : 'This Month'}</option>
          </select>
          {(filterStatus !== 'all' || filterDateRange !== 'all' || searchQuery) && (
            <button
              onClick={clearFilters}
              className="text-sm text-green-500 hover:text-green-400 flex items-center"
            >
              <XMarkIcon className="w-4 h-4 mr-1" />
              {language === 'am' ? 'ማጣሪያዎችን አጽዳ' : 'Clear Filters'}
            </button>
          )}
        </div>
      </div>

      {/* Verifications Table */}
      <div className={`${cn('bg-gray-800', 'bg-white')} rounded-lg shadow-lg overflow-hidden`}>
        {filteredVerifications.length === 0 ? (
          <div className="text-center py-12">
            <DocumentTextIcon className="w-12 h-12 mx-auto text-gray-400 mb-3" />
            <p className={`${cn('text-gray-300', 'text-gray-600')}`}>
              {language === 'am' ? 'ምንም ጥያቄዎች አልተገኙም' : 'No verifications found'}
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className={`${cn('bg-gray-700/50', 'bg-gray-50')}`}>
                  <tr>
                    <th className="text-left px-6 py-3 text-xs font-medium uppercase tracking-wider">ID</th>
                    <th className="text-left px-6 py-3 text-xs font-medium uppercase tracking-wider">Applicant</th>
                    <th className="text-left px-6 py-3 text-xs font-medium uppercase tracking-wider">Land ID</th>
                    <th className="text-left px-6 py-3 text-xs font-medium uppercase tracking-wider">Date</th>
                    <th className="text-left px-6 py-3 text-xs font-medium uppercase tracking-wider">Status</th>
                    <th className="text-left px-6 py-3 text-xs font-medium uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {paginatedVerifications.map((item) => (
                    <tr key={item.id} className={`${cn('hover:bg-gray-700/50', 'hover:bg-gray-50')} transition-colors`}>
                      <td className="px-6 py-4 text-sm font-medium">{item.verificationId || `VER-${item.id}`}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <UserIcon className="w-4 h-4 text-gray-400 mr-2" />
                          <span>{language === 'am' && item.applicantAm ? item.applicantAm : item.applicant}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm">{item.parcelId}</td>
                      <td className="px-6 py-4 text-sm">{formatDate(item.submittedDate)}</td>
                      <td className="px-6 py-4">{getStatusBadge(item.status)}</td>
                      <td className="px-6 py-4">
                        <div className="flex space-x-2">
                          <button className="text-blue-500 hover:text-blue-400">
                            <EyeIcon className="w-5 h-5" />
                          </button>
                          {item.status === 'pending' && (
                            <>
                              <button 
                                onClick={() => approveVerification(item.id)}
                                className="text-green-500 hover:text-green-400"
                              >
                                <CheckCircleIcon className="w-5 h-5" />
                              </button>
                              <button 
                                onClick={() => rejectVerification(item.id)}
                                className="text-red-500 hover:text-red-400"
                              >
                                <XCircleIcon className="w-5 h-5" />
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

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-700 flex items-center justify-between">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 rounded disabled:opacity-50"
                >
                  <ChevronLeftIcon className="w-4 h-4 inline" /> Previous
                </button>
                <span>Page {currentPage} of {totalPages}</span>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 rounded disabled:opacity-50"
                >
                  Next <ChevronRightIcon className="w-4 h-4 inline" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}