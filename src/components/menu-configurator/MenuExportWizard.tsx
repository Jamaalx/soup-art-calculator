'use client';

import React, { useState } from 'react';
import { useMenuExport } from '@/lib/hooks/useMenuExport';
import { ExportableProduct, ExportPlatform } from '@/types';
import { 
  Download, 
  CheckCircle, 
  ArrowRight, 
  ArrowLeft,
  FileText,
  Settings,
  Filter,
  Upload,
  Smartphone,
  Globe,
  Truck,
  Package,
  Eye,
  X,
  AlertCircle,
  Loader
} from 'lucide-react';

interface PlatformConfig {
  key: ExportPlatform;
  name: string;
  icon: any;
  color: string;
  description: string;
  formats: Array<'csv' | 'json' | 'excel' | 'pdf'>;
}

const PLATFORMS: PlatformConfig[] = [
  {
    key: 'glovo',
    name: 'Glovo',
    icon: Truck,
    color: 'bg-yellow-500',
    description: 'Export menu for Glovo delivery platform',
    formats: ['csv', 'json', 'excel']
  },
  {
    key: 'bolt',
    name: 'Bolt Food',
    icon: Package,
    color: 'bg-green-500',
    description: 'Export menu for Bolt Food delivery platform',
    formats: ['csv', 'json', 'pdf']
  },
  {
    key: 'tazz',
    name: 'Tazz',
    icon: Smartphone,
    color: 'bg-red-500',
    description: 'Export menu for Tazz delivery platform',
    formats: ['csv', 'json', 'excel']
  },
  {
    key: 'uber',
    name: 'Uber Eats',
    icon: Globe,
    color: 'bg-black',
    description: 'Export menu for Uber Eats delivery platform',
    formats: ['csv', 'json', 'pdf']
  },
  {
    key: 'foodpanda',
    name: 'foodpanda',
    icon: Upload,
    color: 'bg-pink-500',
    description: 'Export menu for foodpanda delivery platform',
    formats: ['csv', 'json', 'excel']
  },
  {
    key: 'all',
    name: 'All Platforms',
    icon: FileText,
    color: 'bg-blue-500',
    description: 'Export unified menu for all platforms',
    formats: ['csv', 'json', 'excel', 'pdf']
  }
];

type WizardStep = 'platform' | 'products' | 'format' | 'review' | 'export';

