import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SupabaseService } from '../../../core/services/supabase.service';

const STATUS_MAP: Record<string, string> = {
  pending: 'Chờ xử lý',
  confirmed: 'Đã xác nhận',
  shipping: 'Đang giao hàng',
  completed: 'Hoàn thành',
  cancelled: 'Đã hủy',
};

const STATUS_ICON: Record<string, string> = {
  pending: 'hourglass_top',
  confirmed: 'check_circle',
  shipping: 'local_shipping',
  completed: 'verified',
  cancelled: 'cancel',
};

const STATUS_FLOW = ['pending', 'confirmed', 'shipping', 'completed'];

@Component({
  selector: 'app-admin-orders',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="admin-page">
      <div class="page-header">
        <h2>
          <span
            class="material-icons"
            style="color: #1890ff; vertical-align: middle"
            >receipt_long</span
          >
          Quản lý đơn hàng
        </h2>
        <div class="order-stats">
          <span class="stat-badge pending">
            <span class="material-icons">hourglass_top</span>
            Chờ xử lý: {{ pendingCount() }}
          </span>
          <span class="stat-badge confirmed">
            <span class="material-icons">check_circle</span>
            Đã xác nhận: {{ confirmedCount() }}
          </span>
          <span class="stat-badge shipping">
            <span class="material-icons">local_shipping</span>
            Đang giao: {{ shippingCount() }}
          </span>
          <span class="stat-badge completed">
            <span class="material-icons">verified</span>
            Hoàn thành: {{ completedCount() }}
          </span>
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
          <option value="completed">Hoàn thành</option>
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
                <strong>{{
                  o.order_number || '#' + o.id?.substring(0, 8)
                }}</strong>
              </td>
              <td>
                {{ o.customer_name || o.customer_email || 'Khách vãng lai' }}
              </td>
              <td>
                {{ o.total_amount | currency: 'VND' : 'symbol' : '1.0-0' }}
              </td>
              <td>
                <span class="order-status" [attr.data-status]="o.status">
                  <span class="material-icons">{{
                    getStatusIcon(o.status)
                  }}</span>
                  {{ getStatusLabel(o.status) }}
                </span>
              </td>
              <td>
                {{ o.ordered_at || o.created_at | date: 'dd/MM/yyyy HH:mm' }}
              </td>
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
                  (ngModelChange)="onTableStatusChange(o, $event)"
                >
                  <option value="pending">⏳ Chờ xử lý</option>
                  <option value="confirmed">✅ Xác nhận</option>
                  <option value="shipping">🚚 Đang giao</option>
                  <option value="completed">✔️ Hoàn thành</option>
                  <option value="cancelled">❌ Hủy</option>
                </select>
              </td>
            </tr>
          </tbody>
        </table>
        <p class="empty-text" *ngIf="filteredOrders().length === 0">
          Chưa có đơn hàng nào
        </p>
      </div>

      <!-- Confirmation Dialog (custom, replaces window.confirm) -->
      <div
        class="modal-overlay confirm-overlay"
        *ngIf="confirmData"
        (click)="cancelConfirm()"
      >
        <div class="confirm-dialog" (click)="$event.stopPropagation()">
          <div class="confirm-icon">
            <span
              class="material-icons"
              [attr.data-status]="confirmData.newStatus"
            >
              {{ getStatusIcon(confirmData.newStatus) }}
            </span>
          </div>
          <h3>Xác nhận thay đổi trạng thái</h3>
          <p>
            Đơn hàng <strong>{{ confirmData.orderNumber }}</strong
            ><br />
            <span
              class="order-status inline"
              [attr.data-status]="confirmData.oldStatus"
            >
              {{ getStatusLabel(confirmData.oldStatus) }}
            </span>
            <span class="material-icons arrow-icon">arrow_forward</span>
            <span
              class="order-status inline"
              [attr.data-status]="confirmData.newStatus"
            >
              {{ getStatusLabel(confirmData.newStatus) }}
            </span>
          </p>
          <div class="confirm-actions">
            <button class="btn-cancel" (click)="cancelConfirm()">Hủy</button>
            <button
              class="btn-confirm"
              [attr.data-status]="confirmData.newStatus"
              (click)="executeConfirm()"
              [disabled]="saving()"
            >
              {{ saving() ? 'Đang cập nhật...' : 'Xác nhận' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Order Detail Modal -->
      <div
        class="modal-overlay"
        *ngIf="selectedOrder && !confirmData"
        (click)="selectedOrder = null"
      >
        <div class="modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>
              Chi tiết đơn hàng
              {{
                selectedOrder.order_number ||
                  '#' + selectedOrder.id?.substring(0, 8)
              }}
            </h3>
            <button class="btn-close" (click)="selectedOrder = null">
              <span class="material-icons">close</span>
            </button>
          </div>
          <div class="modal-body">
            <!-- Status Flow -->
            <div
              class="status-flow"
              *ngIf="selectedOrder.status !== 'cancelled'"
            >
              <ng-container *ngFor="let step of statusFlow; let i = index">
                <span
                  class="flow-step"
                  [class.active]="selectedOrder.status === step"
                  [class.done]="getStepIndex(selectedOrder.status) > i"
                  [attr.data-status]="step"
                >
                  <span class="material-icons">{{ getStatusIcon(step) }}</span>
                  {{ getStatusLabel(step) }}
                </span>
                <span class="flow-arrow" *ngIf="i < statusFlow.length - 1">
                  <span class="material-icons">chevron_right</span>
                </span>
              </ng-container>
            </div>
            <div
              class="status-flow"
              *ngIf="selectedOrder.status === 'cancelled'"
            >
              <span class="flow-step active" data-status="cancelled">
                <span class="material-icons">cancel</span>
                Đã hủy
              </span>
            </div>

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
                <span>{{ selectedOrder.notes || '—' }}</span>
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
            <p class="empty-text" *ngIf="orderItems().length === 0">
              Không có sản phẩm
            </p>

            <!-- Status Change in Modal -->
            <div class="status-row">
              <span class="label">Cập nhật trạng thái:</span>
              <select class="status-select-modal" [(ngModel)]="modalNewStatus">
                <option value="pending">⏳ Chờ xử lý</option>
                <option value="confirmed">✅ Đã xác nhận</option>
                <option value="shipping">🚚 Đang giao hàng</option>
                <option value="completed">✔️ Hoàn thành</option>
                <option value="cancelled">❌ Đã hủy</option>
              </select>
              <button
                class="btn-save-status"
                (click)="onModalStatusChange()"
                [disabled]="saving() || modalNewStatus === selectedOrder.status"
              >
                {{ saving() ? 'Đang lưu...' : 'Cập nhật' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Toast notification -->
      <div
        class="toast"
        *ngIf="toastMsg()"
        [class.error]="toastType() === 'error'"
      >
        <span class="material-icons">{{
          toastType() === 'error' ? 'error' : 'check_circle'
        }}</span>
        {{ toastMsg() }}
      </div>
    </div>
  `,
  styleUrls: ['./orders.component.scss'],
})
export class AdminOrdersComponent implements OnInit {
  orders = signal<any[]>([]);
  filteredOrders = signal<any[]>([]);
  orderItems = signal<any[]>([]);
  saving = signal(false);

  pendingCount = signal(0);
  confirmedCount = signal(0);
  shippingCount = signal(0);
  completedCount = signal(0);

  toastMsg = signal('');
  toastType = signal<'success' | 'error'>('success');

  selectedOrder: any = null;
  modalNewStatus = '';
  filterStatus = '';
  searchTerm = '';
  confirmData: {
    orderId: string;
    orderNumber: string;
    oldStatus: string;
    newStatus: string;
    fromModal: boolean;
  } | null = null;

  statusFlow = STATUS_FLOW;

  constructor(private supabase: SupabaseService) {}

  async ngOnInit() {
    await this.loadOrders();
  }

  async loadOrders() {
    const { data } = await this.supabase.client
      .from('orders')
      .select('*')
      .order('ordered_at', { ascending: false });

    const d = data || [];
    this.orders.set(d);
    this.pendingCount.set(d.filter((o: any) => o.status === 'pending').length);
    this.confirmedCount.set(
      d.filter((o: any) => o.status === 'confirmed').length,
    );
    this.shippingCount.set(
      d.filter((o: any) => o.status === 'shipping').length,
    );
    this.completedCount.set(
      d.filter((o: any) => o.status === 'completed').length,
    );
    this.filterOrders();
  }

  filterOrders() {
    let result = this.orders();
    if (this.filterStatus)
      result = result.filter((o) => o.status === this.filterStatus);
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      result = result.filter(
        (o) =>
          o.order_number?.toLowerCase().includes(term) ||
          o.id?.includes(term) ||
          o.customer_name?.toLowerCase().includes(term) ||
          o.customer_email?.toLowerCase().includes(term),
      );
    }
    this.filteredOrders.set(result);
  }

  getStatusLabel(status: string): string {
    return STATUS_MAP[status] || status;
  }

  getStatusIcon(status: string): string {
    return STATUS_ICON[status] || 'help';
  }

  getStepIndex(status: string): number {
    return STATUS_FLOW.indexOf(status);
  }

  async viewOrder(order: any) {
    this.selectedOrder = order;
    this.modalNewStatus = order.status;
    const { data } = await this.supabase.client
      .from('order_items')
      .select('*, products(name)')
      .eq('order_id', order.id);

    this.orderItems.set(
      (data || []).map((item: any) => ({
        ...item,
        product_name:
          item.products?.name || item.product_name || item.product_id,
      })),
    );
  }

  // --- Status change from table dropdown ---
  onTableStatusChange(order: any, newStatus: string) {
    if (newStatus === order.status) return;
    this.confirmData = {
      orderId: order.id,
      orderNumber: order.order_number || '#' + order.id?.substring(0, 8),
      oldStatus: order.status,
      newStatus,
      fromModal: false,
    };
  }

  // --- Status change from detail modal ---
  onModalStatusChange() {
    if (
      !this.selectedOrder ||
      this.modalNewStatus === this.selectedOrder.status
    )
      return;
    this.confirmData = {
      orderId: this.selectedOrder.id,
      orderNumber:
        this.selectedOrder.order_number ||
        '#' + this.selectedOrder.id?.substring(0, 8),
      oldStatus: this.selectedOrder.status,
      newStatus: this.modalNewStatus,
      fromModal: true,
    };
  }

  cancelConfirm() {
    this.confirmData = null;
    this.loadOrders(); // Reset the dropdown state
  }

  async executeConfirm() {
    if (!this.confirmData) return;
    const { orderId, newStatus, fromModal } = this.confirmData;

    this.saving.set(true);
    try {
      const { data, error } = await this.supabase.client.rpc(
        'fn_update_order_status',
        {
          p_order_id: orderId,
          p_new_status: newStatus,
        },
      );

      console.log('RPC response:', { data, error });

      if (error) throw error;
      if (data && !data.success) throw new Error(data.error || 'Unknown error');

      // Update selectedOrder if from modal
      if (fromModal && this.selectedOrder) {
        this.selectedOrder = { ...this.selectedOrder, status: newStatus };
        this.modalNewStatus = newStatus;
      }

      this.confirmData = null;
      await this.loadOrders();
      this.showToast('Cập nhật trạng thái thành công!', 'success');
    } catch (err: any) {
      console.error('Status update error:', err);
      this.showToast('Lỗi: ' + (err?.message || 'Không thể cập nhật'), 'error');
      this.confirmData = null;
      await this.loadOrders();
    } finally {
      this.saving.set(false);
    }
  }

  private showToast(msg: string, type: 'success' | 'error') {
    this.toastMsg.set(msg);
    this.toastType.set(type);
    setTimeout(() => this.toastMsg.set(''), 3000);
  }
}
