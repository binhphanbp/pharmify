import { Component, computed, inject } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CartService } from '../../core/services/cart.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss']
})
export class CartComponent {
  cartService = inject(CartService);
  summary = this.cartService.cartSummary;
  itemCount = this.cartService.cartItemCount;

  updateQty(productId: string, unitId: string, quantity: number) {
    this.cartService.updateQuantity(productId, unitId, quantity);
  }

  removeItem(productId: string, unitId: string) {
    this.cartService.removeFromCart(productId, unitId);
  }
}
