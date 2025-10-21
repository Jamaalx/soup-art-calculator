'use client';

import { PriceComparison } from '@/types';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Target, 
  AlertCircle,
  CheckCircle,
  ArrowUp,
  ArrowDown
} from 'lucide-react';

interface ComparisonTableProps {
  comparisons: PriceComparison[];
  loading?: boolean;
}

export default function ComparisonTable({ comparisons, loading = false }: ComparisonTableProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg border-2 border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (comparisons.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg border-2 border-gray-200 p-8 text-center">
        <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-black text-gray-900 mb-2">No Price Comparisons Available</h3>
        <p className="text-gray-600 mb-4">
          Add competitor products to start comparing prices with your menu
        </p>
      </div>
    );
  }

  const getPositionIcon = (position: string) => {
    switch (position) {
      case 'below': return <TrendingDown className="w-5 h-5 text-green-600" />;
      case 'above': return <TrendingUp className="w-5 h-5 text-red-600" />;
      default: return <Minus className="w-5 h-5 text-yellow-600" />;
    }
  };

  const getPositionColor = (position: string) => {
    switch (position) {
      case 'below': return 'bg-green-100 text-green-800';
      case 'above': return 'bg-red-100 text-red-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getPositionLabel = (position: string) => {
    switch (position) {
      case 'below': return 'Below Market';
      case 'above': return 'Above Market';
      default: return 'Market Average';
    }
  };

  const getDifferenceIcon = (difference: number) => {
    if (difference > 0) return <ArrowUp className="w-4 h-4 text-red-600" />;
    if (difference < 0) return <ArrowDown className="w-4 h-4 text-green-600" />;
    return <Minus className="w-4 h-4 text-gray-600" />;
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border-2 border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black mb-2">Price Comparison Analysis</h2>
            <p className="text-blue-100">
              Compare your prices with competitors • {comparisons.length} products analyzed
            </p>
          </div>
          <Target className="w-8 h-8" />
        </div>
      </div>

      {/* Summary Stats */}
      <div className="p-6 border-b border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-1">Products Compared</p>
            <p className="text-2xl font-black text-gray-900">{comparisons.length}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-1">Below Market</p>
            <p className="text-2xl font-black text-green-600">
              {comparisons.filter(c => c.our_position === 'below').length}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-1">Above Market</p>
            <p className="text-2xl font-black text-red-600">
              {comparisons.filter(c => c.our_position === 'above').length}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-1">Market Average</p>
            <p className="text-2xl font-black text-yellow-600">
              {comparisons.filter(c => c.our_position === 'average').length}
            </p>
          </div>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-black text-gray-700 uppercase tracking-wider">
                Product
              </th>
              <th className="px-6 py-4 text-center text-xs font-black text-gray-700 uppercase tracking-wider">
                Our Price
              </th>
              <th className="px-6 py-4 text-center text-xs font-black text-gray-700 uppercase tracking-wider">
                Market Avg
              </th>
              <th className="px-6 py-4 text-center text-xs font-black text-gray-700 uppercase tracking-wider">
                Position
              </th>
              <th className="px-6 py-4 text-left text-xs font-black text-gray-700 uppercase tracking-wider">
                Competitors
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {comparisons.map((comparison, index) => (
              <tr key={index} className="hover:bg-gray-50 transition">
                <td className="px-6 py-4">
                  <div>
                    <p className="font-bold text-gray-900">{comparison.product_name}</p>
                    <p className="text-sm text-gray-600">
                      {comparison.competitor_prices.length} competitor{comparison.competitor_prices.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                </td>
                
                <td className="px-6 py-4 text-center">
                  <span className="text-lg font-black text-gray-900">
                    {comparison.our_price.toFixed(2)} LEI
                  </span>
                </td>

                <td className="px-6 py-4 text-center">
                  <span className="text-lg font-bold text-gray-700">
                    {comparison.market_average.toFixed(2)} LEI
                  </span>
                </td>

                <td className="px-6 py-4 text-center">
                  <div className="flex items-center justify-center gap-2">
                    {getPositionIcon(comparison.our_position)}
                    <span className={`px-3 py-1 rounded-full text-sm font-bold ${getPositionColor(comparison.our_position)}`}>
                      {getPositionLabel(comparison.our_position)}
                    </span>
                  </div>
                </td>

                <td className="px-6 py-4">
                  <div className="space-y-2">
                    {comparison.competitor_prices.map((comp, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span className="text-sm font-medium text-gray-900">
                          {comp.competitor_name}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-gray-900">
                            {comp.price.toFixed(2)} LEI
                          </span>
                          <div className="flex items-center gap-1">
                            {getDifferenceIcon(comp.difference)}
                            <span className={`text-xs font-bold ${
                              comp.difference > 0 ? 'text-red-600' : 
                              comp.difference < 0 ? 'text-green-600' : 'text-gray-600'
                            }`}>
                              {Math.abs(comp.difference).toFixed(2)} LEI
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Insights Section */}
      <div className="p-6 bg-gray-50 border-t border-gray-200">
        <h3 className="text-lg font-black text-gray-900 mb-4">Pricing Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Competitive Advantage */}
          <div className="p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
              <div>
                <p className="font-bold text-green-900 text-sm">Price Advantage</p>
                <p className="text-green-700 text-xs">
                  You have competitive pricing on {comparisons.filter(c => c.our_position === 'below').length} products
                </p>
              </div>
            </div>
          </div>

          {/* Optimization Opportunities */}
          <div className="p-4 bg-yellow-50 rounded-lg border-l-4 border-yellow-500">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div>
                <p className="font-bold text-yellow-900 text-sm">Review Needed</p>
                <p className="text-yellow-700 text-xs">
                  {comparisons.filter(c => c.our_position === 'above').length} products may be overpriced
                </p>
              </div>
            </div>
          </div>

          {/* Market Position */}
          <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
            <div className="flex items-start gap-3">
              <Target className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <p className="font-bold text-blue-900 text-sm">Market Position</p>
                <p className="text-blue-700 text-xs">
                  Overall competitive pricing strategy analysis
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}