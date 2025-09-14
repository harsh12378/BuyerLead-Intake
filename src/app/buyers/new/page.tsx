'use client'
import '../../globals.css';
import { useState } from 'react'
import { ProtectedRoute, useAuth } from '../../providers/AuthProvider'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import { z } from 'zod'
import Header from '../components/Header';
import { Metadata } from "next";

const buyerSchema = z.object({
  fullName: z.string()
    .min(2, 'Full name must be at least 2 characters')
    .max(80, 'Full name must be at most 80 characters'),
  
  email: z.string()
    .email('Invalid email format')
    .optional()
    .or(z.literal('')),
  
  phone: z.string()
    .regex(/^\d{10,15}$/, 'Phone must be 10-15 digits only'),
  
  city: z.enum(['Chandigarh', 'Mohali', 'Zirakpur', 'Panchkula', 'Other']),
  
  propertyType: z.enum(['Apartment', 'Villa', 'Plot', 'Office', 'Retail']),
  
  bhk: z.enum(['Studio', 'One', 'Two', 'Three', 'Four']).optional(),
  
  purpose: z.enum(['Buy', 'Rent']),
  
  budgetMin: z.number()
    .positive('Budget min must be positive')
    .optional(),
  
  budgetMax: z.number()
    .positive('Budget max must be positive')
    .optional(),
  
  timeline: z.enum(['ZeroTo3m', 'ThreeTo6m', 'MoreThan6m', 'Exploring']),
  
  source: z.enum(['Website', 'Referral', 'WalkIn', 'Call', 'Other']),
  notes: z.string()
    .max(1000, 'Notes must be at most 1000 characters')
    .optional(),
  tags: z.array(z.string()).optional(),
  ownerId: z.string().min(1, 'Owner ID is required')
}).refine((data) => {
  // BHK required for Apartment and Villa
  if (['Apartment', 'Villa'].includes(data.propertyType) && !data.bhk) {
    return false
  }
  return true
}, {
  message: "BHK is required for Apartment and Villa",
  path: ["bhk"]
}).refine((data) => {
  // Budget max should be >= budget min
  if (data.budgetMin && data.budgetMax && data.budgetMax < data.budgetMin) {
    return false
  }
  return true
}, {
  message: "Budget max must be greater than or equal to budget min",
  path: ["budgetMax"]
})

type BuyerFormData = z.infer<typeof buyerSchema>

