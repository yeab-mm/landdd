// app/officer/transfers/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useLanguage } from '@/lib/LanguageContext'
import { useTranslation } from '@/lib/useTranslation'
import {
  MagnifyingGlassIcon,
  ArrowDownTrayIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  UserIcon,
  EyeIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

const API_URL = 'http://localhost:5000/api'

interface Transfer {
  id: number
  transferId: string
  landId?: string
  parcelId?: string
  seller: string
  buyer: string
  type?: string
  requestDate: string
  date?: string
  amount: number
  status: string
  documents?: number
  location?: string
  reason?: string
}

// Fallback data for demo
const fallbackTransfers: Transfer[] = [
  {
    id: 1,
    transferId: 'TR-2024-001',
    landId: 'BD-2024-003',
    seller: 'Tekle Berhan',
    buyer: 'Abebe Kebede',
    type: 'sale',
    requestDate: '2024-03-15',
    date: '2024-03-15',
    amount: 5800000,
    status: 'pending',
    documents: 3,
    location: 'Kebele 03, Polytechnic Area',
    reason: 'Sale of commercial property'
  },
  {
    id: 2,
    transferId: 'TR-2024-002',
    landId: 'BD-2024-005',
    seller: 'Tigist Haile',
    buyer: 'Biruk Alemu',
    type: 'sale',
    requestDate: '2024-03-14',
    date: '2024-03-14',
    amount: 7200000,
    status: 'pending',
    documents: 4,
    location: 'Kebele 02, Bezawit Area',
    reason: 'Sale of residential land'
  },
  {
    id: 3,
    transferId: 'TR-2024-003',
    landId: 'BD-2024-008',
    seller: 'Hailu Girmay',
    buyer: 'Meron Tadesse',
    type: 'sale',
    requestDate: '2024-03-13',
    date: '2024-03-13',
    amount: 11200000,
    status: 'approved',
    documents: 4,
    location: 'Kebele 08, Tis Abay',
    reason: 'Sale of agricultural land'
  }
]

export default function OfficerTransfersPage() {
  const { darkMode, language } = useLanguage()
  const { t } = useTranslation()
  const router = useRouter()
  const [transfers, setTransfers] = useState<Transfer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filterStatus, setFilterStatus] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    totalValue: 0
  })

  const itemsPerPage = 5

  const cn = (darkClass: string, lightClass: string) => darkMode ? darkClass : lightClass

  const getText = (en: string, am: string) => language === 'en' ? en : am

  const getAuthToken = () => localStorage.getItem('token')

  // Export to CSV
  const exportTransfers = () => {
    const filtered = getFilteredTransfers()
    
    const headers = ['Transfer ID', 'Land ID', 'Seller', 'Buyer', 'Request Date', 'Amount', 'Status']
    const rows = filtered.map(t => [
      t.transferId,
      t.landId || t.parcelId || 'N/A',
      t.seller,
      t.buyer,
      t.requestDate || t.date || 'N/A',
      t.amount,
      t.status
    ])
    
    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `transfers_${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
    
    toast.success(getText('Exported successfully!', 'በሚገባ ተልኳል!'))
  }

  // Fetch transfers
  const fetchTransfers = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const token = getAuthToken()
      if (!token) {
        router.push('/login')
        return
      }

      // Try officer endpoint first
      let response = await fetch(`${API_URL}/officer/transfers`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      // If not found, try admin endpoint
      if (response.status === 404) {
        response = await fetch(`${API_URL}/admin/transfers`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      }

      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem('token')
        router.push('/login')
        return
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const data = await response.json()
      const transfersData = data.transfers || []
      setTransfers(transfersData)
      
      setStats({
        total: transfersData.length,
        pending: transfersData.filter((t: Transfer) => t.status === 'pending').length,
        approved: transfersData.filter((t: Transfer) => t.status === 'approved' || t.status === 'completed').length,
        totalValue: transfersData.reduce((sum: number, t: Transfer) => sum + (t.amount || 0), 0)
      })
    } catch (err) {
      console.error('Error fetching transfers:', err)
      setError('Using demo data')
      toast.error('Failed to load transfers, using demo data')
      setTransfers(fallbackTransfers)
      setStats({
        total: fallbackTransfers.length,
        pending: fallbackTransfers.filter(t => t.status === 'pending').length,
        approved: fallbackTransfers.filter(t => t.status === 'approved').length,
        totalValue: fallbackTransfers.reduce((sum, t) => sum + (t.amount || 0), 0)
      })
    } finally {
      setLoading(false)
    }
  }

  // Update status
  const updateStatus = async (id: number, status: string) => {
    try {
      const token = getAuthToken()
      
      // Try officer endpoint first
      let response = await fetch(`${API_URL}/officer/transfers/${id}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      })

      // If not found, try admin endpoint
      if (response.status === 404) {
        response = await fetch(`${API_URL}/admin/transfers/${id}/status`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ status })
        })
      }

      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem('token')
        router.push('/login')
        return
      }

      if (response.ok) {
        toast.success(getText(`Transfer ${status}!`, `ዝውውሩ ${status === 'approved' ? 'ጸድቋል' : 'ውድቅ ተደርጓል'}`))
        fetchTransfers()
      } else {
        // Update locally as fallback
        setTransfers(prev => prev.map(t => 
          t.id === id ? { ...t, status: status } : t
        ))
        toast.success(getText(`Transfer ${status} (Demo)`, `ዝውውሩ ${status === 'approved' ? 'ጸድቋል' : 'ውድቅ ተደርጓል'} (ማሳያ)`))
      }
    } catch (err) {
      console.error('Error updating status:', err)
      // Update locally as fallback
      setTransfers(prev => prev.map(t => 
        t.id === id ? { ...t, status: status } : t
      ))
      toast.success(getText(`Transfer ${status} (Demo)`, `ዝውውሩ ${status === 'approved' ? 'ጸድቋል' : 'ውድቅ ተደርጓል'} (ማሳያ)`))
    }
  }

  const getFilteredTransfers = () => {
    let filtered = transfers
    
    if (filterStatus !== 'all') {
      filtered = filtered.filter(t => t.status === filterStatus)
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(t => 
        t.transferId.toLowerCase().includes(query) ||
        t.seller.toLowerCase().includes(query) ||
        t.buyer.toLowerCase().includes(query) ||
        (t.landId && t.landId.toLowerCase().includes(query)) ||
        (t.parcelId && t.parcelId.toLowerCase().includes(query))
      )
    }
    
    return filtered
  }

  const clearFilters = () => {
    setFilterStatus('all')
    setSearchQuery('')
    setCurrentPage(1)
  }

  useEffect(() => {
    fetchTransfers()
  }, [])

  const getStatusBadge = (status: string) => {
    if (status === 'approved' || status === 'completed') {
      return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
        <CheckCircleIcon className="w-3 h-3 mr-1" />
        {getText('Approved', 'ጸድቋል')}
      </span>
    }
    if (status === 'rejected') {
      return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
        <XCircleIcon className="w-3 h-3 mr-1" />
        {getText('Rejected', 'ውድቅ ተደርጓል')}
      </span>
    }
    return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
      <ClockIcon className="w-3 h-3 mr-1" />
      {getText('Pending', 'በመጠባበቅ ላይ')}
    </span>
  }

  const formatPrice = (price: number): string => {
    if (language === 'am') return `ብር ${price.toLocaleString()}`
    return `ETB ${price.toLocaleString()}`
  }

  const formatDate = (date: string): string => {
    if (!date) return 'N/A'
    return new Date(date).toLocaleDateString(language === 'am' ? 'am-ET' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const filteredTransfers = getFilteredTransfers()
  const totalPages = Math.ceil(filteredTransfers.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedTransfers = filteredTransfers.slice(startIndex, startIndex + itemsPerPage)

  if (loading && transfers.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {getText('Transfer Requests', 'የዝውውር ጥያቄዎች')}
          </h2>
          <p className={`mt-1 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            {getText(`Total ${stats.total} transfer requests`, `በአጠቃላይ ${stats.total} የዝውውር ጥያቄዎች`)}
          </p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={fetchTransfers}
            className={`p-2 rounded-lg transition-colors ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
            title={getText('Refresh', 'አድስ')}
          >
            <ArrowPathIcon className={`w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
          </button>
          <button 
            onClick={exportTransfers}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center ${
              darkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-white hover:bg-gray-50 border border-gray-300 text-gray-700'
            }`}
          >
            <ArrowDownTrayIcon className="w-4 h-4 mr-2" />
            {getText('Export', 'ላክ')}
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-yellow-500/20 border border-yellow-500 rounded-lg p-4 text-yellow-500 text-sm">
          ⚠️ {error}
          <button onClick={fetchTransfers} className="ml-4 underline">{getText('Retry', 'እንደገና ሞክር')}</button>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className={`rounded-lg p-4 ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{getText('Total Requests', 'ጠቅላላ ጥያቄዎች')}</p>
          <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{stats.total}</p>
        </div>
        <div className={`rounded-lg p-4 ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{getText('Pending', 'በመጠባበቅ ላይ')}</p>
          <p className="text-2xl font-bold text-yellow-500">{stats.pending}</p>
        </div>
        <div className={`rounded-lg p-4 ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{getText('Approved', 'ጸድቋል')}</p>
          <p className="text-2xl font-bold text-green-500">{stats.approved}</p>
        </div>
        <div className={`rounded-lg p-4 ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{getText('Total Value', 'ጠቅላላ ዋጋ')}</p>
          <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{formatPrice(stats.totalValue)}</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className={`rounded-lg shadow-sm p-4 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder={getText('Search by ID, seller, or buyer...', 'በመታወቂያ፣ በሻጭ ወይም በገዢ ስም ፈልግ...')}
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1) }}
                className={`w-full pl-9 pr-4 py-2 rounded-lg text-sm border focus:outline-none focus:ring-2 focus:ring-green-500 ${
                  darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-gray-50 border-gray-300 text-gray-900'
                }`}
              />
            </div>
          </div>
          
          <select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1) }}
            className={`px-4 py-2 rounded-lg text-sm border focus:outline-none focus:ring-2 focus:ring-green-500 ${
              darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
            }`}>
            <option value="all">{getText('All Status', 'ሁሉም ሁኔታ')}</option>
            <option value="pending">{getText('Pending', 'በመጠባበቅ ላይ')}</option>
            <option value="approved">{getText('Approved', 'ጸድቋል')}</option>
            <option value="rejected">{getText('Rejected', 'ውድቅ ተደርጓል')}</option>
          </select>

          {(filterStatus !== 'all' || searchQuery) && (
            <button onClick={clearFilters}
              className="text-sm text-green-500 hover:text-green-400 flex items-center">
              <XMarkIcon className="w-4 h-4 mr-1" />
              {getText('Clear Filters', 'ማጣሪያዎችን አጽዳ')}
            </button>
          )}
        </div>
      </div>

      {/* Transfers Table */}
      <div className={`rounded-lg shadow-sm overflow-hidden ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
        {filteredTransfers.length === 0 ? (
          <div className="text-center py-12">
            <ArrowPathIcon className="w-12 h-12 mx-auto text-gray-400 mb-3" />
            <p className={darkMode ? 'text-gray-400' : 'text-gray-500'}>
              {getText('No transfer requests found', 'ምንም የዝውውር ጥያቄዎች አልተገኙም')}
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className={darkMode ? 'bg-gray-700/50' : 'bg-gray-50'}>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{getText('Transfer ID', 'የዝውውር መለያ')}</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{getText('Land ID', 'የመሬት መለያ')}</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{getText('Seller', 'ሻጭ')}</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{getText('Buyer', 'ገዢ')}</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{getText('Date', 'ቀን')}</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{getText('Amount', 'ዋጋ')}</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{getText('Status', 'ሁኔታ')}</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{getText('Actions', 'ድርጊቶች')}</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                  {paginatedTransfers.map((item) => (
                    <tr key={item.id} className={darkMode ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'}>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">{item.transferId}</td>
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{item.landId || item.parcelId || 'N/A'}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <UserIcon className="w-4 h-4 text-gray-400 mr-2" />
                          <span className="text-gray-900 dark:text-white">{item.seller}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <UserIcon className="w-4 h-4 text-gray-400 mr-2" />
                          <span className="text-gray-900 dark:text-white">{item.buyer}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{formatDate(item.requestDate || item.date || '')}</td>
                      <td className="px-6 py-4">
                        {item.amount > 0 ? (
                          <span className="text-green-600 dark:text-green-400 font-semibold">{formatPrice(item.amount)}</span>
                        ) : (
                          <span className="text-gray-400">N/A</span>
                        )}
                      </td>
                      <td className="px-6 py-4">{getStatusBadge(item.status)}</td>
                      <td className="px-6 py-4">
                        <div className="flex space-x-2">
                          <button className="text-blue-500 hover:text-blue-400">
                            <EyeIcon className="w-5 h-5" />
                          </button>
                          {item.status === 'pending' && (
                            <>
                              <button onClick={() => updateStatus(item.id, 'approved')} className="text-green-500 hover:text-green-400">
                                <CheckCircleIcon className="w-5 h-5" />
                              </button>
                              <button onClick={() => updateStatus(item.id, 'rejected')} className="text-red-500 hover:text-red-400">
                                <XCircleIcon className="w-5 h-5" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className={`px-6 py-4 border-t flex items-center justify-between ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} 
                  className={`px-3 py-1 rounded disabled:opacity-50 ${
                    darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}>
                  <ChevronLeftIcon className="w-4 h-4 inline" /> {getText('Previous', 'ቀዳሚ')}
                </button>
                <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                  {getText('Page', 'ገጽ')} {currentPage} {getText('of', 'ከ')} {totalPages}
                </span>
                <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} 
                  className={`px-3 py-1 rounded disabled:opacity-50 ${
                    darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}>
                  {getText('Next', 'ቀጣይ')} <ChevronRightIcon className="w-4 h-4 inline" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}