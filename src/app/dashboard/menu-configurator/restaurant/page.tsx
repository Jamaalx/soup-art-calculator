'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function MenuConfiguratorRestaurantPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/dashboard/pricing/offline');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>
    </div>
  );
}