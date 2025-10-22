import { supabase } from '@/lib/supabase';

export interface Unit {
  id: string;
  name: string;
  abbreviation: string;
  type: 'weight' | 'volume' | 'count' | 'length' | 'other';
  base_unit?: string; // For conversion purposes
  conversion_factor?: number; // How many base units this represents
  is_active: boolean;
  company_id?: string; // null for system-wide units
  created_at?: string;
  updated_at?: string;
}

export const unitsService = {
  // Get all available units (system + company specific)
  async getUnits(companyId?: string): Promise<Unit[]> {
    let query = supabase
      .from('units')
      .select('*')
      .eq('is_active', true)
      .order('type, name');

    // Get system-wide units and company-specific units
    if (companyId) {
      query = query.or(`company_id.is.null,company_id.eq.${companyId}`);
    } else {
      query = query.is('company_id', null);
    }

    const { data, error } = await query;
    
    if (error) throw error;
    return data || [];
  },

  // Get units by type
  async getUnitsByType(type: string, companyId?: string): Promise<Unit[]> {
    let query = supabase
      .from('units')
      .select('*')
      .eq('type', type)
      .eq('is_active', true)
      .order('name');

    if (companyId) {
      query = query.or(`company_id.is.null,company_id.eq.${companyId}`);
    } else {
      query = query.is('company_id', null);
    }

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
      { name: 'Kilograms', abbreviation: 'kg', type: 'weight', base_unit: 'g', conversion_factor: 1000, is_active: true, company_id: null },
      { name: 'Grams', abbreviation: 'g', type: 'weight', base_unit: 'g', conversion_factor: 1, is_active: true, company_id: null },
      { name: 'Pounds', abbreviation: 'lb', type: 'weight', base_unit: 'g', conversion_factor: 453.592, is_active: true, company_id: null },
      { name: 'Ounces', abbreviation: 'oz', type: 'weight', base_unit: 'g', conversion_factor: 28.3495, is_active: true, company_id: null },
      
      // Volume units
      { name: 'Liters', abbreviation: 'l', type: 'volume', base_unit: 'ml', conversion_factor: 1000, is_active: true, company_id: null },
      { name: 'Milliliters', abbreviation: 'ml', type: 'volume', base_unit: 'ml', conversion_factor: 1, is_active: true, company_id: null },
      { name: 'Cups', abbreviation: 'cup', type: 'volume', base_unit: 'ml', conversion_factor: 240, is_active: true, company_id: null },
      { name: 'Tablespoons', abbreviation: 'tbsp', type: 'volume', base_unit: 'ml', conversion_factor: 15, is_active: true, company_id: null },
      { name: 'Teaspoons', abbreviation: 'tsp', type: 'volume', base_unit: 'ml', conversion_factor: 5, is_active: true, company_id: null },
      
      // Count units
      { name: 'Pieces', abbreviation: 'piece', type: 'count', base_unit: 'piece', conversion_factor: 1, is_active: true, company_id: null },
      { name: 'Dozen', abbreviation: 'dz', type: 'count', base_unit: 'piece', conversion_factor: 12, is_active: true, company_id: null },
      { name: 'Pack', abbreviation: 'pack', type: 'count', base_unit: 'piece', conversion_factor: 1, is_active: true, company_id: null },
      
      // Other common units
      { name: 'Cloves (garlic)', abbreviation: 'clove', type: 'count', base_unit: 'piece', conversion_factor: 1, is_active: true, company_id: null },
      { name: 'Leaves', abbreviation: 'leaf', type: 'count', base_unit: 'piece', conversion_factor: 1, is_active: true, company_id: null },
      { name: 'Pinch', abbreviation: 'pinch', type: 'volume', base_unit: 'ml', conversion_factor: 0.3, is_active: true, company_id: null }
    ];

    const { error } = await supabase
      .from('units')
      .insert(systemUnits);
    
    if (error) throw error;
  },

  // Convert between units
  convertUnits(value: number, fromUnit: Unit, toUnit: Unit): number {
    if (fromUnit.base_unit !== toUnit.base_unit) {
      throw new Error('Cannot convert between different unit types');
    }

    if (!fromUnit.conversion_factor || !toUnit.conversion_factor) {
      throw new Error('Conversion factors not defined');
    }

    // Convert to base unit, then to target unit
    const baseValue = value * fromUnit.conversion_factor;
    return baseValue / toUnit.conversion_factor;
  }
};