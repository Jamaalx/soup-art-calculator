'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useExportJobs, usePlatformIntegrations, useQuickExport } from '@/lib/hooks/useMenuExport';
import MenuExportWizard from '@/components/menu-configurator/MenuExportWizard';
import { 
  Download, 
  Upload, 
  Settings, 
  Zap,
  Eye,
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle,
  X,
  Truck,
  Package,
  Smartphone,
  Globe,
  FileText,
  BarChart3,
  Plus,
  ArrowRight
} from 'lucide-react';
import React from 'react';

export default function MenuExportPage() {
  const { jobs, loading: jobsLoading } = useExportJobs();
  const { integrations, loading: integrationsLoading } = usePlatformIntegrations();
  const { quickExport, loading: exportLoading } = useQuickExport();
  
  const [activeTab, setActiveTab] = useState<'wizard' | 'jobs' | 'integrations'>('wizard');

  const tabs = [
    { key: 'wizard', label: 'Export Wizard', icon: Download },
    { key: 'jobs', label: 'Export Jobs', icon: FileText },
    { key: 'integrations', label: 'Platform Settings', icon: Settings }
  ];

  const platformIcons = {
    glovo: Truck,
    bolt: Package,
    tazz: Smartphone,
    uber: Globe,
    foodpanda: Upload
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return CheckCircle;
      case 'processing':
        return Clock;
      case 'failed':
        return AlertCircle;
      default:
        return Clock;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600';
      case 'processing':
        return 'text-blue-600';
      case 'failed':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const handleQuickExport = async (platform: string) => {
    await quickExport(platform as any, 'csv');
  };

  if (activeTab === 'wizard') {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-lg p-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <Download className="w-8 h-8" />
                <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-bold">MENU EXPORT</span>
              </div>
              <h1 className="text-4xl font-black mb-2">Menu Export Center</h1>
              <p className="text-blue-100">
                Export your menu to delivery platforms with optimized formatting
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-lg border-2 border-gray-200 overflow-hidden">
          <div className="border-b border-gray-200">
            <div className="flex">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 font-bold transition ${
                    activeTab === tab.key
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {React.createElement(tab.icon, { className: 'w-5 h-5' })}
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <MenuExportWizard />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-lg p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <Download className="w-8 h-8" />
              <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-bold">MENU EXPORT</span>
            </div>
            <h1 className="text-4xl font-black mb-2">Menu Export Center</h1>
            <p className="text-blue-100">
              Export your menu to delivery platforms with optimized formatting
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-lg border-2 border-gray-200 overflow-hidden">
        <div className="border-b border-gray-200">
          <div className="flex">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 font-bold transition ${
                  activeTab === tab.key
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                {React.createElement(tab.icon, { className: 'w-5 h-5' })}
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6">
          {activeTab === 'jobs' && (
            <div className="space-y-6">
              {/* Quick Export Actions */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-6 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl text-white">
                  <div className="flex items-center gap-3 mb-3">
                    <Truck className="w-6 h-6" />
                    <h3 className="font-bold">Glovo Quick Export</h3>
                  </div>
                  <p className="text-sm text-yellow-100 mb-4">
                    Export current menu to Glovo format
                  </p>
                  <button
                    onClick={() => handleQuickExport('glovo')}
                    disabled={exportLoading}
                    className="w-full px-4 py-2 bg-white text-yellow-600 rounded-lg font-bold hover:bg-gray-100 disabled:opacity-50 transition flex items-center justify-center gap-2"
                  >
                    <Zap className="w-4 h-4" />
                    Quick Export
                  </button>
                </div>

                <div className="p-6 bg-gradient-to-r from-green-500 to-teal-500 rounded-xl text-white">
                  <div className="flex items-center gap-3 mb-3">
                    <Package className="w-6 h-6" />
                    <h3 className="font-bold">Bolt Food Quick Export</h3>
                  </div>
                  <p className="text-sm text-green-100 mb-4">
                    Export current menu to Bolt Food format
                  </p>
                  <button
                    onClick={() => handleQuickExport('bolt')}
                    disabled={exportLoading}
                    className="w-full px-4 py-2 bg-white text-green-600 rounded-lg font-bold hover:bg-gray-100 disabled:opacity-50 transition flex items-center justify-center gap-2"
                  >
                    <Zap className="w-4 h-4" />
                    Quick Export
                  </button>
                </div>

                <div className="p-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl text-white">
                  <div className="flex items-center gap-3 mb-3">
                    <FileText className="w-6 h-6" />
                    <h3 className="font-bold">All Platforms Export</h3>
                  </div>
                  <p className="text-sm text-blue-100 mb-4">
                    Export unified menu for all platforms
                  </p>
                  <button
                    onClick={() => handleQuickExport('all')}
                    disabled={exportLoading}
                    className="w-full px-4 py-2 bg-white text-blue-600 rounded-lg font-bold hover:bg-gray-100 disabled:opacity-50 transition flex items-center justify-center gap-2"
                  >
                    <Zap className="w-4 h-4" />
                    Quick Export
                  </button>
                </div>
              </div>

              {/* Export Jobs List */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-black text-gray-900">Recent Export Jobs</h3>
                  <button
                    onClick={() => setActiveTab('wizard')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    New Export
                  </button>
                </div>

                {jobsLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading export jobs...</p>
                  </div>
                ) : jobs.length === 0 ? (
                  <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
                    <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h4 className="text-xl font-black text-gray-900 mb-2">No Export Jobs Yet</h4>
                    <p className="text-gray-600 mb-6">
                      Create your first menu export using the wizard
                    </p>
                    <button
                      onClick={() => setActiveTab('wizard')}
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition flex items-center gap-2 mx-auto"
                    >
                      <Plus className="w-5 h-5" />
                      Start Export
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {jobs.map((job) => (
                      <div key={job.id} className="p-4 border border-gray-200 rounded-lg hover:shadow-lg transition">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                              {React.createElement(
                                platformIcons[job.platform as keyof typeof platformIcons] || FileText,
                                { className: 'w-5 h-5 text-blue-600' }
                              )}
                            </div>
                            <div>
                              <h4 className="font-bold text-gray-900">{job.name}</h4>
                              <p className="text-sm text-gray-600">
                                {job.products.length} products • {job.format.toUpperCase()} format
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <div className={`flex items-center gap-1 ${getStatusColor(job.status)}`}>
                                {React.createElement(getStatusIcon(job.status), { className: 'w-4 h-4' })}
                                <span className="text-sm font-bold capitalize">{job.status}</span>
                              </div>
                              <p className="text-xs text-gray-500">
                                {new Date(job.created_at).toLocaleDateString()}
                              </p>
                            </div>

                            <div className="flex gap-2">
                              <button className="p-2 bg-gray-100 text-gray-600 rounded hover:bg-gray-200 transition">
                                <Eye className="w-4 h-4" />
                              </button>
                              {job.status === 'completed' && (
                                <button className="p-2 bg-green-100 text-green-600 rounded hover:bg-green-200 transition">
                                  <Download className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'integrations' && (
            <div className="space-y-6">
              <h3 className="text-lg font-black text-gray-900">Platform Integrations</h3>

              {integrationsLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading platform integrations...</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {integrations.map((integration) => (
                    <div key={integration.platform} className="p-6 border-2 border-gray-200 rounded-xl">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="p-3 bg-blue-100 rounded-lg">
                            {React.createElement(
                              platformIcons[integration.platform as keyof typeof platformIcons] || FileText,
                              { className: 'w-6 h-6 text-blue-600' }
                            )}
                          </div>
                          <div>
                            <h4 className="font-bold text-gray-900 capitalize">{integration.platform}</h4>
                            <p className="text-sm text-gray-600">
                              {integration.enabled ? 'Connected' : 'Not connected'}
                            </p>
                          </div>
                        </div>

                        <div className={`w-3 h-3 rounded-full ${
                          integration.enabled ? 'bg-green-500' : 'bg-gray-400'
                        }`}></div>
                      </div>

                      {integration.enabled && (
                        <div className="space-y-3">
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-gray-600">Auto Sync:</p>
                              <p className="font-bold text-gray-900">
                                {integration.sync_settings.auto_sync ? 'Enabled' : 'Disabled'}
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-600">Frequency:</p>
                              <p className="font-bold text-gray-900 capitalize">
                                {integration.sync_settings.sync_frequency}
                              </p>
                            </div>
                          </div>

                          {integration.last_sync && (
                            <div className="text-sm">
                              <p className="text-gray-600">Last Sync:</p>
                              <p className="font-bold text-gray-900">
                                {new Date(integration.last_sync).toLocaleString()}
                              </p>
                            </div>
                          )}

                          <div className="flex gap-2 pt-2">
                            <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition">
                              Configure
                            </button>
                            <button className="px-4 py-2 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition">
                              Sync Now
                            </button>
                          </div>
                        </div>
                      )}

                      {!integration.enabled && (
                        <button className="w-full px-4 py-3 bg-gray-200 text-gray-700 rounded-lg font-bold hover:bg-gray-300 transition">
                          Connect Platform
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Integration Tips */}
              <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Settings className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-black text-blue-900 mb-2">Platform Integration Benefits</h3>
                    <ul className="space-y-1 text-sm text-blue-800">
                      <li>• Automatic menu synchronization across platforms</li>
                      <li>• Real-time price and availability updates</li>
                      <li>• Bulk product management from one dashboard</li>
                      <li>• Consistent menu formatting and compliance</li>
                      <li>• Reduced manual export and upload time</li>
                      <li>• Error prevention with automated validation</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          href="/dashboard/menu-export/wizard"
          className="p-6 bg-white rounded-xl shadow-lg border-2 border-gray-200 hover:shadow-xl transition-all group"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition">
              <Download className="w-6 h-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-lg text-gray-900">Export Wizard</h3>
              <p className="text-sm text-gray-600">Step-by-step menu export process</p>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition" />
          </div>
        </Link>

        <Link
          href="/dashboard/menu-export/templates"
          className="p-6 bg-white rounded-xl shadow-lg border-2 border-gray-200 hover:shadow-xl transition-all group"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-lg group-hover:bg-green-200 transition">
              <FileText className="w-6 h-6 text-green-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-lg text-gray-900">Export Templates</h3>
              <p className="text-sm text-gray-600">Manage platform-specific templates</p>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-green-600 transition" />
          </div>
        </Link>

        <Link
          href="/dashboard/menu-export/analytics"
          className="p-6 bg-white rounded-xl shadow-lg border-2 border-gray-200 hover:shadow-xl transition-all group"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition">
              <BarChart3 className="w-6 h-6 text-purple-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-lg text-gray-900">Export Analytics</h3>
              <p className="text-sm text-gray-600">Track export performance and metrics</p>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-purple-600 transition" />
          </div>
        </Link>
      </div>
    </div>
  );
}