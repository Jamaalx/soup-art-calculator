'use client';

import { useProducts } from '@/hooks/useProducts';
import OfferGenerator from '@/components/OfferGenerator';

export default function OfertePage() {
  const { products, loading } = useProducts();

  if (loading) {
    return (
      <div className="p-8 text-center">
        <p className="text-lg font-bold">Se încarcă produsele...</p>
      </div>
    );
  }

  // Filter to ensure only active products with proper types
  const activeProducts = products.filter(p => p.is_active === true);

  return (
    <div>
      <OfferGenerator products={activeProducts} />
    </div>
  );
}