// src/app/api/admin/users/route.ts

import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// Create Supabase admin client (bypasses RLS)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// POST: Create new user
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, full_name, phone, role, company_id } = body;

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    console.log('🔧 Creating user with email:', email);

    // Step 1: Create auth user using admin client
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        full_name: full_name || null,
        phone: phone || null
      }
    });

    if (authError) {
      console.error('❌ Auth error:', authError);
      return NextResponse.json(
        { error: `Failed to create auth user: ${authError.message}` },
        { status: 500 }
      );
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: 'User creation failed - no user returned' },
        { status: 500 }
      );
    }

    console.log('✅ Auth user created:', authData.user.id);

    // Step 2: Get company name if company_id provided
    let company_name = null;
    if (company_id) {
      const { data: companyData } = await supabaseAdmin
        .from('companies')
        .select('company_name')
        .eq('id', company_id)
        .single();
      
      company_name = companyData?.company_name || null;
    }

    // Step 3: Create profile (this should trigger automatically, but let's ensure it exists)
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .upsert({
        id: authData.user.id, // Use the auth user ID
        email: email,
        full_name: full_name || null,
        phone: phone || null,
        role: role || 'user',
        company_id: company_id || null,
        company_name: company_name,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'id' // If profile exists, update it
      });

    if (profileError) {
      console.error('❌ Profile error:', profileError);
      
      // Try to delete the auth user if profile creation failed
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      
      return NextResponse.json(
        { error: `Failed to create profile: ${profileError.message}` },
        { status: 500 }
      );
    }

    console.log('✅ Profile created for user:', authData.user.id);

    // Step 4: If company_id provided, copy templates (optional)
    if (company_id) {
      try {
        // Copy company products to user
        const { data: companyProducts } = await supabaseAdmin
          .from('products')
          .select('*')
          .eq('company_id', company_id);

        if (companyProducts && companyProducts.length > 0) {
          const userProducts = companyProducts.map(product => ({
            ...product,
            id: undefined, // Remove old ID, let Supabase generate new one
            product_id: undefined, // Remove old product_id
            user_id: authData.user.id, // Set to new user
            company_id: null, // Clear company_id (user owns these now)
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }));

          await supabaseAdmin
            .from('products')
            .insert(userProducts);

          console.log(`✅ Copied ${userProducts.length} products to user`);
        }

        // Copy company categories to user
        const { data: companyCategories } = await supabaseAdmin
          .from('categories')
          .select('*')
          .eq('company_id', company_id);

        if (companyCategories && companyCategories.length > 0) {
          const userCategories = companyCategories.map(category => ({
            ...category,
            id: undefined, // Remove old ID
            category_id: undefined, // Remove old category_id
            user_id: authData.user.id, // Set to new user
            company_id: null, // Clear company_id
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }));

          await supabaseAdmin
            .from('categories')
            .insert(userCategories);

          console.log(`✅ Copied ${userCategories.length} categories to user`);
        }
      } catch (copyError) {
        console.error('⚠️ Error copying templates:', copyError);
        // Don't fail the whole request if template copying fails
      }
    }

    return NextResponse.json({
      success: true,
      user: {
        id: authData.user.id,
        email: authData.user.email,
        role: role || 'user'
      }
    }, { status: 201 });

  } catch (error: any) {
    console.error('❌ Unexpected error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE: Delete user
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    console.log('🗑️ Deleting user:', userId);

    // Step 1: Delete user's products
    const { error: productsError } = await supabaseAdmin
      .from('products')
      .delete()
      .eq('user_id', userId);

    if (productsError) {
      console.error('⚠️ Error deleting products:', productsError);
    }

    // Step 2: Delete user's categories
    const { error: categoriesError } = await supabaseAdmin
      .from('categories')
      .delete()
      .eq('user_id', userId);

    if (categoriesError) {
      console.error('⚠️ Error deleting categories:', categoriesError);
    }

    // Step 3: Delete profile
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .delete()
      .eq('id', userId);

    if (profileError) {
      console.error('❌ Error deleting profile:', profileError);
      return NextResponse.json(
        { error: `Failed to delete profile: ${profileError.message}` },
        { status: 500 }
      );
    }

    // Step 4: Delete auth user
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId);

    if (authError) {
      console.error('❌ Error deleting auth user:', authError);
      return NextResponse.json(
        { error: `Failed to delete auth user: ${authError.message}` },
        { status: 500 }
      );
    }

    console.log('✅ User deleted successfully:', userId);

    return NextResponse.json({
      success: true,
      message: 'User deleted successfully'
    });

  } catch (error: any) {
    console.error('❌ Unexpected error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}