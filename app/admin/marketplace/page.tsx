'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/lib/LanguageContext';
import { useTranslation } from '@/lib/useTranslation';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  CheckCircleIcon,
  XCircleIcon,
  BuildingStorefrontIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  HeartIcon,
  UserIcon,
  PlusIcon,
  TrashIcon,
  PencilIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface Listing {
  id: number;
  title: string;
  titleAm: string;
  price: number;
  type: string;
  status: string;
  location: string;
  locationAm: string;
  description: string;
  descriptionAm: string;
  images: string[];
  seller: string;
  sellerAm: string;
  sellerContact: string;
  sellerEmail: string;
  views: number;
  likes: number;
  createdAt: string;
}

export default function AdminMarketplacePage() {
  const { darkMode, language } = useLanguage();
  const { t } = useTranslation();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [stats, setStats] = useState({
    totalListings: 0,
    activeListings: 0,
    pendingListings: 0,
    totalValue: 0
  });

  const cn = (darkClass: string, lightClass: string) => darkMode ? darkClass : lightClass;

  const getText = (enText: string, amText: string) => {
    return language === 'en' ? enText : amText;
  };

  // Fetch listings from backend
  const fetchListings = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/admin/marketplace/listings`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setListings(data.listings || []);
      } else if (response.status === 401) {
        toast.error(getText('Please login again', 'እባክዎ እንደገና ይግቡ'));
        window.location.href = '/login';
      }
    } catch (error) {
      console.error('Error fetching listings:', error);
      toast.error(getText('Failed to load listings', 'ዝርዝሮችን ማምጣት አልተሳካም'));
    } finally {
      setLoading(false);
    }
  };

  // Fetch stats
  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/admin/marketplace/stats`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/login';
      return;
    }
    fetchListings();
    fetchStats();
  }, []);

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('en-ET', {
      style: 'currency',
      currency: 'ETB',
      minimumFractionDigits: 0
    }).format(price);
  };

  const getStatusBadge = (status: string) => {
    const config: any = {
      active: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
      sold: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400',
      rejected: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
    };
    const statusText: any = {
      active: getText('Active', 'ንቁ'),
      pending: getText('Pending', 'በመጠባበቅ ላይ'),
      sold: getText('Sold', 'ተሽጧል'),
      rejected: getText('Rejected', 'ውድቅ ተደርጓል')
    };
    return (
      <span className={`px-2 py-1 text-xs rounded-full ${config[status] || config.pending}`}>
        {statusText[status] || status}
      </span>
    );
  };

  const getTypeBadge = (type: string) => {
    const config: any = {
      residential: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      commercial: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
      agricultural: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      industrial: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400'
    };
    const typeText: any = {
      residential: getText('Residential', 'መኖሪያ'),
      commercial: getText('Commercial', 'ንግድ'),
      agricultural: getText('Agricultural', 'እርሻ'),
      industrial: getText('Industrial', 'ኢንዱስትሪ')
    };
    return (
      <span className={`px-2 py-1 text-xs rounded-full ${config[type] || config.residential}`}>
        {typeText[type] || type}
      </span>
    );
  };

  const deleteListing = async (id: number) => {
    if (!confirm(getText('Are you sure you want to delete this listing?', 'ይህን ዝርዝር መሰረዝ እንደሚፈልጉ እርግጠኛ ነዎት?'))) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/admin/marketplace/listings/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        toast.success(getText('Listing deleted', 'ዝርዝሩ ተሰርዟል'));
        fetchListings();
        fetchStats();
      }
    } catch (error) {
      toast.error(getText('Failed to delete', 'መሰረዝ አልተሳካም'));
    }
  };

  const updateStatus = async (id: number, status: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/admin/marketplace/listings/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      
      if (response.ok) {
        toast.success(getText(`Listing ${status}`, `ዝርዝሩ ${status === 'active' ? 'ጸድቋል' : 'ውድቅ ተደርጓል'}`));
        fetchListings();
        fetchStats();
      }
    } catch (error) {
      toast.error(getText('Failed to update status', 'ሁኔታውን ማዘመን አልተሳካም'));
    }
  };

  const getDisplayTitle = (listing: Listing) => {
    return language === 'en' ? listing.title : (listing.titleAm || listing.title);
  };

  const getDisplayLocation = (listing: Listing) => {
    return language === 'en' ? listing.location : (listing.locationAm || listing.location);
  };

  const getDisplaySeller = (listing: Listing) => {
    return language === 'en' ? listing.seller : (listing.sellerAm || listing.seller);
  };

  const filteredListings = listings.filter(listing => {
    const title = getDisplayTitle(listing).toLowerCase();
    const matchesSearch = searchTerm === '' || title.includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || listing.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || listing.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">{getText('Loading listings...', 'ዝርዝሮችን በማምጣት ላይ...')}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className={`text-2xl font-bold ${cn('text-white', 'text-gray-900')}`}>
            {getText('Marketplace', 'ገበያ ቦታ')}
          </h1>
          <p className={`text-sm mt-1 ${cn('text-gray-400', 'text-gray-600')}`}>
            {getText('Total', 'ጠቅላላ')}: {listings.length} {getText('listings', 'ዝርዝሮች')}
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/marketplace/new">
            <button className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
              <PlusIcon className="w-5 h-5 mr-2" />
              {getText('Add New', 'አዲስ ያስገቡ')}
            </button>
          </Link>
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-green-600 text-white' : cn('bg-gray-700 text-gray-300', 'bg-gray-200 text-gray-700')}`}
            title={getText('Grid View', 'የፍርግርግ እይታ')}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-green-600 text-white' : cn('bg-gray-700 text-gray-300', 'bg-gray-200 text-gray-700')}`}
            title={getText('List View', 'የዝርዝር እይታ')}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className={`${cn('bg-gray-800', 'bg-white')} rounded-xl shadow-sm p-4`}>
          <p className={`text-sm ${cn('text-gray-400', 'text-gray-500')}`}>{getText('Total Listings', 'ጠቅላላ ዝርዝሮች')}</p>
          <p className="text-2xl font-bold text-blue-600">{stats.totalListings}</p>
        </div>
        <div className={`${cn('bg-gray-800', 'bg-white')} rounded-xl shadow-sm p-4`}>
          <p className={`text-sm ${cn('text-gray-400', 'text-gray-500')}`}>{getText('Active', 'ንቁ')}</p>
          <p className="text-2xl font-bold text-green-600">{stats.activeListings}</p>
        </div>
        <div className={`${cn('bg-gray-800', 'bg-white')} rounded-xl shadow-sm p-4`}>
          <p className={`text-sm ${cn('text-gray-400', 'text-gray-500')}`}>{getText('Pending', 'በመጠባበቅ ላይ')}</p>
          <p className="text-2xl font-bold text-yellow-600">{stats.pendingListings}</p>
        </div>
        <div className={`${cn('bg-gray-800', 'bg-white')} rounded-xl shadow-sm p-4`}>
          <p className={`text-sm ${cn('text-gray-400', 'text-gray-500')}`}>{getText('Total Value', 'ጠቅላላ ዋጋ')}</p>
          <p className="text-2xl font-bold text-purple-600">{formatPrice(stats.totalValue)}</p>
        </div>
      </div>

      {/* Filters */}
      <div className={`${cn('bg-gray-800', 'bg-white')} rounded-xl shadow-sm p-4`}>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder={getText('Search by title...', 'በርዕስ ፈልግ...')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500
                ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}
              `}
            />
          </div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className={`px-4 py-2 border rounded-lg ${darkMode ? 'bg-gray-700 text-white' : 'bg-white'} md:w-40`}
          >
            <option value="all">{getText('All Types', 'ሁሉም አይነት')}</option>
            <option value="residential">{getText('Residential', 'መኖሪያ')}</option>
            <option value="commercial">{getText('Commercial', 'ንግድ')}</option>
            <option value="agricultural">{getText('Agricultural', 'እርሻ')}</option>
            <option value="industrial">{getText('Industrial', 'ኢንዱስትሪ')}</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={`px-4 py-2 border rounded-lg ${darkMode ? 'bg-gray-700 text-white' : 'bg-white'} md:w-40`}
          >
            <option value="all">{getText('All Status', 'ሁሉም ሁኔታ')}</option>
            <option value="active">{getText('Active', 'ንቁ')}</option>
            <option value="pending">{getText('Pending', 'በመጠባበቅ ላይ')}</option>
            <option value="sold">{getText('Sold', 'ተሽጧል')}</option>
          </select>
        </div>
      </div>

      {/* Listings Grid */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredListings.map((listing) => (
            <div key={listing.id} className={`${cn('bg-gray-800', 'bg-white')} rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-all`}>
              <div className="relative h-48 bg-gray-300 dark:bg-gray-700">
                {listing.images && listing.images[0] ? (
                  <img src={listing.images[0]} alt={getDisplayTitle(listing)} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <BuildingStorefrontIcon className="w-12 h-12 text-gray-500" />
                  </div>
                )}
                <div className="absolute top-2 right-2">
                  {getStatusBadge(listing.status)}
                </div>
                <div className="absolute top-2 left-2">
                  {getTypeBadge(listing.type)}
                </div>
              </div>
              
              <div className="p-4">
                <h3 className={`text-lg font-semibold mb-2 line-clamp-1 ${cn('text-white', 'text-gray-900')}`}>
                  {getDisplayTitle(listing)}
                </h3>
                
                <div className="flex items-center mb-2">
                  <MapPinIcon className="w-4 h-4 text-gray-400 mr-1 flex-shrink-0" />
                  <span className={`text-sm line-clamp-1 ${cn('text-gray-400', 'text-gray-600')}`}>
                    {getDisplayLocation(listing)}
                  </span>
                </div>
                
                <div className="flex justify-between items-center mb-3">
                  <span className={`text-sm ${cn('text-gray-400', 'text-gray-600')}`}>
                    {getDisplaySeller(listing)}
                  </span>
                  <span className="text-lg font-bold text-green-600">{formatPrice(listing.price)}</span>
                </div>
                
                <div className="flex justify-between items-center pt-3 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex gap-1 text-xs text-gray-400">
                    <span className="flex items-center">
                      <EyeIcon className="w-3 h-3 mr-1" />
                      {listing.views}
                    </span>
                    <span className="flex items-center ml-2">
                      <HeartIcon className="w-3 h-3 mr-1" />
                      {listing.likes}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    {listing.status === 'pending' && (
                      <>
                        <button
                          onClick={() => updateStatus(listing.id, 'active')}
                          className="p-1 text-green-500 hover:text-green-700"
                          title={getText('Approve', 'አጽድቅ')}
                        >
                          <CheckCircleIcon className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => updateStatus(listing.id, 'rejected')}
                          className="p-1 text-red-500 hover:text-red-700"
                          title={getText('Reject', 'ውድቅ አድርግ')}
                        >
                          <XCircleIcon className="w-5 h-5" />
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => deleteListing(listing.id)}
                      className="p-1 text-red-500 hover:text-red-700"
                      title={getText('Delete', 'ሰርዝ')}
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* List View */
        <div className={`${cn('bg-gray-800', 'bg-white')} rounded-xl shadow-sm overflow-hidden`}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className={cn('bg-gray-700', 'bg-gray-50')}>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">{getText('Property', 'ንብረት')}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">{getText('Type', 'አይነት')}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">{getText('Status', 'ሁኔታ')}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">{getText('Price', 'ዋጋ')}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">{getText('Seller', 'ሻጭ')}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">{getText('Views', 'እይታዎች')}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">{getText('Actions', 'ድርጊቶች')}</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${cn('divide-gray-700', 'divide-gray-200')}`}>
                {filteredListings.map((listing) => (
                  <tr key={listing.id} className={cn('hover:bg-gray-700', 'hover:bg-gray-50')}>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-lg bg-gray-300 dark:bg-gray-600 flex items-center justify-center overflow-hidden">
                          {listing.images && listing.images[0] ? (
                            <img src={listing.images[0]} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <BuildingStorefrontIcon className="w-5 h-5 text-gray-500" />
                          )}
                        </div>
                        <div className="ml-3">
                          <p className={`text-sm font-medium ${cn('text-white', 'text-gray-900')}`}>
                            {getDisplayTitle(listing)}
                          </p>
                          <p className={`text-xs ${cn('text-gray-400', 'text-gray-500')}`}>
                            {getDisplayLocation(listing)}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{getTypeBadge(listing.type)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(listing.status)}</td>
                    <td className="px-6 py-4 whitespace-nowrap font-semibold text-green-600">{formatPrice(listing.price)}</td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${cn('text-gray-300', 'text-gray-600')}`}>
                      {getDisplaySeller(listing)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">{listing.views}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex gap-2">
                        {listing.status === 'pending' && (
                          <>
                            <button onClick={() => updateStatus(listing.id, 'active')} className="text-green-500 hover:text-green-700">
                              <CheckCircleIcon className="w-5 h-5" />
                            </button>
                            <button onClick={() => updateStatus(listing.id, 'rejected')} className="text-red-500 hover:text-red-700">
                              <XCircleIcon className="w-5 h-5" />
                            </button>
                          </>
                        )}
                        <button onClick={() => deleteListing(listing.id)} className="text-red-500 hover:text-red-700">
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* No Results */}
      {filteredListings.length === 0 && (
        <div className={`${cn('bg-gray-800', 'bg-white')} rounded-xl shadow-sm p-12 text-center`}>
          <BuildingStorefrontIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className={`text-lg ${cn('text-gray-300', 'text-gray-600')}`}>
            {getText('No listings found', 'ምንም ዝርዝሮች አልተገኙም')}
          </p>
          <p className={`text-sm mt-2 ${cn('text-gray-500', 'text-gray-400')}`}>
            {getText('Try adjusting your search or add a new listing', 'እባክዎ ፍለጋዎን ያስተካክሉ ወይም አዲስ ዝርዝር ያስገቡ')}
          </p>
        </div>
      )}
    </div>
  );
}