export interface Product {
  id: string;
  name: string;
  slug: string;
  sku: string;
  product_type: string;
  short_description: string;
  active_ingredient?: string;
  dosage?: string;
  manufacturer?: string;
  requires_prescription: boolean;
  image_url?: string;
  category_name: string;
  category_slug: string;
  base_unit_name: string;
  price: number;
  original_price?: number;
  total_stock: number;
  created_at: string;
}

export interface ProductDetail extends Product {
  description?: string;
  packaging?: string;
  brand_name?: string;
  contraindications?: string;
  side_effects?: string;
  usage_instructions?: string;
  storage_instructions?: string;
  units: ProductUnit[];
}

export interface ProductUnit {
  id: string;
  unit_name: string;
  conversion_factor: number;
  is_base_unit: boolean;
  price?: number;
  original_price?: number;
  is_active: boolean;
}
