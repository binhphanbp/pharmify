import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SupabaseService } from '../../../core/services/supabase.service';

interface Campaign {
  id: string;
  name: string;
  banner_image_url: string;
  is_active: boolean;
  created_at: string;
}

interface TimeSlot {
  id: string;
  campaign_id: string;
  start_time: string;
  end_time: string;
  label: string;
  sort_order: number;
  campaign_name?: string;
}

interface FlashItem {
  id: string;
  time_slot_id: string;
  product_id: string;
  product_unit_id: string;
  flash_price: number;
  original_price: number;
  stock_limit: number;
  sold_count: number;
  sort_order: number;
  product_name?: string;
  unit_name?: string;
  slot_label?: string;
}

interface ProductOption {
  id: string;
  name: string;
  units: { id: string; unit_name: string; price: number }[];
}

@Component({
  selector: 'app-admin-flash-sale',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="admin-page">
      <div class="page-header">
        <h2>
          <span
            class="material-icons"
            style="color: #ff6b35; vertical-align: middle"
            >flash_on</span
          >
          Quản lý Flash Sale
        </h2>
      </div>

      <!-- Tabs -->
      <div class="tabs">
        <button
          class="tab"
          [class.active]="activeTab === 'campaigns'"
          (click)="activeTab = 'campaigns'"
        >
          <span class="material-icons">campaign</span>
          Chiến dịch ({{ campaigns().length }})
        </button>
        <button
          class="tab"
          [class.active]="activeTab === 'slots'"
          (click)="activeTab = 'slots'"
        >
          <span class="material-icons">schedule</span>
          Khung giờ ({{ timeSlots().length }})
        </button>
        <button
          class="tab"
          [class.active]="activeTab === 'items'"
          (click)="activeTab = 'items'"
        >
          <span class="material-icons">inventory_2</span>
          Sản phẩm ({{ flashItems().length }})
        </button>
      </div>

      <!-- ===== TAB 1: CAMPAIGNS ===== -->
      <div *ngIf="activeTab === 'campaigns'">
        <div class="section-header">
          <h3>Danh sách chiến dịch</h3>
          <button class="btn-primary" (click)="openCampaignForm()">
            <span class="material-icons">add</span> Thêm chiến dịch
          </button>
        </div>

        <div class="data-table">
          <table>
            <thead>
              <tr>
                <th>Tên chiến dịch</th>
                <th>Trạng thái</th>
                <th>Ngày tạo</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let c of campaigns()">
                <td>
                  <strong>{{ c.name }}</strong>
                </td>
                <td>
                  <span
                    class="badge"
                    [class.active]="c.is_active"
                    [class.inactive]="!c.is_active"
                  >
                    {{ c.is_active ? '🟢 Đang chạy' : '⏸ Đã tắt' }}
                  </span>
                </td>
                <td>{{ c.created_at | date: 'dd/MM/yyyy HH:mm' }}</td>
                <td class="actions-cell">
                  <button
                    class="btn-icon edit"
                    (click)="editCampaign(c)"
                    title="Sửa"
                  >
                    <span class="material-icons">edit</span>
                  </button>
                  <button
                    class="btn-icon"
                    [class.active-toggle]="c.is_active"
                    (click)="toggleCampaign(c)"
                    title="Bật/Tắt"
                  >
                    <span class="material-icons">{{
                      c.is_active ? 'pause' : 'play_arrow'
                    }}</span>
                  </button>
                  <button
                    class="btn-icon danger"
                    (click)="deleteCampaign(c.id)"
                    title="Xóa"
                  >
                    <span class="material-icons">delete</span>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
          <p class="empty-text" *ngIf="campaigns().length === 0">
            Chưa có chiến dịch Flash Sale nào
          </p>
        </div>
      </div>

      <!-- ===== TAB 2: TIME SLOTS ===== -->
      <div *ngIf="activeTab === 'slots'">
        <div class="section-header">
          <h3>Danh sách khung giờ</h3>
          <button
            class="btn-primary"
            (click)="openSlotForm()"
            [disabled]="campaigns().length === 0"
          >
            <span class="material-icons">add</span> Thêm khung giờ
          </button>
        </div>

        <div class="data-table">
          <table>
            <thead>
              <tr>
                <th>Chiến dịch</th>
                <th>Nhãn</th>
                <th>Bắt đầu</th>
                <th>Kết thúc</th>
                <th>Trạng thái</th>
                <th>Thứ tự</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let s of timeSlots()">
                <td>{{ s.campaign_name }}</td>
                <td>
                  <strong>{{ s.label }}</strong>
                </td>
                <td>{{ s.start_time | date: 'dd/MM/yyyy HH:mm' }}</td>
                <td>{{ s.end_time | date: 'dd/MM/yyyy HH:mm' }}</td>
                <td>
                  <span class="badge" [ngClass]="getSlotStatusClass(s)">
                    {{ getSlotStatusText(s) }}
                  </span>
                </td>
                <td>{{ s.sort_order }}</td>
                <td class="actions-cell">
                  <button class="btn-icon edit" (click)="editSlot(s)">
                    <span class="material-icons">edit</span>
                  </button>
                  <button class="btn-icon danger" (click)="deleteSlot(s.id)">
                    <span class="material-icons">delete</span>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
          <p class="empty-text" *ngIf="timeSlots().length === 0">
            Chưa có khung giờ nào
          </p>
        </div>
      </div>

      <!-- ===== TAB 3: FLASH ITEMS ===== -->
      <div *ngIf="activeTab === 'items'">
        <div class="section-header">
          <h3>Sản phẩm Flash Sale</h3>
          <button
            class="btn-primary"
            (click)="openItemForm()"
            [disabled]="timeSlots().length === 0"
          >
            <span class="material-icons">add</span> Thêm sản phẩm
          </button>
        </div>

        <!-- Filter by slot -->
        <div class="filter-row" *ngIf="timeSlots().length > 0">
          <label>Lọc theo khung giờ:</label>
          <select [(ngModel)]="filterSlotId" (ngModelChange)="loadItems()">
            <option value="">Tất cả</option>
            <option *ngFor="let s of timeSlots()" [value]="s.id">
              {{ s.campaign_name }} — {{ s.label }}
            </option>
          </select>
        </div>

        <div class="data-table">
          <table>
            <thead>
              <tr>
                <th>Sản phẩm</th>
                <th>Đơn vị</th>
                <th>Giá Flash</th>
                <th>Giá gốc</th>
                <th>Giảm %</th>
                <th>Tồn kho</th>
                <th>Đã bán</th>
                <th>Tiến độ</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let item of flashItems()">
                <td>
                  <strong>{{ item.product_name }}</strong>
                </td>
                <td>{{ item.unit_name }}</td>
                <td class="price-flash">
                  {{ item.flash_price | number: '1.0-0' }}đ
                </td>
                <td class="price-original">
                  {{ item.original_price | number: '1.0-0' }}đ
                </td>
                <td>
                  <span class="discount-badge"
                    >-{{ getDiscountPercent(item) }}%</span
                  >
                </td>
                <td>{{ item.stock_limit }}</td>
                <td>{{ item.sold_count }}</td>
                <td>
                  <div class="progress-bar-wrap">
                    <div class="progress-bar">
                      <div
                        class="progress-fill"
                        [style.width.%]="getSoldPercent(item)"
                      ></div>
                    </div>
                    <span class="progress-text"
                      >{{ getSoldPercent(item) }}%</span
                    >
                  </div>
                </td>
                <td class="actions-cell">
                  <button class="btn-icon edit" (click)="editItem(item)">
                    <span class="material-icons">edit</span>
                  </button>
                  <button class="btn-icon danger" (click)="deleteItem(item.id)">
                    <span class="material-icons">delete</span>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
          <p class="empty-text" *ngIf="flashItems().length === 0">
            Chưa có sản phẩm trong Flash Sale
          </p>
        </div>
      </div>

      <!-- ===== CAMPAIGN FORM MODAL ===== -->
      <div
        class="modal-overlay"
        *ngIf="showCampaignForm"
        (click)="showCampaignForm = false"
      >
        <div class="modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>
              {{ campaignForm.id ? 'Sửa chiến dịch' : 'Thêm chiến dịch mới' }}
            </h3>
            <button class="btn-close" (click)="showCampaignForm = false">
              <span class="material-icons">close</span>
            </button>
          </div>
          <div class="modal-body">
            <div class="form-group">
              <label>Tên chiến dịch *</label>
              <input
                type="text"
                [(ngModel)]="campaignForm.name"
                placeholder="VD: Flash Sale Tháng 4"
              />
            </div>
            <div class="form-group">
              <label>Banner URL</label>
              <input
                type="url"
                [(ngModel)]="campaignForm.banner_image_url"
                placeholder="https://..."
              />
              <img
                *ngIf="campaignForm.banner_image_url"
                [src]="campaignForm.banner_image_url"
                class="preview-img"
              />
            </div>
            <div class="form-group">
              <label
                ><input type="checkbox" [(ngModel)]="campaignForm.is_active" />
                Đang hoạt động</label
              >
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn-cancel" (click)="showCampaignForm = false">
              Hủy
            </button>
            <button
              class="btn-primary"
              (click)="saveCampaign()"
              [disabled]="saving()"
            >
              {{
                saving()
                  ? 'Đang lưu...'
                  : campaignForm.id
                    ? 'Cập nhật'
                    : 'Tạo mới'
              }}
            </button>
          </div>
        </div>
      </div>

      <!-- ===== TIME SLOT FORM MODAL ===== -->
      <div
        class="modal-overlay"
        *ngIf="showSlotForm"
        (click)="showSlotForm = false"
      >
        <div class="modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>{{ slotForm.id ? 'Sửa khung giờ' : 'Thêm khung giờ mới' }}</h3>
            <button class="btn-close" (click)="showSlotForm = false">
              <span class="material-icons">close</span>
            </button>
          </div>
          <div class="modal-body">
            <div class="form-group">
              <label>Chiến dịch *</label>
              <select [(ngModel)]="slotForm.campaign_id">
                <option value="">-- Chọn chiến dịch --</option>
                <option *ngFor="let c of campaigns()" [value]="c.id">
                  {{ c.name }}
                </option>
              </select>
            </div>
            <div class="form-group">
              <label>Nhãn hiển thị</label>
              <input
                type="text"
                [(ngModel)]="slotForm.label"
                placeholder="VD: 29/03"
              />
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Bắt đầu *</label>
                <input
                  type="datetime-local"
                  [(ngModel)]="slotForm.start_time"
                />
              </div>
              <div class="form-group">
                <label>Kết thúc *</label>
                <input type="datetime-local" [(ngModel)]="slotForm.end_time" />
              </div>
            </div>
            <div class="form-group">
              <label>Thứ tự hiển thị</label>
              <input type="number" [(ngModel)]="slotForm.sort_order" min="0" />
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn-cancel" (click)="showSlotForm = false">
              Hủy
            </button>
            <button
              class="btn-primary"
              (click)="saveSlot()"
              [disabled]="saving()"
            >
              {{
                saving() ? 'Đang lưu...' : slotForm.id ? 'Cập nhật' : 'Tạo mới'
              }}
            </button>
          </div>
        </div>
      </div>

      <!-- ===== FLASH ITEM FORM MODAL ===== -->
      <div
        class="modal-overlay"
        *ngIf="showItemForm"
        (click)="showItemForm = false"
      >
        <div class="modal modal-wide" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>
              {{
                itemForm.id
                  ? 'Sửa sản phẩm Flash Sale'
                  : 'Thêm sản phẩm vào Flash Sale'
              }}
            </h3>
            <button class="btn-close" (click)="showItemForm = false">
              <span class="material-icons">close</span>
            </button>
          </div>
          <div class="modal-body">
            <div class="form-group">
              <label>Khung giờ *</label>
              <select [(ngModel)]="itemForm.time_slot_id">
                <option value="">-- Chọn khung giờ --</option>
                <option *ngFor="let s of timeSlots()" [value]="s.id">
                  {{ s.campaign_name }} — {{ s.label }} ({{
                    s.start_time | date: 'dd/MM HH:mm'
                  }}
                  → {{ s.end_time | date: 'dd/MM HH:mm' }})
                </option>
              </select>
            </div>
            <div class="form-group">
              <label>Sản phẩm *</label>
              <select
                [(ngModel)]="itemForm.product_id"
                (ngModelChange)="onProductSelect()"
              >
                <option value="">-- Chọn sản phẩm --</option>
                <option *ngFor="let p of productOptions()" [value]="p.id">
                  {{ p.name }}
                </option>
              </select>
            </div>
            <div class="form-group" *ngIf="selectedProductUnits().length > 0">
              <label>Đơn vị tính *</label>
              <select
                [(ngModel)]="itemForm.product_unit_id"
                (ngModelChange)="onUnitSelect()"
              >
                <option value="">-- Chọn đơn vị --</option>
                <option *ngFor="let u of selectedProductUnits()" [value]="u.id">
                  {{ u.unit_name }} (giá gốc: {{ u.price | number: '1.0-0' }}đ)
                </option>
              </select>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Giá gốc *</label>
                <input
                  type="number"
                  [(ngModel)]="itemForm.original_price"
                  min="0"
                />
              </div>
              <div class="form-group">
                <label>Giá Flash Sale *</label>
                <input
                  type="number"
                  [(ngModel)]="itemForm.flash_price"
                  min="0"
                />
              </div>
            </div>
            <div
              class="discount-preview"
              *ngIf="itemForm.original_price > 0 && itemForm.flash_price > 0"
            >
              Giảm {{ getFormDiscountPercent() }}% — Tiết kiệm
              {{
                itemForm.original_price - itemForm.flash_price
                  | number: '1.0-0'
              }}đ
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Số lượng tồn kho *</label>
                <input
                  type="number"
                  [(ngModel)]="itemForm.stock_limit"
                  min="1"
                />
              </div>
              <div class="form-group">
                <label>Đã bán</label>
                <input
                  type="number"
                  [(ngModel)]="itemForm.sold_count"
                  min="0"
                />
              </div>
            </div>
            <div class="form-group">
              <label>Thứ tự hiển thị</label>
              <input type="number" [(ngModel)]="itemForm.sort_order" min="0" />
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn-cancel" (click)="showItemForm = false">
              Hủy
            </button>
            <button
              class="btn-primary"
              (click)="saveItem()"
              [disabled]="saving()"
            >
              {{
                saving() ? 'Đang lưu...' : itemForm.id ? 'Cập nhật' : 'Thêm mới'
              }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./flash-sale.component.scss'],
})
export class AdminFlashSaleComponent implements OnInit {
  activeTab: 'campaigns' | 'slots' | 'items' = 'campaigns';
  saving = signal(false);

  // Data
  campaigns = signal<Campaign[]>([]);
  timeSlots = signal<TimeSlot[]>([]);
  flashItems = signal<FlashItem[]>([]);
  productOptions = signal<ProductOption[]>([]);

  // Filters
  filterSlotId = '';

  // Forms
  showCampaignForm = false;
  showSlotForm = false;
  showItemForm = false;

  campaignForm: any = {};
  slotForm: any = {};
  itemForm: any = {};

  // Signal for selected product ID — drives reactive unit list
  selectedProductId = signal<string>('');

  // Computed: product units for selected product
  selectedProductUnits = computed(() => {
    const prodId = this.selectedProductId();
    if (!prodId) return [];
    const prod = this.productOptions().find((p) => p.id === prodId);
    return prod?.units || [];
  });

  constructor(private supabase: SupabaseService) {}

  async ngOnInit() {
    await this.loadAll();
    await this.loadProductOptions();
  }

  // ====== LOAD DATA ======
  async loadAll() {
    await Promise.all([
      this.loadCampaigns(),
      this.loadSlots(),
      this.loadItems(),
    ]);
  }

  async loadCampaigns() {
    const { data } = await this.supabase.client
      .from('flash_sale_campaigns')
      .select('*')
      .order('created_at', { ascending: false });
    this.campaigns.set(data || []);
  }

  async loadSlots() {
    const { data } = await this.supabase.client
      .from('flash_sale_time_slots')
      .select('*, flash_sale_campaigns(name)')
      .order('sort_order');
    this.timeSlots.set(
      (data || []).map((s: any) => ({
        ...s,
        campaign_name: s.flash_sale_campaigns?.name || '—',
      })),
    );
  }

  async loadItems() {
    let query = this.supabase.client
      .from('flash_sale_items')
      .select(
        '*, products(name), product_units(unit_name), flash_sale_time_slots(label, flash_sale_campaigns(name))',
      )
      .order('sort_order');

    if (this.filterSlotId) {
      query = query.eq('time_slot_id', this.filterSlotId);
    }

    const { data } = await query;
    this.flashItems.set(
      (data || []).map((i: any) => ({
        ...i,
        product_name: i.products?.name || '—',
        unit_name: i.product_units?.unit_name || '—',
        slot_label: `${i.flash_sale_time_slots?.flash_sale_campaigns?.name || ''} — ${i.flash_sale_time_slots?.label || ''}`,
      })),
    );
  }

  async loadProductOptions() {
    const { data } = await this.supabase.client
      .from('products')
      .select('id, name, product_units(id, unit_name, product_prices(price))')
      .eq('is_active', true)
      .order('name');

    this.productOptions.set(
      (data || []).map((p: any) => ({
        id: p.id,
        name: p.name,
        units: (p.product_units || []).map((u: any) => ({
          id: u.id,
          unit_name: u.unit_name,
          price: u.product_prices?.[0]?.price || 0,
        })),
      })),
    );
  }

  // ====== CAMPAIGNS CRUD ======
  openCampaignForm() {
    this.campaignForm = {
      id: '',
      name: '',
      banner_image_url: '',
      is_active: true,
    };
    this.showCampaignForm = true;
  }

  editCampaign(c: Campaign) {
    this.campaignForm = { ...c };
    this.showCampaignForm = true;
  }

  async saveCampaign() {
    this.saving.set(true);
    try {
      const payload = {
        name: this.campaignForm.name,
        banner_image_url: this.campaignForm.banner_image_url || null,
        is_active: this.campaignForm.is_active,
      };
      if (this.campaignForm.id) {
        await this.supabase.client
          .from('flash_sale_campaigns')
          .update(payload)
          .eq('id', this.campaignForm.id);
      } else {
        await this.supabase.client.from('flash_sale_campaigns').insert(payload);
      }
      this.showCampaignForm = false;
      await this.loadCampaigns();
    } catch (err) {
      alert('Lỗi khi lưu chiến dịch');
    } finally {
      this.saving.set(false);
    }
  }

  async toggleCampaign(c: Campaign) {
    await this.supabase.client
      .from('flash_sale_campaigns')
      .update({ is_active: !c.is_active })
      .eq('id', c.id);
    await this.loadCampaigns();
  }

  async deleteCampaign(id: string) {
    if (
      !confirm(
        'Xóa chiến dịch sẽ xóa tất cả khung giờ và sản phẩm liên quan. Tiếp tục?',
      )
    )
      return;
    await this.supabase.client
      .from('flash_sale_campaigns')
      .delete()
      .eq('id', id);
    await this.loadAll();
  }

  // ====== TIME SLOTS CRUD ======
  openSlotForm() {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    this.slotForm = {
      id: '',
      campaign_id: this.campaigns()[0]?.id || '',
      label: '',
      start_time: this.toLocalDatetime(now),
      end_time: this.toLocalDatetime(tomorrow),
      sort_order: this.timeSlots().length + 1,
    };
    this.showSlotForm = true;
  }

  editSlot(s: TimeSlot) {
    this.slotForm = {
      ...s,
      start_time: this.toLocalDatetime(new Date(s.start_time)),
      end_time: this.toLocalDatetime(new Date(s.end_time)),
    };
    this.showSlotForm = true;
  }

  async saveSlot() {
    this.saving.set(true);
    try {
      const payload = {
        campaign_id: this.slotForm.campaign_id,
        start_time: new Date(this.slotForm.start_time).toISOString(),
        end_time: new Date(this.slotForm.end_time).toISOString(),
        label: this.slotForm.label,
        sort_order: this.slotForm.sort_order,
      };
      if (this.slotForm.id) {
        await this.supabase.client
          .from('flash_sale_time_slots')
          .update(payload)
          .eq('id', this.slotForm.id);
      } else {
        await this.supabase.client
          .from('flash_sale_time_slots')
          .insert(payload);
      }
      this.showSlotForm = false;
      await this.loadSlots();
    } catch (err) {
      alert('Lỗi khi lưu khung giờ');
    } finally {
      this.saving.set(false);
    }
  }

  async deleteSlot(id: string) {
    if (
      !confirm(
        'Xóa khung giờ sẽ xóa tất cả sản phẩm trong khung giờ đó. Tiếp tục?',
      )
    )
      return;
    await this.supabase.client
      .from('flash_sale_time_slots')
      .delete()
      .eq('id', id);
    await Promise.all([this.loadSlots(), this.loadItems()]);
  }

  // ====== FLASH ITEMS CRUD ======
  openItemForm() {
    this.itemForm = {
      id: '',
      time_slot_id: this.timeSlots()[0]?.id || '',
      product_id: '',
      product_unit_id: '',
      flash_price: 0,
      original_price: 0,
      stock_limit: 50,
      sold_count: 0,
      sort_order: this.flashItems().length + 1,
    };
    this.showItemForm = true;
  }

  editItem(item: FlashItem) {
    this.itemForm = { ...item };
    this.selectedProductId.set(item.product_id);
    this.showItemForm = true;
  }

  onProductSelect() {
    this.selectedProductId.set(this.itemForm.product_id);
    this.itemForm.product_unit_id = '';
    this.itemForm.original_price = 0;
    this.itemForm.flash_price = 0;
  }

  onUnitSelect() {
    const unit = this.selectedProductUnits().find(
      (u: any) => u.id === this.itemForm.product_unit_id,
    );
    if (unit) {
      this.itemForm.original_price = unit.price;
      this.itemForm.flash_price = Math.round(unit.price * 0.8); // default 20% off
    }
  }

  async saveItem() {
    this.saving.set(true);
    try {
      const payload = {
        time_slot_id: this.itemForm.time_slot_id,
        product_id: this.itemForm.product_id,
        product_unit_id: this.itemForm.product_unit_id,
        flash_price: this.itemForm.flash_price,
        original_price: this.itemForm.original_price,
        stock_limit: this.itemForm.stock_limit,
        sold_count: this.itemForm.sold_count,
        sort_order: this.itemForm.sort_order,
      };
      if (this.itemForm.id) {
        await this.supabase.client
          .from('flash_sale_items')
          .update(payload)
          .eq('id', this.itemForm.id);
      } else {
        await this.supabase.client.from('flash_sale_items').insert(payload);
      }
      this.showItemForm = false;
      await this.loadItems();
    } catch (err) {
      alert('Lỗi khi lưu sản phẩm Flash Sale');
    } finally {
      this.saving.set(false);
    }
  }

  async deleteItem(id: string) {
    if (!confirm('Xóa sản phẩm khỏi Flash Sale?')) return;
    await this.supabase.client.from('flash_sale_items').delete().eq('id', id);
    await this.loadItems();
  }

  // ====== HELPERS ======
  getSlotStatusClass(s: TimeSlot): string {
    const now = new Date();
    const start = new Date(s.start_time);
    const end = new Date(s.end_time);
    if (now >= start && now < end) return 'active';
    if (now < start) return 'upcoming';
    return 'inactive';
  }

  getSlotStatusText(s: TimeSlot): string {
    const cls = this.getSlotStatusClass(s);
    if (cls === 'active') return '🟢 Đang diễn ra';
    if (cls === 'upcoming') return '🟡 Sắp diễn ra';
    return '⏹ Đã kết thúc';
  }

  getDiscountPercent(item: FlashItem): number {
    if (!item.original_price || item.original_price <= 0) return 0;
    return Math.round((1 - item.flash_price / item.original_price) * 100);
  }

  getSoldPercent(item: FlashItem): number {
    if (item.stock_limit <= 0) return 0;
    return Math.round((item.sold_count / item.stock_limit) * 100);
  }

  getFormDiscountPercent(): number {
    if (!this.itemForm.original_price || this.itemForm.original_price <= 0)
      return 0;
    return Math.round(
      (1 - this.itemForm.flash_price / this.itemForm.original_price) * 100,
    );
  }

  private toLocalDatetime(d: Date): string {
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }
}
