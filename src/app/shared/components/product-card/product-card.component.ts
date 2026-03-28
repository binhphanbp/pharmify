import { Component, Input } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Product } from '../../../core/models/product.model';
import { QuickViewModalComponent } from '../quick-view-modal/quick-view-modal.component';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule, RouterModule, DecimalPipe, QuickViewModalComponent],
  templateUrl: './product-card.component.html',
  styleUrls: ['./product-card.component.scss'],
})
export class ProductCardComponent {
  @Input({ required: true }) product!: Product;

  showQuickView = false;

  openQuickView(event: Event) {
    event.preventDefault();
    event.stopPropagation();
    this.showQuickView = true;
  }

  closeQuickView() {
    this.showQuickView = false;
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