export default function CreateLeadPage() {
  const router = useRouter()
  const { user } = useAuth();
  const [formData, setFormData] = useState<Partial<BuyerFormData>>({
    city: 'Chandigarh',
    propertyType: 'Apartment',
    purpose: 'Buy',
    timeline: 'Exploring',
    source: 'Website',
    tags: []
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [tagInput, setTagInput] = useState('')

  const handleInputChange = (field: keyof BuyerFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const addTag = () => {
    if (tagInput.trim() && !formData.tags?.includes(tagInput.trim())) {
      handleInputChange('tags', [...(formData.tags || []), tagInput.trim()])
      setTagInput('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    handleInputChange('tags', formData.tags?.filter(tag => tag !== tagToRemove) || [])
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setErrors({})

    try {
      // Check if user is authenticated
      if (!user?.id) {
        setErrors({ submit: 'You must be logged in to create a lead' })
        return
      }

      // Prepare data for validation
      const dataToValidate = {
        ...formData,
        email: formData.email || undefined,
        budgetMin: formData.budgetMin ? Number(formData.budgetMin) : undefined,
        budgetMax: formData.budgetMax ? Number(formData.budgetMax) : undefined,
        notes: formData.notes || undefined,
        tags: formData.tags || [],
        ownerId: user?.id // Add ownerId from authenticated user
      }

      // Validate with Zod
      const validatedData = buyerSchema.parse(dataToValidate)
      
      // Submit to API
      const response = await fetch('/api/buyers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(validatedData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to create lead')
      }

      // Redirect to buyers list
      router.push('/buyers')
      
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {}
        error.issues.forEach((err) => {
          const path = err.path[0] as string
          fieldErrors[path] = err.message
        })
        setErrors(fieldErrors)
      } else {
        setErrors({ submit: error instanceof Error ? error.message : 'An error occurred' })
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const isResidential = ['Apartment', 'Villa'].includes(formData.propertyType || '')

  return (
    <ProtectedRoute>
    <Header/>
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white shadow-lg rounded-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Create New Lead</h1>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name *
              </label>
              <input
                type="text"
                value={formData.fullName || ''}
                onChange={(e) => handleInputChange('fullName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter full name"
              />
              {errors.fullName && <p className="mt-1 text-sm text-red-600">{errors.fullName}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={formData.email || ''}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter email address"
              />
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone *
              </label>
              <input
                type="tel"
                value={formData.phone || ''}
                onChange={(e) => handleInputChange('phone', e.target.value.replace(/\D/g, ''))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter 10-15 digit phone number"
              />
              {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
            </div>

            {/* City */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                City *
              </label>
              <select
                value={formData.city || ''}
                onChange={(e) => handleInputChange('city', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Chandigarh">Chandigarh</option>
                <option value="Mohali">Mohali</option>
                <option value="Zirakpur">Zirakpur</option>
                <option value="Panchkula">Panchkula</option>
                <option value="Other">Other</option>
              </select>
              {errors.city && <p className="mt-1 text-sm text-red-600">{errors.city}</p>}
            </div>

            {/* Property Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Property Type *
              </label>
              <select
                value={formData.propertyType || ''}
                onChange={(e) => handleInputChange('propertyType', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Apartment">Apartment</option>
                <option value="Villa">Villa</option>
                <option value="Plot">Plot</option>
                <option value="Office">Office</option>
                <option value="Retail">Retail</option>
              </select>
              {errors.propertyType && <p className="mt-1 text-sm text-red-600">{errors.propertyType}</p>}
            </div>

            {/* BHK - Conditional */}
            {isResidential && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  BHK *
                </label>
                <select
                  value={formData.bhk || ''}
                  onChange={(e) => handleInputChange('bhk', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select BHK</option>
                  <option value="Studio">Studio</option>
                  <option value="One">1 BHK</option>
                  <option value="Two">2 BHK</option>
                  <option value="Three">3 BHK</option>
                  <option value="Four">4 BHK</option>
                </select>
                {errors.bhk && <p className="mt-1 text-sm text-red-600">{errors.bhk}</p>}
              </div>
            )}

            {/* Purpose */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Purpose *
              </label>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="Buy"
                    checked={formData.purpose === 'Buy'}
                    onChange={(e) => handleInputChange('purpose', e.target.value)}
                    className="mr-2"
                  />
                  Buy
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="Rent"
                    checked={formData.purpose === 'Rent'}
                    onChange={(e) => handleInputChange('purpose', e.target.value)}
                    className="mr-2"
                  />
                  Rent
                </label>
              </div>
              {errors.purpose && <p className="mt-1 text-sm text-red-600">{errors.purpose}</p>}
            </div>

            {/* Budget Range */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Budget Min (₹)
                </label>
                <input
                  type="number"
                  value={formData.budgetMin || ''}
                  onChange={(e) => handleInputChange('budgetMin', e.target.value ? parseInt(e.target.value) : undefined)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Minimum budget"
                />
                {errors.budgetMin && <p className="mt-1 text-sm text-red-600">{errors.budgetMin}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Budget Max (₹)
                </label>
                <input
                  type="number"
                  value={formData.budgetMax || ''}
                  onChange={(e) => handleInputChange('budgetMax', e.target.value ? parseInt(e.target.value) : undefined)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Maximum budget"
                />
                {errors.budgetMax && <p className="mt-1 text-sm text-red-600">{errors.budgetMax}</p>}
              </div>
            </div>

            {/* Timeline */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Timeline *
              </label>
              <select
                value={formData.timeline || ''}
                onChange={(e) => handleInputChange('timeline', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="ZeroTo3m">0-3 months</option>
                <option value="ThreeTo6m">3-6 months</option>
                <option value="MoreThan6m">More than 6 months</option>
                <option value="Exploring">Just Exploring</option>
              </select>
              {errors.timeline && <p className="mt-1 text-sm text-red-600">{errors.timeline}</p>}
            </div>

            {/* Source */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Source *
              </label>
              <select
                value={formData.source || ''}
                onChange={(e) => handleInputChange('source', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Website">Website</option>
                <option value="Referral">Referral</option>
                <option value="WalkIn">Walk-in</option>
                <option value="Call">Call</option>
                <option value="Other">Other</option>
              </select>
              {errors.source && <p className="mt-1 text-sm text-red-600">{errors.source}</p>}
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes
              </label>
              <textarea
                value={formData.notes || ''}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Additional notes about the lead"
                maxLength={1000}
              />
              <p className="mt-1 text-sm text-gray-500">
                {(formData.notes || '').length}/1000 characters
              </p>
              {errors.notes && <p className="mt-1 text-sm text-red-600">{errors.notes}</p>}
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tags
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Add a tag"
                />
                <button
                  type="button"
                  onClick={addTag}
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.tags?.map((tag: string, index: number) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-2 text-blue-600 hover:text-blue-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Creating Lead...' : 'Create Lead'}
              </button>
              <button
                type="button"
                onClick={() => router.push('/buyers')}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>

            {errors.submit && (
              <p className="text-sm text-red-600 text-center">{errors.submit}</p>
            )}
          </form>
        </div>
      </div>
    </div>
    </ProtectedRoute>
  )
}