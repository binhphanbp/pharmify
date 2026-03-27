import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { Product, ProductDetail } from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  constructor(private supabase: SupabaseService) { }

  async getHotProducts(limit: number = 10): Promise<Product[]> {
    // For demo, ordering by recent or specific logic, here just random or first 10
    const { data, error } = await this.supabase.client
      .from('v_product_catalog')
      .select('*')
      .limit(limit);
      
    if (error) throw error;
    return data as Product[];
  }

  async getNewProducts(limit: number = 10): Promise<Product[]> {
    const { data, error } = await this.supabase.client
      .from('v_product_catalog')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);
      
    if (error) throw error;
    return data as Product[];
  }

  async getProductBySlug(slug: string): Promise<ProductDetail | null> {
    const { data, error } = await this.supabase.client
      .from('v_product_detail')
      .select('*')
      .eq('slug', slug)
      .single();
      
    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw error;
    }
    return data as ProductDetail;
  }

  async searchProducts(query: string, page: number = 1, perPage: number = 12) {
    const { data, error } = await this.supabase.client.rpc('fn_search_products', {
      p_query: query,
      p_page: page,
      p_per_page: perPage,
      p_sort_by: 'name'
    });

    if (error) throw error;
    return data;
  }
}
