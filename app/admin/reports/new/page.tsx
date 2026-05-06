'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/lib/LanguageContext';
import { useTranslation } from '@/lib/useTranslation';
import {
  ArrowLeftIcon,
  DocumentArrowDownIcon,
  UserIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import toast from 'react-hot-toast';

const API_URL = 'http://localhost:5000/api';

export default function NewReportPage() {
  const router = useRouter();
  const { darkMode, language } = useLanguage();
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    reportType: 'verifications',
    period: 'monthly',
    startDate: '',
    endDate: '',
    format: 'pdf',
  });

  const cn = (darkClass: string, lightClass: string): string => {
    return darkMode ? darkClass : lightClass;
  };

  const getText = (enText: string, amText: string) => {
    return language === 'en' ? enText : amText;
  };

  const reportTypes = [
    { id: 'users', nameEn: 'Users Report', nameAm: 'የተጠቃሚዎች ሪፖርት', icon: UserIcon },
    { id: 'verifications', nameEn: 'Verifications Report', nameAm: 'የማረጋገጫ ሪፖርት', icon: DocumentTextIcon },
    { id: 'payments', nameEn: 'Payments Report', nameAm: 'የክፍያ ሪፖርት', icon: CurrencyDollarIcon },
    { id: 'listings', nameEn: 'Listings Report', nameAm: 'የዝርዝሮች ሪፖርት', icon: MapPinIcon },
  ];

  const periods = [
    { id: 'daily', nameEn: 'Daily', nameAm: 'ዕለታዊ' },
    { id: 'weekly', nameEn: 'Weekly', nameAm: 'ሳምንታዊ' },
    { id: 'monthly', nameEn: 'Monthly', nameAm: 'ወርሃዊ' },
    { id: 'yearly', nameEn: 'Yearly', nameAm: 'ዓመታዊ' },
    { id: 'custom', nameEn: 'Custom Range', nameAm: 'ብጁ ክልል' },
  ];

  const formats = [
    { id: 'pdf', nameEn: 'PDF Document', nameAm: 'ፒዲኤፍ ሰነድ' },
    { id: 'excel', nameEn: 'Excel Spreadsheet', nameAm: 'ኤክሴል ሉህ' },
    { id: 'csv', nameEn: 'CSV File', nameAm: 'ሲኤስቪ ፋይል' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Build period string
    let periodString = '';
    if (formData.period === 'custom') {
      if (!formData.startDate || !formData.endDate) {
        toast.error(getText('Please select start and end dates', 'እባክዎ የመጀመሪያ እና የመጨረሻ ቀን ይምረጡ'));
        setIsLoading(false);
        return;
      }
      periodString = `${formData.startDate} to ${formData.endDate}`;
    } else {
      const periodNames: any = {
        daily: 'Today',
        weekly: 'This Week',
        monthly: 'This Month',
        yearly: 'This Year'
      };
      periodString = periodNames[formData.period];
    }

    const reportData = {
      type: formData.reportType,
      period: periodString,
      format: formData.format
    };

    console.log('Sending report data:', reportData);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error(getText('Please login first', 'እባክዎ መጀመሪያ ይግቡ'));
        router.push('/login');
        return;
      }

      const response = await fetch(`${API_URL}/admin/reports/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(reportData)
      });

      console.log('Response status:', response.status);

      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem('token');
        toast.error(getText('Session expired', 'ጊዜው አልፏል'));
        router.push('/login');
        return;
      }

      const data = await response.json();
      console.log('Response data:', data);

      if (response.ok) {
        toast.success(getText('Report generated successfully!', 'ሪፖርት በተሳካ ሁኔታ ተዘጋጅቷል!'));
        setTimeout(() => {
          router.push('/admin/reports');
        }, 1500);
      } else {
        toast.error(data.message || getText('Failed to generate report', 'ሪፖርት ማዘጋጀት አልተሳካም'));
      }
    } catch (error) {
      console.error('Error generating report:', error);
      toast.error(getText('Cannot connect to server', 'ከአገልጋይ ጋር መገናኘት አልተቻለም'));
    } finally {
      setIsLoading(false);
    }
  };

  const selectedReportType = reportTypes.find(r => r.id === formData.reportType);
  const selectedPeriod = periods.find(p => p.id === formData.period);
  const selectedFormat = formats.find(f => f.id === formData.format);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link
          href="/admin/reports"
          className={`p-2 rounded-lg transition-colors ${cn('hover:bg-gray-700', 'hover:bg-gray-100')}`}
        >
          <ArrowLeftIcon className={`w-5 h-5 ${cn('text-gray-400', 'text-gray-500')}`} />
        </Link>
        <div>
          <h1 className={`text-2xl font-bold ${cn('text-white', 'text-gray-900')}`}>
            {getText('Generate New Report', 'አዲስ ሪፖርት ፍጠር')}
          </h1>
          <p className={`text-sm mt-1 ${cn('text-gray-400', 'text-gray-500')}`}>
            {getText('Fill in the details to generate a custom report', 'ሪፖርት ለማዘጋጀት መረጃዎችን ይሙሉ')}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Report Type */}
        <div className={`${cn('bg-gray-800', 'bg-white')} rounded-xl shadow-sm p-6`}>
          <h2 className={`text-lg font-semibold mb-4 ${cn('text-white', 'text-gray-900')}`}>
            {getText('Report Type', 'የሪፖርት አይነት')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {reportTypes.map((type) => {
              const Icon = type.icon;
              const isSelected = formData.reportType === type.id;
              return (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => setFormData({ ...formData, reportType: type.id })}
                  className={`
                    flex items-center p-4 rounded-xl border-2 transition-all
                    ${isSelected 
                      ? 'border-green-500 bg-green-50 dark:bg-green-900/20' 
                      : cn('border-gray-600 hover:border-gray-500', 'border-gray-200 hover:border-gray-300')
                    }
                  `}
                >
                  <div className={`p-2 rounded-lg mr-3 ${isSelected ? 'bg-green-500' : cn('bg-gray-700', 'bg-gray-100')}`}>
                    <Icon className={`w-5 h-5 ${isSelected ? 'text-white' : cn('text-gray-400', 'text-gray-500')}`} />
                  </div>
                  <div className="text-left">
                    <p className={`font-medium ${isSelected ? 'text-green-600 dark:text-green-400' : cn('text-white', 'text-gray-900')}`}>
                      {language === 'en' ? type.nameEn : type.nameAm}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Period */}
        <div className={`${cn('bg-gray-800', 'bg-white')} rounded-xl shadow-sm p-6`}>
          <h2 className={`text-lg font-semibold mb-4 ${cn('text-white', 'text-gray-900')}`}>
            {getText('Time Period', 'የጊዜ ክልል')}
          </h2>
          <div className="flex flex-wrap gap-3 mb-4">
            {periods.map((period) => (
              <button
                key={period.id}
                type="button"
                onClick={() => setFormData({ ...formData, period: period.id })}
                className={`
                  px-4 py-2 rounded-lg text-sm font-medium transition-all
                  ${formData.period === period.id
                    ? 'bg-green-600 text-white'
                    : cn('bg-gray-700 text-gray-300 hover:bg-gray-600', 'bg-gray-100 text-gray-700 hover:bg-gray-200')
                  }
                `}
              >
                {language === 'en' ? period.nameEn : period.nameAm}
              </button>
            ))}
          </div>

          {/* Custom Date Range */}
          {formData.period === 'custom' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div>
                <label className={`block text-sm font-medium mb-2 ${cn('text-gray-300', 'text-gray-700')}`}>
                  {getText('Start Date', 'ከ')}
                </label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className={`w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-green-500 focus:border-transparent
                    ${darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                    }
                  `}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${cn('text-gray-300', 'text-gray-700')}`}>
                  {getText('End Date', 'እስከ')}
                </label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className={`w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-green-500 focus:border-transparent
                    ${darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                    }
                  `}
                />
              </div>
            </div>
          )}
        </div>

        {/* Format */}
        <div className={`${cn('bg-gray-800', 'bg-white')} rounded-xl shadow-sm p-6`}>
          <h2 className={`text-lg font-semibold mb-4 ${cn('text-white', 'text-gray-900')}`}>
            {getText('Export Format', 'የውጤት ቅርጸት')}
          </h2>
          <div className="flex flex-wrap gap-4">
            {formats.map((format) => (
              <button
                key={format.id}
                type="button"
                onClick={() => setFormData({ ...formData, format: format.id })}
                className={`
                  px-6 py-3 rounded-xl border-2 transition-all
                  ${formData.format === format.id
                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                    : cn('border-gray-600 hover:border-gray-500', 'border-gray-200 hover:border-gray-300')
                  }
                `}
              >
                <p className={`font-medium ${formData.format === format.id ? 'text-green-600 dark:text-green-400' : cn('text-white', 'text-gray-900')}`}>
                  {language === 'en' ? format.nameEn : format.nameAm}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Preview */}
        <div className={`${cn('bg-gray-800', 'bg-white')} rounded-xl shadow-sm p-6`}>
          <h2 className={`text-lg font-semibold mb-4 ${cn('text-white', 'text-gray-900')}`}>
            {getText('Report Preview', 'የሪፖርት ቅድመ እይታ')}
          </h2>
          <div className={`p-4 rounded-lg ${cn('bg-gray-700', 'bg-gray-50')}`}>
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className={`text-sm font-medium ${cn('text-gray-400', 'text-gray-500')}`}>
                  {getText('Report Type', 'የሪፖርት አይነት')}:
                </p>
                <p className={`text-lg font-semibold ${cn('text-white', 'text-gray-900')}`}>
                  {selectedReportType ? (language === 'en' ? selectedReportType.nameEn : selectedReportType.nameAm) : ''}
                </p>
              </div>
              <div className="text-right">
                <p className={`text-sm font-medium ${cn('text-gray-400', 'text-gray-500')}`}>
                  {getText('Format', 'ቅርጸት')}:
                </p>
                <p className={`text-lg font-semibold ${cn('text-white', 'text-gray-900')}`}>
                  {selectedFormat ? (language === 'en' ? selectedFormat.nameEn : selectedFormat.nameAm) : ''}
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${cn('text-gray-400', 'text-gray-500')}`}>
                  {getText('Period', 'ወቅት')}:
                </p>
                <p className={`text-sm ${cn('text-gray-400', 'text-gray-600')}`}>
                  {formData.period === 'custom' 
                    ? `${formData.startDate || '...'} - ${formData.endDate || '...'}`
                    : (selectedPeriod ? (language === 'en' ? selectedPeriod.nameEn : selectedPeriod.nameAm) : '')
                  }
                </p>
              </div>
              <CheckCircleIcon className="w-8 h-8 text-green-500" />
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end space-x-4">
          <Link
            href="/admin/reports"
            className={`px-6 py-2 rounded-lg font-medium transition-colors
              ${cn('bg-gray-700 text-gray-300 hover:bg-gray-600', 'bg-gray-100 text-gray-700 hover:bg-gray-200')}
            `}
          >
            {getText('Cancel', 'ሰርዝ')}
          </Link>
          <button
            type="submit"
            disabled={isLoading}
            className="flex items-center px-6 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 transition-colors"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                {getText('Generating...', 'በማዘጋጀት ላይ...')}
              </>
            ) : (
              <>
                <DocumentArrowDownIcon className="w-4 h-4 mr-2" />
                {getText('Generate Report', 'ሪፖርት ፍጠር')}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}