export default function MenuExportWizard() {
  const {
    products,
    templates,
    isLoading,
    selectedProducts,
    selectedPlatform,
    selectedFormat,
    setSelectedProducts,
    setSelectedPlatform,
    setSelectedFormat,
    createAndProcessExport,
    quickExport
  } = useMenuExport();

  const [currentStep, setCurrentStep] = useState<WizardStep>('platform');
  const [selectedPlatformConfig, setSelectedPlatformConfig] = useState<PlatformConfig | null>(null);
  const [filters, setFilters] = useState({
    categories: [] as string[],
    priceRange: { min: 0, max: 1000 },
    availableOnly: true,
    platformEnabledOnly: true
  });
  const [exportLoading, setExportLoading] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);

  const steps = [
    { key: 'platform', label: 'Platform', icon: Truck },
    { key: 'products', label: 'Products', icon: Package },
    { key: 'format', label: 'Format', icon: FileText },
    { key: 'review', label: 'Review', icon: Eye },
    { key: 'export', label: 'Export', icon: Download }
  ];

  const getStepIndex = (step: WizardStep) => steps.findIndex(s => s.key === step);
  const currentStepIndex = getStepIndex(currentStep);

  const canProceed = () => {
    switch (currentStep) {
      case 'platform':
        return selectedPlatformConfig !== null;
      case 'products':
        return selectedProducts.length > 0;
      case 'format':
        return !!selectedFormat;
      case 'review':
        return true;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (!canProceed()) return;
    
    const nextStepIndex = currentStepIndex + 1;
    if (nextStepIndex < steps.length) {
      setCurrentStep(steps[nextStepIndex].key as WizardStep);
    }
  };

  const handleBack = () => {
    const prevStepIndex = currentStepIndex - 1;
    if (prevStepIndex >= 0) {
      setCurrentStep(steps[prevStepIndex].key as WizardStep);
    }
  };

  const handlePlatformSelect = (platform: PlatformConfig) => {
    setSelectedPlatformConfig(platform);
    setSelectedPlatform(platform.key === 'all' ? 'standard' : platform.key);
    
    // Auto-filter products based on platform
    if (platform.key !== 'all') {
      const platformProducts = products.filter(p => 
        p.delivery_platforms[platform.key as keyof typeof p.delivery_platforms]
      );
      setSelectedProducts(platformProducts);
    } else {
      setSelectedProducts(products);
    }
  };

  const handleProductToggle = (product: ExportableProduct) => {
    setSelectedProducts(prev => {
      const exists = prev.find(p => p.id === product.id);
      if (exists) {
        return prev.filter(p => p.id !== product.id);
      } else {
        return [...prev, product];
      }
    });
  };

  const handleSelectAll = () => {
    const filteredProducts = getFilteredProducts();
    setSelectedProducts(filteredProducts);
  };

  const handleDeselectAll = () => {
    setSelectedProducts([]);
  };

  const getFilteredProducts = () => {
    let filtered = products;

    if (filters.categories.length > 0) {
      filtered = filtered.filter(p => filters.categories.includes(p.category));
    }

    if (filters.availableOnly) {
      filtered = filtered.filter(p => p.availability.available);
    }

    if (filters.platformEnabledOnly && selectedPlatformConfig && selectedPlatformConfig.key !== 'all') {
      filtered = filtered.filter(p => 
        p.delivery_platforms[selectedPlatformConfig.key as keyof typeof p.delivery_platforms]
      );
    }

    filtered = filtered.filter(p => 
      p.price >= filters.priceRange.min && p.price <= filters.priceRange.max
    );

    return filtered;
  };

  const handleExport = async () => {
    if (!selectedPlatformConfig) return;
    
    setExportLoading(true);
    
    try {
      if (selectedPlatformConfig.key === 'all') {
        await quickExport('all', selectedFormat as 'csv' | 'json');
      } else {
        await createAndProcessExport(
          selectedPlatform,
          selectedFormat as 'csv' | 'json' | 'excel' | 'pdf',
          selectedProducts,
          filters
        );
      }
      
      setExportSuccess(true);
      setCurrentStep('export');
    } catch (err) {
      console.error('Export failed:', err);
    } finally {
      setExportLoading(false);
    }
  };

  const resetWizard = () => {
    setCurrentStep('platform');
    setSelectedPlatformConfig(null);
    setSelectedProducts([]);
    setSelectedFormat('csv');
    setExportSuccess(false);
  };

  const categories = [...new Set(products.map(p => p.category))];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-semibold">Loading export wizard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
        <div className="flex items-center gap-3 mb-3">
          <Download className="w-8 h-8" />
          <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-bold">MENU EXPORT</span>
        </div>
        <h2 className="text-2xl font-black mb-2">Menu Export Wizard</h2>
        <p className="text-blue-100">
          Export your menu to delivery platforms in just a few steps
        </p>
      </div>

      {/* Progress Steps */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const isActive = index === currentStepIndex;
            const isCompleted = index < currentStepIndex;
            const isAccessible = index <= currentStepIndex;
            
            return (
              <div key={step.key} className="flex items-center">
                <div className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                  isActive ? 'bg-blue-600 text-white' :
                  isCompleted ? 'bg-green-100 text-green-800' :
                  isAccessible ? 'bg-gray-100 text-gray-700' :
                  'bg-gray-50 text-gray-400'
                }`}>
                  {isCompleted ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    React.createElement(step.icon, { className: 'w-5 h-5' })
                  )}
                  <span className="font-bold">{step.label}</span>
                </div>
                {index < steps.length - 1 && (
                  <ArrowRight className="w-5 h-5 text-gray-400 mx-2" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Step Content */}
      <div className="p-6">
        {currentStep === 'platform' && (
          <div className="space-y-6">
            <h3 className="text-lg font-black text-gray-900">Select Delivery Platform</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {PLATFORMS.map((platform) => (
                <button
                  key={platform.key}
                  onClick={() => handlePlatformSelect(platform)}
                  className={`p-6 border-2 rounded-xl transition-all text-left ${
                    selectedPlatformConfig?.key === platform.key
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 hover:shadow-lg'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`p-3 ${platform.color} text-white rounded-lg`}>
                      {React.createElement(platform.icon, { className: 'w-6 h-6' })}
                    </div>
                    <h4 className="font-bold text-gray-900">{platform.name}</h4>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{platform.description}</p>
                  <div className="flex gap-2 flex-wrap">
                    {platform.formats.map(format => (
                      <span key={format} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium">
                        {format.toUpperCase()}
                      </span>
                    ))}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {currentStep === 'products' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-gray-900">Select Products</h3>
              <div className="flex gap-2">
                <button
                  onClick={handleSelectAll}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition"
                >
                  Select All
                </button>
                <button
                  onClick={handleDeselectAll}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg font-bold hover:bg-gray-400 transition"
                >
                  Deselect All
                </button>
              </div>
            </div>

            {/* Filters */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <Filter className="w-5 h-5 text-gray-600" />
                <h4 className="font-bold text-gray-900">Filters</h4>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Categories</label>
                  <select
                    multiple
                    value={filters.categories}
                    onChange={(e) => setFilters({
                      ...filters,
                      categories: Array.from(e.target.selectedOptions, option => option.value)
                    })}
                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                  >
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Min Price (LEI)</label>
                  <input
                    type="number"
                    value={filters.priceRange.min}
                    onChange={(e) => setFilters({
                      ...filters,
                      priceRange: { ...filters.priceRange, min: Number(e.target.value) }
                    })}
                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Max Price (LEI)</label>
                  <input
                    type="number"
                    value={filters.priceRange.max}
                    onChange={(e) => setFilters({
                      ...filters,
                      priceRange: { ...filters.priceRange, max: Number(e.target.value) }
                    })}
                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={filters.availableOnly}
                      onChange={(e) => setFilters({
                        ...filters,
                        availableOnly: e.target.checked
                      })}
                      className="w-4 h-4 text-blue-600 border-2 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Available only</span>
                  </label>
                  
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={filters.platformEnabledOnly}
                      onChange={(e) => setFilters({
                        ...filters,
                        platformEnabledOnly: e.target.checked
                      })}
                      className="w-4 h-4 text-blue-600 border-2 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Platform enabled</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Products List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
              {getFilteredProducts().map((product) => {
                const isSelected = selectedProducts.find(p => p.id === product.id);
                
                return (
                  <div
                    key={product.id}
                    onClick={() => handleProductToggle(product)}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={!!isSelected}
                        onChange={() => {}} // Handled by parent onClick
                        className="w-5 h-5 text-blue-600 border-2 border-gray-300 rounded focus:ring-blue-500 mt-1"
                      />
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-900 mb-1">{product.name}</h4>
                        <p className="text-sm text-gray-600 mb-2">{product.category}</p>
                        <p className="text-lg font-black text-blue-600">{product.price.toFixed(2)} LEI</p>
                        
                        {/* Platform availability */}
                        <div className="flex gap-1 mt-2">
                          {Object.entries(product.delivery_platforms).map(([platform, enabled]) => (
                            <span
                              key={platform}
                              className={`px-2 py-1 rounded text-xs font-medium ${
                                enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                              }`}
                            >
                              {platform}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="text-center text-sm text-gray-600">
              {selectedProducts.length} of {getFilteredProducts().length} products selected
            </div>
          </div>
        )}

        {currentStep === 'format' && (
          <div className="space-y-6">
            <h3 className="text-lg font-black text-gray-900">Select Export Format</h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {selectedPlatformConfig?.formats.map((format) => (
                <button
                  key={format}
                  onClick={() => setSelectedFormat(format)}
                  className={`p-6 border-2 rounded-xl transition-all text-center ${
                    selectedFormat === format
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <FileText className="w-8 h-8 mx-auto mb-3 text-gray-600" />
                  <h4 className="font-bold text-gray-900 mb-2">{format.toUpperCase()}</h4>
                  <p className="text-sm text-gray-600">
                    {format === 'csv' && 'Comma-separated values'}
                    {format === 'json' && 'JavaScript Object Notation'}
                    {format === 'excel' && 'Microsoft Excel format'}
                    {format === 'pdf' && 'Portable Document Format'}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}

        {currentStep === 'review' && (
          <div className="space-y-6">
            <h3 className="text-lg font-black text-gray-900">Review Export Settings</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-bold text-gray-900 mb-2">Platform</h4>
                <div className="flex items-center gap-2">
                  {selectedPlatformConfig && (
                    <>
                      <div className={`p-2 ${selectedPlatformConfig.color} text-white rounded`}>
                        {React.createElement(selectedPlatformConfig.icon, { className: 'w-4 h-4' })}
                      </div>
                      <span className="font-medium">{selectedPlatformConfig.name}</span>
                    </>
                  )}
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-bold text-gray-900 mb-2">Products</h4>
                <p className="text-2xl font-black text-blue-600">{selectedProducts.length}</p>
                <p className="text-sm text-gray-600">products selected</p>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-bold text-gray-900 mb-2">Format</h4>
                <p className="text-lg font-bold text-gray-900">{selectedFormat.toUpperCase()}</p>
              </div>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
              <h4 className="font-bold text-blue-900 mb-2">Export Preview</h4>
              <p className="text-sm text-blue-800">
                Your menu will be exported with {selectedProducts.length} products in {selectedFormat.toUpperCase()} format 
                for {selectedPlatformConfig?.name}. The file will be automatically downloaded when ready.
              </p>
            </div>
          </div>
        )}

        {currentStep === 'export' && (
          <div className="text-center space-y-6">
            {exportLoading ? (
              <>
                <Loader className="w-16 h-16 text-blue-600 mx-auto mb-4 animate-spin" />
                <h3 className="text-xl font-black text-gray-900">Exporting Menu...</h3>
                <p className="text-gray-600">
                  Processing {selectedProducts.length} products for {selectedPlatformConfig?.name}
                </p>
              </>
            ) : exportSuccess ? (
              <>
                <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                <h3 className="text-xl font-black text-gray-900">Export Completed!</h3>
                <p className="text-gray-600">
                  Your menu has been successfully exported and downloaded.
                </p>
                <button
                  onClick={resetWizard}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition"
                >
                  Export Another Menu
                </button>
              </>
            ) : (
              <>
                <AlertCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
                <h3 className="text-xl font-black text-gray-900">Export Failed</h3>
                <p className="text-gray-600">
                  There was an error exporting your menu. Please try again.
                </p>
                <button
                  onClick={() => setCurrentStep('review')}
                  className="px-6 py-3 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition"
                >
                  Try Again
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Navigation */}
      {currentStep !== 'export' && (
        <div className="flex justify-between items-center p-6 border-t border-gray-200">
          <button
            onClick={handleBack}
            disabled={currentStepIndex === 0}
            className="px-6 py-3 bg-gray-300 text-gray-700 rounded-lg font-bold hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>

          {currentStep === 'review' ? (
            <button
              onClick={handleExport}
              disabled={exportLoading}
              className="px-6 py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2"
            >
              {exportLoading ? (
                <Loader className="w-5 h-5 animate-spin" />
              ) : (
                <Download className="w-5 h-5" />
              )}
              {exportLoading ? 'Exporting...' : 'Export Menu'}
            </button>
          ) : (
            <button
              onClick={handleNext}
              disabled={!canProceed()}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2"
            >
              Next
              <ArrowRight className="w-5 h-5" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}