// app/officer/reports/page.tsx
'use client';

import { useState } from 'react';
import { useLanguage } from '@/lib/LanguageContext';

interface Report {
  id: number;
  name: string;
  type: string;
  period: string;
  generatedDate: string;
  size: number;
  format: string;
}

export default function ReportsPage() {
  const { darkMode, language } = useLanguage();
  const [generating, setGenerating] = useState(false);
  const [selectedType, setSelectedType] = useState('verifications');
  const [period, setPeriod] = useState('thisMonth');
  const [reports, setReports] = useState<Report[]>([
    { id: 1, name: 'Verifications Report - March 2024', type: 'verifications', period: 'March 2024', generatedDate: '2024-03-15', size: 245760, format: 'csv' },
    { id: 2, name: 'Transactions Report - Q1 2024', type: 'transactions', period: 'Q1 2024', generatedDate: '2024-03-14', size: 524288, format: 'csv' },
    { id: 3, name: 'Users Report - March 2024', type: 'users', period: 'March 2024', generatedDate: '2024-03-13', size: 184320, format: 'csv' }
  ]);

  const cn = (darkClass: string, lightClass: string) => darkMode ? darkClass : lightClass;

  const getText = (en: string, am: string) => language === 'en' ? en : am;

  // Generate report - creates CSV directly in browser
  const generateReport = () => {
    setGenerating(true);
    
    // Simulate generation delay
    setTimeout(() => {
      let csvContent = '';
      let filename = '';
      
      // Generate data based on report type
      switch(selectedType) {
        case 'verifications':
          filename = `verifications_report_${new Date().toISOString().split('T')[0]}.csv`;
          csvContent = 'ID,Applicant,Parcel ID,Status,Submitted Date,Documents\n';
          csvContent += '1,Abebe Kebede,BD-001,Pending,2024-03-15,3\n';
          csvContent += '2,Tigist Haile,BD-002,Approved,2024-03-14,5\n';
          csvContent += '3,Biruk Alemu,BD-003,Pending,2024-03-13,2\n';
          csvContent += '4,Meron Tadesse,BD-004,Rejected,2024-03-12,4\n';
          break;
          
        case 'transactions':
          filename = `transactions_report_${new Date().toISOString().split('T')[0]}.csv`;
          csvContent = 'ID,Transaction ID,Payer Name,Amount,Type,Status,Method,Date,Reference\n';
          csvContent += '1,TXN-001,Abebe Kebede,8500000,landPurchase,completed,telebirr,2024-03-15,REF-001\n';
          csvContent += '2,TXN-002,Tigist Haile,3200000,landPurchase,completed,cbeBirr,2024-03-14,REF-002\n';
          csvContent += '3,TXN-003,Biruk Alemu,2500,verification,pending,telebirr,2024-03-14,REF-003\n';
          break;
          
        case 'users':
          filename = `users_report_${new Date().toISOString().split('T')[0]}.csv`;
          csvContent = 'ID,Name,Email,Phone,Role,Status,Joined Date\n';
          csvContent += '1,Admin User,admin@land.gov.et,+251911111111,admin,active,2024-01-01\n';
          csvContent += '2,Officer User,officer@land.gov.et,+251922222222,officer,active,2024-01-02\n';
          csvContent += '3,Abebe Kebede,abebe@example.com,+251933333333,citizen,active,2024-01-15\n';
          break;
          
        case 'marketplace':
          filename = `marketplace_report_${new Date().toISOString().split('T')[0]}.csv`;
          csvContent = 'ID,Title,Price,Type,Status,Seller,Views,Posted Date\n';
          csvContent += '1,Coffee House,850000,commercial,active,Abebe Kebede,245,2024-03-01\n';
          csvContent += '2,Modern Apartment,1200000,residential,active,Tigist Haile,189,2024-03-02\n';
          csvContent += '3,Farm Land,2200000,agricultural,pending,Biruk Alemu,312,2024-03-03\n';
          break;
          
        case 'disputes':
          filename = `disputes_report_${new Date().toISOString().split('T')[0]}.csv`;
          csvContent = 'ID,Complainant,Respondent,Type,Status,Priority,Filed Date\n';
          csvContent += '1,Abebe Kebede,Tekle Berhan,boundary,open,high,2024-03-15\n';
          csvContent += '2,Tigist Haile,Biruk Alemu,ownership,resolved,high,2024-03-14\n';
          csvContent += '3,Meron Tadesse,Tigist Haile,contract,open,medium,2024-03-13\n';
          break;
          
        default:
          filename = `report_${new Date().toISOString().split('T')[0]}.csv`;
          csvContent = `Report Type: ${selectedType}\nPeriod: ${period}\nGenerated: ${new Date().toLocaleString()}\n`;
      }
      
      // Add generated report to list
      const periodMap: Record<string, string> = {
        today: 'Today',
        thisWeek: 'This Week',
        thisMonth: 'This Month',
        thisYear: 'This Year'
      };
      
      const newReport: Report = {
        id: reports.length + 1,
        name: `${selectedType.charAt(0).toUpperCase() + selectedType.slice(1)} Report - ${periodMap[period] || period}`,
        type: selectedType,
        period: periodMap[period] || period,
        generatedDate: new Date().toISOString().split('T')[0],
        size: csvContent.length,
        format: 'csv'
      };
      
      setReports([newReport, ...reports]);
      
      // Download the file
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      setGenerating(false);
    }, 500);
  };

  // Download existing report
  const downloadReport = (report: Report) => {
    let csvContent = '';
    
    switch(report.type) {
      case 'verifications':
        csvContent = 'ID,Applicant,Parcel ID,Status,Submitted Date,Documents\n';
        csvContent += '1,Abebe Kebede,BD-001,Pending,2024-03-15,3\n';
        csvContent += '2,Tigist Haile,BD-002,Approved,2024-03-14,5\n';
        break;
      case 'transactions':
        csvContent = 'ID,Transaction ID,Payer Name,Amount,Type,Status,Method,Date,Reference\n';
        csvContent += '1,TXN-001,Abebe Kebede,8500000,landPurchase,completed,telebirr,2024-03-15,REF-001\n';
        break;
      default:
        csvContent = `Report: ${report.name}\nGenerated: ${report.generatedDate}\nType: ${report.type}\nPeriod: ${report.period}`;
    }
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${report.type}_report_${report.generatedDate}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const reportTypes = [
    { id: 'verifications', name: getText('Verifications', 'ማረጋገጫዎች') },
    { id: 'transactions', name: getText('Transactions', 'ግብይቶች') },
    { id: 'users', name: getText('Users', 'ተጠቃሚዎች') },
    { id: 'marketplace', name: getText('Marketplace', 'ገበያ') },
    { id: 'disputes', name: getText('Disputes', 'አለመግባባቶች') }
  ];

  const periods = [
    { value: 'today', label: getText('Today', 'ዛሬ') },
    { value: 'thisWeek', label: getText('This Week', 'በዚህ ሳምንት') },
    { value: 'thisMonth', label: getText('This Month', 'በዚህ ወር') },
    { value: 'thisYear', label: getText('This Year', 'በዚህ አመት') }
  ];

  const formatDate = (date: string): string => {
    return new Date(date).toLocaleDateString(language === 'am' ? 'am-ET' : 'en-US');
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className={`text-2xl font-bold ${cn('text-white', 'text-gray-900')}`}>
            {getText('Reports & Analytics', 'ሪፖርቶች እና ትንታኔዎች')}
          </h1>
          <p className={`mt-1 ${cn('text-gray-400', 'text-gray-600')}`}>
            {getText('Generate and download reports', 'ሪፖርቶችን ያመንጩ እና ያውርዱ')}
          </p>
        </div>
      </div>

      {/* Report Generator */}
      <div className={`rounded-lg shadow-lg p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <h2 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          {getText('Generate New Report', 'አዲስ ሪፖርት ያመንጩ')}
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              {getText('Report Type', 'የሪፖርት አይነት')}
            </label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-green-500 ${
                darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              {reportTypes.map((type) => (
                <option key={type.id} value={type.id}>{type.name}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              {getText('Period', 'ጊዜ')}
            </label>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-green-500 ${
                darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              {periods.map((p) => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
          </div>
          
          <div className="flex items-end">
            <button
              onClick={generateReport}
              disabled={generating}
              className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center"
            >
              {generating ? (
                <>
                  <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  {getText('Generating...', 'በማመንጨት ላይ...')}
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  {getText('Generate & Download', 'አመንጭ እና አውርድ')}
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Report Types Quick Links */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {reportTypes.map((type) => (
          <button
            key={type.id}
            onClick={() => setSelectedType(type.id)}
            className={`p-4 rounded-lg text-center transition-colors ${
              selectedType === type.id
                ? 'ring-2 ring-green-500 bg-green-600/20'
                : darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50 border border-gray-200'
            }`}
          >
            <span className={`text-xs block ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              {type.name}
            </span>
          </button>
        ))}
      </div>

      {/* Reports List */}
      <div className={`rounded-lg shadow-lg overflow-hidden ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="px-6 py-4 border-b border-gray-700">
          <h2 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {getText('Recent Reports', 'የቅርብ ጊዜ ሪፖርቶች')}
          </h2>
        </div>
        
        {reports.length === 0 ? (
          <div className="text-center py-12">
            <svg className="w-12 h-12 mx-auto text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
              {getText('No reports generated yet', 'ገና ምንም ሪፖርቶች አልተመነጩም')}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-700">
            {reports.map((report) => (
              <div key={report.id} className="p-4 flex items-center justify-between hover:bg-gray-700/50 transition-colors">
                <div className="flex-1">
                  <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {report.name}
                  </p>
                  <div className="flex flex-wrap items-center gap-4 mt-1">
                    <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {report.type}
                    </span>
                    <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {report.period}
                    </span>
                    <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {formatDate(report.generatedDate)}
                    </span>
                    <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {formatFileSize(report.size)}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => downloadReport(report)}
                  className="p-2 text-green-500 hover:text-green-400 rounded-lg transition-colors"
                  title={getText('Download', 'አውርድ')}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}