import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { Banner, Brand } from '../models/banner.model';

@Injectable({ providedIn: 'root' })
export class BannerService {
  private supabase;

  constructor(private supabaseService: SupabaseService) {
    this.supabase = this.supabaseService.client;
  }

  /**
   * Get active banners by position (hero, sub, popup, sidebar)
   * Only returns banners within valid date range
   */
  async getBannersByPosition(position: string = 'hero'): Promise<Banner[]> {
    const now = new Date().toISOString();
    const { data, error } = await this.supabase
      .from('banners')
      .select('*')
      .eq('position', position)
      .eq('is_active', true)
      .or(`start_date.is.null,start_date.lte.${now}`)
      .or(`end_date.is.null,end_date.gte.${now}`)
      .order('sort_order', { ascending: true });

    if (error) {
      console.error('Error fetching banners:', error);
      return [];
    }
    return data || [];
  }

  /**
   * Get all active brands ordered by sort_order
   */
  async getActiveBrands(): Promise<Brand[]> {
    const { data, error } = await this.supabase
      .from('brands')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (error) {
      console.error('Error fetching brands:', error);
      return [];
    }
    return data || [];
  }

  // ============ ADMIN METHODS (for future admin panel) ============

  /** Create a new banner */
  async createBanner(banner: Partial<Banner>): Promise<Banner | null> {
    const { data, error } = await this.supabase
      .from('banners')
      .insert(banner)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  /** Update a banner */
  async updateBanner(
    id: string,
    updates: Partial<Banner>,
  ): Promise<Banner | null> {
    const { data, error } = await this.supabase
      .from('banners')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  /** Delete a banner */
  async deleteBanner(id: string): Promise<void> {
    const { error } = await this.supabase.from('banners').delete().eq('id', id);
    if (error) throw error;
  }

  /** Create a new brand */
  async createBrand(brand: Partial<Brand>): Promise<Brand | null> {
    const { data, error } = await this.supabase
      .from('brands')
      .insert(brand)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  /** Update a brand */
  async updateBrand(
    id: string,
    updates: Partial<Brand>,
  ): Promise<Brand | null> {
    const { data, error } = await this.supabase
      .from('brands')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  /** Delete a brand */
  async deleteBrand(id: string): Promise<void> {
    const { error } = await this.supabase.from('brands').delete().eq('id', id);
    if (error) throw error;
  }

  /** Upload banner image to Storage and return public URL */
  async uploadBannerImage(file: File, filename: string): Promise<string> {
    const path = `banners/${filename}`;
    const { error } = await this.supabase.storage
      .from('product-images')
      .upload(path, file, { upsert: true, contentType: file.type });
    if (error) throw error;

    const { data } = this.supabase.storage
      .from('product-images')
      .getPublicUrl(path);
    return data.publicUrl;
  }

  /** Upload brand logo to Storage and return public URL */
  async uploadBrandLogo(file: File, slug: string): Promise<string> {
    const ext = file.name.split('.').pop();
    const path = `brands/${slug}.${ext}`;
    const { error } = await this.supabase.storage
      .from('product-images')
      .upload(path, file, { upsert: true, contentType: file.type });
    if (error) throw error;

    const { data } = this.supabase.storage
      .from('product-images')
      .getPublicUrl(path);
    return data.publicUrl;
  }
}
