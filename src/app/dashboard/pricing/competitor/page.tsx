'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  Plus, 
  Search, 
  Filter, 
  Target, 
  TrendingUp, 
  Building2, 
  BarChart3,
  AlertTriangle,
  CheckCircle,
  Eye,
  ArrowRight
} from 'lucide-react';
import { useCompetitors, useMarketInsights, usePriceComparison } from '@/lib/hooks/useCompetitors';
import { Competitor } from '@/types';
import CompetitorCard from '@/components/competitor/CompetitorCard';
import CompetitorForm from '@/components/competitor/CompetitorForm';
import ComparisonTable from '@/components/competitor/ComparisonTable';

export default function CompetitorAnalysisPage() {
  const { competitors, loading, error, createCompetitor, updateCompetitor, deleteCompetitor } = useCompetitors();
  const { insights, loading: insightsLoading } = useMarketInsights();
  const { comparisons, loading: comparisonsLoading } = usePriceComparison();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedPriceRange, setSelectedPriceRange] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editingCompetitor, setEditingCompetitor] = useState<Competitor | null>(null);
  const [activeTab, setActiveTab] = useState<'competitors' | 'analysis'>('competitors');

  // Filter competitors
  const filteredCompetitors = competitors.filter(competitor => {
    const matchesSearch = competitor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         competitor.location?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || competitor.type === selectedType;
    const matchesPriceRange = selectedPriceRange === 'all' || competitor.price_range === selectedPriceRange;
    return matchesSearch && matchesType && matchesPriceRange;
  });

  const handleCreateCompetitor = async (competitorData: Omit<Competitor, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      await createCompetitor(competitorData);
      setShowForm(false);
    } catch (err) {
      console.error('Failed to create competitor:', err);
    }
  };

  const handleUpdateCompetitor = async (competitorData: Omit<Competitor, 'id' | 'created_at' | 'updated_at'>) => {
    if (!editingCompetitor) return;
    
    try {
      await updateCompetitor(editingCompetitor.id, competitorData);
      setEditingCompetitor(null);
      setShowForm(false);
    } catch (err) {
      console.error('Failed to update competitor:', err);
    }
  };

  const handleEditCompetitor = (competitor: Competitor) => {
    setEditingCompetitor(competitor);
    setShowForm(true);
  };

  const handleDeleteCompetitor = async (id: string) => {
    if (confirm('Are you sure you want to delete this competitor? This will also remove all their tracked products.')) {
      try {
        await deleteCompetitor(id);
      } catch (err) {
        console.error('Failed to delete competitor:', err);
      }
    }
  };

  const handleViewProducts = (competitor: Competitor) => {
    // Navigate to competitor products page (to be implemented)
    console.log('View products for:', competitor.name);
  };

  if (showForm) {
    return (
      <CompetitorForm
        competitor={editingCompetitor || undefined}
        onSave={editingCompetitor ? handleUpdateCompetitor : handleCreateCompetitor}
        onCancel={() => {
          setShowForm(false);
          setEditingCompetitor(null);
        }}
      />
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-semibold">Loading competitor data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl shadow-lg p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <Target className="w-8 h-8" />
              <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-bold">COMPETITOR ANALYSIS</span>
            </div>
            <h1 className="text-4xl font-black mb-2">Market Intelligence</h1>
            <p className="text-purple-100">
              Track competitors, analyze pricing strategies, and maintain market advantage
            </p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="px-6 py-3 bg-white text-purple-600 rounded-xl font-bold hover:bg-gray-100 shadow-lg transition transform hover:scale-105 flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add Competitor
          </button>
        </div>
      </div>

      {/* Market Insights */}
      {insights && !insightsLoading && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Building2 className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-1">Total Competitors</p>
            <p className="text-3xl font-black text-gray-900">{insights.totalCompetitors}</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <BarChart3 className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-1">Tracked Products</p>
            <p className="text-3xl font-black text-gray-900">{insights.totalTrackedProducts}</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-1">Price Advantage</p>
            <p className="text-3xl font-black text-gray-900">{insights.priceAdvantage.toFixed(0)}%</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-orange-100 rounded-lg">
                <Target className="w-6 h-6 text-orange-600" />
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-1">Avg Price Diff</p>
            <p className={`text-3xl font-black ${
              insights.avgPriceDifference >= 0 ? 'text-red-900' : 'text-green-900'
            }`}>
              {insights.avgPriceDifference >= 0 ? '+' : ''}{insights.avgPriceDifference.toFixed(1)} LEI
            </p>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="bg-white rounded-xl shadow-lg border-2 border-gray-200 overflow-hidden">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('competitors')}
            className={`flex-1 px-6 py-4 font-bold transition ${
              activeTab === 'competitors'
                ? 'bg-purple-50 text-purple-700 border-b-2 border-purple-500'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Building2 className="w-5 h-5 inline mr-2" />
            Competitors ({competitors.length})
          </button>
          <button
            onClick={() => setActiveTab('analysis')}
            className={`flex-1 px-6 py-4 font-bold transition ${
              activeTab === 'analysis'
                ? 'bg-purple-50 text-purple-700 border-b-2 border-purple-500'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <BarChart3 className="w-5 h-5 inline mr-2" />
            Price Analysis ({comparisons.length})
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'competitors' ? (
            <>
              {/* Filters */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search competitors..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none transition"
                  />
                </div>

                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none transition"
                >
                  <option value="all">All Types</option>
                  <option value="restaurant">Restaurant Only</option>
                  <option value="delivery">Delivery Only</option>
                  <option value="both">Restaurant + Delivery</option>
                </select>

                <select
                  value={selectedPriceRange}
                  onChange={(e) => setSelectedPriceRange(e.target.value)}
                  className="px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none transition"
                >
                  <option value="all">All Price Ranges</option>
                  <option value="budget">Budget</option>
                  <option value="medium">Medium</option>
                  <option value="premium">Premium</option>
                </select>

                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Filter className="w-4 h-4" />
                  <span>Showing {filteredCompetitors.length} of {competitors.length}</span>
                </div>
              </div>

              {/* Competitors Grid */}
              {filteredCompetitors.length === 0 ? (
                <div className="text-center py-12">
                  <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-black text-gray-900 mb-2">
                    {competitors.length === 0 ? 'No Competitors Added Yet' : 'No Competitors Found'}
                  </h3>
                  <p className="text-gray-600 mb-6">
                    {competitors.length === 0 
                      ? 'Start tracking your competition to gain market insights'
                      : 'Try adjusting your search or filter criteria'
                    }
                  </p>
                  {competitors.length === 0 && (
                    <button
                      onClick={() => setShowForm(true)}
                      className="px-6 py-3 bg-purple-600 text-white rounded-lg font-bold hover:bg-purple-700 transition flex items-center gap-2 mx-auto"
                    >
                      <Plus className="w-5 h-5" />
                      Add First Competitor
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredCompetitors.map((competitor) => (
                    <CompetitorCard
                      key={competitor.id}
                      competitor={competitor}
                      onEdit={handleEditCompetitor}
                      onDelete={handleDeleteCompetitor}
                      onViewProducts={handleViewProducts}
                      productCount={0} // TODO: Get actual product count
                    />
                  ))}
                </div>
              )}
            </>
          ) : (
            <ComparisonTable 
              comparisons={comparisons} 
              loading={comparisonsLoading} 
            />
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          href="/dashboard/pricing"
          className="p-6 bg-white rounded-xl shadow-lg border-2 border-gray-200 hover:shadow-xl transition-all group"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-lg group-hover:bg-green-200 transition">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-gray-900">Optimize Pricing</h3>
              <p className="text-sm text-gray-600">Adjust your prices based on analysis</p>
            </div>
          </div>
        </Link>

        <Link
          href="/dashboard/reports/menu-performance"
          className="p-6 bg-white rounded-xl shadow-lg border-2 border-gray-200 hover:shadow-xl transition-all group"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition">
              <BarChart3 className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-gray-900">View Reports</h3>
              <p className="text-sm text-gray-600">Analyze market performance</p>
            </div>
          </div>
        </Link>

        <div className="p-6 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl border-2 border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-lg text-purple-900">Market Position</h3>
              <p className="text-sm text-purple-700">
                {insights?.priceAdvantage ? 
                  `${insights.priceAdvantage.toFixed(0)}% competitive advantage` :
                  'Building competitive intelligence'
                }
              </p>
            </div>
            <Eye className="w-8 h-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Tips Section */}
      <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <div className="p-2 bg-blue-100 rounded-lg">
            <AlertTriangle className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="font-black text-blue-900 mb-2">Competitive Analysis Best Practices</h3>
            <ul className="space-y-1 text-sm text-blue-800">
              <li>• Update competitor prices weekly for accurate market data</li>
              <li>• Track both direct and indirect competitors in your area</li>
              <li>• Monitor seasonal pricing changes and promotional strategies</li>
              <li>• Focus on value proposition, not just price matching</li>
              <li>• Use insights to identify gaps in the market</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}