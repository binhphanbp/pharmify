import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SupabaseService } from '../../../core/services/supabase.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dashboard">
      <!-- Stats Cards -->
      <div class="stats-grid">
        <div class="stat-card blue">
          <div class="stat-icon">
            <span class="material-icons">inventory_2</span>
          </div>
          <div class="stat-info">
            <span class="stat-value">{{ stats().products }}</span>
            <span class="stat-label">Sản phẩm</span>
          </div>
        </div>
        <div class="stat-card green">
          <div class="stat-icon">
            <span class="material-icons">category</span>
          </div>
          <div class="stat-info">
            <span class="stat-value">{{ stats().categories }}</span>
            <span class="stat-label">Danh mục</span>
          </div>
        </div>
        <div class="stat-card orange">
          <div class="stat-icon">
            <span class="material-icons">receipt_long</span>
          </div>
          <div class="stat-info">
            <span class="stat-value">{{ stats().orders }}</span>
            <span class="stat-label">Đơn hàng</span>
          </div>
        </div>
        <div class="stat-card purple">
          <div class="stat-icon">
            <span class="material-icons">panorama</span>
          </div>
          <div class="stat-info">
            <span class="stat-value">{{ stats().banners }}</span>
            <span class="stat-label">Banners</span>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="section-card">
        <h2 class="section-title">Thao tác nhanh</h2>
        <div class="action-grid">
          <button class="action-btn" (click)="navigate('/admin/products')">
            <span class="material-icons">add_circle</span>
            Thêm sản phẩm
          </button>
          <button class="action-btn" (click)="navigate('/admin/banners')">
            <span class="material-icons">panorama</span>
            Quản lý Banner
          </button>
          <button class="action-btn" (click)="navigate('/admin/brands')">
            <span class="material-icons">workspace_premium</span>
            Quản lý thương hiệu
          </button>
          <button class="action-btn" (click)="navigate('/admin/orders')">
            <span class="material-icons">list_alt</span>
            Xem đơn hàng
          </button>
        </div>
      </div>

      <!-- Recent Products -->
      <div class="section-card">
        <h2 class="section-title">Sản phẩm gần đây</h2>
        <table class="data-table" *ngIf="recentProducts().length > 0">
          <thead>
            <tr>
              <th>Ảnh</th>
              <th>Tên sản phẩm</th>
              <th>Danh mục</th>
              <th>Giá</th>
              <th>Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let p of recentProducts()">
              <td>
                <img
                  [src]="
                    p.image_url ||
                    'https://placehold.co/40x40/f0f0f0/999?text=?'
                  "
                  class="thumb"
                  [alt]="p.name"
                />
              </td>
              <td>
                <strong>{{ p.name }}</strong>
              </td>
              <td>{{ p.category_name }}</td>
              <td>{{ p.price | currency: 'VND' : 'symbol' : '1.0-0' }}</td>
              <td>
                <span
                  class="badge"
                  [class.active]="p.is_active"
                  [class.inactive]="!p.is_active"
                >
                  {{ p.is_active ? 'Đang bán' : 'Tắt' }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
        <p class="empty-text" *ngIf="recentProducts().length === 0">
          Chưa có sản phẩm nào
        </p>
      </div>
    </div>
  `,
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  stats = signal({ products: 0, categories: 0, orders: 0, banners: 0 });
  recentProducts = signal<any[]>([]);

  constructor(
    private supabaseService: SupabaseService,
    private router: Router,
  ) {}

  async ngOnInit() {
    await this.loadStats();
    await this.loadRecentProducts();
  }

  async loadStats() {
    const client = this.supabaseService.client;
    const [products, categories, orders, banners] = await Promise.all([
      client.from('products').select('id', { count: 'exact', head: true }),
      client.from('categories').select('id', { count: 'exact', head: true }),
      client.from('orders').select('id', { count: 'exact', head: true }),
      client.from('banners').select('id', { count: 'exact', head: true }),
    ]);
    this.stats.set({
      products: products.count || 0,
      categories: categories.count || 0,
      orders: orders.count || 0,
      banners: banners.count || 0,
    });
  }

  async loadRecentProducts() {
    const { data } = await this.supabaseService.client
      .from('v_product_catalog')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);
    this.recentProducts.set(data || []);
  }

  navigate(path: string) {
    this.router.navigate([path]);
  }
}
