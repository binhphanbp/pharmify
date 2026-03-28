import { Injectable, signal, computed } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { CartItem, CartSummary } from '../models/cart.model';

@Injectable({
  providedIn: 'root',
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
    const existingIndex = items.findIndex(
      (i) => i.product_id === productId && i.unit_id === unitId,
    );

    if (existingIndex >= 0) {
      // Move to front and update quantity
      const [existing] = items.splice(existingIndex, 1);
      existing.quantity += quantity;
      items.unshift(existing);
    } else {
      items.unshift({ product_id: productId, unit_id: unitId, quantity });
    }
    this.saveCart(items);
  }

  removeFromCart(productId: string, unitId: string) {
    const items = this.itemsSignal().filter(
      (i) => !(i.product_id === productId && i.unit_id === unitId),
    );
    this.saveCart(items);
  }

  updateQuantity(productId: string, unitId: string, quantity: number) {
    if (quantity <= 0) {
      this.removeFromCart(productId, unitId);
      return;
    }
    const items = [...this.itemsSignal()];
    const item = items.find(
      (i) => i.product_id === productId && i.unit_id === unitId,
    );
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
        item_count: 0,
      });
      return;
    }

    // Call RPC to get hydrated cart summary
    const payload = items.map((i) => ({
      product_id: i.product_id,
      unit_id: i.unit_id,
      quantity: i.quantity,
    }));

    try {
      const { data, error } = await this.supabase.client.rpc(
        'fn_get_cart_summary',
        {
          p_items: payload,
          p_coupon_code: couponCode || null,
        },
      );

      if (error) throw error;

      const summary = data as CartSummary;
      this.cartSummary.set(summary);

      // Prune local cart: remove items that the server couldn't resolve
      // (e.g. items with invalid unit_id like 'default-unit-id')
      if (summary.items && summary.items.length < items.length) {
        const validKeys = new Set(
          summary.items.map((i) => `${i.product_id}::${i.unit_id}`),
        );
        const cleaned = items.filter((i) =>
          validKeys.has(`${i.product_id}::${i.unit_id}`),
        );
        localStorage.setItem('pharmify_cart', JSON.stringify(cleaned));
        this.itemsSignal.set(cleaned);
      }
    } catch (err) {
      console.error('Error syncing cart with server:', err);
    }
  }
}
