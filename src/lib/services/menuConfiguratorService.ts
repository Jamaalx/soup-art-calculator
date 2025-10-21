import { createClient } from '@/lib/supabase/client';
import { 
  ExportableProduct,
  MenuExportTemplate,
  MenuExportJob,
  PlatformIntegration,
  SeasonalMenu,
  BulkMenuOperation,
  ExportPlatform,
  MenuExportFormat
} from '@/types';

const supabase = createClient();

// Platform-specific templates
const PLATFORM_TEMPLATES: Record<string, MenuExportTemplate> = {
  glovo: {
    platform: 'glovo',
    name: 'Glovo Export Template',
    description: 'Standard template for Glovo platform exports',
    required_fields: ['name', 'description', 'price', 'category'],
    optional_fields: ['image_url', 'allergens', 'availability'],
    field_mappings: {
      'name': 'product_name',
      'description': 'product_description',
      'price': 'price_lei',
      'category': 'category_name',
      'image_url': 'image',
      'allergens': 'allergen_info'
    },
    formatting_rules: {
      price_format: '0.00',
      currency: 'LEI',
      decimal_places: 2,
      thousand_separator: '',
      category_separator: ' > '
    },
    validation_rules: {
      max_name_length: 100,
      max_description_length: 300,
      required_image: false,
      price_range: { min: 1, max: 1000 }
    }
  },
  bolt: {
    platform: 'bolt',
    name: 'Bolt Food Export Template',
    description: 'Standard template for Bolt Food platform exports',
    required_fields: ['name', 'description', 'price', 'category'],
    optional_fields: ['image_url', 'nutrition_info', 'ingredients'],
    field_mappings: {
      'name': 'item_name',
      'description': 'item_description',
      'price': 'price',
      'category': 'category',
      'image_url': 'photo_url',
      'ingredients': 'ingredients_list'
    },
    formatting_rules: {
      price_format: '0.00',
      currency: 'RON',
      decimal_places: 2,
      thousand_separator: '',
      category_separator: '/'
    },
    validation_rules: {
      max_name_length: 80,
      max_description_length: 250,
      required_image: true,
      price_range: { min: 0.5, max: 500 }
    }
  },
  tazz: {
    platform: 'tazz',
    name: 'Tazz Export Template',
    description: 'Standard template for Tazz platform exports',
    required_fields: ['name', 'price', 'category'],
    optional_fields: ['description', 'image_url', 'allergens', 'nutrition_info'],
    field_mappings: {
      'name': 'product_name',
      'description': 'description',
      'price': 'price_ron',
      'category': 'category',
      'image_url': 'image_link'
    },
    formatting_rules: {
      price_format: '0.00',
      currency: 'RON',
      decimal_places: 2,
      thousand_separator: '',
      category_separator: ' | '
    },
    validation_rules: {
      max_name_length: 120,
      max_description_length: 400,
      required_image: false,
      price_range: { min: 1, max: 800 }
    }
  },
  uber: {
    platform: 'uber',
    name: 'Uber Eats Export Template',
    description: 'Standard template for Uber Eats platform exports',
    required_fields: ['name', 'description', 'price', 'category', 'image_url'],
    optional_fields: ['allergens', 'nutrition_info', 'ingredients'],
    field_mappings: {
      'name': 'title',
      'description': 'description',
      'price': 'price',
      'category': 'section',
      'image_url': 'photo'
    },
    formatting_rules: {
      price_format: '0.00',
      currency: 'RON',
      decimal_places: 2,
      thousand_separator: '',
      category_separator: ' - '
    },
    validation_rules: {
      max_name_length: 150,
      max_description_length: 500,
      required_image: true,
      price_range: { min: 1, max: 1200 }
    }
  },
  foodpanda: {
    platform: 'foodpanda',
    name: 'foodpanda Export Template',
    description: 'Standard template for foodpanda platform exports',
    required_fields: ['name', 'description', 'price', 'category'],
    optional_fields: ['image_url', 'allergens', 'availability', 'nutrition_info'],
    field_mappings: {
      'name': 'menu_item_name',
      'description': 'menu_item_description',
      'price': 'price_lei',
      'category': 'menu_category',
      'image_url': 'image_url'
    },
    formatting_rules: {
      price_format: '0.00',
      currency: 'LEI',
      decimal_places: 2,
      thousand_separator: '',
      category_separator: ' :: '
    },
    validation_rules: {
      max_name_length: 100,
      max_description_length: 350,
      required_image: false,
      price_range: { min: 0.5, max: 600 }
    }
  },
  standard: {
    platform: 'standard',
    name: 'Standard Export Template',
    description: 'Generic template for standard menu exports',
    required_fields: ['name', 'price', 'category'],
    optional_fields: ['description', 'image_url', 'allergens', 'ingredients', 'nutrition_info'],
    field_mappings: {
      'name': 'product_name',
      'description': 'description',
      'price': 'price',
      'category': 'category',
      'image_url': 'image_url'
    },
    formatting_rules: {
      price_format: '0.00',
      currency: 'LEI',
      decimal_places: 2,
      thousand_separator: ',',
      category_separator: ' > '
    },
    validation_rules: {
      max_name_length: 200,
      max_description_length: 1000,
      required_image: false,
      price_range: { min: 0, max: 10000 }
    }
  }
};

