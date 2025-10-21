import { useState, useEffect, useCallback } from 'react';
import { Unit, unitsService } from '@/lib/services/unitsService';

export function useUnits(companyId?: string, type?: string) {
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUnits = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = type 
        ? await unitsService.getUnitsByType(type, companyId)
        : await unitsService.getUnits(companyId);
      setUnits(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch units');
    } finally {
      setLoading(false);
    }
  }, [companyId, type]);

  useEffect(() => {
    fetchUnits();
  }, [fetchUnits]);

  const createUnit = useCallback(async (unitData: Omit<Unit, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const newUnit = await unitsService.createUnit(unitData);
      setUnits(prev => [...prev, newUnit]);
      return newUnit;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create unit');
      throw err;
    }
  }, []);

  const updateUnit = useCallback(async (id: string, updates: Partial<Unit>) => {
    try {
      const updatedUnit = await unitsService.updateUnit(id, updates);
      setUnits(prev => prev.map(unit => unit.id === id ? updatedUnit : unit));
      return updatedUnit;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update unit');
      throw err;
    }
  }, []);

  const deleteUnit = useCallback(async (id: string) => {
    try {
      await unitsService.deleteUnit(id);
      setUnits(prev => prev.filter(unit => unit.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete unit');
      throw err;
    }
  }, []);

  return {
    units,
    loading,
    error,
    createUnit,
    updateUnit,
    deleteUnit,
    refetch: fetchUnits
  };
}

// Hook specifically for ingredient units (most commonly used)
export function useIngredientUnits(companyId?: string) {
  return useUnits(companyId);
}

// Hook for weight units
export function useWeightUnits(companyId?: string) {
  return useUnits(companyId, 'weight');
}

// Hook for volume units  
export function useVolumeUnits(companyId?: string) {
  return useUnits(companyId, 'volume');
}

// Hook for count units
export function useCountUnits(companyId?: string) {
  return useUnits(companyId, 'count');
}