import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { Banner, Brand } from '../models/banner.model';
import { Product } from '../models/product.model';
import { Category } from '../models/category.model';

export interface HomePageData {
  hero_banners: Banner[];
  sub_banners: Banner[];
  brands: Brand[];
  categories: Category[];
  hot_products: Product[];
  new_products: Product[];
}

@Injectable({ providedIn: 'root' })
export class HomeService {
  constructor(private supabaseService: SupabaseService) {}

  /**
   * Fetch all home page data in a single RPC call.
   * Returns: hero_banners, sub_banners, brands, categories, hot_products, new_products
   */
  async getHomePageData(): Promise<HomePageData> {
    const { data, error } =
      await this.supabaseService.client.rpc('get_home_page_data');

    if (error) {
      console.error('Error fetching home page data:', error);
      throw error;
    }

    return data as HomePageData;
  }
}
