import { Injectable, inject } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { CartService } from './cart.service';

export interface PlaceOrderRequest {
  items: { product_id: string; product_unit_id: string; quantity: number }[];
  shipping_address: string;
  notes?: string;
  coupon_code?: string;
}

export interface PlaceOrderResult {
  order_id: string;
  order_number: string;
  total: number;
  discount: number;
}

@Injectable({ providedIn: 'root' })
export class OrderService {
  private supabase = inject(SupabaseService);
  private cart = inject(CartService);

  async placeOrder(req: PlaceOrderRequest): Promise<PlaceOrderResult> {
    const { data, error } = await this.supabase.client.rpc('fn_place_order', {
      p_items: req.items,
      p_shipping_address: req.shipping_address,
      p_notes: req.notes || null,
      p_coupon_code: req.coupon_code || null,
    });

    if (error) throw error;

    // Clear cart after successful order
    this.cart.clearCart();

    return data as PlaceOrderResult;
  }

  async getMyOrders() {
    const { data, error } = await this.supabase.client
      .from('orders')
      .select('*, order_items(*)')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }
}
