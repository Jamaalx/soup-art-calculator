export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          company_name: string | null;
          phone: string | null;
          role: 'admin' | 'user';
          is_active: boolean;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          company_name?: string | null;
          phone?: string | null;
          role?: 'admin' | 'user';
          is_active?: boolean;
          created_by?: string | null;
        };
        Update: {
          full_name?: string | null;
          company_name?: string | null;
          phone?: string | null;
          role?: 'admin' | 'user';
          is_active?: boolean;
        };
      };
      user_products: {
        Row: {
          id: string;
          user_id: string;
          product_id: string;
          category: string;
          nume: string;
          pret_cost: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          product_id: string;
          category: string;
          nume: string;
          pret_cost: number;
          is_active?: boolean;
        };
        Update: {
          nume?: string;
          pret_cost?: number;
          is_active?: boolean;
        };
      };
      calculations: {
        Row: {
          id: string;
          user_id: string;
          calculator_type: 'online' | 'offline' | 'fix' | 'catering';
          pret_vanzare: number;
          selected_products: any;
          results: any;
          client_info: any;
          created_at: string;
        };
        Insert: {
          user_id: string;
          calculator_type: 'online' | 'offline' | 'fix' | 'catering';
          pret_vanzare: number;
          selected_products: any;
          results: any;
          client_info?: any;
        };
      };
    };
  };
}