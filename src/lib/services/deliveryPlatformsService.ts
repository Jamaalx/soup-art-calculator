// src/lib/services/deliveryPlatformsService.ts
import { createClient } from '@/lib/supabase/client';

export interface DeliveryPlatform {
  id: string;
  company_id: string;
  platform_name: string;
  commission_rate: number;
  is_active: boolean;
  sort_order: number;
  platform_color?: string;
  platform_icon?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

class DeliveryPlatformsService {
  private supabase = createClient();

  /**
   * Get all delivery platforms for the current user's company
   */
  async getCompanyPlatforms(): Promise<DeliveryPlatform[]> {
    const { data: { user } } = await this.supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data: profile } = await this.supabase
      .from('profiles')
      .select('company_id')
      .eq('id', user.id)
      .single();

    if (!profile?.company_id) {
      console.warn('User has no company_id, returning empty platforms');
      return [];
    }

    const { data, error } = await this.supabase
      .from('delivery_platforms')
      .select('*')
      .eq('company_id', profile.company_id)
      .eq('is_active', true)
      .order('sort_order');

    if (error) {
      console.error('Error fetching delivery platforms:', error);
      throw error;
    }

    return data || [];
  }

  /**
   * Get all platforms (including inactive) for admin management
   */
  async getAllPlatforms(): Promise<DeliveryPlatform[]> {
    const { data: { user } } = await this.supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data: profile } = await this.supabase
      .from('profiles')
      .select('company_id')
      .eq('id', user.id)
      .single();

    if (!profile?.company_id) {
      throw new Error('User has no company assigned');
    }

    const { data, error } = await this.supabase
      .from('delivery_platforms')
      .select('*')
      .eq('company_id', profile.company_id)
      .order('sort_order');

    if (error) throw error;
    return data || [];
  }

  /**
   * Create a new delivery platform
   */
  async createPlatform(platform: Omit<DeliveryPlatform, 'id' | 'created_at' | 'updated_at' | 'company_id'>): Promise<DeliveryPlatform> {
    const { data: { user } } = await this.supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data: profile } = await this.supabase
      .from('profiles')
      .select('company_id')
      .eq('id', user.id)
      .single();

    if (!profile?.company_id) {
      throw new Error('User has no company assigned');
    }

    const { data, error } = await this.supabase
      .from('delivery_platforms')
      .insert({
        ...platform,
        company_id: profile.company_id,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Update a delivery platform
   */
  async updatePlatform(id: string, updates: Partial<DeliveryPlatform>): Promise<DeliveryPlatform> {
    const { data, error } = await this.supabase
      .from('delivery_platforms')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Delete a delivery platform
   */
  async deletePlatform(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('delivery_platforms')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  /**
   * Toggle platform active status
   */
  async togglePlatformStatus(id: string, isActive: boolean): Promise<DeliveryPlatform> {
    return this.updatePlatform(id, { is_active: isActive });
  }

  /**
   * Create default platforms for a company (used by admin when creating new company/user)
   */
  async createDefaultPlatforms(companyId: string): Promise<DeliveryPlatform[]> {
    const defaultPlatforms = [
      { name: 'Glovo', rate: 17.00, color: '#FFC244', sort: 1 },
      { name: 'Bolt Food', rate: 15.00, color: '#34D186', sort: 2 },
      { name: 'Wolt', rate: 15.00, color: '#00C2E8', sort: 3 },
      { name: 'Tazz', rate: 16.00, color: '#FF6B35', sort: 4 },
      { name: 'Uber Eats', rate: 18.00, color: '#06C167', sort: 5 },
    ];

    const platforms = defaultPlatforms.map(p => ({
      company_id: companyId,
      platform_name: p.name,
      commission_rate: p.rate,
      platform_color: p.color,
      sort_order: p.sort,
      is_active: true,
    }));

    const { data, error } = await this.supabase
      .from('delivery_platforms')
      .insert(platforms)
      .select();

    if (error) throw error;
    return data || [];
  }
}

export const deliveryPlatformsService = new DeliveryPlatformsService();
