'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  EnvelopeIcon, 
  ArrowLeftIcon,
  CheckCircleIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

export default function ForgotPasswordPage() {
  const [language, setLanguage] = useState<'en' | 'am'>('en')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') as 'en' | 'am' || 'en'
    setLanguage(savedLanguage)
    
    const handleLanguageChange = () => {
      const newLanguage = localStorage.getItem('language') as 'en' | 'am' || 'en'
      setLanguage(newLanguage)
    }
    
    window.addEventListener('languageChange', handleLanguageChange)
    return () => window.removeEventListener('languageChange', handleLanguageChange)
  }, [])

  const getText = (en: string, am: string) => language === 'en' ? en : am

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Simulate API call - replace with your actual endpoint
      const response = await fetch(`${API_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })

      // For demo, even if API fails, show success
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setSubmitted(true)
          toast.success(getText('Reset link sent!', 'የዳግም ማስጀመሪያ አገናኝ ተልኳል!'))
        } else {
          setSubmitted(true) // Still show success to prevent email enumeration
          toast.success(getText('If email exists, reset link sent', 'ኢሜይሉ ካለ የዳግም ማስጀመሪያ አገናኝ ተልኳል'))
        }
      } else {
        // For demo, still show success to prevent email enumeration
        setSubmitted(true)
        toast.success(getText('If email exists, reset link sent', 'ኢሜይሉ ካለ የዳግም ማስጀመሪያ አገናኝ ተልኳል'))
      }
    } catch (error) {
      console.error('Error:', error)
      // For demo, still show success
      setSubmitted(true)
      toast.success(getText('If email exists, reset link sent', 'ኢሜይሉ ካለ የዳግም ማስጀመሪያ አገናኝ ተልኳል'))
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-gradient-to-br from-green-600 to-green-700 rounded-2xl shadow-2xl p-8 text-center">
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <CheckCircleIcon className="h-10 w-10 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">
            {getText('Check Your Email', 'ኢሜይልዎን ይፈትሹ')}
          </h1>
          <p className="text-green-100 mb-4">
            {getText(
              `We've sent a password reset link to ${email}`,
              `የይለፍ ቃል ዳግም ማስጀመሪያ አገናኝ ወደ ${email} ተልኳል`
            )}
          </p>
          <Link
            href="/login"
            className="inline-block px-6 py-2 bg-white text-green-700 rounded-lg font-semibold hover:bg-green-50 transition-all"
          >
            {getText('Back to Login', 'ወደ መግቢያ ተመለስ')}
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-gradient-to-br from-green-600 to-green-700 rounded-2xl shadow-2xl p-8">
        <Link href="/login" className="inline-flex items-center text-green-200 hover:text-white mb-6 transition-colors">
          <ArrowLeftIcon className="w-4 h-4 mr-2" />
          {getText('Back to Login', 'ወደ መግቢያ ተመለስ')}
        </Link>

        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <ShieldCheckIcon className="h-10 w-10 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">
            {getText('Forgot Password?', 'የይለፍ ቃል ረሳሁ?')}
          </h1>
          <p className="text-green-100">
            {getText(
              'Enter your email address and we\'ll send you a link to reset your password.',
              'ኢሜይል አድራሻዎን ያስገቡ እና የይለፍ ቃልዎን ለማስጀመር አገናኝ እንልክልዎታለን።'
            )}
          </p>
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
                placeholder={getText('Enter your email', 'ኢሜይልዎን ያስገቡ')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-green-500 bg-opacity-20 border border-green-400 rounded-lg text-white placeholder-green-300 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-white text-green-700 py-3 rounded-lg font-semibold hover:bg-green-50 transition-all duration-200 disabled:opacity-50"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-green-600 border-t-transparent rounded-full animate-spin mr-2"></div>
                {getText('Sending...', 'በመላክ ላይ...')}
              </div>
            ) : (
              getText('Send Reset Link', 'የዳግም ማስጀመሪያ አገናኝ ላክ')
            )}
          </button>
        </form>
      </div>
    </div>
  )
}