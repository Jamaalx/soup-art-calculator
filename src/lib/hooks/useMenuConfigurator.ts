'use client';

import { useState, useCallback, useEffect } from 'react';
import { menuExportService } from '@/lib/services/menuConfiguratorService';
import { 
  ExportableProduct,
  MenuExportTemplate,
  MenuExportJob,
  PlatformIntegration,
  SeasonalMenu,
  BulkMenuOperation,
  ExportPlatform
} from '@/types';

export function useExportableProducts() {
  const [products, setProducts] = useState<ExportableProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await menuExportService.getExportableProducts();
      setProducts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return {
    products,
    loading,
    error,
    refetch: fetchProducts
  };
}

export function usePlatformTemplates() {
  const [templates, setTemplates] = useState<MenuExportTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTemplates = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await menuExportService.getPlatformTemplates();
      setTemplates(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch templates');
    } finally {
      setLoading(false);
    }
  }, []);

  const getTemplate = useCallback(async (platform: string) => {
    try {
      return await menuExportService.getPlatformTemplate(platform);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch template');
      return null;
    }
  }, []);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  return {
    templates,
    loading,
    error,
    getTemplate,
    refetch: fetchTemplates
  };
}

export function useExportJobs() {
  const [jobs, setJobs] = useState<MenuExportJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await menuExportService.getExportJobs();
      setJobs(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch export jobs');
    } finally {
      setLoading(false);
    }
  }, []);

  const createJob = useCallback(async (jobData: Omit<MenuExportJob, 'id' | 'created_at' | 'status'>) => {
    setError(null);
    
    try {
      const newJob = await menuExportService.createExportJob(jobData);
      setJobs(prev => [newJob, ...prev]);
      return newJob;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create export job');
      throw err;
    }
  }, []);

  const processJob = useCallback(async (jobId: string) => {
    setError(null);
    
    try {
      const blob = await menuExportService.processExportJob(jobId);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `menu-export-${jobId}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      // Update job status
      setJobs(prev => prev.map(job => 
        job.id === jobId 
          ? { ...job, status: 'completed', completed_at: new Date().toISOString() }
          : job
      ));
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process export job');
      
      // Update job status to failed
      setJobs(prev => prev.map(job => 
        job.id === jobId 
          ? { ...job, status: 'failed' }
          : job
      ));
    }
  }, []);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  return {
    jobs,
    loading,
    error,
    createJob,
    processJob,
    refetch: fetchJobs
  };
}

export function usePlatformIntegrations() {
  const [integrations, setIntegrations] = useState<PlatformIntegration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchIntegrations = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await menuExportService.getPlatformIntegrations();
      setIntegrations(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch integrations');
    } finally {
      setLoading(false);
    }
  }, []);

  const updateIntegration = useCallback(async (
    platform: string, 
    updates: Partial<PlatformIntegration>
  ) => {
    setError(null);
    
    try {
      const updated = await menuExportService.updatePlatformIntegration(platform, updates);
      setIntegrations(prev => prev.map(integration => 
        integration.platform === platform ? updated : integration
      ));
      return updated;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update integration');
      throw err;
    }
  }, []);

  useEffect(() => {
    fetchIntegrations();
  }, [fetchIntegrations]);

  return {
    integrations,
    loading,
    error,
    updateIntegration,
    refetch: fetchIntegrations
  };
}

export function useSeasonalMenus() {
  const [menus, setMenus] = useState<SeasonalMenu[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMenus = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await menuExportService.getSeasonalMenus();
      setMenus(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch seasonal menus');
    } finally {
      setLoading(false);
    }
  }, []);

  const createMenu = useCallback(async (menuData: Omit<SeasonalMenu, 'id' | 'created_at'>) => {
    setError(null);
    
    try {
      const newMenu = await menuExportService.createSeasonalMenu(menuData);
      setMenus(prev => [newMenu, ...prev]);
      return newMenu;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create seasonal menu');
      throw err;
    }
  }, []);

  useEffect(() => {
    fetchMenus();
  }, [fetchMenus]);

  return {
    menus,
    loading,
    error,
    createMenu,
    refetch: fetchMenus
  };
}

export function useQuickExport() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const quickExport = useCallback(async (
    platform: ExportPlatform,
    format: 'csv' | 'json' = 'csv',
    filename?: string
  ) => {
    setLoading(true);
    setError(null);
    
    try {
      const blob = await menuExportService.quickExport(platform, format);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      const defaultFilename = `${platform}-menu-export-${new Date().toISOString().split('T')[0]}`;
      link.download = filename || `${defaultFilename}.${format}`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to export menu');
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    quickExport
  };
}

export function useBulkOperations() {
  const [operations, setOperations] = useState<BulkMenuOperation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createOperation = useCallback(async (
    operationType: 'export' | 'import' | 'update' | 'sync',
    platform?: string
  ) => {
    setLoading(true);
    setError(null);
    
    try {
      const operation = await menuExportService.createBulkOperation(operationType, platform);
      setOperations(prev => [operation, ...prev]);
      return operation;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create bulk operation');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    operations,
    loading,
    error,
    createOperation
  };
}

// Combined hook for menu export functionality
export function useMenuExport() {
  const { products, loading: productsLoading } = useExportableProducts();
  const { templates, loading: templatesLoading } = usePlatformTemplates();
  const { jobs, loading: jobsLoading, createJob, processJob } = useExportJobs();
  const { integrations, loading: integrationsLoading } = usePlatformIntegrations();
  const { quickExport, loading: exportLoading } = useQuickExport();

  const [selectedProducts, setSelectedProducts] = useState<ExportableProduct[]>([]);
  const [selectedPlatform, setSelectedPlatform] = useState<string>('glovo');
  const [selectedFormat, setSelectedFormat] = useState<'csv' | 'json' | 'excel' | 'pdf'>('csv');

  const isLoading = productsLoading || templatesLoading || jobsLoading || integrationsLoading || exportLoading;

  const createAndProcessExport = useCallback(async (
    platform: string,
    format: 'csv' | 'json' | 'excel' | 'pdf',
    products: ExportableProduct[],
    filters: any = {}
  ) => {
    try {
      const template = templates.find(t => t.platform === platform);
      if (!template) {
        throw new Error(`Template not found for platform: ${platform}`);
      }

      const job = await createJob({
        name: `${platform} Menu Export`,
        platform,
        format,
        products,
        template,
        filters,
        company_id: ''
      });

      await processJob(job.id);
      return job;
    } catch (err) {
      throw err;
    }
  }, [templates, createJob, processJob]);

  return {
    // Data
    products,
    templates,
    jobs,
    integrations,
    selectedProducts,
    selectedPlatform,
    selectedFormat,
    
    // Loading states
    isLoading,
    
    // Actions
    setSelectedProducts,
    setSelectedPlatform,
    setSelectedFormat,
    createAndProcessExport,
    quickExport,
    
    // Individual actions
    createJob,
    processJob
  };
}