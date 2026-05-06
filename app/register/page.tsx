// app/register/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useLanguage } from '@/lib/LanguageContext';
import {
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  KeyIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  EyeSlashIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';

export default function RegisterPage() {
  const { language } = useLanguage();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'citizen'
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const translations = {
    en: {
      title: 'Create Account',
      subtitle: 'Register to access land administration services',
      fullName: 'Full Name',
      email: 'Email Address',
      phone: 'Phone Number',
      password: 'Password',
      confirmPassword: 'Confirm Password',
      register: 'Register',
      registering: 'Registering...',
      alreadyHaveAccount: 'Already have an account?',
      loginHere: 'Login here',
      passwordRequirements: 'Password must be at least 6 characters',
      agreeToTerms: 'By registering, you agree to our',
      termsOfService: 'Terms of Service',
      registrationSuccess: 'Registration successful! Redirecting to login...',
      registrationFailed: 'Registration failed. Please try again.',
      nameRequired: 'Full name is required',
      emailRequired: 'Email is required',
      emailInvalid: 'Please enter a valid email address',
      passwordRequired: 'Password is required',
      passwordMinLength: 'Password must be at least 6 characters',
      passwordsNotMatch: 'Passwords do not match',
      phoneInvalid: 'Please enter a valid phone number'
    },
    am: {
      title: 'አካውንት ይፍጠሩ',
      subtitle: 'የመሬት አስተዳደር አገልግሎቶችን ለማግኘት ይመዝገቡ',
      fullName: 'ሙሉ ስም',
      email: 'ኢሜይል አድራሻ',
      phone: 'ስልክ ቁጥር',
      password: 'የይለፍ ቃል',
      confirmPassword: 'የይለፍ ቃል አረጋግጥ',
      register: 'ይመዝገቡ',
      registering: 'በምዝገባ ላይ...',
      alreadyHaveAccount: 'አካውንት አለዎት?',
      loginHere: 'እዚህ ይግቡ',
      passwordRequirements: 'የይለፍ ቃል ቢያንስ 6 ቁምፊዎች መሆን አለበት',
      agreeToTerms: 'በመመዝገብ የእኛን ይስማማሉ',
      termsOfService: 'የአገልግሎት ውሎች',
      registrationSuccess: 'ምዝገባ ተሳክቷል! ወደ መግቢያ ገጽ እየተዘዋወረ ነው...',
      registrationFailed: 'ምዝገባ አልተሳካም። እባክዎ ይሞክሩ።',
      nameRequired: 'ሙሉ ስም ያስፈልጋል',
      emailRequired: 'ኢሜይል ያስፈልጋል',
      emailInvalid: 'እባክዎ ትክክለኛ የኢሜይል አድራሻ ያስገቡ',
      passwordRequired: 'የይለፍ ቃል ያስፈልጋል',
      passwordMinLength: 'የይለፍ ቃል ቢያንስ 6 ቁምፊዎች መሆን አለበት',
      passwordsNotMatch: 'የይለፍ ቃሎች አይዛመዱም',
      phoneInvalid: 'እባክዎ ትክክለኛ የስልክ ቁጥር ያስገቡ'
    }
  };

  const t = translations[language as keyof typeof translations] || translations.en;

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = t.nameRequired;
    }

    if (!formData.email.trim()) {
      newErrors.email = t.emailRequired;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t.emailInvalid;
    }

    if (!formData.password) {
      newErrors.password = t.passwordRequired;
    } else if (formData.password.length < 6) {
      newErrors.password = t.passwordMinLength;
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = t.passwordsNotMatch;
    }

    if (formData.phone && !/^\+?[0-9]{10,13}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = t.phoneInvalid;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          phone: formData.phone,
          role: formData.role
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccessMessage(t.registrationSuccess);
        if (data.token) {
          localStorage.setItem('token', data.token);
          localStorage.setItem('user', JSON.stringify(data.user));
        }
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      } else {
        setErrorMessage(data.message || t.registrationFailed);
      }
    } catch (error) {
      console.error('Registration error:', error);
      setErrorMessage(t.registrationFailed);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-white">
      {/* ENTIRE CARD IS GREEN */}
      <div className="max-w-md w-full bg-green-600 rounded-2xl shadow-2xl overflow-hidden">
        
        {/* Header Section */}
        <div className="p-8 text-center">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center bg-white">
            <UserIcon className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-white">
            {t.title}
          </h1>
          <p className="mt-1 text-green-100 text-sm">
            {t.subtitle}
          </p>
        </div>

        {/* Form Section */}
        <div className="p-8 pt-0">
          {/* Success Message */}
          {successMessage && (
            <div className="mb-6 p-3 bg-green-700 border border-green-400 rounded-lg flex items-center">
              <CheckCircleIcon className="w-5 h-5 text-white mr-2 flex-shrink-0" />
              <span className="text-white text-sm">{successMessage}</span>
            </div>
          )}

          {/* Error Message */}
          {errorMessage && (
            <div className="mb-6 p-3 bg-red-600 border border-red-400 rounded-lg flex items-center">
              <ExclamationTriangleIcon className="w-5 h-5 text-white mr-2 flex-shrink-0" />
              <span className="text-white text-sm">{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-white mb-1">
                {t.fullName} *
              </label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Full Name"
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-green-400 bg-white text-gray-400 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent transition-colors"
                />
              </div>
              {errors.name && (
                <p className="mt-1 text-xs text-red-200">{errors.name}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-white mb-1">
                {t.email} *
              </label>
              <div className="relative">
                <EnvelopeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-green-400 bg-white text-gray-400 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent transition-colors"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-xs text-red-200">{errors.email}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-white mb-1">
                {t.phone}
              </label>
              <div className="relative">
                <PhoneIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+251 911 234 567"
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-green-400 bg-white text-gray-400 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent transition-colors"
                />
              </div>
              {errors.phone && (
                <p className="mt-1 text-xs text-red-200">{errors.phone}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-white mb-1">
                {t.password} *
              </label>
              <div className="relative">
                <KeyIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="********"
                  className="w-full pl-10 pr-12 py-2.5 rounded-lg border border-green-400 bg-white text-gray-400 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-red-200">{errors.password}</p>
              )}
              <p className="mt-1 text-xs text-green-200">
                {t.passwordRequirements}
              </p>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-white mb-1">
                {t.confirmPassword} *
              </label>
              <div className="relative">
                <KeyIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="********"
                  className="w-full pl-10 pr-12 py-2.5 rounded-lg border border-green-400 bg-white text-gray-400 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-xs text-red-200">{errors.confirmPassword}</p>
              )}
            </div>

            {/* Hidden Role Selection */}
            <div className="hidden">
              <select name="role" value={formData.role} onChange={handleChange}>
                <option value="citizen">Citizen</option>
                <option value="officer">Officer</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            {/* Register Button - White background, green text */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-white hover:bg-gray-100 text-green-600 font-semibold rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 mr-2 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {t.registering}
                </>
              ) : (
                <>
                  {t.register}
                  <ArrowRightIcon className="w-4 h-4 ml-2" />
                </>
              )}
            </button>

            {/* Login Link - White text */}
            <div className="text-center pt-2">
              <p className="text-sm text-white">
                {t.alreadyHaveAccount}{' '}
                <Link href="/login" className="text-white underline hover:text-green-200 font-medium">
                  {t.loginHere}
                </Link>
              </p>
            </div>

            {/* Terms - White text */}
            <div className="text-center pt-2">
              <p className="text-xs text-green-200">
                {t.agreeToTerms}{' '}
                <Link href="/terms" className="text-white underline hover:text-green-200">
                  {t.termsOfService}
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}