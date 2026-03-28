import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="admin-layout">
      <!-- Sidebar -->
      <aside class="sidebar" [class.collapsed]="sidebarCollapsed">
        <div class="sidebar-header">
          <a routerLink="/admin" class="logo">
            <span class="material-icons">local_pharmacy</span>
            <span class="logo-text" *ngIf="!sidebarCollapsed"
              >Pharmify Admin</span
            >
          </a>
          <button
            class="toggle-btn"
            (click)="sidebarCollapsed = !sidebarCollapsed"
          >
            <span class="material-icons">{{
              sidebarCollapsed ? 'chevron_right' : 'chevron_left'
            }}</span>
          </button>
        </div>

        <nav class="sidebar-nav">
          <a
            routerLink="/admin"
            routerLinkActive="active"
            [routerLinkActiveOptions]="{ exact: true }"
            class="nav-item"
          >
            <span class="material-icons">dashboard</span>
            <span class="nav-text" *ngIf="!sidebarCollapsed">Dashboard</span>
          </a>
          <a
            routerLink="/admin/products"
            routerLinkActive="active"
            class="nav-item"
          >
            <span class="material-icons">inventory_2</span>
            <span class="nav-text" *ngIf="!sidebarCollapsed">Sản phẩm</span>
          </a>
          <a
            routerLink="/admin/categories"
            routerLinkActive="active"
            class="nav-item"
          >
            <span class="material-icons">category</span>
            <span class="nav-text" *ngIf="!sidebarCollapsed">Danh mục</span>
          </a>
          <a
            routerLink="/admin/banners"
            routerLinkActive="active"
            class="nav-item"
          >
            <span class="material-icons">panorama</span>
            <span class="nav-text" *ngIf="!sidebarCollapsed">Banner</span>
          </a>
          <a
            routerLink="/admin/brands"
            routerLinkActive="active"
            class="nav-item"
          >
            <span class="material-icons">workspace_premium</span>
            <span class="nav-text" *ngIf="!sidebarCollapsed">Thương hiệu</span>
          </a>
          <a
            routerLink="/admin/flash-sale"
            routerLinkActive="active"
            class="nav-item"
          >
            <span class="material-icons">flash_on</span>
            <span class="nav-text" *ngIf="!sidebarCollapsed">Flash Sale</span>
          </a>
          <a
            routerLink="/admin/orders"
            routerLinkActive="active"
            class="nav-item"
          >
            <span class="material-icons">receipt_long</span>
            <span class="nav-text" *ngIf="!sidebarCollapsed">Đơn hàng</span>
          </a>

          <div class="nav-divider"></div>

          <a routerLink="/" class="nav-item">
            <span class="material-icons">storefront</span>
            <span class="nav-text" *ngIf="!sidebarCollapsed">Về cửa hàng</span>
          </a>
          <button class="nav-item logout-btn" (click)="logout()">
            <span class="material-icons">logout</span>
            <span class="nav-text" *ngIf="!sidebarCollapsed">Đăng xuất</span>
          </button>
        </nav>
      </aside>

      <!-- Main Content -->
      <main class="main-content">
        <header class="top-bar">
          <div class="top-bar-left">
            <h1 class="page-title">{{ pageTitle }}</h1>
          </div>
          <div class="top-bar-right">
            <span class="admin-name">
              <span class="material-icons">account_circle</span>
              Admin
            </span>
          </div>
        </header>
        <div class="content-area">
          <router-outlet></router-outlet>
        </div>
      </main>
    </div>
  `,
  styleUrls: ['./admin-layout.component.scss'],
})
export class AdminLayoutComponent {
  sidebarCollapsed = false;
  pageTitle = 'Dashboard';

  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  async logout() {
    await this.authService.signOut();
    this.router.navigate(['/auth']);
  }
}
