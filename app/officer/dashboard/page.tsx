'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/lib/LanguageContext';
import { useTranslation } from '@/lib/useTranslation';
import {
  DocumentCheckIcon,
  BuildingStorefrontIcon,
  CreditCardIcon,
  ClockIcon,
  CheckCircleIcon,
  UserGroupIcon,
  MapPinIcon,
  EyeIcon
} from '@heroicons/react/24/outline';

interface Verification {
  id: number;
  applicant: string;
  type: string;
  location: string;
  time: string;
  priority: 'high' | 'medium' | 'low';
}

export default function OfficerDashboard() {
  const { darkMode } = useLanguage();
  const { t } = useTranslation();
  const [selectedPeriod, setSelectedPeriod] = useState('today');

  const cn = (darkClass: string, lightClass: string): string => {
    return darkMode ? darkClass : lightClass;
  };

  // Stats based on PDF
  const stats = [
    { 
      title: t('pendingVerifications'), 
      value: '23', 
      icon: DocumentCheckIcon, 
      color: 'yellow',
      trend: '+12%',
      href: '/officer/verifications'
    },
    { 
      title: t('approvedToday'), 
      value: '12', 
      icon: CheckCircleIcon, 
      color: 'green',
      trend: '+5%',
      href: '/officer/verifications'
    },
    { 
      title: t('activeListings'), 
      value: '156', 
      icon: BuildingStorefrontIcon, 
      color: 'purple',
      trend: '+8%',
      href: '/officer/marketplace'
    },
    { 
      title: t('totalCitizens'), 
      value: '3,421', 
      icon: UserGroupIcon, 
      color: 'blue',
      trend: '+23%',
      href: '/officer/users'
    }
  ];

  // Pending verifications that need attention
  const pendingVerifications: Verification[] = [
    { 
      id: 1, 
      applicant: t('abebe'), 
      type: t('landTransfer'), 
      location: t('zone1'), 
      time: `2 ${t('hoursAgo')}`, 
      priority: 'high' 
    },
    { 
      id: 2, 
      applicant: t('tigist'), 
      type: t('newRegistration'), 
      location: t('zone3'), 
      time: `3 ${t('hoursAgo')}`, 
      priority: 'medium' 
    },
    { 
      id: 3, 
      applicant: t('biruk'), 
      type: t('boundaryUpdate'), 
      location: t('zone2'), 
      time: `5 ${t('hoursAgo')}`, 
      priority: 'low' 
    },
    { 
      id: 4, 
      applicant: t('meron'), 
      type: t('ownershipVerification'), 
      location: t('zone4'), 
      time: `1 ${t('dayAgo')}`, 
      priority: 'high' 
    }
  ];

  const getPriorityBadge = (priority: string) => {
    switch(priority) {
      case 'high':
        return <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">{t('high')}</span>;
      case 'medium':
        return <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">{t('medium')}</span>;
      case 'low':
        return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">{t('low')}</span>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className={`text-2xl font-bold ${cn('text-white', 'text-gray-900')}`}>
            {t('welcomeBack')}
          </h1>
          <p className={`text-sm ${cn('text-gray-400', 'text-gray-500')} mt-1`}>
            {t('whatsHappening')}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setSelectedPeriod('today')}
            className={`px-3 py-1 text-sm rounded-lg transition-colors ${
              selectedPeriod === 'today'
                ? 'bg-green-600 text-white'
                : cn('bg-gray-700 text-gray-300', 'bg-gray-100 text-gray-700')
            }`}
          >
            {t('today')}
          </button>
          <button
            onClick={() => setSelectedPeriod('week')}
            className={`px-3 py-1 text-sm rounded-lg transition-colors ${
              selectedPeriod === 'week'
                ? 'bg-green-600 text-white'
                : cn('bg-gray-700 text-gray-300', 'bg-gray-100 text-gray-700')
            }`}
          >
            {t('thisWeek')}
          </button>
          <button
            onClick={() => setSelectedPeriod('month')}
            className={`px-3 py-1 text-sm rounded-lg transition-colors ${
              selectedPeriod === 'month'
                ? 'bg-green-600 text-white'
                : cn('bg-gray-700 text-gray-300', 'bg-gray-100 text-gray-700')
            }`}
          >
            {t('thisMonth')}
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          const colorClasses = {
            yellow: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400',
            green: 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400',
            purple: 'text-purple-600 bg-purple-100 dark:bg-purple-900/30 dark:text-purple-400',
            blue: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400',
          };
          
          return (
            <Link key={index} href={stat.href}>
              <div className={`${cn('bg-gray-800', 'bg-white')} rounded-xl shadow-sm p-6 hover:shadow-lg transition-all cursor-pointer group`}>
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-lg ${colorClasses[stat.color as keyof typeof colorClasses]}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-sm text-green-500">{stat.trend}</span>
                </div>
                <h3 className={`text-sm ${cn('text-gray-400', 'text-gray-500')}`}>{stat.title}</h3>
                <p className={`text-2xl font-bold ${colorClasses[stat.color as keyof typeof colorClasses].split(' ')[0]}`}>
                  {stat.value}
                </p>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Two Column Layout - Pending Tasks & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pending Verifications - Left Column (2/3 width) */}
        <div className="lg:col-span-2">
          <div className={`${cn('bg-gray-800', 'bg-white')} rounded-xl shadow-sm overflow-hidden`}>
            <div className={`px-6 py-4 border-b ${cn('border-gray-700', 'border-gray-200')} flex justify-between items-center`}>
              <h2 className={`text-lg font-semibold ${cn('text-white', 'text-gray-900')}`}>
                {t('requiresImmediateAttention')}
              </h2>
              <Link href="/officer/verifications" className="text-sm text-green-600 hover:text-green-700">
                {t('viewAll')} →
              </Link>
            </div>
            <div className={`divide-y ${cn('divide-gray-700', 'divide-gray-200')}`}>
              {pendingVerifications.map((item) => (
                <div key={item.id} className={`p-4 ${cn('hover:bg-gray-700', 'hover:bg-gray-50')} transition-colors`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold">
                          {item.applicant.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <h3 className={`font-medium ${cn('text-white', 'text-gray-900')}`}>
                          {item.applicant}
                        </h3>
                        <div className="flex items-center space-x-2 text-sm">
                          <span className={`${cn('text-gray-400', 'text-gray-500')}`}>{item.type}</span>
                          <span className="text-gray-500">•</span>
                          <span className={`${cn('text-gray-400', 'text-gray-500')} flex items-center`}>
                            <MapPinIcon className="w-3 h-3 mr-1" />
                            {item.location}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className={`text-sm ${cn('text-gray-400', 'text-gray-500')}`}>
                        {item.time}
                      </span>
                      {getPriorityBadge(item.priority)}
                      <button className="p-1 hover:bg-gray-600 rounded">
                        <EyeIcon className="w-4 h-4 text-blue-400" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions & Performance - Right Column (1/3 width) */}
        <div className="lg:col-span-1 space-y-6">
          {/* Quick Actions */}
          <div className={`${cn('bg-gray-800', 'bg-white')} rounded-xl shadow-sm p-6`}>
            <h2 className={`text-lg font-semibold mb-4 ${cn('text-white', 'text-gray-900')}`}>
              {t('quickActions')}
            </h2>
            
          </div>

          {/* Performance Stats */}
          <div className={`${cn('bg-gray-800', 'bg-white')} rounded-xl shadow-sm p-6`}>
            <h2 className={`text-lg font-semibold mb-4 ${cn('text-white', 'text-gray-900')}`}>
              {t('performance')}
            </h2>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className={cn('text-gray-400', 'text-gray-600')}>{t('approvalRate')}</span>
                  <span className={cn('text-white', 'text-gray-900')}>94%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: '94%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className={cn('text-gray-400', 'text-gray-600')}>{t('responseTime')}</span>
                  <span className={cn('text-white', 'text-gray-900')}>2.4 min</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: '85%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className={cn('text-gray-400', 'text-gray-600')}>{t('completionRate')}</span>
                  <span className={cn('text-white', 'text-gray-900')}>78%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div className="bg-purple-500 h-2 rounded-full" style={{ width: '78%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Today's Activity Summary */}
      <div className={`${cn('bg-gray-800', 'bg-white')} rounded-xl shadow-sm p-6`}>
        <h2 className={`text-lg font-semibold mb-4 ${cn('text-white', 'text-gray-900')}`}>
          {t('todaysActivity')}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-3xl font-bold text-green-600">8</p>
            <p className={`text-sm ${cn('text-gray-400', 'text-gray-500')}`}>{t('verificationsProcessed')}</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-blue-600">12</p>
            <p className={`text-sm ${cn('text-gray-400', 'text-gray-500')}`}>{t('applicationsReviewed')}</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-purple-600">5</p>
            <p className={`text-sm ${cn('text-gray-400', 'text-gray-500')}`}>{t('listingsModerated')}</p>
          </div>
        </div>
      </div>
    </div>
  );
}