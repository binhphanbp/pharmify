import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ProductService } from '../../core/services/product.service';
import { CartService } from '../../core/services/cart.service';
import { ProductDetail, ProductUnit } from '../../core/models/product.model';
import { toast } from 'ngx-sonner';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.scss'],
})
export class ProductDetailComponent implements OnInit {
  product = signal<ProductDetail | null>(null);
  loading = signal(true);
  quantity = signal<number>(1);
  selectedUnitId = signal<string | null>(null);

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    private cartService: CartService,
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      const slug = params.get('slug');
      if (slug) {
        this.loadProduct(slug);
      }
    });
  }

  async loadProduct(slug: string) {
    this.loading.set(true);
    try {
      const data = await this.productService.getProductBySlug(slug);
      this.product.set(data);
      if (data && data.units && data.units.length > 0) {
        // Find base unit or first unit
        const base = data.units.find((u) => u.is_base_unit);
        const firstUnit = base || data.units[0];
        // v_product_detail uses unit_id, v_product_catalog may use id
        this.selectedUnitId.set(firstUnit.unit_id || firstUnit.id);
      }
    } catch (err) {
      console.error('Error loading product details', err);
    } finally {
      this.loading.set(false);
    }
  }

  /** Get the currently selected unit object */
  get selectedUnit(): ProductUnit | null {
    const p = this.product();
    const uid = this.selectedUnitId();
    if (!p || !uid || !p.units) return null;
    // Match by unit_id first (v_product_detail), then id fallback
    return p.units.find((u) => (u.unit_id || u.id) === uid) || null;
  }

  /** Current price based on selected unit */
  get currentPrice(): number {
    const unit = this.selectedUnit;
    if (unit && unit.price) return unit.price;
    // Fallback to product-level price if exists
    const p = this.product();
    return p?.price || 0;
  }

  /** Original price for showing strikethrough */
  get originalPrice(): number | null {
    const unit = this.selectedUnit;
    if (unit?.original_price && unit.original_price > (unit.price || 0)) {
      return unit.original_price;
    }
    const p = this.product();
    if (p?.original_price && p.original_price > (p.price || 0)) {
      return p.original_price;
    }
    return null;
  }

  /** Current unit name */
  get currentUnitName(): string {
    const unit = this.selectedUnit;
    if (unit) return unit.unit_name;
    const p = this.product();
    return p?.base_unit_name || '';
  }

  /** Discount percentage */
  get discountPercent(): number | null {
    const orig = this.originalPrice;
    const curr = this.currentPrice;
    if (!orig || !curr || orig <= curr) return null;
    return Math.round((1 - curr / orig) * 100);
  }

  increaseQuantity() {
    this.quantity.update((q) => q + 1);
  }

  decreaseQuantity() {
    this.quantity.update((q) => (q > 1 ? q - 1 : 1));
  }

  selectUnit(unitId: string) {
    this.selectedUnitId.set(unitId);
  }

  addToCart() {
    const p = this.product();
    const u = this.selectedUnitId();
    if (p && u) {
      this.cartService.addToCart(p.id, u, this.quantity());
      toast.success('Đã thêm sản phẩm vào giỏ hàng', {
        description: `${p.name} × ${this.quantity()}`,
      });
    }
  }
}
