'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  EnvelopeIcon, 
  LockClosedIcon, 
  EyeIcon, 
  EyeSlashIcon, 
  ShieldCheckIcon,
  ArrowLeftIcon 
} from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

export default function LoginPage() {
  const router = useRouter()
  const [language, setLanguage] = useState<'en' | 'am'>('en')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  })

  // Load language from localStorage on mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') as 'en' | 'am' || 'en'
    const rememberedEmail = localStorage.getItem('rememberedEmail')
    setLanguage(savedLanguage)
    if (rememberedEmail) {
      setFormData(prev => ({ ...prev, email: rememberedEmail, rememberMe: true }))
    }
    
    // Listen for language changes from layout
    const handleLanguageChange = () => {
      const newLanguage = localStorage.getItem('language') as 'en' | 'am' || 'en'
      setLanguage(newLanguage)
    }
    
    window.addEventListener('languageChange', handleLanguageChange)
    window.addEventListener('storage', handleLanguageChange)
    
    return () => {
      window.removeEventListener('languageChange', handleLanguageChange)
      window.removeEventListener('storage', handleLanguageChange)
    }
  }, [])

  const getText = (en: string, am: string) => language === 'en' ? en : am

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, password: formData.password })
      })

      const data = await response.json()

      if (response.ok && data.success && data.token) {
        const userName = data.user.name || data.user.fullName || 'User'
        const userRole = data.user.role
        
        localStorage.setItem('token', data.token)
        localStorage.setItem('user', JSON.stringify(data.user))
        localStorage.setItem('userRole', userRole)
        localStorage.setItem('userName', userName)
        
        if (formData.rememberMe) {
          localStorage.setItem('rememberedEmail', formData.email)
        } else {
          localStorage.removeItem('rememberedEmail')
        }
        
        toast.success(getText(`Welcome ${userName}!`, `እንኳን ደህና መጡ ${userName}!`))
        
        if (userRole === 'admin') {
          router.push('/admin/dashboard')
        } else if (userRole === 'officer') {
          router.push('/officer/dashboard')
        } else {
          router.push('/dashboard')
        }
      } else {
        toast.error(data.message || data.error || getText('Invalid credentials', 'የተሳሳተ መረጃ'))
        setLoading(false)
      }
    } catch (error) {
      console.error('Login error:', error)
      toast.error(getText('Cannot connect to server', 'ከአገልጋይ ጋር መገናኘት አልተቻለም'))
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-gradient-to-br from-green-600 to-green-700 rounded-2xl shadow-2xl p-8 relative">
        <Link href="/" className="absolute top-4 left-4 text-green-200 hover:text-white transition-colors">
          <ArrowLeftIcon className="w-5 h-5" />
        </Link>

        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <ShieldCheckIcon className="h-10 w-10 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            {getText('Welcome Back!', 'እንኳን ደህና መጡ!')}
          </h1>
          <p className="text-green-100">
            {getText('Sign in to your account', 'ወደ መለያዎ ይግቡ')}
          </p>
        </div>

        <div className="mb-4 p-3 bg-green-500 bg-opacity-20 rounded-lg text-center">
          <p className="text-green-100 text-sm font-semibold">
            {getText('Demo Accounts:', 'የሙከራ መለያዎች:')}
          </p>
          <p className="text-green-200 text-xs">Admin: admin@land.gov.et / admin123</p>
          <p className="text-green-200 text-xs">Officer: officer@land.gov.et / officer123</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-green-100 mb-1">
              {getText('Email Address', 'ኢሜይል አድራሻ')}
            </label>
            <div className="relative">
              <EnvelopeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-400" />
              <input
                type="email"
                placeholder={getText('Enter Your Email', 'ኢሜይልዎን ያስገቡ')}
                className="w-full pl-10 pr-4 py-3 bg-green-500 bg-opacity-20 border border-green-400 rounded-lg text-white placeholder-green-300 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-green-100 mb-1">
              {getText('Password', 'የይለፍ ቃል')}
            </label>
            <div className="relative">
              <LockClosedIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder={getText('Enter Your Password', 'የይለፍ ቃልዎን ያስገቡ')}
                className="w-full pl-10 pr-10 py-3 bg-green-500 bg-opacity-20 border border-green-400 rounded-lg text-white placeholder-green-300 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeSlashIcon className="w-5 h-5 text-green-300 hover:text-white" />
                ) : (
                  <EyeIcon className="w-5 h-5 text-green-300 hover:text-white" />
                )}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="remember"
                className="mr-2"
                checked={formData.rememberMe}
                onChange={(e) => setFormData({ ...formData, rememberMe: e.target.checked })}
              />
              <label htmlFor="remember" className="text-sm text-green-200">
                {getText('Remember me', 'አስታውሰኝ')}
              </label>
            </div>
            <Link href="/forgot-password" className="text-sm text-green-200 hover:text-white font-medium">
              {getText('Forgot Password?', 'የይለፍ ቃል ረሳሁ?')}
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-white text-green-700 py-3 rounded-lg font-semibold hover:bg-green-50 transition-all duration-200 disabled:opacity-50"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-green-600 border-t-transparent rounded-full animate-spin mr-2"></div>
                {getText('Signing in...', 'በመግባት ላይ...')}
              </div>
            ) : (
              getText('Login', 'ግባ')
            )}
          </button>

          <p className="text-center text-green-200">
            {getText("Don't have an account?", 'መለያ የለዎትም?')}{' '}
            <Link href="/register" className="text-white hover:text-green-100 font-medium">
              {getText('Register', 'ይመዝገቡ')}
            </Link>
          </p>
        </form>

        <p className="mt-6 text-xs text-center text-green-300">
          {getText('By continuing, you agree to our Terms of Service and Privacy Policy', 'በመቀጠል የአገልግሎት ውል እና የግላዊነት ፖሊሲን ይስማማሉ')}
        </p>
      </div>
    </div>
  )
}