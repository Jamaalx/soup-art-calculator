import { createClient } from '@/lib/supabase/client';

export interface UserCompany {
  id: string;
  user_id: string;
  company_id: string;
  role: string;
  is_primary: boolean;
  created_at: string;
  updated_at: string;
  company?: {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    address?: string;
    is_active: boolean;
  };
}

export interface Company {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  tax_number?: string;
  is_active: boolean;
  settings?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

const supabase = createClient();

export const companyService = {
  /**
   * Get all companies a user has access to
   */
  async getUserCompanies(userId?: string): Promise<UserCompany[]> {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user && !userId) {
      throw new Error('User not authenticated');
    }

    const targetUserId = userId || user!.id;

    const { data, error } = await supabase
      .from('user_companies')
      .select(`
        *,
        company:companies (
          id,
          name,
          email,
          phone,
          address,
          is_active
        )
      `)
      .eq('user_id', targetUserId)
      .order('is_primary', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  /**
   * Get user's primary company
   */
  async getPrimaryCompany(userId?: string): Promise<UserCompany | null> {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user && !userId) {
      throw new Error('User not authenticated');
    }

    const targetUserId = userId || user!.id;

    const { data, error } = await supabase
      .from('user_companies')
      .select(`
        *,
        company:companies (
          id,
          name,
          email,
          phone,
          address,
          is_active
        )
      `)
      .eq('user_id', targetUserId)
      .eq('is_primary', true)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // Ignore "not found" errors
    return data;
  },

  /**
   * Set primary company for user
   */
  async setPrimaryCompany(companyId: string, userId?: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user && !userId) {
      throw new Error('User not authenticated');
    }

    const targetUserId = userId || user!.id;

    // First, unset all primary flags for this user
    const { error: unsetError } = await supabase
      .from('user_companies')
      .update({ is_primary: false })
      .eq('user_id', targetUserId);

    if (unsetError) throw unsetError;

    // Then set the new primary company
    const { error: setError } = await supabase
      .from('user_companies')
      .update({ is_primary: true })
      .eq('user_id', targetUserId)
      .eq('company_id', companyId);

    if (setError) throw setError;
  },

  /**
   * Check if user has access to a company
   */
  async hasCompanyAccess(companyId: string, userId?: string): Promise<boolean> {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user && !userId) {
      return false;
    }

    const targetUserId = userId || user!.id;

    // Check if user is admin
    const { data: profileData } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', targetUserId)
      .single();

    if (profileData?.role === 'admin' || profileData?.role === 'super_admin') {
      return true;
    }

    // Check if user has access via user_companies
    const { data, error } = await supabase
      .from('user_companies')
      .select('id')
      .eq('user_id', targetUserId)
      .eq('company_id', companyId)
      .single();

    return !!data && !error;
  },

  /**
   * Assign user to company
   * Admin only operation
   */
  async assignUserToCompany(
    userId: string,
    companyId: string,
    role: string = 'user',
    isPrimary: boolean = false
  ): Promise<UserCompany> {
    // Verify current user is admin
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data: profileData } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileData?.role !== 'admin' && profileData?.role !== 'super_admin') {
      throw new Error('Only admins can assign users to companies');
    }

    // If setting as primary, unset other primary assignments
    if (isPrimary) {
      await supabase
        .from('user_companies')
        .update({ is_primary: false })
        .eq('user_id', userId);
    }

    // Insert or update assignment
    const { data, error } = await supabase
      .from('user_companies')
      .upsert({
        user_id: userId,
        company_id: companyId,
        role,
        is_primary: isPrimary
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Remove user from company
   * Admin only operation
   */
  async removeUserFromCompany(userId: string, companyId: string): Promise<void> {
    // Verify current user is admin
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data: profileData } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileData?.role !== 'admin' && profileData?.role !== 'super_admin') {
      throw new Error('Only admins can remove users from companies');
    }

    const { error } = await supabase
      .from('user_companies')
      .delete()
      .eq('user_id', userId)
      .eq('company_id', companyId);

    if (error) throw error;
  },

  /**
   * Get company by ID
   */
  async getCompany(companyId: string): Promise<Company | null> {
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .eq('id', companyId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  /**
   * Get all companies (admin only)
   */
  async getAllCompanies(): Promise<Company[]> {
    // Verify current user is admin
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data: profileData } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileData?.role !== 'admin' && profileData?.role !== 'super_admin') {
      throw new Error('Only admins can view all companies');
    }

    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .order('name');

    if (error) throw error;
    return data || [];
  },

  /**
   * Create new company (admin only)
   */
  async createCompany(company: Omit<Company, 'id' | 'created_at' | 'updated_at'>): Promise<Company> {
    // Verify current user is admin
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data: profileData } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileData?.role !== 'admin' && profileData?.role !== 'super_admin') {
      throw new Error('Only admins can create companies');
    }

    const { data, error } = await supabase
      .from('companies')
      .insert(company)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Update company (admin only)
   */
  async updateCompany(companyId: string, updates: Partial<Company>): Promise<Company> {
    // Verify current user is admin
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data: profileData } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileData?.role !== 'admin' && profileData?.role !== 'super_admin') {
      throw new Error('Only admins can update companies');
    }

    const { data, error } = await supabase
      .from('companies')
      .update(updates)
      .eq('id', companyId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Delete company (admin only) - soft delete by setting is_active to false
   */
  async deleteCompany(companyId: string): Promise<void> {
    // Verify current user is admin
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data: profileData } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileData?.role !== 'admin' && profileData?.role !== 'super_admin') {
      throw new Error('Only admins can delete companies');
    }

    const { error } = await supabase
      .from('companies')
      .update({ is_active: false })
      .eq('id', companyId);

    if (error) throw error;
  },

  /**
   * Get users assigned to a company (admin only)
   */
  async getCompanyUsers(companyId: string): Promise<UserCompany[]> {
    // Verify current user is admin or has access to company
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const hasAccess = await this.hasCompanyAccess(companyId);
    if (!hasAccess) {
      throw new Error('Access denied to this company');
    }

    const { data, error } = await supabase
      .from('user_companies')
      .select(`
        *,
        user:profiles (
          id,
          email,
          role
        )
      `)
      .eq('company_id', companyId);

    if (error) throw error;
    return data || [];
  },

  /**
   * Get company statistics (admin only)
   */
  async getCompanyStats(companyId: string): Promise<{
    totalUsers: number;
    totalIngredients: number;
    totalRecipes: number;
    totalProducts: number;
  }> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const hasAccess = await this.hasCompanyAccess(companyId);
    if (!hasAccess) {
      throw new Error('Access denied to this company');
    }

    const [usersCount, ingredientsCount, recipesCount, productsCount] = await Promise.all([
      supabase.from('user_companies').select('id', { count: 'exact', head: true }).eq('company_id', companyId),
      supabase.from('ingredients').select('id', { count: 'exact', head: true }).eq('company_id', companyId).eq('is_active', true),
      supabase.from('recipes').select('id', { count: 'exact', head: true }).eq('company_id', companyId).eq('is_active', true),
      supabase.from('products').select('id', { count: 'exact', head: true }).eq('company_id', companyId).eq('is_active', true)
    ]);

    return {
      totalUsers: usersCount.count || 0,
      totalIngredients: ingredientsCount.count || 0,
      totalRecipes: recipesCount.count || 0,
      totalProducts: productsCount.count || 0
    };
  }
};
