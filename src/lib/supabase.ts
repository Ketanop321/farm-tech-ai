import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          password: string;
          first_name: string;
          last_name: string;
          phone: string | null;
          role: 'farmer' | 'buyer' | 'admin';
          avatar: string | null;
          is_verified: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          password: string;
          first_name: string;
          last_name: string;
          phone?: string | null;
          role: 'farmer' | 'buyer' | 'admin';
          avatar?: string | null;
          is_verified?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          password?: string;
          first_name?: string;
          last_name?: string;
          phone?: string | null;
          role?: 'farmer' | 'buyer' | 'admin';
          avatar?: string | null;
          is_verified?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      farmers: {
        Row: {
          id: string;
          user_id: string;
          farm_name: string;
          farm_address: string;
          license_number: string | null;
          kyc_documents: string | null;
          is_approved: boolean;
          account_balance: number;
        };
        Insert: {
          id?: string;
          user_id: string;
          farm_name: string;
          farm_address: string;
          license_number?: string | null;
          kyc_documents?: string | null;
          is_approved?: boolean;
          account_balance?: number;
        };
        Update: {
          id?: string;
          user_id?: string;
          farm_name?: string;
          farm_address?: string;
          license_number?: string | null;
          kyc_documents?: string | null;
          is_approved?: boolean;
          account_balance?: number;
        };
      };
      products: {
        Row: {
          id: string;
          farmer_id: string;
          title: string;
          description: string | null;
          category: string;
          price: number;
          stock: number;
          images: any;
          unit: string;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          farmer_id: string;
          title: string;
          description?: string | null;
          category: string;
          price: number;
          stock: number;
          images?: any;
          unit: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          farmer_id?: string;
          title?: string;
          description?: string | null;
          category?: string;
          price?: number;
          stock?: number;
          images?: any;
          unit?: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      orders: {
        Row: {
          id: string;
          buyer_id: string;
          farmer_id: string;
          total_amount: number;
          status: string;
          shipping_address: any;
          payment_status: string;
          payment_method: string | null;
          payment_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          buyer_id: string;
          farmer_id: string;
          total_amount: number;
          status?: string;
          shipping_address: any;
          payment_status?: string;
          payment_method?: string | null;
          payment_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          buyer_id?: string;
          farmer_id?: string;
          total_amount?: number;
          status?: string;
          shipping_address?: any;
          payment_status?: string;
          payment_method?: string | null;
          payment_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          product_id: string;
          quantity: number;
          price: number;
        };
        Insert: {
          id?: string;
          order_id: string;
          product_id: string;
          quantity: number;
          price: number;
        };
        Update: {
          id?: string;
          order_id?: string;
          product_id?: string;
          quantity?: number;
          price?: number;
        };
      };
      chats: {
        Row: {
          id: string;
          buyer_id: string;
          farmer_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          buyer_id: string;
          farmer_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          buyer_id?: string;
          farmer_id?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      messages: {
        Row: {
          id: string;
          chat_id: string;
          sender_id: string;
          content: string;
          type: string;
          is_read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          chat_id: string;
          sender_id: string;
          content: string;
          type?: string;
          is_read?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          chat_id?: string;
          sender_id?: string;
          content?: string;
          type?: string;
          is_read?: boolean;
          created_at?: string;
        };
      };
      categories: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          is_active?: boolean;
          created_at?: string;
        };
      };
      reviews: {
        Row: {
          id: string;
          order_id: string;
          buyer_id: string;
          farmer_id: string;
          product_id: string;
          rating: number;
          comment: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          buyer_id: string;
          farmer_id: string;
          product_id: string;
          rating: number;
          comment?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          order_id?: string;
          buyer_id?: string;
          farmer_id?: string;
          product_id?: string;
          rating?: number;
          comment?: string | null;
          created_at?: string;
        };
      };
    };
  };
}