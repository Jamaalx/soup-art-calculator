import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import type { Database } from '@/types/database';

// Server-side supabase client (for API routes only)
export function createServerClient() {
  const cookieStore = cookies();
  return createRouteHandlerClient<Database>({ cookies: () => cookieStore });
}