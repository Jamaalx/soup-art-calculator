// src/hooks/useDeliveryPlatforms.ts
import { useState, useEffect } from 'react';
import { deliveryPlatformsService, DeliveryPlatform } from '@/lib/services/deliveryPlatformsService';

interface UseDeliveryPlatformsReturn {
  platforms: DeliveryPlatform[];
  loading: boolean;
  error: string | null;
  refreshPlatforms: () => Promise<void>;
}

export function useDeliveryPlatforms(): UseDeliveryPlatformsReturn {
  const [platforms, setPlatforms] = useState<DeliveryPlatform[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPlatforms = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await deliveryPlatformsService.getCompanyPlatforms();
      setPlatforms(data);

      if (data.length === 0) {
        console.warn('No delivery platforms found for this company. Admin should configure platforms.');
      }
    } catch (err: any) {
      console.error('Error fetching delivery platforms:', err);
      setError(err.message || 'Failed to load delivery platforms');
      setPlatforms([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlatforms();
  }, []);

  return {
    platforms,
    loading,
    error,
    refreshPlatforms: fetchPlatforms,
  };
}
