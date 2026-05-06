'use client'

import { useState, useEffect } from 'react'
import { useTranslation } from '@/lib/useTranslation'
import { useLanguage } from '@/lib/LanguageContext'
import {
  BellIcon,
  ShieldCheckIcon,
  PaintBrushIcon,
  GlobeAltIcon,
  CurrencyDollarIcon,
  Cog6ToothIcon,
  CheckCircleIcon,
  SunIcon,
  MoonIcon,
  WalletIcon,
  BanknotesIcon,
  CreditCardIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

const API_URL = 'http://localhost:5000/api'

interface Settings {
  siteName: string
  siteUrl: string
  supportEmail: string
  supportPhone: string
  itemsPerPage: string
  enableRegistration: boolean
  enableMarketplace: boolean
  maintenanceMode: boolean
  emailNotifications: boolean
  smsNotifications: boolean
  twoFactorAuth: boolean
  dateFormat: string
  timezone: string
  currency: string
  transactionFee: string
  paymentGateways: {
    telebirr: boolean
    cbeBirr: boolean
    bankTransfer: boolean
    cash: boolean
  }
}

export default function AdminSettingsPage() {
  const { t } = useTranslation()
  const languageContext = useLanguage()
  const darkMode = languageContext.darkMode
  const toggleDarkMode = languageContext.toggleDarkMode
  const language = languageContext.language
  const setLanguage = languageContext.setLanguage
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const cn = (darkClass: string, lightClass: string) => darkMode ? darkClass : lightClass

  const [activeTab, setActiveTab] = useState<string>('general')
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false)
  
  const [settings, setSettings] = useState<Settings>({
    siteName: 'Digital Land Portal',
    siteUrl: 'https://land.gov.et',
    supportEmail: 'support@land.gov.et',
    supportPhone: '+251 911 234 567',
    itemsPerPage: '20',
    enableRegistration: true,
    enableMarketplace: true,
    maintenanceMode: false,
    emailNotifications: true,
    smsNotifications: false,
    twoFactorAuth: true,
    dateFormat: 'MM/DD/YYYY',
    timezone: 'UTC+3',
    currency: 'ETB',
    transactionFee: '2.5',
    paymentGateways: {
      telebirr: true,
      cbeBirr: true,
      bankTransfer: false,
      cash: true
    }
  })

  const tabs = [
    { id: 'general', name: t('general'), icon: Cog6ToothIcon },
    { id: 'notifications', name: t('notifications'), icon: BellIcon },
    { id: 'security', name: t('security'), icon: ShieldCheckIcon },
    { id: 'appearance', name: t('appearance'), icon: PaintBrushIcon },
    { id: 'localization', name: t('localization'), icon: GlobeAltIcon },
    { id: 'payments', name: t('paymentSettings'), icon: CurrencyDollarIcon }
  ]

  // Fetch settings from backend
  const fetchSettings = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      if (!token) {
        window.location.href = '/login'
        return
      }

      const response = await fetch(`${API_URL}/admin/settings`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem('token')
        window.location.href = '/login'
        return
      }

      if (response.ok) {
        const data = await response.json()
        if (data.settings) {
          setSettings(prev => ({
            ...prev,
            siteName: data.settings.siteName || prev.siteName,
            supportEmail: data.settings.supportEmail || prev.supportEmail,
            supportPhone: data.settings.supportPhone || prev.supportPhone,
            enableRegistration: data.settings.enableRegistration !== undefined ? data.settings.enableRegistration : prev.enableRegistration,
            maintenanceMode: data.settings.maintenanceMode || prev.maintenanceMode
          }))
        }
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
      toast.error(t('failedToLoadSettings') || 'Failed to load settings')
    } finally {
      setLoading(false)
    }
  }

  // Save settings to backend
  const saveSettingsToBackend = async () => {
    setSaving(true)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/admin/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ settings })
      })

      if (response.ok) {
        setSaveSuccess(true)
        toast.success(t('settingsSaved') || 'Settings saved!')
        setTimeout(() => setSaveSuccess(false), 3000)
      } else {
        toast.error(t('failedToSave') || 'Failed to save settings')
      }
    } catch (error) {
      console.error('Error saving settings:', error)
      toast.error(t('errorSaving') || 'Error saving settings')
    } finally {
      setSaving(false)
    }
  }

  useEffect(() => {
    fetchSettings()
  }, [])

  const handleSettingChange = (key: keyof Settings, value: string | boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  const handleGatewayChange = (gateway: keyof Settings['paymentGateways']) => {
    setSettings(prev => ({
      ...prev,
      paymentGateways: {
        ...prev.paymentGateways,
        [gateway]: !prev.paymentGateways[gateway]
      }
    }))
  }

  const handleSave = () => {
    saveSettingsToBackend()
  }

  const ToggleButton = ({ isEnabled, onChange }: { isEnabled: boolean; onChange: () => void }) => (
    <button
      type="button"
      onClick={onChange}
      className={`
        relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2
        ${isEnabled ? 'bg-green-600' : darkMode ? 'bg-gray-600' : 'bg-gray-300'}
      `}
      role="switch"
      aria-checked={isEnabled}
    >
      <span
        className={`
          inline-block h-4 w-4 transform rounded-full bg-white transition-transform
          ${isEnabled ? 'translate-x-6' : 'translate-x-1'}
        `}
      />
    </button>
  )

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className={`text-2xl font-bold ${cn('text-white', 'text-gray-900')}`}>
          {t('settings')}
        </h1>
        <div className="flex gap-2">
          {saveSuccess && (
            <div className={`${cn('bg-green-900/30 text-green-400', 'bg-green-50 text-green-600')} flex items-center text-sm px-4 py-2 rounded-lg`}>
              <CheckCircleIcon className="w-5 h-5 mr-2" />
              {t('saved')}
            </div>
          )}
          <button
            onClick={fetchSettings}
            className={`p-2 rounded-lg transition-colors ${cn('hover:bg-gray-700', 'hover:bg-gray-100')}`}
          >
            <ArrowPathIcon className={`w-5 h-5 ${cn('text-gray-400', 'text-gray-500')}`} />
          </button>
        </div>
      </div>

      {/* Settings Tabs */}
      <div className={`${cn('bg-gray-800', 'bg-white')} rounded-xl shadow-sm overflow-hidden`}>
        <div className={`${cn('border-gray-700', 'border-gray-200')} border-b overflow-x-auto`}>
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors duration-200
                    ${isActive 
                      ? `border-green-500 text-green-600 ${darkMode ? 'dark:text-green-400' : ''}`
                      : `border-transparent ${darkMode ? 'text-gray-400 hover:text-gray-300 hover:border-gray-600' : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'}`
                    }
                  `}
                >
                  <Icon className={`
                    w-5 h-5 mr-2
                    ${isActive 
                      ? `text-green-600 ${darkMode ? 'dark:text-green-400' : ''}`
                      : darkMode ? 'text-gray-500' : 'text-gray-400'
                    }
                  `} />
                  {tab.name}
                </button>
              )
            })}
          </nav>
        </div>

        <div className="p-6">
          {/* General Tab */}
          {activeTab === 'general' && (
            <div className="space-y-6">
              <h2 className={`text-lg font-medium ${cn('text-white', 'text-gray-900')}`}>{t('general')}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${cn('text-gray-300', 'text-gray-700')}`}>
                    {t('siteName')}
                  </label>
                  <input
                    type="text"
                    className={cn(
                      'bg-gray-700 border-gray-600 text-white',
                      'bg-white border-gray-300 text-gray-900'
                    ) + ' w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500'}
                    value={settings.siteName}
                    onChange={(e) => handleSettingChange('siteName', e.target.value)}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${cn('text-gray-300', 'text-gray-700')}`}>
                    {t('siteUrl')}
                  </label>
                  <input
                    type="url"
                    className={cn(
                      'bg-gray-700 border-gray-600 text-white',
                      'bg-white border-gray-300 text-gray-900'
                    ) + ' w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500'}
                    value={settings.siteUrl}
                    onChange={(e) => handleSettingChange('siteUrl', e.target.value)}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${cn('text-gray-300', 'text-gray-700')}`}>
                    {t('supportEmail')}
                  </label>
                  <input
                    type="email"
                    className={cn(
                      'bg-gray-700 border-gray-600 text-white',
                      'bg-white border-gray-300 text-gray-900'
                    ) + ' w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500'}
                    value={settings.supportEmail}
                    onChange={(e) => handleSettingChange('supportEmail', e.target.value)}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${cn('text-gray-300', 'text-gray-700')}`}>
                    {t('supportPhone')}
                  </label>
                  <input
                    type="tel"
                    className={cn(
                      'bg-gray-700 border-gray-600 text-white',
                      'bg-white border-gray-300 text-gray-900'
                    ) + ' w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500'}
                    value={settings.supportPhone}
                    onChange={(e) => handleSettingChange('supportPhone', e.target.value)}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${cn('text-gray-300', 'text-gray-700')}`}>
                    {t('itemsPerPage')}
                  </label>
                  <select
                    className={cn(
                      'bg-gray-700 border-gray-600 text-white',
                      'bg-white border-gray-300 text-gray-900'
                    ) + ' w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500'}
                    value={settings.itemsPerPage}
                    onChange={(e) => handleSettingChange('itemsPerPage', e.target.value)}
                  >
                    <option>10</option>
                    <option>20</option>
                    <option>50</option>
                    <option>100</option>
                  </select>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className={`${cn('bg-gray-700/50', 'bg-gray-50')} flex items-center justify-between p-4 rounded-lg`}>
                  <div>
                    <p className={`font-medium ${cn('text-white', 'text-gray-900')}`}>{t('enableRegistration')}</p>
                    <p className={`text-xs ${cn('text-gray-400', 'text-gray-500')}`}>
                      {t('allowNewUsers')}
                    </p>
                  </div>
                  <ToggleButton 
                    isEnabled={settings.enableRegistration} 
                    onChange={() => handleSettingChange('enableRegistration', !settings.enableRegistration)} 
                  />
                </div>
                
                <div className={`${cn('bg-gray-700/50', 'bg-gray-50')} flex items-center justify-between p-4 rounded-lg`}>
                  <div>
                    <p className={`font-medium ${cn('text-white', 'text-gray-900')}`}>{t('enableMarketplace')}</p>
                    <p className={`text-xs ${cn('text-gray-400', 'text-gray-500')}`}>
                      {t('allowPropertyListings')}
                    </p>
                  </div>
                  <ToggleButton 
                    isEnabled={settings.enableMarketplace} 
                    onChange={() => handleSettingChange('enableMarketplace', !settings.enableMarketplace)} 
                  />
                </div>

                <div className={`${cn('bg-gray-700/50', 'bg-gray-50')} flex items-center justify-between p-4 rounded-lg`}>
                  <div>
                    <p className={`font-medium ${cn('text-white', 'text-gray-900')}`}>{t('maintenanceMode')}</p>
                    <p className={`text-xs ${cn('text-gray-400', 'text-gray-500')}`}>
                      {t('temporarilyDisableSystem')}
                    </p>
                  </div>
                  <ToggleButton 
                    isEnabled={settings.maintenanceMode} 
                    onChange={() => handleSettingChange('maintenanceMode', !settings.maintenanceMode)} 
                  />
                </div>
              </div>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <h2 className={`text-lg font-medium ${cn('text-white', 'text-gray-900')}`}>{t('notifications')}</h2>
              <div className="space-y-4">
                <div className={`${cn('bg-gray-700/50', 'bg-gray-50')} flex items-center justify-between p-4 rounded-lg`}>
                  <div>
                    <p className={`font-medium ${cn('text-white', 'text-gray-900')}`}>{t('emailNotifications')}</p>
                    <p className={`text-xs ${cn('text-gray-400', 'text-gray-500')}`}>
                      {t('receiveEmailUpdates')}
                    </p>
                  </div>
                  <ToggleButton 
                    isEnabled={settings.emailNotifications} 
                    onChange={() => handleSettingChange('emailNotifications', !settings.emailNotifications)} 
                  />
                </div>
                
                <div className={`${cn('bg-gray-700/50', 'bg-gray-50')} flex items-center justify-between p-4 rounded-lg`}>
                  <div>
                    <p className={`font-medium ${cn('text-white', 'text-gray-900')}`}>{t('smsNotifications')}</p>
                    <p className={`text-xs ${cn('text-gray-400', 'text-gray-500')}`}>
                      {t('receiveSMSAlerts')}
                    </p>
                  </div>
                  <ToggleButton 
                    isEnabled={settings.smsNotifications} 
                    onChange={() => handleSettingChange('smsNotifications', !settings.smsNotifications)} 
                  />
                </div>
              </div>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <h2 className={`text-lg font-medium ${cn('text-white', 'text-gray-900')}`}>{t('security')}</h2>
              <div className={`${cn('bg-gray-700/50', 'bg-gray-50')} flex items-center justify-between p-4 rounded-lg`}>
                <div>
                  <p className={`font-medium ${cn('text-white', 'text-gray-900')}`}>{t('twoFactorAuth')}</p>
                  <p className={`text-xs ${cn('text-gray-400', 'text-gray-500')}`}>
                    {t('twoFactorDescription')}
                  </p>
                </div>
                <ToggleButton 
                  isEnabled={settings.twoFactorAuth} 
                  onChange={() => handleSettingChange('twoFactorAuth', !settings.twoFactorAuth)} 
                />
              </div>
            </div>
          )}

          {/* Appearance Tab */}
          {activeTab === 'appearance' && (
            <div className="space-y-6">
              <h2 className={`text-lg font-medium ${cn('text-white', 'text-gray-900')}`}>{t('appearance')}</h2>
              <div className={`${cn('bg-gray-700/50', 'bg-gray-50')} p-4 rounded-lg`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    {darkMode ? (
                      <MoonIcon className={`${cn('text-gray-400', 'text-gray-500')} w-5 h-5 mr-3`} />
                    ) : (
                      <SunIcon className={`${cn('text-gray-400', 'text-gray-500')} w-5 h-5 mr-3`} />
                    )}
                    <div>
                      <p className={`font-medium ${cn('text-white', 'text-gray-900')}`}>{t('darkMode')}</p>
                      <p className={`text-xs ${cn('text-gray-400', 'text-gray-500')}`}>
                        {darkMode ? t('darkModeEnabled') : t('lightModeEnabled')}
                      </p>
                    </div>
                  </div>
                  <ToggleButton 
                    isEnabled={darkMode} 
                    onChange={toggleDarkMode} 
                  />
                </div>
              </div>
            </div>
          )}

          {/* Localization Tab */}
          {activeTab === 'localization' && (
            <div className="space-y-6">
              <h2 className={`text-lg font-medium ${cn('text-white', 'text-gray-900')}`}>{t('localization')}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${cn('text-gray-300', 'text-gray-700')}`}>
                    {t('language')}
                  </label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value as 'en' | 'am')}
                    className={cn(
                      'bg-gray-700 border-gray-600 text-white',
                      'bg-white border-gray-300 text-gray-900'
                    ) + ' w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500'}
                  >
                    <option value="en">{t('english')}</option>
                    <option value="am">{t('amharic')}</option>
                  </select>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${cn('text-gray-300', 'text-gray-700')}`}>
                    {t('dateFormat')}
                  </label>
                  <select
                    className={cn(
                      'bg-gray-700 border-gray-600 text-white',
                      'bg-white border-gray-300 text-gray-900'
                    ) + ' w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500'}
                    value={settings.dateFormat}
                    onChange={(e) => handleSettingChange('dateFormat', e.target.value)}
                  >
                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                    <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                  </select>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${cn('text-gray-300', 'text-gray-700')}`}>
                    {t('timezone')}
                  </label>
                  <select
                    className={cn(
                      'bg-gray-700 border-gray-600 text-white',
                      'bg-white border-gray-300 text-gray-900'
                    ) + ' w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500'}
                    value={settings.timezone}
                    onChange={(e) => handleSettingChange('timezone', e.target.value)}
                  >
                    <option value="UTC+3">{t('eastAfricaTime')}</option>
                    <option value="UTC+2">{t('centralAfricaTime')}</option>
                    <option value="UTC+0">{t('gmt')}</option>
                  </select>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${cn('text-gray-300', 'text-gray-700')}`}>
                    {t('currency')}
                  </label>
                  <select
                    className={cn(
                      'bg-gray-700 border-gray-600 text-white',
                      'bg-white border-gray-300 text-gray-900'
                    ) + ' w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500'}
                    value={settings.currency}
                    onChange={(e) => handleSettingChange('currency', e.target.value)}
                  >
                    <option value="ETB">{t('ethiopianBirr')}</option>
                    <option value="USD">{t('usDollar')}</option>
                    <option value="EUR">{t('euro')}</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Payments Tab */}
          {activeTab === 'payments' && (
            <div className="space-y-6">
              <h2 className={`text-lg font-medium ${cn('text-white', 'text-gray-900')}`}>{t('paymentSettings')}</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${cn('text-gray-300', 'text-gray-700')}`}>
                    {t('currency')}
                  </label>
                  <select
                    className={cn(
                      'bg-gray-700 border-gray-600 text-white',
                      'bg-white border-gray-300 text-gray-900'
                    ) + ' w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500'}
                    value={settings.currency}
                    onChange={(e) => handleSettingChange('currency', e.target.value)}
                  >
                    <option value="ETB">{t('etb')}</option>
                    <option value="USD">{t('usd')}</option>
                    <option value="EUR">{t('eur')}</option>
                  </select>
                </div>
                
                <div>
                  <label className={`block text-sm font-medium mb-2 ${cn('text-gray-300', 'text-gray-700')}`}>
                    {t('transactionFee')}
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    className={cn(
                      'bg-gray-700 border-gray-600 text-white',
                      'bg-white border-gray-300 text-gray-900'
                    ) + ' w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500'}
                    value={settings.transactionFee}
                    onChange={(e) => handleSettingChange('transactionFee', e.target.value)}
                  />
                </div>
              </div>

              <div>
                <h3 className={`text-md font-medium mb-3 ${cn('text-white', 'text-gray-900')}`}>
                  {t('paymentGateways')}
                </h3>
                <div className="space-y-3">
                  <div className={`${cn('bg-gray-700/50', 'bg-gray-50')} flex items-center justify-between p-4 rounded-lg`}>
                    <div className="flex items-center">
                      <WalletIcon className={`${cn('text-gray-400', 'text-gray-500')} w-5 h-5 mr-3`} />
                      <div>
                        <p className={`font-medium ${cn('text-white', 'text-gray-900')}`}>
                          {t('telebirr')}
                        </p>
                      </div>
                    </div>
                    <ToggleButton 
                      isEnabled={settings.paymentGateways.telebirr} 
                      onChange={() => handleGatewayChange('telebirr')} 
                    />
                  </div>

                  <div className={`${cn('bg-gray-700/50', 'bg-gray-50')} flex items-center justify-between p-4 rounded-lg`}>
                    <div className="flex items-center">
                      <BanknotesIcon className={`${cn('text-gray-400', 'text-gray-500')} w-5 h-5 mr-3`} />
                      <div>
                        <p className={`font-medium ${cn('text-white', 'text-gray-900')}`}>
                          {t('cbeBirr')}
                        </p>
                      </div>
                    </div>
                    <ToggleButton 
                      isEnabled={settings.paymentGateways.cbeBirr} 
                      onChange={() => handleGatewayChange('cbeBirr')} 
                    />
                  </div>

                  <div className={`${cn('bg-gray-700/50', 'bg-gray-50')} flex items-center justify-between p-4 rounded-lg`}>
                    <div className="flex items-center">
                      <CreditCardIcon className={`${cn('text-gray-400', 'text-gray-500')} w-5 h-5 mr-3`} />
                      <div>
                        <p className={`font-medium ${cn('text-white', 'text-gray-900')}`}>
                          {t('bankTransfer')}
                        </p>
                      </div>
                    </div>
                    <ToggleButton 
                      isEnabled={settings.paymentGateways.bankTransfer} 
                      onChange={() => handleGatewayChange('bankTransfer')} 
                    />
                  </div>

                  <div className={`${cn('bg-gray-700/50', 'bg-gray-50')} flex items-center justify-between p-4 rounded-lg`}>
                    <div className="flex items-center">
                      <CurrencyDollarIcon className={`${cn('text-gray-400', 'text-gray-500')} w-5 h-5 mr-3`} />
                      <div>
                        <p className={`font-medium ${cn('text-white', 'text-gray-900')}`}>
                          {t('cash')}
                        </p>
                      </div>
                    </div>
                    <ToggleButton 
                      isEnabled={settings.paymentGateways.cash} 
                      onChange={() => handleGatewayChange('cash')} 
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Save Button */}
          <div className={`${cn('border-gray-700', 'border-gray-200')} mt-6 pt-6 border-t flex justify-end`}>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {saving ? t('saving') || 'Saving...' : t('saveChanges')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}