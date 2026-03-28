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
  styleUrls: ['./product-card.component.scss'],
})
export class ProductCardComponent {
  @Input({ required: true }) product!: Product;

  constructor(private cartService: CartService) {}

  addToCart(event: Event) {
    event.preventDefault();
    event.stopPropagation();
    if (this.product.base_unit_id) {
      this.cartService.addToCart(this.product.id, this.product.base_unit_id);
    }
  }

  get discountPercent(): number {
    if (
      !this.product.original_price ||
      this.product.original_price <= this.product.price
    )
      return 0;
    return Math.round(
      ((this.product.original_price - this.product.price) /
        this.product.original_price) *
        100,
    );
  }
}
