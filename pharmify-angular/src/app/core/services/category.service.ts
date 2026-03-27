import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { Category } from '../models/category.model';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {

  constructor(private supabase: SupabaseService) { }

  async getCategories(): Promise<Category[]> {
    const { data, error } = await this.supabase.client
      .from('categories')
      .select('*')
      .order('sort_order', { ascending: true });
      
    if (error) throw error;
    return data as Category[];
  }

  async getParentCategories(): Promise<Category[]> {
    const { data, error } = await this.supabase.client
      .from('categories')
      .select('*')
      .is('parent_id', null)
      .order('sort_order', { ascending: true });
      
    if (error) throw error;
    return data as Category[];
  }
}
