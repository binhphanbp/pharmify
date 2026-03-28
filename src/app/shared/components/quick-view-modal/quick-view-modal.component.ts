import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  signal,
} from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import {
  Product,
  ProductDetail,
  ProductUnit,
} from '../../../core/models/product.model';
import { ProductService } from '../../../core/services/product.service';
import { CartService } from '../../../core/services/cart.service';

@Component({
  selector: 'app-quick-view-modal',
  standalone: true,
  imports: [CommonModule, RouterModule, DecimalPipe],
  templateUrl: './quick-view-modal.component.html',
  styleUrls: ['./quick-view-modal.component.scss'],
})
export class QuickViewModalComponent implements OnInit {
  @Input({ required: true }) product!: Product;
  @Output() close = new EventEmitter<void>();

  detail = signal<ProductDetail | null>(null);
  loading = signal(true);
  quantity = signal(1);
  selectedUnitId = signal<string | null>(null);

  constructor(
    private productService: ProductService,
    private cartService: CartService,
    private router: Router,
  ) {}

  ngOnInit() {
    this.loadDetail();
  }

  async loadDetail() {
    this.loading.set(true);
    try {
      const data = await this.productService.getProductBySlug(
        this.product.slug,
      );
      this.detail.set(data);
      if (data?.units?.length) {
        const base = data.units.find((u) => u.is_base_unit);
        const firstUnit = base || data.units[0];
        this.selectedUnitId.set(firstUnit.unit_id || firstUnit.id);
      } else {
        this.selectedUnitId.set(this.product.base_unit_id);
      }
    } catch (err) {
      console.error('Error loading product detail:', err);
      // Use basic product info as fallback
      this.selectedUnitId.set(this.product.base_unit_id);
    } finally {
      this.loading.set(false);
    }
  }

  get units(): ProductUnit[] {
    const d = this.detail();
    return d?.units?.filter((u) => u.is_active !== false) || [];
  }

  get selectedUnit(): ProductUnit | null {
    const uid = this.selectedUnitId();
    if (!uid) return null;
    return this.units.find((u) => (u.unit_id || u.id) === uid) || null;
  }

  get currentPrice(): number {
    const unit = this.selectedUnit;
    if (unit?.price) return unit.price;
    return this.product.price;
  }

  get originalPrice(): number | null {
    const unit = this.selectedUnit;
    if (unit?.original_price && unit.original_price > (unit.price || 0)) {
      return unit.original_price;
    }
    if (
      this.product.original_price &&
      this.product.original_price > this.product.price
    ) {
      return this.product.original_price;
    }
    return null;
  }

  get currentUnitName(): string {
    const unit = this.selectedUnit;
    if (unit) return unit.unit_name;
    return this.product.base_unit_name || '';
  }

  get discountPercent(): number | null {
    const orig = this.originalPrice;
    const curr = this.currentPrice;
    if (!orig || !curr || orig <= curr) return null;
    return Math.round((1 - curr / orig) * 100);
  }

  selectUnit(unitId: string) {
    this.selectedUnitId.set(unitId);
  }

  increaseQty() {
    this.quantity.update((q) => q + 1);
  }

  decreaseQty() {
    this.quantity.update((q) => (q > 1 ? q - 1 : 1));
  }

  addToCart() {
    const uid = this.selectedUnitId();
    if (uid) {
      this.cartService.addToCart(this.product.id, uid, this.quantity());
      this.close.emit();
    }
  }

  buyNow() {
    const uid = this.selectedUnitId();
    if (uid) {
      this.cartService.addToCart(this.product.id, uid, this.quantity());
      this.close.emit();
      this.router.navigate(['/checkout']);
    }
  }

  onOverlayClick(event: MouseEvent) {
    if ((event.target as HTMLElement).classList.contains('qv-overlay')) {
      this.close.emit();
    }
  }
}
