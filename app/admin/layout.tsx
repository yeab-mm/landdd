'use client'

import { ReactNode, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTranslation } from '@/lib/useTranslation'
import { useLanguage } from '@/lib/LanguageContext'
import {
  HomeIcon,
  UsersIcon,
  DocumentCheckIcon,
  ShoppingBagIcon,
  CreditCardIcon,
  ChartBarIcon,
  ShieldCheckIcon,
  Cog6ToothIcon,
  DocumentArrowDownIcon,
  SunIcon,
  MoonIcon,
  BellIcon
} from '@heroicons/react/24/outline'

interface NavigationItem {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
}

interface Notification {
  id: number;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: string;
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  const router = useRouter()
  const { t } = useTranslation()
  const languageContext = useLanguage()
  const darkMode = languageContext.darkMode
  const toggleDarkMode = languageContext.toggleDarkMode
  const language = languageContext.language
  const setLanguage = languageContext.setLanguage
  const pathname = usePathname()
  
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [showNotifications, setShowNotifications] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    const role = localStorage.getItem('userRole')
    if (role !== 'admin') {
      window.location.href = '/login'
    }
    fetchNotifications()
  }, [])

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      const response = await fetch('http://localhost:5000/api/admin/notifications', {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (response.ok) {
        const data = await response.json()
        setNotifications(data.notifications || [])
        setUnreadCount(data.unreadCount || 0)
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
    }
  }

  const markAsRead = async (id: number) => {
    try {
      const token = localStorage.getItem('token')
      await fetch(`http://localhost:5000/api/admin/notifications/${id}/read`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, read: true } : n)
      )
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem('token')
      await fetch('http://localhost:5000/api/admin/notifications/read-all', {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      setNotifications(prev => prev.map(n => ({ ...n, read: true })))
      setUnreadCount(0)
    } catch (error) {
      console.error('Error marking all as read:', error)
    }
  }

  const navigation: NavigationItem[] = [
    { name: 'dashboard', href: '/admin/dashboard', icon: HomeIcon },
    { name: 'users', href: '/admin/users', icon: UsersIcon },
    { name: 'verifications', href: '/admin/verifications', icon: DocumentCheckIcon },
    { name: 'marketplace', href: '/admin/marketplace', icon: ShoppingBagIcon },
    { name: 'payments', href: '/admin/payments', icon: CreditCardIcon },
    { name: 'reports', href: '/admin/reports', icon: DocumentArrowDownIcon },
    { name: 'security', href: '/admin/security', icon: ShieldCheckIcon },
    { name: 'settings', href: '/admin/settings', icon: Cog6ToothIcon }
  ]

  const isActive = (href: string): boolean => pathname === href

  const cn = (darkClass: string, lightClass: string) => darkMode ? darkClass : lightClass

  // Close notifications when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (!target.closest('.notifications-panel') && !target.closest('.notifications-button')) {
        setShowNotifications(false)
      }
    }
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [])

  return (
    <div className={`${cn('bg-gray-900', 'bg-gray-50')} min-h-screen`}>
      {/* Sidebar */}
      <div className={`${cn('bg-gray-800 border-gray-700', 'bg-white border-gray-200')} fixed inset-y-0 left-0 w-64 border-r transition-colors duration-200`}>
        <div className={`${cn('border-gray-700', 'border-gray-200')} flex items-center h-16 px-6 border-b`}>
          <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold">AD</span>
          </div>
          <span className={`${cn('text-white', 'text-gray-900')} ml-3 font-semibold`}>{t('adminPortal') || 'Admin Portal'}</span>
        </div>
        
        <nav className="mt-6 px-3">
          {navigation.map((item) => {
            const Icon = item.icon
            const active = isActive(item.href)
            
            const linkClass = active 
              ? `${cn('bg-green-900/30 text-green-400', 'bg-green-50 text-green-700')} flex items-center px-4 py-3 mb-1 text-sm rounded-lg`
              : `${cn('text-gray-300 hover:bg-gray-700', 'text-gray-700 hover:bg-gray-50')} flex items-center px-4 py-3 mb-1 text-sm rounded-lg transition-colors`
            
            const iconClass = active
              ? `${cn('text-green-400', 'text-green-600')} w-5 h-5 mr-3`
              : `${cn('text-gray-500', 'text-gray-400')} w-5 h-5 mr-3`

            return (
              <Link key={item.href} href={item.href} className={linkClass}>
                <Icon className={iconClass} />
                {t(item.name) || item.name}
              </Link>
            )
          })}
        </nav>

        {/* Logout Button */}
        <div className={`${cn('border-gray-700', 'border-gray-200')} absolute bottom-0 left-0 right-0 p-4 border-t`}>
          <button
            onClick={() => {
              localStorage.clear()
              window.location.href = '/login'
            }}
            className={`${cn('text-red-400 hover:bg-red-900/30', 'text-red-600 hover:bg-red-50')} flex items-center w-full px-4 py-3 text-sm rounded-lg transition-colors`}
          >
            <svg className="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            {t('logout') || 'Logout'}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="ml-64 flex-1">
        {/* Header */}
        <header className={`${cn('bg-gray-800 border-gray-700', 'bg-white border-gray-200')} border-b h-16 flex items-center justify-between px-8 transition-colors duration-200`}>
          <h1 className={`${cn('text-white', 'text-gray-900')} text-xl font-semibold`}>
            {t(navigation.find((item) => item.href === pathname)?.name || 'dashboard') || 'Dashboard'}
          </h1>
          <div className="flex items-center space-x-4">
            {/* Language Selector */}
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as 'en' | 'am')}
              className={cn(
                'bg-gray-700 border-gray-600 text-white',
                'bg-white border-gray-300 text-gray-900'
              ) + ' border rounded-lg text-sm px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-green-500'}
            >
              <option value="en">🇬🇧 English</option>
              <option value="am">🇪🇹 አማርኛ</option>
            </select>

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className={`p-2 rounded-lg transition-colors ${
                darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
              }`}
            >
              {darkMode ? (
                <SunIcon className="w-5 h-5 text-gray-400" />
              ) : (
                <MoonIcon className="w-5 h-5 text-gray-600" />
              )}
            </button>

            {/* Notifications Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className={`notifications-button p-2 rounded-lg transition-colors relative ${
                  darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                }`}
              >
                <BellIcon className={`w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                {unreadCount > 0 && (
                  <span className="absolute top-0 right-0 inline-flex items-center justify-center w-4 h-4 text-xs font-bold text-white bg-red-500 rounded-full">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {/* Notifications Panel */}
              {showNotifications && (
                <div className={`notifications-panel absolute right-0 mt-2 w-80 rounded-lg shadow-lg overflow-hidden z-50 ${
                  darkMode ? 'bg-gray-800' : 'bg-white'
                } border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  <div className={`flex justify-between items-center p-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                    <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      Notifications
                    </h3>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        className="text-xs text-green-500 hover:text-green-600"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className={`p-4 text-center text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        No notifications
                      </div>
                    ) : (
                      notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={`p-4 border-b ${darkMode ? 'border-gray-700 hover:bg-gray-700' : 'border-gray-100 hover:bg-gray-50'} transition-colors cursor-pointer ${!notification.read ? 'bg-opacity-50' : ''}`}
                          onClick={() => !notification.read && markAsRead(notification.id)}
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <p className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                {notification.title}
                              </p>
                              <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                {notification.message}
                              </p>
                              <p className={`text-xs mt-2 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                                {new Date(notification.createdAt).toLocaleString()}
                              </p>
                            </div>
                            {!notification.read && (
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  <div className={`p-2 text-center border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                    <Link
                      href="/admin/notifications"
                      className={`text-xs ${darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'}`}
                      onClick={() => setShowNotifications(false)}
                    >
                      View all notifications
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* User Profile */}
            <div className="flex items-center space-x-3">
              <div className="text-right hidden md:block">
                <p className={`${cn('text-white', 'text-gray-900')} text-sm font-medium`}>
                  Abebe Belay
                </p>
                <p className={`${cn('text-gray-400', 'text-gray-500')} text-xs`}>
                  Senior Land Administrator
                </p>
              </div>
              <img
                src="https://ui-avatars.com/api/?name=Abebe+Belay&background=16a34a&color=fff&bold=true"
                alt="Admin"
                className="w-10 h-10 rounded-full border-2 border-green-600"
              />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-8">{children}</main>
      </div>
    </div>
  )
}