'use client';

import { useState, useEffect } from 'react';
import { Truck, Plus, Edit2, Trash2, ToggleLeft, ToggleRight, Save, X } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { deliveryPlatformsService, DeliveryPlatform } from '@/lib/services/deliveryPlatformsService';

export default function AdminPlatformsPage() {
  const [platforms, setPlatforms] = useState<DeliveryPlatform[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const [formData, setFormData] = useState<{
    platform_name: string;
    commission_rate: number;
    platform_color: string | null;
    platform_icon: string | null;
    notes: string | null;
    is_active: boolean | null;
    sort_order: number | null;
  }>({
    platform_name: '',
    commission_rate: 15,
    platform_color: '#34D186',
    platform_icon: '',
    notes: '',
    is_active: true,
    sort_order: 0
  });

  const supabase = createClient();

  useEffect(() => {
    fetchPlatforms();
  }, []);

  const fetchPlatforms = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await deliveryPlatformsService.getAllPlatforms();
      setPlatforms(data);
    } catch (err: any) {
      console.error('Error fetching platforms:', err);
      setError(err.message || 'Failed to load platforms');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDefaults = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: profile } = await supabase
        .from('profiles')
        .select('company_id')
        .eq('id', user.id)
        .single();

      if (!profile?.company_id) {
        throw new Error('No company assigned');
      }

      await deliveryPlatformsService.createDefaultPlatforms(profile.company_id);
      await fetchPlatforms();
      alert('Default platforms created successfully!');
    } catch (err: any) {
      console.error('Error creating defaults:', err);
      alert('Error: ' + err.message);
    }
  };

  const handleAdd = async () => {
    try {
      await deliveryPlatformsService.createPlatform(formData);
      await fetchPlatforms();
      setShowAddForm(false);
      resetForm();
      alert('Platform added successfully!');
    } catch (err: any) {
      console.error('Error adding platform:', err);
      alert('Error: ' + err.message);
    }
  };

  const handleUpdate = async (id: string) => {
    try {
      const platform = platforms.find(p => p.id === id);
      if (!platform) return;

      await deliveryPlatformsService.updatePlatform(id, formData);
      await fetchPlatforms();
      setEditingId(null);
      resetForm();
      alert('Platform updated successfully!');
    } catch (err: any) {
      console.error('Error updating platform:', err);
      alert('Error: ' + err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this platform?')) return;

    try {
      await deliveryPlatformsService.deletePlatform(id);
      await fetchPlatforms();
      alert('Platform deleted successfully!');
    } catch (err: any) {
      console.error('Error deleting platform:', err);
      alert('Error: ' + err.message);
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      await deliveryPlatformsService.togglePlatformStatus(id, !currentStatus);
      await fetchPlatforms();
    } catch (err: any) {
      console.error('Error toggling platform status:', err);
      alert('Error: ' + err.message);
    }
  };

  const startEdit = (platform: DeliveryPlatform) => {
    setEditingId(platform.id);
    setFormData({
      platform_name: platform.platform_name,
      commission_rate: platform.commission_rate,
      platform_color: platform.platform_color || '#34D186',
      platform_icon: platform.platform_icon || '',
      notes: platform.notes || '',
      is_active: platform.is_active ?? true,
      sort_order: platform.sort_order ?? 0
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setShowAddForm(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      platform_name: '',
      commission_rate: 15,
      platform_color: '#34D186',
      platform_icon: '',
      notes: '',
      is_active: true,
      sort_order: 0
    });
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl shadow-lg p-8 text-white mb-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <Truck className="w-8 h-8" />
              <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-bold">
                ADMIN
              </span>
            </div>
            <h1 className="text-4xl font-black mb-2">Delivery Platforms</h1>
            <p className="text-blue-100">
              Manage delivery platforms and commission rates for your company
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowAddForm(true)}
              className="px-4 py-2 bg-white text-blue-600 rounded-lg font-bold hover:bg-blue-50 transition flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Add Platform
            </button>
            <button
              onClick={handleCreateDefaults}
              className="px-4 py-2 bg-blue-800 text-white rounded-lg font-bold hover:bg-blue-900 transition"
            >
              Create Defaults
            </button>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Add Form */}
      {showAddForm && (
        <div className="bg-white rounded-xl shadow-lg border-2 border-blue-200 p-6 mb-6">
          <h3 className="text-xl font-bold mb-4">Add New Platform</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Platform Name *
              </label>
              <input
                type="text"
                value={formData.platform_name}
                onChange={(e) => setFormData({ ...formData, platform_name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Glovo"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Commission Rate (%) *
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.commission_rate}
                onChange={(e) => setFormData({ ...formData, commission_rate: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Platform Color
              </label>
              <input
                type="color"
                value={formData.platform_color}
                onChange={(e) => setFormData({ ...formData, platform_color: e.target.value })}
                className="w-full h-10 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sort Order
              </label>
              <input
                type="number"
                value={formData.sort_order}
                onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                rows={2}
              />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button
              onClick={handleAdd}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Save Platform
            </button>
            <button
              onClick={cancelEdit}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-bold hover:bg-gray-300 transition flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Platforms List */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-600">Loading platforms...</p>
        </div>
      ) : platforms.length === 0 ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8 text-center">
          <Truck className="w-16 h-16 text-yellow-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">No Platforms Configured</h3>
          <p className="text-gray-600 mb-4">
            Click "Create Defaults" to add standard Romanian delivery platforms,
            or "Add Platform" to create a custom platform.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {platforms.map((platform) => (
            <div
              key={platform.id}
              className={`bg-white rounded-xl shadow-lg border-2 p-6 ${
                platform.is_active !== false ? 'border-green-200' : 'border-gray-200'
              }`}
            >
              {editingId === platform.id ? (
                // Edit Mode
                <div>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Platform Name
                      </label>
                      <input
                        type="text"
                        value={formData.platform_name}
                        onChange={(e) => setFormData({ ...formData, platform_name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Commission (%)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.commission_rate}
                        onChange={(e) => setFormData({ ...formData, commission_rate: parseFloat(e.target.value) || 0 })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Color
                      </label>
                      <input
                        type="color"
                        value={formData.platform_color}
                        onChange={(e) => setFormData({ ...formData, platform_color: e.target.value })}
                        className="w-full h-10 border border-gray-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Sort Order
                      </label>
                      <input
                        type="number"
                        value={formData.sort_order}
                        onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleUpdate(platform.id)}
                      className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700"
                    >
                      <Save className="w-4 h-4" />
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded-lg text-sm font-bold hover:bg-gray-300"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                // View Mode
                <div>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-12 h-12 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: platform.platform_color || '#34D186' }}
                      >
                        <Truck className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">
                          {platform.platform_name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          Commission: <span className="font-bold">{platform.commission_rate}%</span>
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleToggleActive(platform.id, platform.is_active ?? true)}
                        className={`p-2 rounded-lg ${
                          platform.is_active !== false
                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                        title={platform.is_active !== false ? 'Deactivate' : 'Activate'}
                      >
                        {platform.is_active !== false ? (
                          <ToggleRight className="w-5 h-5" />
                        ) : (
                          <ToggleLeft className="w-5 h-5" />
                        )}
                      </button>
                      <button
                        onClick={() => startEdit(platform)}
                        className="p-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200"
                        title="Edit"
                      >
                        <Edit2 className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(platform.id)}
                        className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
                        title="Delete"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {platform.notes && (
                    <div className="bg-gray-50 rounded-lg p-3 mb-3">
                      <p className="text-sm text-gray-700">{platform.notes}</p>
                    </div>
                  )}

                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span>Sort Order: {platform.sort_order}</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                      platform.is_active !== false
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {platform.is_active !== false ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
