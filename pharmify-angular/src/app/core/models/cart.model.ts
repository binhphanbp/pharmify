export interface CartItem {
  product_id: string;
  unit_id: string;
  quantity: number;
  
  // Hydrated details (optional initially, filled by summary RPC)
  product_name?: string;
  unit_name?: string;
  unit_price?: number;
  original_price?: number;
  subtotal?: number;
  in_stock?: boolean;
}

export interface CartSummary {
  items: CartItem[];
  total_amount: number;
  item_count: number;
  
  // Coupon applied
  coupon_id?: string;
  discount_amount?: number;
  final_total?: number;
}
