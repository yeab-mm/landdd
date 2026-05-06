// app/officer/marketplace/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useLanguage } from '@/lib/LanguageContext'
import { useTranslation } from '@/lib/useTranslation'
import {
  MagnifyingGlassIcon,
  ArrowDownTrayIcon,
  BuildingStorefrontIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  Squares2X2Icon,
  ListBulletIcon,
  EyeIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  UserIcon,
  CalendarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  HeartIcon,
  PhoneIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid'
import toast from 'react-hot-toast'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

interface LandListing {
  id: number
  title: string
  titleAm: string
  description: string
  descriptionAm: string
  type: string
  price: number
  area: string
  location: string
  seller: string
  sellerAm: string
  sellerContact: string
  postedDate: string
  views: number
  status: string
  images: string[]
  features: string[]
  featuresAm: string[]
}

// Fallback data for when API is not available
const fallbackListings: LandListing[] = [
  {
    id: 1,
    title: 'Coffee House',
    titleAm: 'ቡና ቤት',
    description: 'Prime location coffee shop with outdoor seating',
    descriptionAm: 'ፕሪም ሎኬሽን ላይ የሚገኝ የቡና ቤት',
    type: 'commercial',
    price: 850000,
    area: '120 sqm',
    location: 'Zone 1, Bahir Dar',
    seller: 'Abebe Kebede',
    sellerAm: 'አበበ ከበደ',
    sellerContact: '+251911111111',
    postedDate: new Date().toISOString(),
    views: 245,
    status: 'active',
    images: ['https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=500'],
    features: ['electricity', 'waterAccess', 'roadAccess'],
    featuresAm: ['ኤሌክትሪክ', 'ውሃ', 'የመንገድ አቅርቦት']
  },
  {
    id: 2,
    title: 'Modern Apartment',
    titleAm: 'ዘመናዊ አፓርትመንት',
    description: 'Luxury apartment with stunning lake view',
    descriptionAm: 'የሐይቅ እይታ ያለው የቅንጦት አፓርትመንት',
    type: 'residential',
    price: 1200000,
    area: '180 sqm',
    location: 'Zone 3, Bahir Dar',
    seller: 'Tigist Haile',
    sellerAm: 'ትግስት ኃይሉ',
    sellerContact: '+251922222222',
    postedDate: new Date().toISOString(),
    views: 189,
    status: 'active',
    images: ['https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=500'],
    features: ['electricity', 'waterAccess', 'lakeView'],
    featuresAm: ['ኤሌክትሪክ', 'ውሃ', 'የሐይቅ እይታ']
  },
  {
    id: 3,
    title: 'Farm Land',
    titleAm: 'የእርሻ መሬት',
    description: 'Large agricultural land suitable for farming',
    descriptionAm: 'ለእርሻ ምቹ የሆነ ሰፊ መሬት',
    type: 'agricultural',
    price: 2200000,
    area: '5000 sqm',
    location: 'Zone 2, Bahir Dar',
    seller: 'Biruk Alemu',
    sellerAm: 'ብሩክ አለሙ',
    sellerContact: '+251933333333',
    postedDate: new Date().toISOString(),
    views: 312,
    status: 'pending',
    images: ['https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=500'],
    features: ['waterAccess', 'roadAccess'],
    featuresAm: ['ውሃ', 'የመንገድ አቅርቦት']
  },
  {
    id: 4,
    title: 'Office Space',
    titleAm: 'የቢሮ ቦታ',
    description: 'Spacious office space in commercial area',
    descriptionAm: 'በንግድ አካባቢ የሚገኝ ሰፊ የቢሮ ቦታ',
    type: 'commercial',
    price: 3200000,
    area: '250 sqm',
    location: 'Zone 4, Bahir Dar',
    seller: 'Meron Tadesse',
    sellerAm: 'መሮን ታደሰ',
    sellerContact: '+251944444444',
    postedDate: new Date().toISOString(),
    views: 278,
    status: 'pending',
    images: ['https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=500'],
    features: ['electricity', 'roadAccess'],
    featuresAm: ['ኤሌክትሪክ', 'የመንገድ አቅርቦት']
  }
]

export default function MarketplacePage() {
  const router = useRouter()
  const { darkMode, language } = useLanguage()
  const { t } = useTranslation()
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [filterType, setFilterType] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [favorites, setFavorites] = useState<number[]>([])
  const [selectedListing, setSelectedListing] = useState<LandListing | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [listings, setListings] = useState<LandListing[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    totalValue: 0
  })

  const cn = (darkClass: string, lightClass: string) => darkMode ? darkClass : lightClass

  const translate = (key: string): string => {
    const translations: Record<string, { en: string; am: string }> = {
      pageTitle: { en: 'Land Marketplace', am: 'የመሬት ገበያ ቦታ' },
      totalListings: { en: 'Total listings', am: 'ጠቅላላ ዝርዝሮች' },
      export: { en: 'Export', am: 'ላክ' },
      viewDetails: { en: 'View Details', am: 'ዝርዝሮችን ተመልከት' },
      approve: { en: 'Approve', am: 'አጽድቅ' },
      reject: { en: 'Reject', am: 'ውድቅ አድርግ' },
      clearFilters: { en: 'Clear Filters', am: 'ማጣሪያዎችን አጽዳ' },
      close: { en: 'Close', am: 'ዝጋ' },
      contactOwner: { en: 'Contact Owner', am: 'ከባለቤት ጋር ይገናኙ' },
      searchPlaceholder: { en: 'Search by title, location, or seller...', am: 'በርዕስ፣ በአካባቢ ወይም በሻጭ ስም ፈልግ...' },
      gridView: { en: 'Grid View', am: 'ፍርግርግ እይታ' },
      listView: { en: 'List View', am: 'ዝርዝር እይታ' },
      allTypes: { en: 'All Types', am: 'ሁሉም አይነቶች' },
      allStatus: { en: 'All Status', am: 'ሁሉም ሁኔታ' },
      residential: { en: 'Residential', am: 'መኖሪያ' },
      commercial: { en: 'Commercial', am: 'ንግድ' },
      agricultural: { en: 'Agricultural', am: 'እርሻ' },
      pending: { en: 'Pending', am: 'በመጠባበቅ ላይ' },
      approved: { en: 'Approved', am: 'ጸድቋል' },
      rejected: { en: 'Rejected', am: 'ውድቅ ተደርጓል' },
      sold: { en: 'Sold', am: 'ተሽጧል' },
      priceLabel: { en: 'Price', am: 'ዋጋ' },
      locationLabel: { en: 'Location', am: 'አካባቢ' },
      area: { en: 'Area', am: 'ስፋት' },
      seller: { en: 'Seller', am: 'ሻጭ' },
      posted: { en: 'Posted', am: 'የተለጠፈበት' },
      views: { en: 'views', am: 'እይታዎች' },
      listingId: { en: 'Listing ID', am: 'የዝርዝር መታወቂያ' },
      property: { en: 'Property', am: 'ንብረት' },
      type: { en: 'Type', am: 'አይነት' },
      priceHeader: { en: 'Price', am: 'ዋጋ' },
      locationHeader: { en: 'Location', am: 'አካባቢ' },
      statusHeader: { en: 'Status', am: 'ሁኔታ' },
      actionHeader: { en: 'Action', am: 'ድርጊት' },
      description: { en: 'Description', am: 'መግለጫ' },
      features: { en: 'Features', am: 'ገጽታዎች' },
      ownerInformation: { en: 'Owner Information', am: 'የባለቤት መረጃ' },
      verifiedOwner: { en: 'Verified Owner', am: 'የተረጋገጠ ባለቤት' },
      noListings: { en: 'No listings found', am: 'ምንም ዝርዝሮች አልተገኙም' },
      showing: { en: 'Showing {start} to {end} of {total} results', am: '{start} እስከ {end} ከ {total} ውጤቶች እየታየ ነው' },
      previous: { en: 'Previous', am: 'ቀዳሚ' },
      next: { en: 'Next', am: 'ቀጣይ' },
      totalListingsCard: { en: 'Total Listings', am: 'ጠቅላላ ዝርዝሮች' },
      pendingApproval: { en: 'Pending Approval', am: 'ማጽደቅ ይጠብቃል' },
      activeListings: { en: 'Active Listings', am: 'ንቁ ዝርዝሮች' },
      totalValue: { en: 'Total Value', am: 'ጠቅላላ ዋጋ' },
      electricity: { en: 'Electricity', am: 'ኤሌክትሪክ' },
      waterAccess: { en: 'Water Access', am: 'ውሃ' },
      roadAccess: { en: 'Road Access', am: 'የመንገድ አቅርቦት' },
      lakeView: { en: 'Lake View', am: 'የሐይቅ እይታ' }
    }
    return translations[key]?.[language] || key
  }

  const getText = (en: string, am: string) => language === 'en' ? en : am

  // Fetch listings from backend
  const fetchListings = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        router.push('/login')
        return
      }

      const response = await fetch(`${API_URL}/admin/marketplace/listings`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (!response.ok) throw new Error('Failed to fetch')

      const data = await response.json()
      const listingsData = data.listings || []
      setListings(listingsData)
      
      setStats({
        total: listingsData.length,
        pending: listingsData.filter((l: LandListing) => l.status === 'pending').length,
        approved: listingsData.filter((l: LandListing) => l.status === 'active' || l.status === 'approved').length,
        totalValue: listingsData.reduce((sum: number, l: LandListing) => sum + (l.price || 0), 0)
      })
    } catch (error) {
      console.error('Error fetching listings:', error)
      setError('Unable to connect to server. Using demo data.')
      setListings(fallbackListings)
      setStats({
        total: fallbackListings.length,
        pending: fallbackListings.filter(l => l.status === 'pending').length,
        approved: fallbackListings.filter(l => l.status === 'active').length,
        totalValue: fallbackListings.reduce((sum, l) => sum + l.price, 0)
      })
    } finally {
      setLoading(false)
    }
  }

  // Export to CSV
  const exportListings = () => {
    const filtered = getFilteredListings()
    
    const headers = ['ID', 'Title', 'Type', 'Price', 'Location', 'Seller', 'Status', 'Views', 'Posted Date']
    const rows = filtered.map(l => [
      l.id,
      l.title,
      l.type,
      l.price,
      l.location,
      l.seller,
      l.status,
      l.views,
      new Date(l.postedDate).toLocaleDateString()
    ])
    
    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `marketplace_${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
    
    toast.success(getText('Exported successfully!', 'በሚገባ ተልኳል!'))
  }

  // Update listing status (approve/reject)
  const updateStatus = async (id: number, status: string) => {
    const token = localStorage.getItem('token')
    try {
      const response = await fetch(`${API_URL}/admin/marketplace/listings/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      })

      if (response.ok) {
        toast.success(getText(`Listing ${status === 'active' ? 'approved' : 'rejected'}`, 
          `ዝርዝሩ ${status === 'active' ? 'ጸድቋል' : 'ውድቅ ተደርጓል'}`))
        fetchListings()
      }
    } catch (error) {
      toast.error(getText('Failed to update status', 'ሁኔታውን ማዘመን አልተሳካም'))
    }
  }

  useEffect(() => {
    fetchListings()
  }, [])

  const formatPrice = (price: number): string => {
    if (language === 'am') {
      return `ብር ${price.toLocaleString()}`
    }
    return `ETB ${price.toLocaleString()}`
  }

  const formatDate = (date: string): string => {
    if (!date) return 'N/A'
    const d = new Date(date)
    return d.toLocaleDateString(language === 'en' ? 'en-US' : 'am-ET')
  }

  const getPropertyImage = (type: string, index: number = 0): string => {
    const images: Record<string, string[]> = {
      residential: ['https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=500&auto=format'],
      commercial: ['https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=500&auto=format'],
      agricultural: ['https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=500&auto=format'],
      default: ['https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=500&auto=format']
    }
    return (images[type] || images.default)[index % (images[type]?.length || 1)]
  }

  const getStatusBadge = (status: string) => {
    const config: Record<string, { color: string; icon: any; text: string }> = {
      pending: { color: 'yellow', icon: ClockIcon, text: translate('pending') },
      active: { color: 'green', icon: CheckCircleIcon, text: translate('approved') },
      approved: { color: 'green', icon: CheckCircleIcon, text: translate('approved') },
      rejected: { color: 'red', icon: XCircleIcon, text: translate('rejected') },
      sold: { color: 'gray', icon: XCircleIcon, text: translate('sold') }
    }
    
    const c = config[status] || config.pending
    const Icon = c.icon
    const colorMap: Record<string, string> = {
      yellow: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
      green: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      red: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
      gray: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400'
    }
    
    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${colorMap[c.color]}`}>
        <Icon className="w-3 h-3 mr-1" />
        {c.text}
      </span>
    )
  }

  const getTypeBadge = (type: string) => {
    const config: Record<string, { color: string; text: string }> = {
      residential: { color: 'blue', text: translate('residential') },
      commercial: { color: 'green', text: translate('commercial') },
      agricultural: { color: 'yellow', text: translate('agricultural') }
    }
    
    const c = config[type] || config.residential
    const colorMap: Record<string, string> = {
      blue: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      green: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      yellow: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
    }
    
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${colorMap[c.color]}`}>
        {c.text}
      </span>
    )
  }

  const getDisplayTitle = (listing: LandListing) => {
    return language === 'en' ? listing.title : (listing.titleAm || listing.title)
  }

  const getDisplayDescription = (listing: LandListing) => {
    return language === 'en' ? listing.description : (listing.descriptionAm || listing.description)
  }

  const getDisplaySeller = (listing: LandListing) => {
    return language === 'en' ? listing.seller : (listing.sellerAm || listing.seller)
  }

  const getDisplayFeatures = (listing: LandListing): string[] => {
    if (language === 'en') {
      return listing.features || []
    }
    return listing.featuresAm || listing.features || []
  }

  const toggleFavorite = (id: number) => {
    setFavorites(prev => prev.includes(id) ? prev.filter(fav => fav !== id) : [...prev, id])
  }

  const openListingModal = (listing: LandListing) => {
    setSelectedListing(listing)
    setCurrentImageIndex(0)
    setShowModal(true)
  }

  const clearFilters = () => {
    setFilterType('all')
    setFilterStatus('all')
    setSearchQuery('')
    setCurrentPage(1)
  }

  const getFilteredListings = () => {
    let filtered = listings
    
    if (filterType !== 'all') {
      filtered = filtered.filter(l => l.type === filterType)
    }
    
    if (filterStatus !== 'all') {
      filtered = filtered.filter(l => l.status === filterStatus)
    }
    
    if (searchQuery) {
      filtered = filtered.filter(l => 
        getDisplayTitle(l).toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        getDisplaySeller(l).toLowerCase().includes(searchQuery.toLowerCase())
      )
    }
    
    return filtered
  }

  const filteredListings = getFilteredListings()
  const itemsPerPage = viewMode === 'grid' ? 6 : 5
  const totalPages = Math.ceil(filteredListings.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedListings = filteredListings.slice(startIndex, startIndex + itemsPerPage)

  const ListingModal = () => {
    if (!selectedListing || !showModal) return null

    const images = selectedListing.images?.length ? selectedListing.images : [getPropertyImage(selectedListing.type, 0)]

    return (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 overflow-y-auto">
        <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 z-10 bg-white dark:bg-gray-800 rounded-full p-2 shadow-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="relative h-96 bg-gray-100 dark:bg-gray-900">
              <img
                src={images[currentImageIndex]}
                alt={getDisplayTitle(selectedListing)}
                className="w-full h-full object-cover"
              />
              {images.length > 1 && (
                <>
                  <button onClick={() => setCurrentImageIndex(prev => prev === 0 ? images.length - 1 : prev - 1)}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white dark:bg-gray-800 rounded-full p-2 shadow-lg">
                    <ChevronLeftIcon className="w-6 h-6" />
                  </button>
                  <button onClick={() => setCurrentImageIndex(prev => prev === images.length - 1 ? 0 : prev + 1)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white dark:bg-gray-800 rounded-full p-2 shadow-lg">
                    <ChevronRightIcon className="w-6 h-6" />
                  </button>
                </>
              )}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 text-white text-sm px-3 py-1 rounded-full">
                {currentImageIndex + 1} / {images.length}
              </div>
            </div>

            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {getDisplayTitle(selectedListing)}
                </h2>
                {getStatusBadge(selectedListing.status)}
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="flex items-center text-gray-600 dark:text-gray-400">
                  <MapPinIcon className="w-5 h-5 mr-2 text-green-600" />
                  {selectedListing.location}
                </div>
                <div className="flex items-center text-gray-600 dark:text-gray-400">
                  <BuildingStorefrontIcon className="w-5 h-5 mr-2 text-green-600" />
                  {selectedListing.area}
                </div>
                <div className="flex items-center text-2xl font-bold text-green-600 col-span-2">
                  <CurrencyDollarIcon className="w-6 h-6 mr-2" />
                  {formatPrice(selectedListing.price)}
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{translate('description')}</h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  {getDisplayDescription(selectedListing)}
                </p>
              </div>

              {getDisplayFeatures(selectedListing).length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">{translate('features')}</h3>
                  <div className="flex flex-wrap gap-2">
                    {getDisplayFeatures(selectedListing).map((feature, idx) => (
                      <span key={idx} className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 rounded-full text-sm">
                        {translate(feature) || feature}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">{translate('ownerInformation')}</h3>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                      <UserIcon className="w-6 h-6 text-green-600" />
                    </div>
                    <div className="ml-3">
                      <p className="font-semibold text-gray-900 dark:text-white">{getDisplaySeller(selectedListing)}</p>
                      <p className="text-sm text-gray-500">{translate('verifiedOwner')}</p>
                    </div>
                  </div>
                  <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center">
                    <PhoneIcon className="w-4 h-4 mr-2" />
                    {translate('contactOwner')}
                  </button>
                </div>
              </div>

              <div className="mt-4 text-sm text-gray-500 dark:text-gray-400 flex items-center justify-end">
                <CalendarIcon className="w-4 h-4 mr-1" />
                {translate('posted')}: {formatDate(selectedListing.postedDate)}
                <span className="mx-2">•</span>
                <EyeIcon className="w-4 h-4 mr-1" />
                {selectedListing.views} {translate('views')}
              </div>
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className={`${cn('text-white', 'text-gray-900')} text-2xl font-bold`}>
            {translate('pageTitle')}
          </h2>
          <p className={`${cn('text-gray-400', 'text-gray-600')} mt-1`}>
            {stats.total} {translate('totalListings')}
          </p>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={exportListings}
            className={`${cn('bg-gray-700 hover:bg-gray-600', 'bg-white hover:bg-gray-50 border border-gray-300')} px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center`}
          >
            <ArrowDownTrayIcon className="w-4 h-4 mr-2" />
            {translate('export')}
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-yellow-500/20 border border-yellow-500 rounded-lg p-4 text-yellow-500 text-sm">
          {error}
        </div>
      )}

      {/* Search and Filters */}
      <div className={`${cn('bg-gray-800', 'bg-white')} rounded-lg shadow-lg p-4`}>
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder={translate('searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1) }}
                className={`w-full pl-9 pr-4 py-2 rounded-lg text-sm ${
                  darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-100 border-gray-300 text-gray-900'
                } border focus:outline-none focus:ring-2 focus:ring-green-500`}
              />
            </div>
          </div>
          
          <select value={filterType} onChange={(e) => { setFilterType(e.target.value); setCurrentPage(1) }}
            className={`px-4 py-2 rounded-lg text-sm ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} border`}>
            <option value="all">{translate('allTypes')}</option>
            <option value="residential">{translate('residential')}</option>
            <option value="commercial">{translate('commercial')}</option>
            <option value="agricultural">{translate('agricultural')}</option>
          </select>

          <select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1) }}
            className={`px-4 py-2 rounded-lg text-sm ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} border`}>
            <option value="all">{translate('allStatus')}</option>
            <option value="pending">{translate('pending')}</option>
            <option value="active">{translate('approved')}</option>
          </select>

          <div className="flex items-center space-x-2 ml-auto">
            <button onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-green-600 text-white' : cn('bg-gray-700 text-gray-300', 'bg-gray-200 text-gray-700')}`}>
              <Squares2X2Icon className="w-5 h-5" />
            </button>
            <button onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-green-600 text-white' : cn('bg-gray-700 text-gray-300', 'bg-gray-200 text-gray-700')}`}>
              <ListBulletIcon className="w-5 h-5" />
            </button>
          </div>

          {(filterType !== 'all' || filterStatus !== 'all' || searchQuery) && (
            <button onClick={clearFilters}
              className="text-sm text-green-500 hover:text-green-400 flex items-center">
              <XMarkIcon className="w-4 h-4 mr-1" />
              {translate('clearFilters')}
            </button>
          )}
        </div>
      </div>

      {/* Listings */}
      {filteredListings.length === 0 ? (
        <div className="text-center py-12">
          <BuildingStorefrontIcon className="w-12 h-12 mx-auto text-gray-400 mb-3" />
          <p className={cn('text-gray-300', 'text-gray-600')}>{translate('noListings')}</p>
        </div>
      ) : (
        <>
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedListings.map((item, idx) => {
                const displayFeatures = getDisplayFeatures(item)
                return (
                  <div key={item.id} className={`${cn('bg-gray-800', 'bg-white')} rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all cursor-pointer`}
                    onClick={() => openListingModal(item)}>
                    <div className="relative h-48 bg-gray-700">
                      <img src={item.images?.[0] || getPropertyImage(item.type, idx)} alt={getDisplayTitle(item)}
                        className="w-full h-full object-cover" />
                      <div className="absolute top-2 left-2">{getTypeBadge(item.type)}</div>
                      <div className="absolute top-2 right-2">{getStatusBadge(item.status)}</div>
                      <button onClick={(e) => { e.stopPropagation(); toggleFavorite(item.id) }}
                        className="absolute bottom-2 right-2 p-2 bg-white/90 rounded-full">
                        {favorites.includes(item.id) ? <HeartIconSolid className="w-4 h-4 text-red-500" /> : <HeartIcon className="w-4 h-4 text-gray-600" />}
                      </button>
                    </div>
                    <div className="p-4">
                      <h3 className={`${cn('text-white', 'text-gray-900')} font-semibold text-lg mb-2`}>{getDisplayTitle(item)}</h3>
                      <div className="flex items-center text-sm mb-2">
                        <MapPinIcon className="w-4 h-4 text-gray-400 mr-2" />
                        <span className={cn('text-gray-300', 'text-gray-700')}>{item.location}</span>
                      </div>
                      <div className="flex items-center text-sm mb-3">
                        <CurrencyDollarIcon className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-green-500 font-semibold">{formatPrice(item.price)}</span>
                      </div>
                      <div className="flex flex-wrap gap-1 mb-3">
                        {displayFeatures.slice(0, 2).map((f, i) => (
                          <span key={i} className={`text-xs px-2 py-1 rounded-full ${cn('bg-gray-700 text-gray-300', 'bg-gray-200 text-gray-700')}`}>
                            {translate(f) || f}
                          </span>
                        ))}
                        {displayFeatures.length > 2 && (
                          <span className="text-xs text-gray-400">+{displayFeatures.length - 2} more</span>
                        )}
                      </div>
                      <div className="flex items-center justify-between pt-3 border-t border-gray-700">
                        <div className="flex items-center text-xs text-gray-400">
                          <CalendarIcon className="w-3 h-3 mr-1" />
                          {formatDate(item.postedDate)}
                        </div>
                        <button className="text-green-500 hover:text-green-400 text-sm font-medium">
                          {translate('viewDetails')} →
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className={`${cn('bg-gray-800', 'bg-white')} rounded-lg shadow-lg overflow-hidden`}>
              <table className="w-full">
                <thead className={cn('bg-gray-700/50', 'bg-gray-50')}>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">{translate('listingId')}</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">{translate('property')}</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">{translate('type')}</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">{translate('priceHeader')}</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">{translate('locationHeader')}</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">{translate('statusHeader')}</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">{translate('actionHeader')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {paginatedListings.map((item) => (
                    <tr key={item.id} className={cn('hover:bg-gray-700/50', 'hover:bg-gray-50')} onClick={() => openListingModal(item)}>
                      <td className="px-6 py-4 text-sm font-medium text-gray-300">{item.id}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-gray-700 rounded-lg overflow-hidden">
                            <img src={item.images?.[0] || getPropertyImage(item.type, 0)} alt="" className="w-full h-full object-cover" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-white line-clamp-1">{getDisplayTitle(item)}</p>
                            <p className="text-xs text-gray-400 line-clamp-1">{getDisplayDescription(item)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">{getTypeBadge(item.type)}</td>
                      <td className="px-6 py-4"><span className="text-green-500 font-semibold">{formatPrice(item.price)}</span></td>
                      <td className="px-6 py-4 text-sm text-gray-300">{item.location}</td>
                      <td className="px-6 py-4">{getStatusBadge(item.status)}</td>
                      <td className="px-6 py-4">
                        <button className="text-green-500 hover:text-green-400 text-sm font-medium flex items-center">
                          <EyeIcon className="w-4 h-4 mr-1" />
                          {translate('viewDetails')}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {totalPages > 1 && (
            <div className={`${cn('bg-gray-800', 'bg-white')} rounded-lg shadow-lg px-6 py-4 flex items-center justify-between`}>
              <div className="text-sm text-gray-400">
                {translate('showing').replace('{start}', (startIndex + 1).toString()).replace('{end}', Math.min(startIndex + itemsPerPage, filteredListings.length).toString()).replace('{total}', filteredListings.length.toString())}
              </div>
              <div className="flex space-x-2">
                <button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1}
                  className={`px-3 py-1 rounded flex items-center ${currentPage === 1 ? 'bg-gray-800 text-gray-600 cursor-not-allowed' : 'bg-gray-700 text-gray-300 hover:bg-green-600 hover:text-white'}`}>
                  <ChevronLeftIcon className="w-4 h-4" /> {translate('previous')}
                </button>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(page => (
                  <button key={page} onClick={() => setCurrentPage(page)}
                    className={`px-3 py-1 rounded text-sm ${currentPage === page ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-green-600 hover:text-white'}`}>
                    {page}
                  </button>
                ))}
                <button onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages}
                  className={`px-3 py-1 rounded flex items-center ${currentPage === totalPages ? 'bg-gray-800 text-gray-600 cursor-not-allowed' : 'bg-gray-700 text-gray-300 hover:bg-green-600 hover:text-white'}`}>
                  {translate('next')} <ChevronRightIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className={`${cn('bg-gray-800', 'bg-white')} rounded-lg p-4`}>
          <div className="flex items-center justify-between">
            <div><p className="text-sm text-gray-400">{translate('totalListingsCard')}</p><p className="text-2xl font-bold text-white">{stats.total}</p></div>
            <div className="p-3 bg-blue-500/20 rounded-lg"><BuildingStorefrontIcon className="w-6 h-6 text-blue-500" /></div>
          </div>
        </div>
        <div className={`${cn('bg-gray-800', 'bg-white')} rounded-lg p-4`}>
          <div className="flex items-center justify-between">
            <div><p className="text-sm text-gray-400">{translate('pendingApproval')}</p><p className="text-2xl font-bold text-white">{stats.pending}</p></div>
            <div className="p-3 bg-yellow-500/20 rounded-lg"><ClockIcon className="w-6 h-6 text-yellow-500" /></div>
          </div>
        </div>
        <div className={`${cn('bg-gray-800', 'bg-white')} rounded-lg p-4`}>
          <div className="flex items-center justify-between">
            <div><p className="text-sm text-gray-400">{translate('activeListings')}</p><p className="text-2xl font-bold text-white">{stats.approved}</p></div>
            <div className="p-3 bg-green-500/20 rounded-lg"><CheckCircleIcon className="w-6 h-6 text-green-500" /></div>
          </div>
        </div>
        <div className={`${cn('bg-gray-800', 'bg-white')} rounded-lg p-4`}>
          <div className="flex items-center justify-between">
            <div><p className="text-sm text-gray-400">{translate('totalValue')}</p><p className="text-2xl font-bold text-white">{formatPrice(stats.totalValue)}</p></div>
            <div className="p-3 bg-purple-500/20 rounded-lg"><CurrencyDollarIcon className="w-6 h-6 text-purple-500" /></div>
          </div>
        </div>
      </div>

      <ListingModal />
    </div>
  )
}