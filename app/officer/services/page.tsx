'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/lib/LanguageContext';
import {
  MagnifyingGlassIcon,
  EyeIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  AlertTriangleIcon,
  UserIcon,
  CalendarIcon,
  ScaleIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const API_URL = 'http://localhost:5000/api';

interface Dispute {
  id: number;
  complainant: string;
  respondent: string;
  type: string;
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  priority: 'high' | 'medium' | 'low';
  date: string;
  description?: string;
  resolution?: string;
}

export default function OfficerDisputesPage() {
  const { darkMode, language } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null);

  const cn = (darkClass: string, lightClass: string) => darkMode ? darkClass : lightClass;

  const t = (en: string, am: string) => language === 'en' ? en : am;

  // Fetch disputes from backend
  const fetchDisputes = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      
      if (!token) {
        window.location.href = '/login';
        return;
      }

      // First try officer endpoint
      let response = await fetch(`${API_URL}/officer/disputes`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      // If officer endpoint fails (404), try admin endpoint
      if (response.status === 404) {
        response = await fetch(`${API_URL}/admin/disputes`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
      }

      // If both fail, use fallback data
      if (response.status === 404) {
        console.log('Using fallback dispute data');
        setDisputes([
          { id: 1, complainant: 'Abebe Kebede', respondent: 'Tekle Berhan', type: 'Boundary', status: 'open', priority: 'high', date: '2024-03-15', description: 'Boundary dispute between neighbors' },
          { id: 2, complainant: 'Biruk Alemu', respondent: 'City Administration', type: 'Ownership', status: 'in-progress', priority: 'medium', date: '2024-03-10', description: 'Ownership claim issue' },
          { id: 3, complainant: 'Tigist Haile', respondent: 'Construction Co.', type: 'Encroachment', status: 'open', priority: 'high', date: '2024-03-12', description: 'Illegal construction' },
          { id: 4, complainant: 'Mekdes Hailu', respondent: 'Neighbor', type: 'Access', status: 'resolved', priority: 'low', date: '2024-03-05', description: 'Right of way dispute', resolution: 'Access granted with conditions' },
        ]);
        setLoading(false);
        return;
      }

      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem('token');
        window.location.href = '/login';
        return;
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      const disputesData = data.disputes || data || [];
      setDisputes(Array.isArray(disputesData) ? disputesData : []);
    } catch (error) {
      console.error('Fetch error:', error);
      setError(t('Failed to load disputes', 'አለመግባባቶችን ማምጣት አልተሳካም'));
      toast.error(t('Failed to load disputes', 'አለመግባባቶችን ማምጣት አልተሳካም'));
      // Fallback data
      setDisputes([
        { id: 1, complainant: 'Abebe Kebede', respondent: 'Tekle Berhan', type: 'Boundary', status: 'open', priority: 'high', date: '2024-03-15', description: 'Boundary dispute between neighbors' },
        { id: 2, complainant: 'Biruk Alemu', respondent: 'City Administration', type: 'Ownership', status: 'in-progress', priority: 'medium', date: '2024-03-10', description: 'Ownership claim issue' },
        { id: 3, complainant: 'Tigist Haile', respondent: 'Construction Co.', type: 'Encroachment', status: 'open', priority: 'high', date: '2024-03-12', description: 'Illegal construction' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Update dispute status
  const updateStatus = async (id: number, status: string) => {
    try {
      const token = localStorage.getItem('token');
      
      // Try to update via officer endpoint
      let response = await fetch(`${API_URL}/officer/disputes/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });

      // If officer endpoint fails, try admin endpoint
      if (response.status === 404) {
        response = await fetch(`${API_URL}/admin/disputes/${id}/status`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ status })
        });
      }

      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem('token');
        window.location.href = '/login';
        return;
      }

      if (response.ok) {
        const successMsg = status === 'resolved' 
          ? t('Dispute resolved', 'አለመግባባቱ ተፈትቷል')
          : t('Dispute updated', 'አለመግባባቱ ተዘምኗል');
        toast.success(successMsg);
        fetchDisputes();
      } else {
        // If API update fails, update locally for demo
        setDisputes(prev => prev.map(dispute => 
          dispute.id === id ? { ...dispute, status: status as any } : dispute
        ));
        toast.success(status === 'resolved' ? 'Dispute resolved (Demo)' : 'Dispute updated (Demo)');
      }
    } catch (error) {
      console.error('Error updating dispute:', error);
      // Update locally as fallback
      setDisputes(prev => prev.map(dispute => 
        dispute.id === id ? { ...dispute, status: status as any } : dispute
      ));
      toast.success(status === 'resolved' ? 'Dispute resolved (Demo)' : 'Dispute updated (Demo)');
    }
  };

  useEffect(() => {
    fetchDisputes();
  }, []);

  const getStatusBadge = (status: string) => {
    if (status === 'resolved' || status === 'closed') {
      return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300">{t('Resolved', 'ተፈትቷል')}</span>;
    }
    if (status === 'in-progress') {
      return <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300">{t('In Progress', 'በሂደት ላይ')}</span>;
    }
    return <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300">{t('Open', 'ክፍት')}</span>;
  };

  const getPriorityBadge = (priority: string) => {
    if (priority === 'high') {
      return <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300">{t('High', 'ከፍተኛ')}</span>;
    }
    if (priority === 'medium') {
      return <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300">{t('Medium', 'መካከለኛ')}</span>;
    }
    return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300">{t('Low', 'ዝቅተኛ')}</span>;
  };

  const getTypeText = (type: string) => {
    const types: Record<string, { en: string; am: string }> = {
      'Boundary': { en: 'Boundary', am: 'ድንበር' },
      'Ownership': { en: 'Ownership', am: 'ባለቤትነት' },
      'Encroachment': { en: 'Encroachment', am: 'ወረራ' },
      'Access': { en: 'Access', am: 'መዳረሻ' },
    };
    return types[type]?.[language] || type;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(language === 'en' ? 'en-US' : 'am-ET');
  };

  const filteredDisputes = disputes.filter(dispute => {
    const matchesSearch = searchTerm === '' || 
      dispute.complainant.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dispute.respondent.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dispute.type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || dispute.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || dispute.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const stats = {
    total: disputes.length,
    open: disputes.filter(d => d.status === 'open').length,
    inProgress: disputes.filter(d => d.status === 'in-progress').length,
    resolved: disputes.filter(d => d.status === 'resolved' || d.status === 'closed').length,
    highPriority: disputes.filter(d => d.priority === 'high').length
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg">
          <p className="font-bold">{t('Error', 'ስህተት')}</p>
          <p>{error}</p>
          <button onClick={fetchDisputes} className="mt-2 bg-red-600 text-white px-3 py-1 rounded text-sm flex items-center gap-2">
            <ArrowPathIcon className="w-4 h-4" />
            {t('Try Again', 'እንደገና ሞክር')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className={`text-2xl font-bold ${cn('text-white', 'text-gray-900')}`}>
            {t('Disputes', 'አለመግባባቶች')}
          </h1>
          <p className={`text-sm mt-1 ${cn('text-gray-400', 'text-gray-500')}`}>
            {t('Total', 'ጠቅላላ')}: {disputes.length} {t('disputes', 'አለመግባባቶች')}
          </p>
        </div>
        <button
          onClick={fetchDisputes}
          className={`p-2 rounded-lg ${cn('hover:bg-gray-700', 'hover:bg-gray-100')}`}
          title={t('Refresh', 'አድስ')}
        >
          <ArrowPathIcon className={`w-5 h-5 ${cn('text-gray-400', 'text-gray-500')}`} />
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className={`${cn('bg-gray-800', 'bg-white')} rounded-xl shadow-sm p-4`}>
          <p className={`text-sm ${cn('text-gray-400', 'text-gray-500')}`}>{t('Total', 'ጠቅላላ')}</p>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.total}</p>
        </div>
        <div className={`${cn('bg-gray-800', 'bg-white')} rounded-xl shadow-sm p-4`}>
          <p className={`text-sm ${cn('text-gray-400', 'text-gray-500')}`}>{t('Open', 'ክፍት')}</p>
          <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats.open}</p>
        </div>
        <div className={`${cn('bg-gray-800', 'bg-white')} rounded-xl shadow-sm p-4`}>
          <p className={`text-sm ${cn('text-gray-400', 'text-gray-500')}`}>{t('In Progress', 'በሂደት ላይ')}</p>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.inProgress}</p>
        </div>
        <div className={`${cn('bg-gray-800', 'bg-white')} rounded-xl shadow-sm p-4`}>
          <p className={`text-sm ${cn('text-gray-400', 'text-gray-500')}`}>{t('Resolved', 'የተፈታ')}</p>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.resolved}</p>
        </div>
      </div>

      {/* Filters */}
      <div className={`${cn('bg-gray-800', 'bg-white')} rounded-xl shadow-sm p-4`}>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder={t('Search by complainant, respondent, or type...', 'በአቤቱታ ሰጪ፣ በተከሳሽ ወይም በአይነት ፈልግ...')}
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
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={`px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 md:w-40 ${
              darkMode 
                ? 'bg-gray-700 border-gray-600 text-white' 
                : 'bg-white border-gray-300 text-gray-900'
            }`}
          >
            <option value="all">{t('All Status', 'ሁሉም ሁኔታ')}</option>
            <option value="open">{t('Open', 'ክፍት')}</option>
            <option value="in-progress">{t('In Progress', 'በሂደት ላይ')}</option>
            <option value="resolved">{t('Resolved', 'የተፈታ')}</option>
          </select>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className={`px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 md:w-40 ${
              darkMode 
                ? 'bg-gray-700 border-gray-600 text-white' 
                : 'bg-white border-gray-300 text-gray-900'
            }`}
          >
            <option value="all">{t('All Priority', 'ሁሉም ቅድሚያ')}</option>
            <option value="high">{t('High', 'ከፍተኛ')}</option>
            <option value="medium">{t('Medium', 'መካከለኛ')}</option>
            <option value="low">{t('Low', 'ዝቅተኛ')}</option>
          </select>
        </div>
      </div>

      {/* Disputes Table */}
      <div className={`${cn('bg-gray-800', 'bg-white')} rounded-xl shadow-sm overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className={cn('bg-gray-700', 'bg-gray-50')}>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  {t('Complainant', 'አቤቱታ ሰጪ')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  {t('Respondent', 'ተከሳሽ')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  {t('Type', 'አይነት')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  {t('Priority', 'ቅድሚያ')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  {t('Date', 'ቀን')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  {t('Status', 'ሁኔታ')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  {t('Actions', 'ድርጊቶች')}
                </th>
              </tr>
            </thead>
            <tbody className={`${cn('bg-gray-800', 'bg-white')} divide-y ${cn('divide-gray-700', 'divide-gray-200')}`}>
              {filteredDisputes.map((dispute) => (
                <tr key={dispute.id} className={cn('hover:bg-gray-700', 'hover:bg-gray-50') + ' transition-colors'}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-semibold">
                          {dispute.complainant.charAt(0)}
                        </span>
                      </div>
                      <div className="ml-3">
                        <p className={`text-sm font-medium ${cn('text-white', 'text-gray-900')}`}>
                          {dispute.complainant}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <p className={`text-sm ${cn('text-gray-300', 'text-gray-600')}`}>
                      {dispute.respondent}
                    </p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <p className={`text-sm ${cn('text-gray-300', 'text-gray-600')}`}>
                      {getTypeText(dispute.type)}
                    </p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getPriorityBadge(dispute.priority)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <p className={`text-sm ${cn('text-gray-400', 'text-gray-500')}`}>
                      {formatDate(dispute.date)}
                    </p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(dispute.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => setSelectedDispute(dispute)}
                        className="p-1 rounded-lg transition-colors"
                        title={t('View Details', 'ዝርዝሮችን ተመልከት')}
                      >
                        <EyeIcon className="w-5 h-5 text-blue-400" />
                      </button>
                      {dispute.status !== 'resolved' && dispute.status !== 'closed' && (
                        <button 
                          onClick={() => updateStatus(dispute.id, 'resolved')}
                          className="p-1 rounded-lg transition-colors"
                          title={t('Mark Resolved', 'እንደተፈታ ምልክት አድርግ')}
                        >
                          <CheckCircleIcon className="w-5 h-5 text-green-400" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredDisputes.length === 0 && (
          <div className="p-8 text-center">
            <ScaleIcon className={`w-12 h-12 mx-auto mb-4 ${cn('text-gray-600', 'text-gray-400')}`} />
            <p className={`text-lg ${cn('text-gray-400', 'text-gray-600')}`}>
              {t('No disputes found', 'ምንም አለመግባባቶች አልተገኙም')}
            </p>
          </div>
        )}
      </div>

      {/* Details Modal */}
      {selectedDispute && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`${cn('bg-gray-800', 'bg-white')} rounded-xl max-w-md w-full p-6`}>
            <div className="flex justify-between items-center mb-4">
              <h2 className={`text-xl font-bold ${cn('text-white', 'text-gray-900')}`}>
                {t('Dispute Details', 'የአለመግባባት ዝርዝሮች')}
              </h2>
              <button 
                onClick={() => setSelectedDispute(null)}
                className={`${cn('text-gray-400 hover:text-gray-300', 'text-gray-500 hover:text-gray-700')}`}
              >
                ✕
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <p className={`text-sm ${cn('text-gray-400', 'text-gray-500')}`}>{t('Complainant', 'አቤቱታ ሰጪ')}</p>
                <p className={`font-medium ${cn('text-white', 'text-gray-900')}`}>{selectedDispute.complainant}</p>
              </div>
              <div>
                <p className={`text-sm ${cn('text-gray-400', 'text-gray-500')}`}>{t('Respondent', 'ተከሳሽ')}</p>
                <p className={`font-medium ${cn('text-white', 'text-gray-900')}`}>{selectedDispute.respondent}</p>
              </div>
              <div>
                <p className={`text-sm ${cn('text-gray-400', 'text-gray-500')}`}>{t('Type', 'አይነት')}</p>
                <p className={`font-medium ${cn('text-white', 'text-gray-900')}`}>{getTypeText(selectedDispute.type)}</p>
              </div>
              <div>
                <p className={`text-sm ${cn('text-gray-400', 'text-gray-500')}`}>{t('Priority', 'ቅድሚያ')}</p>
                <div>{getPriorityBadge(selectedDispute.priority)}</div>
              </div>
              <div>
                <p className={`text-sm ${cn('text-gray-400', 'text-gray-500')}`}>{t('Date', 'ቀን')}</p>
                <p className={`font-medium ${cn('text-white', 'text-gray-900')}`}>{formatDate(selectedDispute.date)}</p>
              </div>
              <div>
                <p className={`text-sm ${cn('text-gray-400', 'text-gray-500')}`}>{t('Status', 'ሁኔታ')}</p>
                <div>{getStatusBadge(selectedDispute.status)}</div>
              </div>
              {selectedDispute.description && (
                <div>
                  <p className={`text-sm ${cn('text-gray-400', 'text-gray-500')}`}>{t('Description', 'መግለጫ')}</p>
                  <p className={`text-sm ${cn('text-gray-300', 'text-gray-700')}`}>{selectedDispute.description}</p>
                </div>
              )}
              {selectedDispute.resolution && (
                <div>
                  <p className={`text-sm ${cn('text-gray-400', 'text-gray-500')}`}>{t('Resolution', 'ውሳኔ')}</p>
                  <p className={`text-sm ${cn('text-gray-300', 'text-gray-700')}`}>{selectedDispute.resolution}</p>
                </div>
              )}
            </div>
            <div className="flex justify-end gap-2 mt-6">
              {selectedDispute.status !== 'resolved' && selectedDispute.status !== 'closed' && (
                <button
                  onClick={() => {
                    updateStatus(selectedDispute.id, 'resolved');
                    setSelectedDispute(null);
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  {t('Mark Resolved', 'እንደተፈታ ምልክት አድርግ')}
                </button>
              )}
              <button
                onClick={() => setSelectedDispute(null)}
                className={`px-4 py-2 rounded-lg ${cn('bg-gray-700 hover:bg-gray-600', 'bg-gray-200 hover:bg-gray-300')}`}
              >
                {t('Close', 'ዝጋ')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}