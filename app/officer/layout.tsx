// app/officer/layout.tsx
'use client'

import { ReactNode, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTranslation } from '@/lib/useTranslation'
import { useLanguage } from '@/lib/LanguageContext'
import {
  HomeIcon,
  DocumentCheckIcon,
  BuildingStorefrontIcon,
  CreditCardIcon,
  BellIcon,
  Cog6ToothIcon,
  SunIcon,
  MoonIcon,
  UserGroupIcon,
  ArrowRightOnRectangleIcon,
  FolderIcon,
  ShieldCheckIcon,
  ChartBarIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline'

interface NavigationItem {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  badge?: number
}

export default function OfficerLayout({ children }: { children: ReactNode }) {
  const router = useRouter()
  const { t } = useTranslation()
  const languageContext = useLanguage()
  const darkMode = languageContext.darkMode
  const toggleDarkMode = languageContext.toggleDarkMode
  const language = languageContext.language
  const setLanguage = languageContext.setLanguage
  const pathname = usePathname()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const role = localStorage.getItem('userRole')
    if (role !== 'officer') {
      router.push('/login')
    } else {
      setIsLoading(false)
    }
  }, [router])

  const navigation: NavigationItem[] = [
    { name: 'dashboard', href: '/officer', icon: HomeIcon },
    { name: 'verifications', href: '/officer/verifications', icon: DocumentCheckIcon },
    { name: 'marketplace', href: '/officer/marketplace', icon: BuildingStorefrontIcon },
    { name: 'payments', href: '/officer/payments', icon: CreditCardIcon },
    { name: 'transferRequests', href: '/officer/transfers', icon: ArrowRightOnRectangleIcon },
    { name: 'serviceApplications', href: '/officer/services', icon: FolderIcon },
    { name: 'disputes', href: '/officer/disputes', icon: ShieldCheckIcon },
    { name: 'users', href: '/officer/users', icon: UserGroupIcon },
    { name: 'reports', href: '/officer/reports', icon: ChartBarIcon },
    { name: 'notifications', href: '/officer/notifications', icon: BellIcon},
   
  ]

  const isActive = (href: string): boolean => {
    if (href === '/officer') {
      return pathname === href
    }
    return pathname.startsWith(href)
  }

  const handleLogout = () => {
    localStorage.clear()
    router.push('/login')
  }

  const cn = (darkClass: string, lightClass: string) => darkMode ? darkClass : lightClass

  if (isLoading) {
    return (
      <div className={`${cn('bg-gray-900', 'bg-gray-50')} min-h-screen flex items-center justify-center`}>
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className={cn('text-gray-300', 'text-gray-600')}>{t('loading')}</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`${cn('bg-gray-900', 'bg-gray-50')} min-h-screen`}>
      {/* Sidebar - Fixed with scrollable area */}
      <div className={`${cn('bg-gray-800 border-gray-700', 'bg-white border-gray-200')} fixed inset-y-0 left-0 w-64 border-r transition-colors duration-200 z-30 flex flex-col`}>
        {/* Header - Fixed at top */}
        <div className={`${cn('border-gray-700', 'border-gray-200')} flex items-center h-16 px-6 border-b flex-shrink-0`}>
          <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold">{language === 'am' ? 'መ/ቤት' : 'LO'}</span>
          </div>
          <span className={`${cn('text-white', 'text-gray-900')} ml-3 font-semibold`}>
            {language === 'am' ? 'የመሬት ኦፊሰር' : t('officerPortal')}
          </span>
        </div>
        
        {/* Scrollable Navigation Area */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 scrollbar-thin scrollbar-thumb-gray-600 hover:scrollbar-thumb-gray-500">
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
                <span className="flex-1">{t(item.name)}</span>
                {item.badge && (
                  <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                    {item.badge}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>

        {/* Logout Button - Fixed at bottom */}
        <div className={`${cn('border-gray-700', 'border-gray-200')} border-t p-4 flex-shrink-0`}>
          <button
            onClick={handleLogout}
            className={`${cn('text-red-400 hover:bg-red-900/30', 'text-red-600 hover:bg-red-50')} flex items-center w-full px-4 py-3 text-sm rounded-lg transition-colors`}
          >
            <svg className="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            {t('logout')}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="ml-64 flex-1">
        {/* Header */}
        <header className={`${cn('bg-gray-800 border-gray-700', 'bg-white border-gray-200')} border-b h-16 flex items-center justify-between px-8 transition-colors duration-200 sticky top-0 z-20`}>
          <div className="flex items-center">
            <h1 className={`${cn('text-white', 'text-gray-900')} text-xl font-semibold`}>
              {t(navigation.find((item) => isActive(item.href))?.name || 'dashboard')}
            </h1>
          </div>
          
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

          

            {/* Profile */}
            <div className="flex items-center space-x-3">
              <div className="text-right hidden md:block">
                <p className={`${cn('text-white', 'text-gray-900')} text-sm font-medium`}>
                  {language === 'am' ? 'አበበ በላይ' : 'Abebe Belay'}
                </p>
                <p className={`${cn('text-gray-400', 'text-gray-500')} text-xs`}>
                  {language === 'am' ? 'ዋና መሬት ኦፊሰር' : 'Senior Land Officer'}
                </p>
              </div>
              <img
                src="https://ui-avatars.com/api/?name=Abebe+Belay&background=16a34a&color=fff&bold=true"
                alt="Officer"
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