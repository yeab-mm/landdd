'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '@/lib/LanguageContext';
import { useTranslation } from '@/lib/useTranslation';
import {
  UsersIcon,
  DocumentCheckIcon,
  BuildingStorefrontIcon,
  CreditCardIcon
} from '@heroicons/react/24/outline';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  href: string;
  trend?: number;
}

export default function AdminDashboard() {
  const { darkMode } = useLanguage();
  const { t } = useTranslation();

  const cn = (darkClass: string, lightClass: string): string => {
    return darkMode ? darkClass : lightClass;
  };

  const stats: StatCardProps[] = [
    {
      title: t('totalUsers'),
      value: '15,420',
      icon: UsersIcon,
      color: 'blue',
      href: '/admin/users',
      trend: 12
    },
    {
      title: t('pendingVerifications'),
      value: '43',
      icon: DocumentCheckIcon,
      color: 'yellow',
      href: '/admin/verifications',
      trend: -5
    },
    {
      title: t('activeListings'),
      value: '234',
      icon: BuildingStorefrontIcon,
      color: 'purple',
      href: '/admin/marketplace',
      trend: 15
    },
    {
      title: t('totalRevenue'),
      value: '₿ 3.45M',
      icon: CreditCardIcon,
      color: 'green',
      href: '/admin/payments',
      trend: 23
    }
  ];

  const recentActivities = [
    { 
      id: 1, 
      user: t('abebe'), 
      action: t('registeredAccount'), 
      time: '5 ' + t('minutesAgo'), 
      status: 'success' 
    },
    { 
      id: 2, 
      user: t('tigist'), 
      action: t('submittedVerification'), 
      time: '15 ' + t('minutesAgo'), 
      status: 'pending' 
    },
    { 
      id: 3, 
      user: t('biruk'), 
      action: t('listedProperty'), 
      time: '1 ' + t('hourAgo'), 
      status: 'success' 
    },
    { 
      id: 4, 
      user: t('meron'), 
      action: t('completedPayment'), 
      time: '2 ' + t('hoursAgo'), 
      status: 'success' 
    },
  ];

  const StatCard = ({ title, value, icon: Icon, color, href, trend }: StatCardProps) => {
    const getColorClasses = (color: string) => {
      const colors = {
        blue: {
          bg: cn('bg-blue-900/30', 'bg-blue-100'),
          text: cn('text-blue-400', 'text-blue-600'),
        },
        yellow: {
          bg: cn('bg-yellow-900/30', 'bg-yellow-100'),
          text: cn('text-yellow-400', 'text-yellow-600'),
        },
        purple: {
          bg: cn('bg-purple-900/30', 'bg-purple-100'),
          text: cn('text-purple-400', 'text-purple-600'),
        },
        green: {
          bg: cn('bg-green-900/30', 'bg-green-100'),
          text: cn('text-green-400', 'text-green-600'),
        }
      };
      return colors[color as keyof typeof colors] || colors.blue;
    };

    const colorClasses = getColorClasses(color);

    return (
      <Link href={href}>
        <div className={`${cn('bg-gray-800', 'bg-white')} rounded-xl shadow-sm p-6 hover:shadow-lg transition-all duration-200 cursor-pointer group`}>
          <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-lg ${colorClasses.bg} ${colorClasses.text} group-hover:scale-110 transition-transform`}>
              <Icon className="w-6 h-6" />
            </div>
            {trend !== undefined && (
              <span className={`text-sm font-medium ${trend > 0 ? 'text-green-500' : 'text-red-500'}`}>
                {trend > 0 ? '+' : ''}{trend}%
              </span>
            )}
          </div>
          <h3 className={`${cn('text-gray-400', 'text-gray-500')} text-sm mb-1`}>{title}</h3>
          <p className={`text-2xl font-bold ${colorClasses.text}`}>{value}</p>
        </div>
      </Link>
    );
  };

  return (
    <div className="space-y-6">
      <h1 className={`text-2xl font-bold ${cn('text-white', 'text-gray-900')}`}>
        {t('adminDashboard')}
      </h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className={`${cn('bg-gray-800', 'bg-white')} rounded-xl shadow-sm overflow-hidden`}>
            <div className={`p-6 border-b ${cn('border-gray-700', 'border-gray-200')}`}>
              <h2 className={`text-lg font-semibold ${cn('text-white', 'text-gray-900')}`}>
                {t('recentActivity')}
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className={cn('bg-gray-700', 'bg-gray-50')}>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">{t('user')}</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">{t('action')}</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">{t('time')}</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">{t('status')}</th>
                  </tr>
                </thead>
                <tbody className={`${cn('bg-gray-800', 'bg-white')} divide-y ${cn('divide-gray-700', 'divide-gray-200')}`}>
                  {recentActivities.map((activity) => (
                    <tr key={activity.id} className={cn('hover:bg-gray-700', 'hover:bg-gray-50') + ' transition-colors'}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                            <span className="text-white text-sm font-semibold">
                              {activity.user.charAt(0)}
                            </span>
                          </div>
                          <div className="ml-3">
                            <p className={`${cn('text-white', 'text-gray-900')} text-sm font-medium`}>
                              {activity.user}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                        {activity.action}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                        {activity.time}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          activity.status === 'success' 
                            ? cn('bg-green-900/30 text-green-400', 'bg-green-100 text-green-800')
                            : cn('bg-yellow-900/30 text-yellow-400', 'bg-yellow-100 text-yellow-800')
                        }`}>
                          {activity.status === 'success' ? t('success') : t('pending')}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="lg:col-span-1">
          <div className={`${cn('bg-gray-800', 'bg-white')} rounded-xl shadow-sm p-6`}>
            <h2 className={`text-lg font-semibold mb-4 ${cn('text-white', 'text-gray-900')}`}>
              {t('quickActions')}
            </h2>
            <div className="space-y-3">
              <Link href="/admin/users/new" className="block">
                <button className="w-full p-3 bg-blue-500/10 hover:bg-blue-500/20 rounded-lg text-left transition-colors">
                  <span className="text-blue-500 font-medium">➕ {t('addUser')}</span>
                </button>
              </Link>
              <Link href="/admin/verifications" className="block">
                <button className="w-full p-3 bg-yellow-500/10 hover:bg-yellow-500/20 rounded-lg text-left transition-colors">
                  <span className="text-yellow-500 font-medium">✓ {t('processVerifications')}</span>
                </button>
              </Link>
              <Link href="/admin/marketplace/new" className="block">
                <button className="w-full p-3 bg-purple-500/10 hover:bg-purple-500/20 rounded-lg text-left transition-colors">
                  <span className="text-purple-500 font-medium">🏷️ {t('addNewListing')}</span>
                </button>
              </Link>
              <Link href="/admin/reports" className="block">
                <button className="w-full p-3 bg-green-500/10 hover:bg-green-500/20 rounded-lg text-left transition-colors">
                  <span className="text-green-500 font-medium">📊 {t('reports')}</span>
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}