import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { createServerSupabaseClient } from '@/lib/supabase/server';

// GET - List all users
export async function GET(request: NextRequest) {
  try {
    // Verify admin access from client session
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get all users using admin client
    const { data: { users: authUsers }, error: authError } = await supabaseAdmin.auth.admin.listUsers();

    if (authError) {
      throw authError;
    }

    // Get all profiles
    const { data: profiles } = await supabaseAdmin
      .from('profiles')
      .select('*');

    const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);

    // Combine auth users with profiles and create missing profiles
    const combinedUsers = await Promise.all(
      authUsers.map(async (authUser) => {
        let profile = profileMap.get(authUser.id);
        
        // If profile doesn't exist, create it
        if (!profile) {
          const { data: newProfile, error: profileError } = await supabaseAdmin
            .from('profiles')
            .insert({
              id: authUser.id,
              email: authUser.email || '',
              role: 'user',
              full_name: authUser.user_metadata?.full_name || null,
              is_active: true
            })
            .select()
            .single();

          if (!profileError && newProfile) {
            profile = newProfile;
          }
        }

        return {
          id: authUser.id,
          email: authUser.email || 'Unknown',
          role: profile?.role || 'user',
          full_name: profile?.full_name || authUser.user_metadata?.full_name || null,
          created_at: authUser.created_at,
          last_sign_in_at: authUser.last_sign_in_at
        };
      })
    );

    return NextResponse.json({ users: combinedUsers });
  } catch (error: any) {
    console.error('Error listing users:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

// POST - Create new user
export async function POST(request: NextRequest) {
  try {
    // Verify admin access
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get request body
    const body = await request.json();
    const { email, password, full_name, role, company_id } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Validate company exists if provided
    if (company_id) {
      const { data: company } = await supabaseAdmin
        .from('companies')
        .select('id, company_name')
        .eq('id', company_id)
        .single();

      if (!company) {
        return NextResponse.json(
          { error: 'Invalid company ID' },
          { status: 400 }
        );
      }
    }

    // Create user using admin client
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: full_name || null
      }
    });

    if (createError) {
      throw createError;
    }

    if (!newUser.user) {
      throw new Error('User creation failed');
    }

    // Get company name if company_id provided
    let companyName = null;
    if (company_id) {
      const { data: company } = await supabaseAdmin
        .from('companies')
        .select('company_name')
        .eq('id', company_id)
        .single();
      companyName = company?.company_name || null;
    }

    // Create profile with company assignment
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert({
        id: newUser.user.id,
        email: newUser.user.email || '',
        role: role || 'user',
        full_name: full_name || null,
        company_id: company_id || null,
        company_name: companyName,
        is_active: true
      });

    if (profileError) {
      console.error('Profile creation error:', profileError);
      await supabaseAdmin.auth.admin.deleteUser(newUser.user.id);
      throw profileError;
    }

    // If user has company, copy company products and categories to user
    if (company_id) {
      // Copy company products to user
      const { data: companyProducts } = await supabaseAdmin
        .from('products')
        .select('*')
        .eq('company_id', company_id)
        .is('user_id', null); // Get template products

      if (companyProducts && companyProducts.length > 0) {
        const userProducts = companyProducts.map(p => ({
          product_id: p.product_id,
          nume: p.nume,
          category_id: p.category_id,
          cantitate: p.cantitate,
          pret_cost: p.pret_cost,
          pret_offline: p.pret_offline,
          pret_online: p.pret_online,
          is_active: p.is_active,
          user_id: newUser.user.id,
          company_id: company_id
        }));

        await supabaseAdmin.from('products').insert(userProducts);
      }

      // Copy company categories to user
      const { data: companyCategories } = await supabaseAdmin
        .from('categories')
        .select('*')
        .eq('company_id', company_id)
        .is('user_id', null); // Get template categories

      if (companyCategories && companyCategories.length > 0) {
        const userCategories = companyCategories.map(c => ({
          category_id: c.category_id,
          name: c.name,
          icon: c.icon,
          color: c.color,
          sort_order: c.sort_order,
          is_active: c.is_active,
          user_id: newUser.user.id,
          company_id: company_id
        }));

        await supabaseAdmin.from('categories').insert(userCategories);
      }
    }

    return NextResponse.json({
      success: true,
      user: {
        id: newUser.user.id,
        email: newUser.user.email,
        role: role || 'user',
        full_name: full_name || null,
        company_id: company_id || null,
        company_name: companyName
      }
    });
  } catch (error: any) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create user' },
      { status: 500 }
    );
  }
}

// DELETE - Delete user
export async function DELETE(request: NextRequest) {
  try {
    // Verify admin access
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get user ID from query params
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Prevent self-deletion
    if (userId === user.id) {
      return NextResponse.json(
        { error: 'Cannot delete your own account' },
        { status: 400 }
      );
    }

    // Delete user using admin client
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId);

    if (deleteError) {
      throw deleteError;
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete user' },
      { status: 500 }
    );
  }
}