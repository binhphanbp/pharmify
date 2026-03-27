import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SupabaseService } from '../../../core/services/supabase.service';

@Component({
  selector: 'app-admin-orders',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="admin-page">
      <div class="page-header">
        <h2>Quản lý đơn hàng</h2>
        <div class="order-stats">
          <span class="stat-badge pending"
            >Chờ xử lý: {{ pendingCount() }}</span
          >
          <span class="stat-badge confirmed"
            >Đã xác nhận: {{ confirmedCount() }}</span
          >
        </div>
      </div>

      <div class="filter-bar">
        <select
          [(ngModel)]="filterStatus"
          (change)="filterOrders()"
          class="filter-select"
        >
          <option value="">Tất cả trạng thái</option>
          <option value="pending">Chờ xử lý</option>
          <option value="confirmed">Đã xác nhận</option>
          <option value="shipping">Đang giao</option>
          <option value="delivered">Đã giao</option>
          <option value="cancelled">Đã hủy</option>
        </select>
        <input
          type="text"
          [(ngModel)]="searchTerm"
          (input)="filterOrders()"
          placeholder="Tìm theo mã đơn, tên khách..."
          class="search-input"
        />
      </div>

      <div class="table-card">
        <table class="data-table">
          <thead>
            <tr>
              <th>Mã đơn</th>
              <th>Khách hàng</th>
              <th>Tổng tiền</th>
              <th>Trạng thái</th>
              <th>Ngày đặt</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let o of filteredOrders()">
              <td>
                <strong>#{{ o.id?.substring(0, 8) }}</strong>
              </td>
              <td>
                {{ o.customer_name || o.customer_email || 'Khách vãng lai' }}
              </td>
              <td>
                {{ o.total_amount | currency: 'VND' : 'symbol' : '1.0-0' }}
              </td>
              <td>
                <span class="order-status" [attr.data-status]="o.status">{{
                  getStatusLabel(o.status)
                }}</span>
              </td>
              <td>{{ o.created_at | date: 'dd/MM/yyyy HH:mm' }}</td>
              <td class="actions">
                <button
                  class="btn-icon edit"
                  (click)="viewOrder(o)"
                  title="Xem chi tiết"
                >
                  <span class="material-icons">visibility</span>
                </button>
                <select
                  class="status-select"
                  [ngModel]="o.status"
                  (ngModelChange)="updateStatus(o.id, $event)"
                >
                  <option value="pending">Chờ xử lý</option>
                  <option value="confirmed">Xác nhận</option>
                  <option value="shipping">Đang giao</option>
                  <option value="delivered">Đã giao</option>
                  <option value="cancelled">Hủy</option>
                </select>
              </td>
            </tr>
          </tbody>
        </table>
        <p class="empty-text" *ngIf="filteredOrders().length === 0">
          Chưa có đơn hàng nào
        </p>
      </div>

      <!-- Order Detail Modal -->
      <div
        class="modal-overlay"
        *ngIf="selectedOrder"
        (click)="selectedOrder = null"
      >
        <div class="modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>Chi tiết đơn hàng #{{ selectedOrder.id?.substring(0, 8) }}</h3>
            <button class="btn-close" (click)="selectedOrder = null">
              <span class="material-icons">close</span>
            </button>
          </div>
          <div class="modal-body">
            <div class="order-detail-info">
              <div class="detail-row">
                <span class="label">Khách hàng:</span>
                <span>{{ selectedOrder.customer_name || 'N/A' }}</span>
              </div>
              <div class="detail-row">
                <span class="label">Email:</span>
                <span>{{ selectedOrder.customer_email || 'N/A' }}</span>
              </div>
              <div class="detail-row">
                <span class="label">SĐT:</span>
                <span>{{ selectedOrder.customer_phone || 'N/A' }}</span>
              </div>
              <div class="detail-row">
                <span class="label">Địa chỉ:</span>
                <span>{{ selectedOrder.shipping_address || 'N/A' }}</span>
              </div>
              <div class="detail-row">
                <span class="label">Tổng tiền:</span>
                <strong>{{
                  selectedOrder.total_amount
                    | currency: 'VND' : 'symbol' : '1.0-0'
                }}</strong>
              </div>
              <div class="detail-row">
                <span class="label">Ghi chú:</span>
                <span>{{ selectedOrder.note || '—' }}</span>
              </div>
            </div>

            <h4 style="margin: 20px 0 12px">Sản phẩm trong đơn</h4>
            <table class="data-table" *ngIf="orderItems().length > 0">
              <thead>
                <tr>
                  <th>Sản phẩm</th>
                  <th>SL</th>
                  <th>Đơn giá</th>
                  <th>Thành tiền</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let item of orderItems()">
                  <td>{{ item.product_name || item.product_id }}</td>
                  <td>{{ item.quantity }}</td>
                  <td>
                    {{ item.unit_price | currency: 'VND' : 'symbol' : '1.0-0' }}
                  </td>
                  <td>
                    {{
                      item.quantity * item.unit_price
                        | currency: 'VND' : 'symbol' : '1.0-0'
                    }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./orders.component.scss'],
})
export class AdminOrdersComponent implements OnInit {
  orders = signal<any[]>([]);
  filteredOrders = signal<any[]>([]);
  orderItems = signal<any[]>([]);
  pendingCount = signal(0);
  confirmedCount = signal(0);
  selectedOrder: any = null;
  filterStatus = '';
  searchTerm = '';

  constructor(private supabase: SupabaseService) {}

  async ngOnInit() {
    await this.loadOrders();
  }

  async loadOrders() {
    const { data } = await this.supabase.client
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });
    this.orders.set(data || []);
    this.filteredOrders.set(data || []);
    this.pendingCount.set(
      (data || []).filter((o: any) => o.status === 'pending').length,
    );
    this.confirmedCount.set(
      (data || []).filter((o: any) => o.status === 'confirmed').length,
    );
  }

  filterOrders() {
    let result = this.orders();
    if (this.filterStatus)
      result = result.filter((o) => o.status === this.filterStatus);
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      result = result.filter(
        (o) =>
          o.id?.includes(term) ||
          o.customer_name?.toLowerCase().includes(term) ||
          o.customer_email?.toLowerCase().includes(term),
      );
    }
    this.filteredOrders.set(result);
  }

  getStatusLabel(status: string): string {
    const map: Record<string, string> = {
      pending: 'Chờ xử lý',
      confirmed: 'Đã xác nhận',
      shipping: 'Đang giao',
      delivered: 'Đã giao',
      cancelled: 'Đã hủy',
    };
    return map[status] || status;
  }

  async viewOrder(order: any) {
    this.selectedOrder = order;
    const { data } = await this.supabase.client
      .from('order_items')
      .select('*')
      .eq('order_id', order.id);
    this.orderItems.set(data || []);
  }

  async updateStatus(orderId: string, newStatus: string) {
    await this.supabase.client
      .from('orders')
      .update({ status: newStatus })
      .eq('id', orderId);
    await this.loadOrders();
  }
}