export const menuExportService = {
  // Get all exportable products
  async getExportableProducts(): Promise<ExportableProduct[]> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('Not authenticated');

    // In a real implementation, this would query the products table
    // For now, return mock data based on existing product structure
    const mockProducts: ExportableProduct[] = [
      {
        id: '1',
        name: 'Signature Burger',
        description: 'Our famous burger with premium beef, special sauce, and fresh vegetables',
        category: 'Main Dishes',
        price: 32.50,
        image_url: '/images/signature-burger.jpg',
        allergens: ['Gluten', 'Dairy', 'Eggs'],
        ingredients: ['Beef patty', 'Bun', 'Lettuce', 'Tomato', 'Special sauce', 'Cheese'],
        nutrition_info: {
          calories: 650,
          protein: 35,
          carbs: 45,
          fat: 28
        },
        availability: {
          available: true,
          start_time: '11:00',
          end_time: '22:00',
          days_of_week: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
        },
        delivery_platforms: {
          glovo: true,
          bolt: true,
          tazz: true,
          uber: false,
          foodpanda: true
        },
        platform_specific_pricing: {
          glovo: 34.00,
          bolt: 33.50,
          tazz: 32.50,
          foodpanda: 33.00
        }
      },
      {
        id: '2',
        name: 'Chicken Caesar Salad',
        description: 'Fresh romaine lettuce with grilled chicken, parmesan cheese, and Caesar dressing',
        category: 'Salads',
        price: 28.00,
        image_url: '/images/caesar-salad.jpg',
        allergens: ['Dairy', 'Eggs'],
        ingredients: ['Romaine lettuce', 'Grilled chicken', 'Parmesan cheese', 'Croutons', 'Caesar dressing'],
        nutrition_info: {
          calories: 420,
          protein: 28,
          carbs: 15,
          fat: 18
        },
        availability: {
          available: true,
          start_time: '11:00',
          end_time: '22:00',
          days_of_week: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
        },
        delivery_platforms: {
          glovo: true,
          bolt: true,
          tazz: true,
          uber: true,
          foodpanda: true
        }
      },
      {
        id: '3',
        name: 'Margherita Pizza',
        description: 'Classic pizza with tomato sauce, mozzarella cheese, and fresh basil',
        category: 'Pizza',
        price: 35.00,
        image_url: '/images/margherita-pizza.jpg',
        allergens: ['Gluten', 'Dairy'],
        ingredients: ['Pizza dough', 'Tomato sauce', 'Mozzarella cheese', 'Fresh basil', 'Olive oil'],
        nutrition_info: {
          calories: 580,
          protein: 25,
          carbs: 65,
          fat: 22
        },
        availability: {
          available: true,
          start_time: '17:00',
          end_time: '23:00',
          days_of_week: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
        },
        delivery_platforms: {
          glovo: true,
          bolt: false,
          tazz: true,
          uber: true,
          foodpanda: false
        }
      }
    ];

    return mockProducts;
  },

  // Get platform templates
  async getPlatformTemplates(): Promise<MenuExportTemplate[]> {
    return Object.values(PLATFORM_TEMPLATES);
  },

  // Get specific platform template
  async getPlatformTemplate(platform: string): Promise<MenuExportTemplate> {
    const template = PLATFORM_TEMPLATES[platform];
    if (!template) {
      throw new Error(`Template not found for platform: ${platform}`);
    }
    return template;
  },

  // Create export job
  async createExportJob(jobData: Omit<MenuExportJob, 'id' | 'created_at' | 'status'>): Promise<MenuExportJob> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('Not authenticated');

    const { data: profile } = await supabase
      .from('profiles')
      .select('company_id')
      .eq('id', user.user.id)
      .single();

    const job: MenuExportJob = {
      id: `job_${Date.now()}`,
      ...jobData,
      status: 'pending',
      created_at: new Date().toISOString(),
      company_id: profile?.company_id || ''
    };

    // In a real implementation, this would be saved to database
    // and processed by a background job queue
    return job;
  },

  // Process export job
  async processExportJob(jobId: string): Promise<Blob> {
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Get job details (in real implementation, from database)
    const job = await this.getExportJob(jobId);
    
    return this.generateExportFile(job);
  },

  // Generate export file
  async generateExportFile(job: MenuExportJob): Promise<Blob> {
    const { format, products, template } = job;
    
    let content = '';
    let mimeType = '';

    switch (format) {
      case 'csv':
        content = this.generateCSV(products, template);
        mimeType = 'text/csv';
        break;
      case 'json':
        content = this.generateJSON(products, template);
        mimeType = 'application/json';
        break;
      case 'excel':
        // In real implementation, use xlsx library
        content = this.generateCSV(products, template);
        mimeType = 'text/csv';
        break;
      case 'pdf':
        // In real implementation, use jsPDF
        content = this.generateText(products, template);
        mimeType = 'text/plain';
        break;
    }

    return new Blob([content], { type: mimeType });
  },

  // Generate CSV format
  generateCSV(products: ExportableProduct[], template: MenuExportTemplate): string {
    const headers = template.required_fields.concat(template.optional_fields);
    const mappedHeaders = headers.map(field => template.field_mappings[field] || field);
    
    let csv = mappedHeaders.join(',') + '\n';
    
    products.forEach(product => {
      const row = headers.map(field => {
        let value = '';
        
        switch (field) {
          case 'name':
            value = `"${product.name}"`;
            break;
          case 'description':
            value = `"${product.description || ''}"`;
            break;
          case 'price':
            value = this.formatPrice(product.price, template.formatting_rules);
            break;
          case 'category':
            value = `"${product.category}"`;
            break;
          case 'image_url':
            value = `"${product.image_url || ''}"`;
            break;
          case 'allergens':
            value = `"${(product.allergens || []).join(', ')}"`;
            break;
          case 'ingredients':
            value = `"${(product.ingredients || []).join(', ')}"`;
            break;
          default:
            value = '""';
        }
        
        return value;
      });
      
      csv += row.join(',') + '\n';
    });
    
    return csv;
  },

  // Generate JSON format
  generateJSON(products: ExportableProduct[], template: MenuExportTemplate): string {
    const formattedProducts = products.map(product => {
      const formatted: any = {};
      
      template.required_fields.concat(template.optional_fields).forEach(field => {
        const mappedField = template.field_mappings[field] || field;
        
        switch (field) {
          case 'price':
            formatted[mappedField] = this.formatPrice(product.price, template.formatting_rules);
            break;
          case 'allergens':
            formatted[mappedField] = product.allergens || [];
            break;
          case 'ingredients':
            formatted[mappedField] = product.ingredients || [];
            break;
          default:
            formatted[mappedField] = (product as any)[field] || null;
        }
      });
      
      return formatted;
    });

    return JSON.stringify({
      platform: template.platform,
      exported_at: new Date().toISOString(),
      total_products: products.length,
      products: formattedProducts
    }, null, 2);
  },

  // Generate text format
  generateText(products: ExportableProduct[], template: MenuExportTemplate): string {
    let text = `${template.name}\n`;
    text += `Platform: ${template.platform}\n`;
    text += `Exported: ${new Date().toISOString()}\n`;
    text += `Total Products: ${products.length}\n\n`;
    
    products.forEach((product, index) => {
      text += `${index + 1}. ${product.name}\n`;
      text += `   Category: ${product.category}\n`;
      text += `   Price: ${this.formatPrice(product.price, template.formatting_rules)}\n`;
      if (product.description) {
        text += `   Description: ${product.description}\n`;
      }
      text += '\n';
    });
    
    return text;
  },

  // Format price according to template rules
  formatPrice(price: number, rules: MenuExportTemplate['formatting_rules']): string {
    const formatted = price.toFixed(rules.decimal_places);
    return `${formatted} ${rules.currency}`;
  },

  // Get export job
  async getExportJob(jobId: string): Promise<MenuExportJob> {
    // Mock job data
    const products = await this.getExportableProducts();
    const template = PLATFORM_TEMPLATES.glovo;
    
    return {
      id: jobId,
      name: 'Test Export Job',
      platform: 'glovo',
      format: 'csv',
      products,
      template,
      filters: {},
      status: 'pending',
      created_at: new Date().toISOString(),
      company_id: 'mock_company'
    };
  },

  // Get export jobs
  async getExportJobs(): Promise<MenuExportJob[]> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('Not authenticated');

    // Mock export jobs
    return [
      {
        id: 'job_1',
        name: 'Glovo Menu Export',
        platform: 'glovo',
        format: 'csv',
        products: await this.getExportableProducts(),
        template: PLATFORM_TEMPLATES.glovo,
        filters: { availability_only: true },
        status: 'completed',
        created_at: '2024-10-15T10:00:00Z',
        completed_at: '2024-10-15T10:02:00Z',
        download_url: '/exports/glovo-menu-export.csv',
        company_id: 'mock_company'
      }
    ];
  },

  // Platform integrations
  async getPlatformIntegrations(): Promise<PlatformIntegration[]> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('Not authenticated');

    const { data: profile } = await supabase
      .from('profiles')
      .select('company_id')
      .eq('id', user.user.id)
      .single();

    // Mock integrations
    return [
      {
        platform: 'glovo',
        enabled: true,
        sync_settings: {
          auto_sync: false,
          sync_frequency: 'manual',
          sync_products: true,
          sync_prices: true,
          sync_availability: true
        },
        last_sync: '2024-10-15T08:00:00Z',
        company_id: profile?.company_id || ''
      },
      {
        platform: 'bolt',
        enabled: true,
        sync_settings: {
          auto_sync: true,
          sync_frequency: 'daily',
          sync_products: true,
          sync_prices: true,
          sync_availability: false
        },
        last_sync: '2024-10-14T22:00:00Z',
        company_id: profile?.company_id || ''
      }
    ];
  },

  // Update platform integration
  async updatePlatformIntegration(
    platform: string, 
    updates: Partial<PlatformIntegration>
  ): Promise<PlatformIntegration> {
    // In real implementation, update database
    const integrations = await this.getPlatformIntegrations();
    const integration = integrations.find(i => i.platform === platform);
    
    if (!integration) {
      throw new Error(`Integration not found for platform: ${platform}`);
    }

    return { ...integration, ...updates };
  },

  // Seasonal menus
  async getSeasonalMenus(): Promise<SeasonalMenu[]> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('Not authenticated');

    // Mock seasonal menus
    return [
      {
        id: 'seasonal_1',
        name: 'Summer Menu 2024',
        season: 'summer',
        products: ['1', '2'],
        active_from: '2024-06-21',
        active_to: '2024-09-22',
        is_active: true,
        auto_activate: true,
        export_platforms: ['glovo', 'bolt', 'tazz'],
        company_id: 'mock_company',
        created_at: '2024-06-01T00:00:00Z'
      }
    ];
  },

  // Create seasonal menu
  async createSeasonalMenu(menuData: Omit<SeasonalMenu, 'id' | 'created_at'>): Promise<SeasonalMenu> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('Not authenticated');

    const menu: SeasonalMenu = {
      id: `seasonal_${Date.now()}`,
      ...menuData,
      created_at: new Date().toISOString()
    };

    // In real implementation, save to database
    return menu;
  },

  // Bulk operations
  async createBulkOperation(
    operationType: 'export' | 'import' | 'update' | 'sync',
    platform?: string
  ): Promise<BulkMenuOperation> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('Not authenticated');

    const { data: profile } = await supabase
      .from('profiles')
      .select('company_id')
      .eq('id', user.user.id)
      .single();

    const operation: BulkMenuOperation = {
      id: `bulk_${Date.now()}`,
      operation_type: operationType,
      platform,
      total_items: 0,
      processed_items: 0,
      failed_items: 0,
      status: 'queued',
      results: {
        success_count: 0,
        error_count: 0,
        warnings: [],
        errors: []
      },
      created_at: new Date().toISOString(),
      company_id: profile?.company_id || ''
    };

    return operation;
  },

  // Quick export for single platform
  async quickExport(platform: ExportPlatform, format: 'csv' | 'json' = 'csv'): Promise<Blob> {
    const products = await this.getExportableProducts();
    const template = await this.getPlatformTemplate(platform === 'all' ? 'standard' : platform);
    
    // Filter products for the platform
    const filteredProducts = platform === 'all' 
      ? products
      : products.filter(p => p.delivery_platforms[platform as keyof typeof p.delivery_platforms]);

    const job: MenuExportJob = {
      id: `quick_${Date.now()}`,
      name: `Quick ${platform} Export`,
      platform: platform === 'all' ? 'standard' : platform,
      format,
      products: filteredProducts,
      template,
      filters: { platform_enabled_only: true },
      status: 'processing',
      created_at: new Date().toISOString(),
      company_id: 'mock_company'
    };

    return this.generateExportFile(job);
  }
};