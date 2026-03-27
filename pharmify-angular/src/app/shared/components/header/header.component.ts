import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { CartService } from '../../../core/services/cart.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  authService = inject(AuthService);
  cartService = inject(CartService);

  user = this.authService.currentUser;
  cartItemCount = this.cartService.cartItemCount;

  onSearchInput(event: Event) {
    const query = (event.target as HTMLInputElement).value;
    // Implement search logic or route navigation
  }
}
