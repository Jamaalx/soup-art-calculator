'use client';

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/types/database';

// Client-side supabase client (for use in Client Components)
export const createClient = () => {
  return createClientComponentClient<Database>();
};

// Default export for convenience
export default createClient;