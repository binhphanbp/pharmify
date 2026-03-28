import { Component, inject, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { CartService } from '../../../core/services/cart.service';
import { AuthModalComponent } from '../auth-modal/auth-modal.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, AuthModalComponent],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent {
  authService = inject(AuthService);
  cartService = inject(CartService);
  router = inject(Router);

  user = this.authService.currentUser;
  cartItemCount = this.cartService.cartItemCount;
  isSticky = false;
  isHomePage = true;
  showAuthModal = false;
  showUserMenu = false;

  constructor() {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.isHomePage =
          event.urlAfterRedirects === '/' ||
          event.urlAfterRedirects.split('?')[0] === '/';
      }
    });
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.isSticky = window.scrollY > 150;
  }

  onSearch(input: HTMLInputElement, event?: Event) {
    if (event) event.preventDefault();
    const query = input.value.trim();
    if (query) {
      this.router.navigate(['/search'], { queryParams: { q: query } });
    }
  }

  openAuthModal() {
    this.showAuthModal = true;
  }

  closeAuthModal() {
    this.showAuthModal = false;
  }

  toggleUserMenu() {
    this.showUserMenu = !this.showUserMenu;
  }

  async logout() {
    await this.authService.signOut();
    this.showUserMenu = false;
    this.router.navigate(['/']);
  }
}
