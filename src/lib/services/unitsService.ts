import { createClient } from '@/lib/supabase/client';
const supabase = createClient();

export interface Unit {
  id: string;
  name: string;
  abbreviation: string;
  type: string; // 'weight', 'volume', 'count', 'length', 'other', etc.
  description?: string | null;
  system?: string | null; // System metadata (can store conversion info as JSON)
  is_active: boolean;
  company_id?: string | null; // null for system-wide units
  created_at?: string;
  updated_at?: string;
}

export const unitsService = {
  // Get all available units (system + company specific)
  async getUnits(companyId?: string): Promise<Unit[]> {
    // Get current user to determine proper filtering
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('User not authenticated');
    }

    // Get user profile to check role and actual company_id
    const { data: profileData } = await supabase
      .from('user_profiles')
      .select('company_id, role')
      .eq('user_id', user.id)
      .single();

    const actualCompanyId = profileData?.company_id;
    const userRole = profileData?.role;

    let query = supabase
      .from('units')
      .select('*')
      .eq('is_active', true)
      .order('type, name');

    // Apply filtering based on user context
    // Always include system-wide units (company_id is null)
    if (userRole !== 'admin' && userRole !== 'super_admin') {
      if (actualCompanyId) {
        // User belongs to a company - show system units + company units
        query = query.or(`company_id.is.null,company_id.eq.${actualCompanyId}`);
      } else {
        // User doesn't have company - show only system units
        query = query.is('company_id', null);
      }
    }
    // If admin, no filter is applied (shows all units)

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  },

  // Get units by type
  async getUnitsByType(type: string, companyId?: string): Promise<Unit[]> {
    // Get current user to determine proper filtering
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('User not authenticated');
    }

    // Get user profile to check role and actual company_id
    const { data: profileData } = await supabase
      .from('user_profiles')
      .select('company_id, role')
      .eq('user_id', user.id)
      .single();

    const actualCompanyId = profileData?.company_id;
    const userRole = profileData?.role;

    let query = supabase
      .from('units')
      .select('*')
      .eq('type', type)
      .eq('is_active', true)
      .order('name');

    // Apply filtering based on user context
    if (userRole !== 'admin' && userRole !== 'super_admin') {
      if (actualCompanyId) {
        // User belongs to a company - show system units + company units
        query = query.or(`company_id.is.null,company_id.eq.${actualCompanyId}`);
      } else {
        // User doesn't have company - show only system units
        query = query.is('company_id', null);
      }
    }
    // If admin, no filter is applied (shows all units)

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  },

  // Create custom unit for company
  async createUnit(unit: Omit<Unit, 'id' | 'created_at' | 'updated_at'>): Promise<Unit> {
    const { data, error } = await supabase
      .from('units')
      .insert(unit)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Update unit
  async updateUnit(id: string, updates: Partial<Unit>): Promise<Unit> {
    const { data, error } = await supabase
      .from('units')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Delete unit (soft delete)
  async deleteUnit(id: string): Promise<void> {
    const { error } = await supabase
      .from('units')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('id', id);
    
    if (error) throw error;
  },

  // Initialize default system units (called once during system setup)
  async initializeSystemUnits(): Promise<void> {
    const systemUnits: Omit<Unit, 'id' | 'created_at' | 'updated_at'>[] = [
      // Weight units
      { name: 'Kilograms', abbreviation: 'kg', type: 'weight', description: 'Kilograms', system: JSON.stringify({ base_unit: 'g', conversion_factor: 1000 }), is_active: true, company_id: null },
      { name: 'Grams', abbreviation: 'g', type: 'weight', description: 'Grams', system: JSON.stringify({ base_unit: 'g', conversion_factor: 1 }), is_active: true, company_id: null },
      { name: 'Pounds', abbreviation: 'lb', type: 'weight', description: 'Pounds', system: JSON.stringify({ base_unit: 'g', conversion_factor: 453.592 }), is_active: true, company_id: null },
      { name: 'Ounces', abbreviation: 'oz', type: 'weight', description: 'Ounces', system: JSON.stringify({ base_unit: 'g', conversion_factor: 28.3495 }), is_active: true, company_id: null },

      // Volume units
      { name: 'Liters', abbreviation: 'l', type: 'volume', description: 'Liters', system: JSON.stringify({ base_unit: 'ml', conversion_factor: 1000 }), is_active: true, company_id: null },
      { name: 'Milliliters', abbreviation: 'ml', type: 'volume', description: 'Milliliters', system: JSON.stringify({ base_unit: 'ml', conversion_factor: 1 }), is_active: true, company_id: null },
      { name: 'Cups', abbreviation: 'cup', type: 'volume', description: 'Cups', system: JSON.stringify({ base_unit: 'ml', conversion_factor: 240 }), is_active: true, company_id: null },
      { name: 'Tablespoons', abbreviation: 'tbsp', type: 'volume', description: 'Tablespoons', system: JSON.stringify({ base_unit: 'ml', conversion_factor: 15 }), is_active: true, company_id: null },
      { name: 'Teaspoons', abbreviation: 'tsp', type: 'volume', description: 'Teaspoons', system: JSON.stringify({ base_unit: 'ml', conversion_factor: 5 }), is_active: true, company_id: null },

      // Count units
      { name: 'Pieces', abbreviation: 'piece', type: 'count', description: 'Pieces', system: JSON.stringify({ base_unit: 'piece', conversion_factor: 1 }), is_active: true, company_id: null },
      { name: 'Dozen', abbreviation: 'dz', type: 'count', description: 'Dozen', system: JSON.stringify({ base_unit: 'piece', conversion_factor: 12 }), is_active: true, company_id: null },
      { name: 'Pack', abbreviation: 'pack', type: 'count', description: 'Pack', system: JSON.stringify({ base_unit: 'piece', conversion_factor: 1 }), is_active: true, company_id: null },

      // Other common units
      { name: 'Cloves (garlic)', abbreviation: 'clove', type: 'count', description: 'Cloves', system: JSON.stringify({ base_unit: 'piece', conversion_factor: 1 }), is_active: true, company_id: null },
      { name: 'Leaves', abbreviation: 'leaf', type: 'count', description: 'Leaves', system: JSON.stringify({ base_unit: 'piece', conversion_factor: 1 }), is_active: true, company_id: null },
      { name: 'Pinch', abbreviation: 'pinch', type: 'volume', description: 'Pinch', system: JSON.stringify({ base_unit: 'ml', conversion_factor: 0.3 }), is_active: true, company_id: null }
    ];

    const { error } = await supabase
      .from('units')
      .insert(systemUnits);

    if (error) throw error;
  },

  // Convert between units
  convertUnits(value: number, fromUnit: Unit, toUnit: Unit): number {
    // Parse system metadata to get conversion info
    let fromMeta: { base_unit: string; conversion_factor: number } | null = null;
    let toMeta: { base_unit: string; conversion_factor: number } | null = null;

    try {
      if (fromUnit.system) {
        fromMeta = JSON.parse(fromUnit.system);
      }
      if (toUnit.system) {
        toMeta = JSON.parse(toUnit.system);
      }
    } catch (e) {
      throw new Error('Invalid system metadata for units');
    }

    if (!fromMeta || !toMeta) {
      throw new Error('Conversion metadata not available');
    }

    if (fromMeta.base_unit !== toMeta.base_unit) {
      throw new Error('Cannot convert between different unit types');
    }

    if (!fromMeta.conversion_factor || !toMeta.conversion_factor) {
      throw new Error('Conversion factors not defined');
    }

    // Convert to base unit, then to target unit
    const baseValue = value * fromMeta.conversion_factor;
    return baseValue / toMeta.conversion_factor;
  }
};