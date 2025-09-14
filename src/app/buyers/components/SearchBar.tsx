'use client'
import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import ImportExport from './ImportExport'
interface SearchBarProps {
  onSearch?: () => void // Optional callback when search is performed
}

export default function SearchBar({ onSearch }: SearchBarProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // State for all search/filter inputs
  const [searchText, setSearchText] = useState('')
  const [city, setCity] = useState('')
  const [propertyType, setPropertyType] = useState('')
  const [status, setStatus] = useState('')
  const [timeline, setTimeline] = useState('')

  // Initialize state from URL params on component mount
  useEffect(() => {
    setSearchText(searchParams.get('search') || '')
    setCity(searchParams.get('city') || '')
    setPropertyType(searchParams.get('propertyType') || '')
    setStatus(searchParams.get('status') || '')
    setTimeline(searchParams.get('timeline') || '')
  }, [searchParams])

  // Handle search submission
  const handleSearch = () => {
    const params = new URLSearchParams()
    
    // Add search text if provided
    if (searchText.trim()) {
      params.set('search', searchText.trim())
    }
    
    // Add filters if selected
    if (city) params.set('city', city)
    if (propertyType) params.set('propertyType', propertyType)
    if (status) params.set('status', status)
    if (timeline) params.set('timeline', timeline)
    
    // Reset to page 1 when searching
    params.set('page', '1')
    
    // Update URL with search params
    router.push(`/buyers?${params.toString()}`)
    
    // Call optional callback
    if (onSearch) {
      onSearch()
    }
  }

  // Handle clear/reset all filters
  const handleClear = () => {
    setSearchText('')
    setCity('')
    setPropertyType('')
    setStatus('')
    setTimeline('')
    
    // Navigate to buyers page without any search params
    router.push('/buyers')
    
    if (onSearch) {
      onSearch()
    }
  }

  // Handle Enter key in search input
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

 return (
  <div className="bg-white shadow-sm rounded-lg p-6 mb-6">
    {/* Search Text Input */}
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Search Leads
      </label>
      <div className="flex gap-2">
        <input
          type="text"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Search by name, phone, or email..."
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleSearch}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Search
        </button>
      </div>
    </div>

    {/* Filters Row */}
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
      {/* City Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          City
        </label>
        <select
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Cities</option>
          <option value="Chandigarh">Chandigarh</option>
          <option value="Mohali">Mohali</option>
          <option value="Zirakpur">Zirakpur</option>
          <option value="Panchkula">Panchkula</option>
          <option value="Other">Other</option>
        </select>
      </div>

      {/* Property Type Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Property Type
        </label>
        <select
          value={propertyType}
          onChange={(e) => setPropertyType(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Types</option>
          <option value="Apartment">Apartment</option>
          <option value="Villa">Villa</option>
          <option value="Plot">Plot</option>
          <option value="Office">Office</option>
          <option value="Retail">Retail</option>
        </select>
      </div>

      {/* Status Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Status
        </label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Status</option>
          <option value="New">New</option>
          <option value="Qualified">Qualified</option>
          <option value="Contacted">Contacted</option>
          <option value="Visited">Visited</option>
          <option value="Negotiation">Negotiation</option>
          <option value="Converted">Converted</option>
          <option value="Dropped">Dropped</option>
        </select>
      </div>

      {/* Timeline Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Timeline
        </label>
        <select
          value={timeline}
          onChange={(e) => setTimeline(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Timelines</option>
          <option value="ZeroTo3m">0-3 months</option>
          <option value="ThreeTo6m">3-6 months</option>
          <option value="MoreThan6m">More than 6 months</option>
          <option value="Exploring">Just Exploring</option>
        </select>
      </div>
    </div>

    <div className="flex flex-col gap-4 mt-2">
      <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
        <div className="flex gap-2">
          <button 
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition" 
            onClick={handleSearch} 
          > 
            Filter 
          </button> 
          <button 
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition" 
            onClick={handleClear} 
          > 
            Clear All 
          </button> 
        </div>
      </div>

      {/* Import/Export section - Full width */}
      <div className="w-full">
        <ImportExport />
      </div>
    </div>

    {/* Active Filters Display */}
    {(searchText || city || propertyType || status || timeline) && (
      <div className="mt-4 pt-4 border-t border-gray-200">
        <p className="text-sm text-gray-600 mb-2">Active filters:</p>
        <div className="flex flex-wrap gap-2">
          {searchText && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
              Search: "{searchText}"
              <button
                onClick={() => {
                  setSearchText('')
                  // Trigger search after clearing
                  setTimeout(handleSearch, 0)
                }}
                className="ml-2 text-blue-600 hover:text-blue-800"
              >
                ×
              </button>
            </span>
          )}
          {city && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
              City: {city}
              <button
                onClick={() => {
                  setCity('')
                  setTimeout(handleSearch, 0)
                }}
                className="ml-2 text-green-600 hover:text-green-800"
              >
                ×
              </button>
            </span>
          )}
          {propertyType && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-800">
              Type: {propertyType}
              <button
                onClick={() => {
                  setPropertyType('')
                  setTimeout(handleSearch, 0)
                }}
                className="ml-2 text-purple-600 hover:text-purple-800"
              >
                ×
              </button>
            </span>
          )}
          {status && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-yellow-100 text-yellow-800">
              Status: {status}
              <button
                onClick={() => {
                  setStatus('')
                  setTimeout(handleSearch, 0)
                }}
                className="ml-2 text-yellow-600 hover:text-yellow-800"
              >
                ×
              </button>
            </span>
          )}
          {timeline && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-pink-100 text-pink-800">
              Timeline: {timeline.replace('ZeroTo3m', '0-3 months').replace('ThreeTo6m', '3-6 months').replace('MoreThan6m', '>6 months')}
              <button
                onClick={() => {
                  setTimeline('')
                  setTimeout(handleSearch, 0)
                }}
                className="ml-2 text-pink-600 hover:text-pink-800"
              >
                ×
              </button>
            </span>
          )}
        </div>
      </div>
    )}
  </div>
)
}