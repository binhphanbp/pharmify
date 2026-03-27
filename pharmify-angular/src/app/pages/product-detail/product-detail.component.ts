import { Component, OnInit, signal } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ProductService } from '../../core/services/product.service';
import { CartService } from '../../core/services/cart.service';
import { ProductDetail } from '../../core/models/product.model';
import { LoadingSkeletonComponent } from '../../shared/components/loading-skeleton/loading-skeleton.component';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, LoadingSkeletonComponent],
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.scss']
})
export class ProductDetailComponent implements OnInit {
  product = signal<ProductDetail | null>(null);
  loading = signal(true);
  quantity = signal<number>(1);
  selectedUnit = signal<string | null>(null);

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    private cartService: CartService
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
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
        // Find base unit or first active unit
        const base = data.units.find(u => u.is_base_unit);
        this.selectedUnit.set(base ? base.id : data.units[0].id);
      }
    } catch (err) {
      console.error('Error loading product details', err);
    } finally {
      this.loading.set(false);
    }
  }

  increaseQuantity() {
    this.quantity.update(q => q + 1);
  }

  decreaseQuantity() {
    this.quantity.update(q => (q > 1 ? q - 1 : 1));
  }

  selectUnit(unitId: string) {
    this.selectedUnit.set(unitId);
  }

  addToCart() {
    const p = this.product();
    const u = this.selectedUnit();
    if (p && u) {
      this.cartService.addToCart(p.id, u, this.quantity());
      // Could show a toast notification here
      alert('Đã thêm sản phẩm vào giỏ hàng');
    }
  }

  get currentPrice(): number {
    const p = this.product();
    const uId = this.selectedUnit();
    if (!p || !uId) return 0;
    
    // In our view, we have base price, if dealing with units we'd look up the unit price 
    // Usually the unit determines the multiplier or final price. 
    // Here we use the base price * conversion, or unit actual price if available
    const unit = p.units.find(u => u.id === uId);
    if (unit && unit.price) {
      return unit.price;
    }
    return p.price;
  }
}
