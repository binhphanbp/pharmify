import { Injectable, signal, computed } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { CartItem, CartSummary } from '../models/cart.model';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private itemsSignal = signal<CartItem[]>(this.loadCart());
  
  cartItems = this.itemsSignal.asReadonly();
  
  cartItemCount = computed(() => {
    return this.itemsSignal().reduce((acc, item) => acc + item.quantity, 0);
  });

  cartSummary = signal<CartSummary | null>(null);

  constructor(private supabase: SupabaseService) {
    this.syncWithServer(); // Initial sync
  }

  private loadCart(): CartItem[] {
    const saved = localStorage.getItem('pharmify_cart');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return [];
      }
    }
    return [];
  }

  private saveCart(items: CartItem[]) {
    localStorage.setItem('pharmify_cart', JSON.stringify(items));
    this.itemsSignal.set(items);
    this.syncWithServer();
  }

  addToCart(productId: string, unitId: string, quantity: number = 1) {
    const items = [...this.itemsSignal()];
    const existing = items.find(i => i.product_id === productId && i.unit_id === unitId);
    
    if (existing) {
      existing.quantity += quantity;
    } else {
      items.push({ product_id: productId, unit_id: unitId, quantity });
    }
    this.saveCart(items);
  }

  removeFromCart(productId: string, unitId: string) {
    const items = this.itemsSignal().filter(i => !(i.product_id === productId && i.unit_id === unitId));
    this.saveCart(items);
  }

  updateQuantity(productId: string, unitId: string, quantity: number) {
    if (quantity <= 0) {
      this.removeFromCart(productId, unitId);
      return;
    }
    const items = [...this.itemsSignal()];
    const item = items.find(i => i.product_id === productId && i.unit_id === unitId);
    if (item) {
      item.quantity = quantity;
      this.saveCart(items);
    }
  }

  clearCart() {
    this.saveCart([]);
  }

  async syncWithServer(couponCode?: string) {
    const items = this.itemsSignal();
    if (items.length === 0) {
      this.cartSummary.set({
        items: [],
        total_amount: 0,
        item_count: 0
      });
      return;
    }

    // Call RPC to get hydrated cart summary
    const payload = items.map(i => ({ product_id: i.product_id, unit_id: i.unit_id, quantity: i.quantity }));
    
    try {
      const { data, error } = await this.supabase.client.rpc('fn_get_cart_summary', {
        p_items: payload,
        p_coupon_code: couponCode || null
      });

      if (error) throw error;
      
      this.cartSummary.set(data as CartSummary);
    } catch (err) {
      console.error('Error syncing cart with server:', err);
    }
  }
}
