'use client';

import { useState } from 'react';
import { Competitor } from '@/types';
import { Building2, Globe, MapPin, Star } from 'lucide-react';

interface CompetitorFormProps {
  competitor?: Competitor;
  onSave: (competitor: Omit<Competitor, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export default function CompetitorForm({ competitor, onSave, onCancel, loading = false }: CompetitorFormProps) {
  const [formData, setFormData] = useState({
    name: competitor?.name || '',
    website: competitor?.website || '',
    location: competitor?.location || '',
    type: competitor?.type || 'restaurant' as 'restaurant' | 'delivery' | 'both',
    price_range: competitor?.price_range || 'medium' as 'budget' | 'medium' | 'premium',
    is_active: competitor?.is_active ?? true
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const competitorData: Omit<Competitor, 'id' | 'created_at' | 'updated_at'> = {
      ...formData,
      company_id: '' // Will be set by service
    };

    await onSave(competitorData);
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6 text-white">
        <h2 className="text-2xl font-black mb-2">
          {competitor ? 'Edit Competitor' : 'Add New Competitor'}
        </h2>
        <p className="text-purple-100">
          Track competitor information and monitor their pricing strategies
        </p>
      </div>

      <form onSubmit={handleSubmit} className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Basic Info */}
          <div className="space-y-6">
            {/* Competitor Name */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                <Building2 className="w-4 h-4 inline mr-1" />
                Competitor Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none transition"
                placeholder="e.g., Restaurant Rival, FoodPanda Competitor"
              />
            </div>

            {/* Website */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                <Globe className="w-4 h-4 inline mr-1" />
                Website
              </label>
              <input
                type="url"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none transition"
                placeholder="https://www.competitor.com"
              />
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                <MapPin className="w-4 h-4 inline mr-1" />
                Location
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none transition"
                placeholder="e.g., București Centru, Delivery Only, Multiple Locations"
              />
            </div>
          </div>

          {/* Right Column - Business Details */}
          <div className="space-y-6">
            {/* Business Type */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Business Type *
              </label>
              <select
                required
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as 'restaurant' | 'delivery' | 'both' })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none transition"
              >
                <option value="restaurant">Restaurant Only</option>
                <option value="delivery">Delivery Only</option>
                <option value="both">Restaurant + Delivery</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Select the business model that best describes this competitor
              </p>
            </div>

            {/* Price Range */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                <Star className="w-4 h-4 inline mr-1" />
                Price Range *
              </label>
              <select
                required
                value={formData.price_range}
                onChange={(e) => setFormData({ ...formData, price_range: e.target.value as 'budget' | 'medium' | 'premium' })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none transition"
              >
                <option value="budget">Budget (Low Prices)</option>
                <option value="medium">Medium (Average Prices)</option>
                <option value="premium">Premium (High Prices)</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                General price positioning compared to market average
              </p>
            </div>

            {/* Status */}
            <div>
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-5 h-5 text-purple-600 border-2 border-gray-300 rounded focus:ring-purple-500"
                />
                <span className="text-sm font-bold text-gray-700">
                  Active Competitor
                </span>
              </label>
              <p className="text-xs text-gray-500 mt-1 ml-8">
                Uncheck to temporarily hide this competitor from analysis
              </p>
            </div>
          </div>
        </div>

        {/* Business Type Info Cards */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className={`p-4 rounded-lg border-2 transition ${
            formData.type === 'restaurant' 
              ? 'border-purple-300 bg-purple-50' 
              : 'border-gray-200 bg-gray-50'
          }`}>
            <h4 className="font-bold text-gray-900 mb-2">Restaurant Only</h4>
            <p className="text-sm text-gray-600">
              Traditional dining establishments with physical locations. Focus on dine-in experience.
            </p>
          </div>

          <div className={`p-4 rounded-lg border-2 transition ${
            formData.type === 'delivery' 
              ? 'border-purple-300 bg-purple-50' 
              : 'border-gray-200 bg-gray-50'
          }`}>
            <h4 className="font-bold text-gray-900 mb-2">Delivery Only</h4>
            <p className="text-sm text-gray-600">
              Cloud kitchens, ghost restaurants, or delivery-first businesses. Online presence only.
            </p>
          </div>

          <div className={`p-4 rounded-lg border-2 transition ${
            formData.type === 'both' 
              ? 'border-purple-300 bg-purple-50' 
              : 'border-gray-200 bg-gray-50'
          }`}>
            <h4 className="font-bold text-gray-900 mb-2">Restaurant + Delivery</h4>
            <p className="text-sm text-gray-600">
              Hybrid model with both physical dining and delivery options. Most comprehensive offering.
            </p>
          </div>
        </div>

        {/* Price Range Info */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
          <h4 className="font-bold text-blue-900 mb-2">Price Range Guidelines</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="font-semibold text-green-700">Budget:</span>
              <p className="text-blue-800">15-25 LEI main courses, focuses on value and affordability</p>
            </div>
            <div>
              <span className="font-semibold text-yellow-700">Medium:</span>
              <p className="text-blue-800">25-40 LEI main courses, balanced quality and price</p>
            </div>
            <div>
              <span className="font-semibold text-purple-700">Premium:</span>
              <p className="text-blue-800">40+ LEI main courses, high-end ingredients and experience</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4 mt-8">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg font-bold hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {loading ? 'Saving...' : (competitor ? 'Update Competitor' : 'Add Competitor')}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 bg-gray-300 text-gray-700 rounded-lg font-bold hover:bg-gray-400 transition"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}