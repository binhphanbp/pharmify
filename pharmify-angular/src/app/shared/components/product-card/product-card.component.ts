import { Component, Input } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Product } from '../../../core/models/product.model';
import { CartService } from '../../../core/services/cart.service';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './product-card.component.html',
  styleUrls: ['./product-card.component.scss']
})
export class ProductCardComponent {
  @Input({ required: true }) product!: Product;

  constructor(private cartService: CartService) {}

  addToCart(event: Event) {
    event.preventDefault();
    event.stopPropagation();
    // Use a default unit id if single unit, here we assume product base unit mapping or just use a mock unit for now
    this.cartService.addToCart(this.product.id, 'default-unit-id');
  }

  get discountPercent(): number {
    if (!this.product.original_price || this.product.original_price <= this.product.price) return 0;
    return Math.round(((this.product.original_price - this.product.price) / this.product.original_price) * 100);
  }
}
