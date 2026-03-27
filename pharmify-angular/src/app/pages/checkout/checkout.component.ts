import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CartService } from '../../core/services/cart.service';
import { OrderService } from '../../core/services/order.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.scss'],
})
export class CheckoutComponent implements OnInit {
  cartService = inject(CartService);
  private orderService = inject(OrderService);
  private authService = inject(AuthService);
  private router = inject(Router);

  summary = this.cartService.cartSummary;
  isLoggedIn = this.authService.isLoggedIn;
  placing = signal(false);
  orderSuccess = signal(false);
  orderResult = signal<any>(null);
  errorMsg = signal('');

  // Form fields
  form = {
    fullName: '',
    phone: '',
    email: '',
    province: '',
    district: '',
    ward: '',
    address: '',
    notes: '',
    couponCode: '',
    paymentMethod: 'cod',
  };

  ngOnInit() {
    if (this.cartService.cartItemCount() === 0) {
      this.router.navigate(['/cart']);
      return;
    }
    if (!this.isLoggedIn()) {
      this.router.navigate(['/auth'], {
        queryParams: { returnUrl: '/checkout' },
      });
    }
  }

  get shippingAddress(): string {
    const parts = [
      this.form.address,
      this.form.ward,
      this.form.district,
      this.form.province,
    ].filter(Boolean);
    return parts.join(', ');
  }

  async placeOrder() {
    // Validate
    if (
      !this.form.fullName ||
      !this.form.phone ||
      !this.form.address ||
      !this.form.province
    ) {
      this.errorMsg.set('Vui lòng điền đầy đủ thông tin giao hàng');
      return;
    }

    this.placing.set(true);
    this.errorMsg.set('');

    try {
      const items = this.cartService.cartItems().map((i) => ({
        product_id: i.product_id,
        product_unit_id: i.unit_id,
        quantity: i.quantity,
      }));

      const result = await this.orderService.placeOrder({
        items,
        shipping_address: `${this.form.fullName} - ${this.form.phone}\n${this.shippingAddress}`,
        notes: this.form.notes || undefined,
        coupon_code: this.form.couponCode || undefined,
      });

      this.orderResult.set(result);
      this.orderSuccess.set(true);
    } catch (err: any) {
      console.error('Lỗi đặt hàng:', err);
      this.errorMsg.set(
        err?.message || 'Đã xảy ra lỗi khi đặt hàng. Vui lòng thử lại.',
      );
    } finally {
      this.placing.set(false);
    }
  }
}
