// app/officer/payments/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useLanguage } from '@/lib/LanguageContext'
import { useTranslation } from '@/lib/useTranslation'
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowDownTrayIcon,
  CreditCardIcon,
  CurrencyDollarIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  UserIcon,
  CalendarIcon,
  DocumentTextIcon,
  BuildingStorefrontIcon,
  EyeIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  BanknotesIcon,
  ReceiptPercentIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

const API_URL = 'http://localhost:5000/api'

export default function PaymentsPage() {
  const { darkMode } = useLanguage()
  const { t } = useTranslation()
  const { language } = useLanguage()
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterMethod, setFilterMethod] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedTransaction, setSelectedTransaction] = useState<string | null>(null)
  const [transactions, setTransactions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const cn = (darkClass: string, lightClass: string) => darkMode ? darkClass : lightClass

  // Translation helper function
  const translate = (key: string): string => {
    const translations: Record<string, { en: string; am: string }> = {
      pageTitle: { en: 'Payment Transactions', am: 'የክፍያ ግብይቶች' },
      totalTransactions: { en: 'Total {count} transactions', am: 'በአጠቃላይ {count} ግብይቶች' },
      filter: { en: 'Filter', am: 'አጣራ' },
      export: { en: 'Export', am: 'ላክ' },
      viewReceipt: { en: 'View Receipt', am: 'ደረሰኝ ተመልከት' },
      downloadReceipt: { en: 'Download Receipt', am: 'ደረሰኝ አውርድ' },
      clearFilters: { en: 'Clear Filters', am: 'ማጣሪያዎችን አጽዳ' },
      searchPlaceholder: { en: 'Search by ID, payer, or reference...', am: 'በመታወቂያ፣ በከፋይ ወይም በማጣቀሻ ቁጥር ፈልግ...' },
      allStatus: { en: 'All Status', am: 'ሁሉም ሁኔታ' },
      allMethods: { en: 'All Methods', am: 'ሁሉም ዘዴዎች' },
      completed: { en: 'Completed', am: 'ተጠናቋል' },
      pending: { en: 'Pending', am: 'በመጠባበቅ ላይ' },
      failed: { en: 'Failed', am: 'አልተሳካም' },
      refunded: { en: 'Refunded', am: 'ተመላሽ ተደርጓል' },
      telebirr: { en: 'Telebirr', am: 'ቴሌ ብር' },
      cbeBirr: { en: 'CBE Birr', am: 'ሲቢኢ ብር' },
      bankTransfer: { en: 'Bank Transfer', am: 'የባንክ ዝውውር' },
      cash: { en: 'Cash', am: 'ጥሬ ገንዘብ' },
      creditCard: { en: 'Credit Card', am: 'ክሬዲት ካርድ' },
      landPurchase: { en: 'Land Purchase', am: 'የመሬት ግዢ' },
      verificationFee: { en: 'Verification Fee', am: 'የማረጋገጫ ክፍያ' },
      transferFee: { en: 'Transfer Fee', am: 'የዝውውር ክፍያ' },
      serviceFee: { en: 'Service Fee', am: 'የአገልግሎት ክፍያ' },
      registrationFee: { en: 'Registration Fee', am: 'የምዝገባ ክፍያ' },
      transactionId: { en: 'Transaction ID', am: 'የግብይት መታወቂያ' },
      payer: { en: 'Payer', am: 'ከፋይ' },
      amount: { en: 'Amount', am: 'መጠን' },
      method: { en: 'Method', am: 'ዘዴ' },
      type: { en: 'Type', am: 'አይነት' },
      date: { en: 'Date', am: 'ቀን' },
      reference: { en: 'Reference', am: 'ማጣቀሻ' },
      status: { en: 'Status', am: 'ሁኔታ' },
      action: { en: 'Action', am: 'ድርጊት' },
      transactionDetails: { en: 'Transaction Details', am: 'የግብይት ዝርዝሮች' },
      paymentMethod: { en: 'Payment Method', am: 'የክፍያ ዘዴ' },
      transactionDate: { en: 'Transaction Date', am: 'የግብይት ቀን' },
      transactionTime: { en: 'Transaction Time', am: 'የግብይት ሰዓት' },
      referenceNumber: { en: 'Reference Number', am: 'የማጣቀሻ ቁጥር' },
      description: { en: 'Description', am: 'መግለጫ' },
      totalRevenue: { en: 'Total Revenue', am: 'ጠቅላላ ገቢ' },
      todayRevenue: { en: "Today's Revenue", am: 'የዛሬ ገቢ' },
      pendingAmount: { en: 'Pending Amount', am: 'በመጠባበቅ ላይ ያለ መጠን' },
      totalTransactions_card: { en: 'Total Transactions', am: 'ጠቅላላ ግብይቶች' },
      noTransactions: { en: 'No transactions found', am: 'ምንም ግብይቶች አልተገኙም' },
      showing: { en: 'Showing {start} to {end} of {total} results', am: '{start} እስከ {end} ከ {total} ውጤቶች እየታየ ነው' },
      previous: { en: 'Previous', am: 'ቀዳሚ' },
      next: { en: 'Next', am: 'ቀጣይ' },
      paymentReceipt: { en: 'Payment Receipt', am: 'የክፍያ ደረሰኝ' },
      receiptId: { en: 'Receipt ID', am: 'የደረሰኝ መታወቂያ' },
      generatedOn: { en: 'Generated on', am: 'የተዘጋጀበት ቀን' },
      printReceipt: { en: 'Print Receipt', am: 'ደረሰኝ አትም' },
      close: { en: 'Close', am: 'ዝጋ' },
      viewAll: { en: 'View All', am: 'ሁሉንም ተመልከት' },
      january: { en: 'January', am: 'ጥር' },
      february: { en: 'February', am: 'የካቲት' },
      march: { en: 'March', am: 'መጋቢት' },
      april: { en: 'April', am: 'ሚያዝያ' },
      may: { en: 'May', am: 'ግንቦት' },
      june: { en: 'June', am: 'ሰኔ' },
      july: { en: 'July', am: 'ሐምሌ' },
      august: { en: 'August', am: 'ነሐሴ' },
      september: { en: 'September', am: 'መስከረም' },
      october: { en: 'October', am: 'ጥቅምት' },
      november: { en: 'November', am: 'ህዳር' },
      december: { en: 'December', am: 'ታህሳስ' },
    }
    
    return translations[key]?.[language] || key
  }

  const getUserName = (nameKey: string): string => {
    const userNames: Record<string, { en: string; am: string }> = {
      abebe: { en: 'Abebe Kebede', am: 'አበበ ከበደ' },
      tigist: { en: 'Tigist Haile', am: 'ትግስት ኃይሌ' },
      biruk: { en: 'Biruk Alemu', am: 'ብሩክ አለሙ' },
      meron: { en: 'Meron Tadesse', am: 'ሜሮን ታደሰ' },
      alemitu: { en: 'Alemitu Bekele', am: 'አለሚቱ በቀለ' },
      tekle: { en: 'Tekle Berhan', am: 'ተክሌ ብርሃን' },
      senait: { en: 'Senait Gebre', am: 'ሰናይት ገብረ' },
      mulugeta: { en: 'Mulugeta Ayele', am: 'ሙሉጌታ አየለ' },
      abebech: { en: 'Abebech Ayele', am: 'አበበች አየለ' },
      kassa: { en: 'Kassa Wondimu', am: 'ካሳ ወንድሙ' },
      mekdes: { en: 'Mekdes Tesfaye', am: 'መቅደስ ተስፋዬ' },
      yonas: { en: 'Yonas Desta', am: 'ዮናስ ደስታ' },
    }
    return userNames[nameKey]?.[language] || nameKey
  }

  const formatPrice = (price: number): string => {
    if (language === 'am') {
      return `ብር ${price.toLocaleString()}`
    }
    return `ETB ${price.toLocaleString()}`
  }

  const formatDate = (date: string): string => {
    const dateObj = new Date(date)
    if (language === 'am') {
      const month = dateObj.getMonth()
      const day = dateObj.getDate()
      const monthNames = [
        translate('september'), translate('october'), translate('november'), translate('december'),
        translate('january'), translate('february'), translate('march'), translate('april'),
        translate('may'), translate('june'), translate('july'), translate('august'),
      ]
      const ethiopianMonthIndex = (month + 4) % 12
      const ethiopianMonth = monthNames[ethiopianMonthIndex]
      return `${ethiopianMonth} ${day}`
    }
    return dateObj.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
  }

  const getEthiopianMonth = (dateStr: string): string => {
    const date = new Date(dateStr)
    const month = date.getMonth()
    const monthNames = [
      translate('september'), translate('october'), translate('november'), translate('december'),
      translate('january'), translate('february'), translate('march'), translate('april'),
      translate('may'), translate('june'), translate('july'), translate('august'),
    ]
    const ethiopianMonthIndex = (month + 4) % 12
    return monthNames[ethiopianMonthIndex]
  }

  // Fetch payments from backend
  const fetchPayments = async () => {
    try {
      setLoading(true)
      setError(null)
      const token = localStorage.getItem('token')
      
      if (!token) {
        window.location.href = '/login'
        return
      }

      let response = await fetch(`${API_URL}/officer/payments`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (response.status === 404) {
        response = await fetch(`${API_URL}/admin/payments`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      }

      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem('token')
        window.location.href = '/login'
        return
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const data = await response.json()
      const paymentsList = data.payments || []
      
      // Convert to transaction format
      const formattedTransactions = paymentsList.map((payment: any, index: number) => ({
        id: payment.transactionId || `TXN-${String(index + 1).padStart(3, '0')}`,
        payer: payment.payerName?.toLowerCase().split(' ')[0] || 'customer',
        amount: payment.amount,
        method: payment.method || 'telebirr',
        type: payment.type || 'landPurchase',
        date: payment.date || new Date().toISOString().split('T')[0],
        time: '10:30 AM',
        reference: payment.reference || `REF-${String(index + 1).padStart(3, '0')}`,
        status: payment.status || 'completed',
        description: `${payment.type} payment`,
        descriptionAm: `${payment.type === 'landPurchase' ? 'የመሬት ግዢ' : 'ክፍያ'}`,
      }))
      
      setTransactions(formattedTransactions)
    } catch (error) {
      console.error('Fetch error:', error)
      setError('Failed to load payments')
      toast.error('Failed to load payments')
      // Fallback to sample data
      setTransactions([
        { id: 'TXN-2024-001', payer: 'abebe', amount: 8500000, method: 'telebirr', type: 'landPurchase', date: '2024-03-15', time: '10:30 AM', reference: 'TB-1234-5678', status: 'completed', description: 'Purchase of Commercial Plot', descriptionAm: 'የንግድ መሬት ግዢ' },
        { id: 'TXN-2024-002', payer: 'tigist', amount: 3200000, method: 'cbeBirr', type: 'landPurchase', date: '2024-03-14', time: '02:15 PM', reference: 'CBE-8765-4321', status: 'completed', description: 'Purchase of Residential Land', descriptionAm: 'የመኖሪያ መሬት ግዢ' },
        { id: 'TXN-2024-003', payer: 'biruk', amount: 2500, method: 'telebirr', type: 'verificationFee', date: '2024-03-14', time: '11:45 AM', reference: 'TB-9876-5432', status: 'completed', description: 'Land verification fee', descriptionAm: 'የመሬት ማረጋገጫ ክፍያ' },
      ])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPayments()
  }, [])

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { color: string; icon: any; text: string }> = {
      completed: { color: 'green', icon: CheckCircleIcon, text: translate('completed') },
      pending: { color: 'yellow', icon: ClockIcon, text: translate('pending') },
      failed: { color: 'red', icon: XCircleIcon, text: translate('failed') },
      refunded: { color: 'gray', icon: XCircleIcon, text: translate('refunded') },
    }
    const config = statusConfig[status]
    if (!config) return <span>{status}</span>
    const Icon = config.icon
    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-${config.color}-100 text-${config.color}-800 dark:bg-${config.color}-900/30 dark:text-${config.color}-400`}>
        <Icon className="w-3 h-3 mr-1" />
        {config.text}
      </span>
    )
  }

  const getMethodBadge = (method: string) => {
    const methodConfig: Record<string, { color: string; text: string }> = {
      telebirr: { color: 'blue', text: translate('telebirr') },
      cbeBirr: { color: 'purple', text: translate('cbeBirr') },
      bankTransfer: { color: 'green', text: translate('bankTransfer') },
      cash: { color: 'gray', text: translate('cash') },
      creditCard: { color: 'yellow', text: translate('creditCard') },
    }
    const config = methodConfig[method]
    if (!config) return <span>{method}</span>
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-${config.color}-100 text-${config.color}-800 dark:bg-${config.color}-900/30 dark:text-${config.color}-400`}>
        {config.text}
      </span>
    )
  }

  const getTypeIcon = (type: string) => {
    switch(type) {
      case 'landPurchase': return <BuildingStorefrontIcon className="w-4 h-4" />
      case 'verificationFee':
      case 'registrationFee': return <DocumentTextIcon className="w-4 h-4" />
      case 'transferFee': return <CurrencyDollarIcon className="w-4 h-4" />
      case 'serviceFee': return <ReceiptPercentIcon className="w-4 h-4" />
      default: return <CreditCardIcon className="w-4 h-4" />
    }
  }

  const filteredTransactions = transactions.filter(item => {
    const payerName = getUserName(item.payer).toLowerCase()
    const searchLower = searchQuery.toLowerCase()
    const matchesSearch = searchQuery === '' || 
      item.id.toLowerCase().includes(searchLower) ||
      payerName.includes(searchLower) ||
      item.reference?.toLowerCase().includes(searchLower) ||
      item.description?.toLowerCase().includes(searchLower)
    const matchesStatus = filterStatus === 'all' || item.status === filterStatus
    const matchesMethod = filterMethod === 'all' || item.method === filterMethod
    return matchesSearch && matchesStatus && matchesMethod
  })

  const totalRevenue = transactions
    .filter(t => t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0)
  
  const todayRevenue = transactions
    .filter(t => t.status === 'completed' && t.date === new Date().toISOString().split('T')[0])
    .reduce((sum, t) => sum + t.amount, 0)
  
  const pendingAmount = transactions
    .filter(t => t.status === 'pending')
    .reduce((sum, t) => sum + t.amount, 0)

  const itemsPerPage = 5
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedTransactions = filteredTransactions.slice(startIndex, startIndex + itemsPerPage)

  const ReceiptModal = ({ transactionId, onClose }: { transactionId: string | null, onClose: () => void }) => {
    if (!transactionId) return null
    const transaction = transactions.find(t => t.id === transactionId)
    if (!transaction) return null
    
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className={`${cn('bg-gray-800', 'bg-white')} rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto`}>
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className={`${cn('text-white', 'text-gray-900')} text-xl font-bold`}>{translate('paymentReceipt')}</h3>
              <button onClick={onClose} className={`${cn('text-gray-400 hover:text-gray-300', 'text-gray-600 hover:text-gray-800')}`}>✕</button>
            </div>
            <div className={`${cn('bg-gray-700', 'bg-gray-50')} rounded-lg p-6 mb-6`}>
              <div className="text-center mb-6">
                <h4 className={`${cn('text-white', 'text-gray-900')} text-2xl font-bold`}>BAHIR DAR CITY</h4>
                <p className={`${cn('text-gray-400', 'text-gray-600')}`}>Land Administration Office</p>
                <p className={`${cn('text-gray-400', 'text-gray-600')} text-sm`}>{translate('paymentReceipt')}</p>
              </div>
              <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-600">
                <span className={`${cn('text-gray-400', 'text-gray-600')}`}>{translate('receiptId')}:</span>
                <span className={`${cn('text-white', 'text-gray-900')} font-mono`}>{transaction.id}</span>
              </div>
              <div className="space-y-3 mb-4">
                <div className="flex justify-between"><span className={`${cn('text-gray-400', 'text-gray-600')}`}>{translate('date')}:</span><span className={`${cn('text-white', 'text-gray-900')}`}>{language === 'am' ? `${getEthiopianMonth(transaction.date)} ${new Date(transaction.date).getDate()}` : formatDate(transaction.date)}</span></div>
                <div className="flex justify-between"><span className={`${cn('text-gray-400', 'text-gray-600')}`}>{translate('transactionTime')}:</span><span className={`${cn('text-white', 'text-gray-900')}`}>{transaction.time}</span></div>
                <div className="flex justify-between"><span className={`${cn('text-gray-400', 'text-gray-600')}`}>{translate('payer')}:</span><span className={`${cn('text-white', 'text-gray-900')}`}>{getUserName(transaction.payer)}</span></div>
                <div className="flex justify-between"><span className={`${cn('text-gray-400', 'text-gray-600')}`}>{translate('paymentMethod')}:</span><span className={`${cn('text-white', 'text-gray-900')}`}>{translate(transaction.method)}</span></div>
                <div className="flex justify-between"><span className={`${cn('text-gray-400', 'text-gray-600')}`}>{translate('referenceNumber')}:</span><span className={`${cn('text-white', 'text-gray-900')} font-mono`}>{transaction.reference}</span></div>
                <div className="flex justify-between"><span className={`${cn('text-gray-400', 'text-gray-600')}`}>{translate('type')}:</span><span className={`${cn('text-white', 'text-gray-900')}`}>{translate(transaction.type)}</span></div>
                <div className="flex justify-between"><span className={`${cn('text-gray-400', 'text-gray-600')}`}>{translate('description')}:</span><span className={`${cn('text-white', 'text-gray-900')} text-right max-w-[250px]`}>{language === 'am' ? transaction.descriptionAm : transaction.description}</span></div>
              </div>
              <div className="flex justify-between items-center pt-4 border-t border-gray-600">
                <span className={`${cn('text-gray-400', 'text-gray-600')} text-lg font-semibold`}>{translate('amount')}:</span>
                <span className="text-green-500 text-2xl font-bold">{formatPrice(transaction.amount)}</span>
              </div>
              <div className="mt-6 text-center">
                <p className={`${cn('text-gray-400', 'text-gray-600')} text-xs`}>{translate('generatedOn')} {language === 'am' ? `${getEthiopianMonth(new Date().toISOString())} ${new Date().getDate()}` : new Date().toLocaleDateString()}</p>
                <p className={`${cn('text-gray-400', 'text-gray-600')} text-xs mt-1`}>This is a computer generated receipt</p>
              </div>
            </div>
            <div className="flex justify-end space-x-3">
              <button onClick={() => window.print()} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">📄 {translate('printReceipt')}</button>
              <button onClick={onClose} className={`px-4 py-2 ${cn('bg-gray-700 hover:bg-gray-600', 'bg-gray-200 hover:bg-gray-300')} rounded-lg`}>{translate('close')}</button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg">
          <p className="font-bold">Error</p>
          <p>{error}</p>
          <button onClick={fetchPayments} className="mt-2 bg-red-600 text-white px-3 py-1 rounded text-sm flex items-center gap-2">
            <ArrowPathIcon className="w-4 h-4" />
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className={`${cn('text-white', 'text-gray-900')} text-2xl font-bold`}>{translate('pageTitle')}</h2>
          <p className={`${cn('text-gray-400', 'text-gray-600')} mt-1`}>{translate('totalTransactions').replace('{count}', filteredTransactions.length.toString())}</p>
        </div>
        <div className="flex space-x-3">
          <button onClick={fetchPayments} className={`${cn('bg-gray-700 hover:bg-gray-600', 'bg-white hover:bg-gray-50 border border-gray-300')} px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center`}>
            <ArrowPathIcon className="w-4 h-4 mr-2" />
            Refresh
          </button>
          <button className={`${cn('bg-gray-700 hover:bg-gray-600', 'bg-white hover:bg-gray-50 border border-gray-300')} px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center`}>
            <ArrowDownTrayIcon className="w-4 h-4 mr-2" />
            {translate('export')}
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className={`${cn('bg-gray-800', 'bg-white')} rounded-lg p-4`}>
          <div className="flex items-center justify-between">
            <div><p className={`${cn('text-gray-400', 'text-gray-600')} text-sm`}>{translate('totalRevenue')}</p><p className={`${cn('text-white', 'text-gray-900')} text-2xl font-bold`}>{formatPrice(totalRevenue)}</p></div>
            <div className="p-3 bg-green-500/20 rounded-lg"><CurrencyDollarIcon className="w-6 h-6 text-green-500" /></div>
          </div>
        </div>
        <div className={`${cn('bg-gray-800', 'bg-white')} rounded-lg p-4`}>
          <div className="flex items-center justify-between">
            <div><p className={`${cn('text-gray-400', 'text-gray-600')} text-sm`}>{translate('todayRevenue')}</p><p className={`${cn('text-white', 'text-gray-900')} text-2xl font-bold`}>{formatPrice(todayRevenue)}</p></div>
            <div className="p-3 bg-blue-500/20 rounded-lg"><BanknotesIcon className="w-6 h-6 text-blue-500" /></div>
          </div>
        </div>
        <div className={`${cn('bg-gray-800', 'bg-white')} rounded-lg p-4`}>
          <div className="flex items-center justify-between">
            <div><p className={`${cn('text-gray-400', 'text-gray-600')} text-sm`}>{translate('pendingAmount')}</p><p className={`${cn('text-white', 'text-gray-900')} text-2xl font-bold`}>{formatPrice(pendingAmount)}</p></div>
            <div className="p-3 bg-yellow-500/20 rounded-lg"><ClockIcon className="w-6 h-6 text-yellow-500" /></div>
          </div>
        </div>
        <div className={`${cn('bg-gray-800', 'bg-white')} rounded-lg p-4`}>
          <div className="flex items-center justify-between">
            <div><p className={`${cn('text-gray-400', 'text-gray-600')} text-sm`}>{translate('totalTransactions_card')}</p><p className={`${cn('text-white', 'text-gray-900')} text-2xl font-bold`}>{transactions.length}</p></div>
            <div className="p-3 bg-purple-500/20 rounded-lg"><CreditCardIcon className="w-6 h-6 text-purple-500" /></div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className={`${cn('bg-gray-800', 'bg-white')} rounded-lg shadow-lg p-4`}>
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="text" placeholder={translate('searchPlaceholder')} value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1) }} className={`w-full pl-9 pr-4 py-2 rounded-lg text-sm ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-gray-100 border-gray-300 text-gray-900 placeholder-gray-500'} border focus:outline-none focus:ring-2 focus:ring-green-500`} />
            </div>
          </div>
          <select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1) }} className={`px-4 py-2 rounded-lg text-sm ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} border focus:outline-none focus:ring-2 focus:ring-green-500`}>
            <option value="all">{translate('allStatus')}</option>
            <option value="completed">{translate('completed')}</option>
            <option value="pending">{translate('pending')}</option>
            <option value="failed">{translate('failed')}</option>
            <option value="refunded">{translate('refunded')}</option>
          </select>
          <select value={filterMethod} onChange={(e) => { setFilterMethod(e.target.value); setCurrentPage(1) }} className={`px-4 py-2 rounded-lg text-sm ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} border focus:outline-none focus:ring-2 focus:ring-green-500`}>
            <option value="all">{translate('allMethods')}</option>
            <option value="telebirr">{translate('telebirr')}</option>
            <option value="cbeBirr">{translate('cbeBirr')}</option>
            <option value="bankTransfer">{translate('bankTransfer')}</option>
            <option value="cash">{translate('cash')}</option>
            <option value="creditCard">{translate('creditCard')}</option>
          </select>
          {(filterStatus !== 'all' || filterMethod !== 'all' || searchQuery) && (
            <button onClick={() => { setFilterStatus('all'); setFilterMethod('all'); setSearchQuery(''); setCurrentPage(1) }} className="text-sm text-green-500 hover:text-green-400">{translate('clearFilters')}</button>
          )}
        </div>
      </div>

      {/* Transactions Table */}
      <div className={`${cn('bg-gray-800', 'bg-white')} rounded-lg shadow-lg overflow-hidden`}>
        {filteredTransactions.length === 0 ? (
          <div className="text-center py-12">
            <CreditCardIcon className="w-12 h-12 mx-auto text-gray-400 mb-3" />
            <p className={`${cn('text-gray-300', 'text-gray-600')}`}>{translate('noTransactions')}</p>
            <button onClick={() => { setFilterStatus('all'); setFilterMethod('all'); setSearchQuery('') }} className="mt-2 text-sm text-green-500 hover:text-green-400">{translate('clearFilters')}</button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className={`${cn('bg-gray-700/50', 'bg-gray-50')}`}>
                  <tr>
                    <th className={`${cn('text-gray-300', 'text-gray-600')} text-left px-6 py-3 text-xs font-medium uppercase tracking-wider`}>{translate('transactionId')}</th>
                    <th className={`${cn('text-gray-300', 'text-gray-600')} text-left px-6 py-3 text-xs font-medium uppercase tracking-wider`}>{translate('payer')}</th>
                    <th className={`${cn('text-gray-300', 'text-gray-600')} text-left px-6 py-3 text-xs font-medium uppercase tracking-wider`}>{translate('amount')}</th>
                    <th className={`${cn('text-gray-300', 'text-gray-600')} text-left px-6 py-3 text-xs font-medium uppercase tracking-wider`}>{translate('method')}</th>
                    <th className={`${cn('text-gray-300', 'text-gray-600')} text-left px-6 py-3 text-xs font-medium uppercase tracking-wider`}>{translate('type')}</th>
                    <th className={`${cn('text-gray-300', 'text-gray-600')} text-left px-6 py-3 text-xs font-medium uppercase tracking-wider`}>{translate('date')}</th>
                    <th className={`${cn('text-gray-300', 'text-gray-600')} text-left px-6 py-3 text-xs font-medium uppercase tracking-wider`}>{translate('status')}</th>
                    <th className={`${cn('text-gray-300', 'text-gray-600')} text-left px-6 py-3 text-xs font-medium uppercase tracking-wider`}>{translate('action')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {paginatedTransactions.map((item) => (
                    <tr key={item.id} className={`${cn('hover:bg-gray-700/50', 'hover:bg-gray-50')} transition-colors`}>
                      <td className={`${cn('text-gray-300', 'text-gray-900')} px-6 py-4 text-sm font-medium`}>{item.id}</td>
                      <td className="px-6 py-4"><div className="flex items-center"><UserIcon className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" /><span className={`${cn('text-white', 'text-gray-900')} text-sm`}>{getUserName(item.payer)}</span></div></td>
                      <td className="px-6 py-4"><span className="text-green-500 font-semibold text-sm">{formatPrice(item.amount)}</span></td>
                      <td className="px-6 py-4">{getMethodBadge(item.method)}</td>
                      <td className="px-6 py-4"><div className="flex items-center"><span className={`${cn('text-gray-300', 'text-gray-700')} text-sm flex items-center`}>{getTypeIcon(item.type)}<span className="ml-1">{translate(item.type)}</span></span></div></td>
                      <td className="px-6 py-4"><div className={`${cn('text-gray-300', 'text-gray-900')} text-sm`}>{formatDate(item.date)}</div><div className={`${cn('text-gray-400', 'text-gray-600')} text-xs`}>{item.time}</div></td>
                      <td className="px-6 py-4">{getStatusBadge(item.status)}</td>
                      <td className="px-6 py-4"><button onClick={() => setSelectedTransaction(item.id)} className="text-green-500 hover:text-green-400 text-sm font-medium flex items-center"><EyeIcon className="w-4 h-4 mr-1" />{translate('viewReceipt')}</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className={`${cn('border-gray-700', 'border-gray-200')} border-t px-6 py-4 flex items-center justify-between`}>
              <div className={`${cn('text-gray-400', 'text-gray-600')} text-sm`}>{translate('showing').replace('{start}', (startIndex + 1).toString()).replace('{end}', Math.min(startIndex + itemsPerPage, filteredTransactions.length).toString()).replace('{total}', filteredTransactions.length.toString())}</div>
              <div className="flex space-x-2">
                <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} className={`px-3 py-1 rounded flex items-center ${currentPage === 1 ? `${cn('bg-gray-800 text-gray-600', 'bg-gray-100 text-gray-400')} cursor-not-allowed` : `${cn('bg-gray-700 text-gray-300 hover:bg-green-600', 'bg-gray-200 text-gray-700 hover:bg-green-600 hover:text-white')} transition-colors`}`}><ChevronLeftIcon className="w-4 h-4" />{translate('previous')}</button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (<button key={page} onClick={() => setCurrentPage(page)} className={`px-3 py-1 rounded text-sm ${currentPage === page ? 'bg-green-600 text-white' : `${cn('bg-gray-700 text-gray-300 hover:bg-green-600', 'bg-gray-200 text-gray-700 hover:bg-green-600 hover:text-white')} transition-colors`}`}>{page}</button>))}
                <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} className={`px-3 py-1 rounded flex items-center ${currentPage === totalPages ? `${cn('bg-gray-800 text-gray-600', 'bg-gray-100 text-gray-400')} cursor-not-allowed` : `${cn('bg-gray-700 text-gray-300 hover:bg-green-600', 'bg-gray-200 text-gray-700 hover:bg-green-600 hover:text-white')} transition-colors`}`}>{translate('next')}<ChevronRightIcon className="w-4 h-4" /></button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Receipt Modal */}
      <ReceiptModal transactionId={selectedTransaction} onClose={() => setSelectedTransaction(null)} />
    </div>
  )
}