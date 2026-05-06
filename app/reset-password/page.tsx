'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { 
  LockClosedIcon, 
  KeyIcon,
  ArrowLeftIcon,
  ShieldCheckIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  
  const [language, setLanguage] = useState<'en' | 'am'>('en')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') as 'en' | 'am' || 'en'
    setLanguage(savedLanguage)
    
    if (!token) {
      toast.error(getText('Invalid reset link', 'የማስጀመሪያ አገናኝ ትክክል አይደለም'))
      router.push('/forgot-password')
    }
  }, [token])

  const getText = (en: string, am: string) => language === 'en' ? en : am

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (password !== confirmPassword) {
      toast.error(getText('Passwords do not match', 'የይለፍ ቃሎች አይዛመዱም'))
      return
    }
    
    if (password.length < 6) {
      toast.error(getText('Password must be at least 6 characters', 'የይለፍ ቃል ቢያንስ 6 ቁምፊዎች መሆን አለበት'))
      return
    }
    
    setLoading(true)

    try {
      const response = await fetch(`${API_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password })
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setSubmitted(true)
          toast.success(getText('Password reset successful!', 'የይለፍ ቃል በተሳካ ሁኔታ ተለውጧል!'))
          setTimeout(() => router.push('/login'), 3000)
        } else {
          toast.error(data.message || getText('Failed to reset password', 'የይለፍ ቃል መለወጥ አልተሳካም'))
        }
      } else {
        toast.error(getText('Invalid or expired reset link', 'የማስጀመሪያ አገናኝ ትክክል ወይም ጊዜው አልፏል'))
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error(getText('Cannot connect to server', 'ከአገልጋይ ጋር መገናኘት አልተቻለም'))
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
            {getText('Password Reset Successful!', 'የይለፍ ቃል ተለውጧል!')}
          </h1>
          <p className="text-green-100 mb-4">
            {getText(
              'Your password has been reset successfully. Redirecting to login...',
              'የይለፍ ቃልዎ በተሳካ ሁኔታ ተለውጧል። ወደ መግቢያ ገጽ እየተዘዋወረ ነው...'
            )}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-gradient-to-br from-green-600 to-green-700 rounded-2xl shadow-2xl p-8">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <KeyIcon className="h-10 w-10 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">
            {getText('Reset Password', 'የይለፍ ቃል ዳግም አስጀምር')}
          </h1>
          <p className="text-green-100">
            {getText(
              'Please enter your new password.',
              'እባክዎ አዲስ የይለፍ ቃልዎን ያስገቡ።'
            )}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-green-100 mb-1">
              {getText('New Password', 'አዲስ የይለፍ ቃል')}
            </label>
            <div className="relative">
              <LockClosedIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder={getText('Enter new password', 'አዲስ የይለፍ ቃል ያስገቡ')}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-green-500 bg-opacity-20 border border-green-400 rounded-lg text-white placeholder-green-300 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-green-100 mb-1">
              {getText('Confirm Password', 'የይለፍ ቃል አረጋግጥ')}
            </label>
            <div className="relative">
              <LockClosedIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder={getText('Confirm new password', 'አዲስ የይለፍ ቃል ያረጋግጡ')}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-green-500 bg-opacity-20 border border-green-400 rounded-lg text-white placeholder-green-300 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent"
                required
              />
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="showPassword"
              className="mr-2"
              checked={showPassword}
              onChange={(e) => setShowPassword(e.target.checked)}
            />
            <label htmlFor="showPassword" className="text-sm text-green-200">
              {getText('Show password', 'የይለፍ ቃል አሳይ')}
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-white text-green-700 py-3 rounded-lg font-semibold hover:bg-green-50 transition-all duration-200 disabled:opacity-50"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-green-600 border-t-transparent rounded-full animate-spin mr-2"></div>
                {getText('Resetting...', 'በማስጀመር ላይ...')}
              </div>
            ) : (
              getText('Reset Password', 'የይለፍ ቃል ዳግም አስጀምር')
            )}
          </button>
        </form>

        <div className="mt-4 text-center">
          <Link href="/login" className="text-sm text-green-200 hover:text-white">
            {getText('Back to Login', 'ወደ መግቢያ ተመለስ')}
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center h-screen">Loading...</div>}>
      <ResetPasswordForm />
    </Suspense>
  )
}