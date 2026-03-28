import { Injectable, signal } from '@angular/core';
import { SupabaseService } from './supabase.service';

export interface FlashSaleSlot {
  time_slot_id: string;
  slot_label: string;
  start_time: string;
  end_time: string;
  slot_status: 'active' | 'upcoming' | 'ended';
  slot_sort_order: number;
}

export interface FlashSaleItem {
  item_id: string;
  campaign_id: string;
  campaign_name: string;
  campaign_banner: string;
  time_slot_id: string;
  flash_price: number;
  original_price: number;
  discount_percent: number;
  stock_limit: number;
  sold_count: number;
  product_id: string;
  product_name: string;
  product_slug: string;
  product_image: string;
  short_description: string;
  unit_id: string;
  unit_name: string;
  category_id: string;
  category_name: string;
  category_slug: string;
  slot_status: 'active' | 'upcoming' | 'ended';
  start_time: string;
  end_time: string;
  slot_label: string;
}

@Injectable({ providedIn: 'root' })
export class FlashSaleService {
  loading = signal(false);

  constructor(private supabase: SupabaseService) {}

  async getActiveFlashSale(): Promise<FlashSaleItem[]> {
    this.loading.set(true);
    try {
      const { data, error } = await this.supabase.client
        .from('v_flash_sale_active')
        .select('*');

      if (error) throw error;
      return (data || []) as FlashSaleItem[];
    } catch (err) {
      console.error('Error fetching flash sale:', err);
      return [];
    } finally {
      this.loading.set(false);
    }
  }
}
