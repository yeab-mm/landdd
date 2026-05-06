'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/lib/LanguageContext';
import { useTranslation } from '@/lib/useTranslation';
import {
  DocumentArrowDownIcon,
  ChartBarIcon,
  ArrowDownTrayIcon,
  EyeIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const API_URL = 'http://localhost:5000/api';

interface Report {
  id: number;
  name: string;
  nameAm: string;
  type: string;
  date: string;
  size: string;
}

export default function AdminReportsPage() {
  const { darkMode, language } = useLanguage();
  const { t } = useTranslation();
  const [selectedReport, setSelectedReport] = useState('verifications');
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  const cn = (darkClass: string, lightClass: string) => darkMode ? darkClass : lightClass;

  const getText = (enText: string, amText: string) => {
    return language === 'en' ? enText : amText;
  };

  // Report types
  const reportTypes = [
    { id: 'users', nameEn: 'Users', nameAm: 'ተጠቃሚዎች', icon: ChartBarIcon },
    { id: 'verifications', nameEn: 'Verifications', nameAm: 'ማረጋገጫዎች', icon: ChartBarIcon },
    { id: 'payments', nameEn: 'Payments', nameAm: 'ክፍያዎች', icon: ChartBarIcon },
    { id: 'listings', nameEn: 'Listings', nameAm: 'ዝርዝሮች', icon: ChartBarIcon },
  ];

  // Fetch reports from backend
  const fetchReports = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        window.location.href = '/login';
        return;
      }

      const response = await fetch(`${API_URL}/admin/reports`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem('token');
        window.location.href = '/login';
        return;
      }

      if (response.ok) {
        const data = await response.json();
        const formattedReports = (data.reports || []).map((report: any) => ({
          id: report.id,
          name: report.name,
          nameAm: report.name,
          type: report.type,
          date: report.generatedDate,
          size: ((report.size || 0) / (1024 * 1024)).toFixed(1)
        }));
        setReports(formattedReports);
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
      toast.error(getText('Failed to load reports', 'ሪፖርቶችን ማምጣት አልተሳካም'));
    } finally {
      setLoading(false);
    }
  };

  // Generate new report
  const generateReport = async () => {
    try {
      const token = localStorage.getItem('token');
      const period = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });
      
      const response = await fetch(`${API_URL}/admin/reports/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          type: selectedReport,
          period: period,
          format: 'pdf'
        })
      });

      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem('token');
        window.location.href = '/login';
        return;
      }

      if (response.ok) {
        toast.success(getText('Report generated successfully!', 'ሪፖርቱ በተሳካ ሁኔታ ተዘጋጅቷል!'));
        fetchReports();
      } else {
        toast.error(getText('Failed to generate report', 'ሪፖርት ማዘጋጀት አልተሳካም'));
      }
    } catch (error) {
      console.error('Error generating report:', error);
      toast.error(getText('Error generating report', 'ሪፖርት በማዘጋጀት ላይ ስህተት'));
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const filteredReports = reports.filter(report => report.type === selectedReport);
  const totalCount = filteredReports.length;
  const totalSize = filteredReports.reduce((acc, report) => acc + parseFloat(report.size || '0'), 0).toFixed(1);

  const getReportName = (report: Report) => {
    return language === 'en' ? report.name : (report.nameAm || report.name);
  };

  const getReportTypeName = (typeId: string) => {
    const type = reportTypes.find(t => t.id === typeId);
    if (!type) return '';
    return language === 'en' ? type.nameEn : type.nameAm;
  };

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
      <div className="flex justify-between items-center">
        <h1 className={`text-2xl font-bold ${cn('text-white', 'text-gray-900')}`}>
          {getText('Reports', 'ሪፖርቶች')}
        </h1>
        <div className="flex gap-2">
          <button
            onClick={fetchReports}
            className={`p-2 rounded-lg transition-colors ${cn('hover:bg-gray-700', 'hover:bg-gray-100')}`}
            title={getText('Refresh', 'አድስ')}
          >
            <ArrowPathIcon className={`w-5 h-5 ${cn('text-gray-400', 'text-gray-500')}`} />
          </button>
          <button
            onClick={generateReport}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <DocumentArrowDownIcon className="w-5 h-5 mr-2" />
            {getText('New Report', 'አዲስ ሪፖርት')}
          </button>
        </div>
      </div>

      {/* Report Type Selection */}
      <div className={`${cn('bg-gray-800', 'bg-white')} rounded-xl shadow-sm p-4`}>
        <h2 className={`text-sm font-medium mb-3 ${cn('text-gray-400', 'text-gray-500')}`}>
          {getText('Select Report Type', 'የሪፖርት አይነት ይምረጡ')}
        </h2>
        <div className="flex flex-wrap gap-2">
          {reportTypes.map((type) => {
            const Icon = type.icon;
            const isSelected = selectedReport === type.id;
            const typeName = language === 'en' ? type.nameEn : type.nameAm;
            return (
              <button
                key={type.id}
                onClick={() => setSelectedReport(type.id)}
                className={`
                  flex items-center px-4 py-2 rounded-lg text-sm transition-colors
                  ${isSelected 
                    ? 'bg-green-600 text-white' 
                    : cn('bg-gray-700 text-gray-300 hover:bg-gray-600', 'bg-gray-100 text-gray-700 hover:bg-gray-200')
                  }
                `}
              >
                <Icon className="w-4 h-4 mr-2" />
                {typeName}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Filter Info */}
      <div className={`${cn('bg-gray-800', 'bg-white')} rounded-xl shadow-sm p-4`}>
        <p className={`text-sm ${cn('text-gray-400', 'text-gray-500')}`}>
          {getText('Showing', 'የሚታየው')}: <span className="font-semibold text-green-600">
            {getReportTypeName(selectedReport)}
          </span>
        </p>
      </div>

      {/* Reports List */}
      <div className={`${cn('bg-gray-800', 'bg-white')} rounded-xl shadow-sm overflow-hidden`}>
        <div className={`px-6 py-4 border-b ${cn('border-gray-700', 'border-gray-200')}`}>
          <h2 className={`font-semibold ${cn('text-white', 'text-gray-900')}`}>
            {getText('Generated Reports', 'የተፈጠሩ ሪፖርቶች')} ({totalCount})
          </h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className={cn('bg-gray-700', 'bg-gray-50')}>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                  {getText('Report Name', 'የሪፖርቱ ስም')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                  {getText('Date', 'ቀን')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                  {getText('Size', 'መጠን')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                  {getText('Actions', 'ድርጊቶች')}
                </th>
              </tr>
            </thead>
            <tbody className={`${cn('bg-gray-800', 'bg-white')} divide-y ${cn('divide-gray-700', 'divide-gray-200')}`}>
              {filteredReports.length > 0 ? (
                filteredReports.map((report) => (
                  <tr key={report.id} className={cn('hover:bg-gray-700', 'hover:bg-gray-50')}>
                    <td className="px-6 py-4">
                      <p className={`text-sm font-medium ${cn('text-white', 'text-gray-900')}`}>
                        {getReportName(report)}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-400">
                      {report.date}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-400">
                      {report.size} {getText('MB', 'ሜባ')}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button className="p-1 hover:bg-gray-700 rounded" title={getText('View', 'ተመልከት')}>
                          <EyeIcon className="w-4 h-4 text-blue-400" />
                        </button>
                        <button className="p-1 hover:bg-gray-700 rounded" title={getText('Download', 'አውርድ')}>
                          <ArrowDownTrayIcon className="w-4 h-4 text-green-400" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center">
                    <p className={`text-sm ${cn('text-gray-400', 'text-gray-500')}`}>
                      {getText('No reports found', 'ምንም ሪፖርት አልተገኘም')}
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className={`${cn('bg-gray-800', 'bg-white')} rounded-xl shadow-sm p-4`}>
          <p className={`text-sm ${cn('text-gray-400', 'text-gray-500')}`}>
            {getText('Total Reports', 'ጠቅላላ ሪፖርቶች')} ({getReportTypeName(selectedReport)})
          </p>
          <p className="text-2xl font-bold text-blue-600">{totalCount}</p>
        </div>
        <div className={`${cn('bg-gray-800', 'bg-white')} rounded-xl shadow-sm p-4`}>
          <p className={`text-sm ${cn('text-gray-400', 'text-gray-500')}`}>
            {getText('Total Size', 'ጠቅላላ መጠን')}
          </p>
          <p className="text-2xl font-bold text-purple-600">{totalSize} {getText('MB', 'ሜባ')}</p>
        </div>
      </div>
    </div>
  );
}