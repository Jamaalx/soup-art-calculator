'use client';

import { Competitor } from '@/types';
import { 
  Building2, 
  Globe, 
  MapPin, 
  Star, 
  Edit, 
  Trash2, 
  ExternalLink,
  Store,
  Truck,
  Target,
  TrendingUp
} from 'lucide-react';

interface CompetitorCardProps {
  competitor: Competitor;
  onEdit: (competitor: Competitor) => void;
  onDelete: (id: string) => void;
  onViewProducts?: (competitor: Competitor) => void;
  productCount?: number;
}

export default function CompetitorCard({ 
  competitor, 
  onEdit, 
  onDelete, 
  onViewProducts,
  productCount = 0 
}: CompetitorCardProps) {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'restaurant': return Store;
      case 'delivery': return Truck;
      case 'both': return Building2;
      default: return Building2;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'restaurant': return 'Restaurant Only';
      case 'delivery': return 'Delivery Only';
      case 'both': return 'Restaurant + Delivery';
      default: return type;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'restaurant': return 'bg-blue-100 text-blue-700';
      case 'delivery': return 'bg-green-100 text-green-700';
      case 'both': return 'bg-purple-100 text-purple-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getPriceRangeColor = (range: string) => {
    switch (range) {
      case 'budget': return 'bg-green-100 text-green-700';
      case 'medium': return 'bg-yellow-100 text-yellow-700';
      case 'premium': return 'bg-purple-100 text-purple-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getPriceRangeLabel = (range: string) => {
    switch (range) {
      case 'budget': return 'Budget';
      case 'medium': return 'Medium';
      case 'premium': return 'Premium';
      default: return range;
    }
  };

  const TypeIcon = getTypeIcon(competitor.type);

  return (
    <div className="bg-white rounded-xl shadow-lg border-2 border-gray-200 hover:shadow-xl transition-all overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500 to-blue-500 p-4 text-white">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-black mb-1">{competitor.name}</h3>
            {competitor.location && (
              <p className="text-purple-100 text-sm flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {competitor.location}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <TypeIcon className="w-5 h-5" />
            {competitor.website && (
              <a
                href={competitor.website}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1 bg-white/20 rounded hover:bg-white/30 transition"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Business Type & Price Range */}
        <div className="flex flex-wrap gap-2 mb-4">
          <span className={`px-3 py-1 rounded-full text-sm font-bold ${getTypeColor(competitor.type)}`}>
            {getTypeLabel(competitor.type)}
          </span>
          <span className={`px-3 py-1 rounded-full text-sm font-bold ${getPriceRangeColor(competitor.price_range)}`}>
            <Star className="w-3 h-3 inline mr-1" />
            {getPriceRangeLabel(competitor.price_range)}
          </span>
        </div>

        {/* Website Link */}
        {competitor.website && (
          <div className="mb-4">
            <a
              href={competitor.website}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              <Globe className="w-4 h-4" />
              <span className="truncate">{competitor.website.replace(/^https?:\/\//, '')}</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">Tracked Products</p>
            <p className="text-xl font-black text-gray-900">{productCount}</p>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">Status</p>
            <p className={`text-sm font-bold ${
              competitor.is_active ? 'text-green-600' : 'text-red-600'
            }`}>
              {competitor.is_active ? 'Active' : 'Inactive'}
            </p>
          </div>
        </div>

        {/* Business Insights */}
        <div className="mb-4 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-500">
          <div className="flex items-start gap-2">
            <Target className="w-4 h-4 text-blue-600 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-blue-900">Market Position</p>
              <p className="text-xs text-blue-700">
                {competitor.price_range === 'budget' && 'Competes on value and affordability'}
                {competitor.price_range === 'medium' && 'Balanced quality-price positioning'}
                {competitor.price_range === 'premium' && 'High-end market with premium pricing'}
              </p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        {onViewProducts && productCount > 0 && (
          <button
            onClick={() => onViewProducts(competitor)}
            className="w-full mb-3 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg font-bold hover:bg-blue-200 transition flex items-center justify-center gap-2"
          >
            <TrendingUp className="w-4 h-4" />
            View Price Analysis
          </button>
        )}
      </div>

      {/* Actions */}
      <div className="border-t border-gray-200 p-3">
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(competitor)}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-500 text-white rounded-lg font-bold hover:bg-blue-600 transition text-sm"
          >
            <Edit className="w-4 h-4" />
            Edit
          </button>
          
          {onViewProducts && (
            <button
              onClick={() => onViewProducts(competitor)}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-purple-500 text-white rounded-lg font-bold hover:bg-purple-600 transition text-sm"
            >
              <Target className="w-4 h-4" />
              Products
            </button>
          )}

          <button
            onClick={() => onDelete(competitor.id)}
            className="px-3 py-2 bg-red-500 text-white rounded-lg font-bold hover:bg-red-600 transition"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Created Date */}
      <div className="px-3 pb-2">
        <p className="text-xs text-gray-500">
          Added {competitor.created_at ? new Date(competitor.created_at).toLocaleDateString() : 'Recently'}
        </p>
      </div>
    </div>
  );
}