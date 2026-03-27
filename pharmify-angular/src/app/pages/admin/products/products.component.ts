import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SupabaseService } from '../../../core/services/supabase.service';

@Component({
  selector: 'app-admin-products',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="admin-page">
      <div class="page-header">
        <h2>Quản lý sản phẩm</h2>
        <button class="btn-primary" (click)="showForm = true; resetForm()">
          <span class="material-icons">add</span> Thêm sản phẩm
        </button>
      </div>

      <!-- Search & Filter -->
      <div class="filter-bar">
        <input
          type="text"
          placeholder="Tìm kiếm sản phẩm..."
          [(ngModel)]="searchTerm"
          (input)="filterProducts()"
          class="search-input"
        />
        <select
          [(ngModel)]="filterCategory"
          (change)="filterProducts()"
          class="filter-select"
        >
          <option value="">Tất cả danh mục</option>
          <option *ngFor="let c of categories()" [value]="c.id">
            {{ c.name }}
          </option>
        </select>
      </div>

      <!-- Products Table -->
      <div class="table-card">
        <table class="data-table">
          <thead>
            <tr>
              <th>Ảnh</th>
              <th>Tên sản phẩm</th>
              <th>Danh mục</th>
              <th>Giá</th>
              <th>Trạng thái</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let p of filteredProducts()">
              <td>
                <img
                  [src]="
                    p.image_url ||
                    'https://placehold.co/40x40/f0f0f0/999?text=?'
                  "
                  class="thumb"
                />
              </td>
              <td>
                <strong>{{ p.name }}</strong
                ><br /><small class="text-muted">{{ p.slug }}</small>
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
              <td class="actions">
                <button
                  class="btn-icon edit"
                  (click)="editProduct(p)"
                  title="Sửa"
                >
                  <span class="material-icons">edit</span>
                </button>
                <button
                  class="btn-icon danger"
                  (click)="deleteProduct(p.id)"
                  title="Xóa"
                >
                  <span class="material-icons">delete</span>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
        <p class="empty-text" *ngIf="filteredProducts().length === 0">
          Không tìm thấy sản phẩm nào
        </p>
      </div>

      <!-- Add/Edit Modal -->
      <div class="modal-overlay" *ngIf="showForm" (click)="showForm = false">
        <div class="modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>{{ editingId ? 'Cập nhật sản phẩm' : 'Thêm sản phẩm mới' }}</h3>
            <button class="btn-close" (click)="showForm = false">
              <span class="material-icons">close</span>
            </button>
          </div>
          <div class="modal-body">
            <div class="form-group">
              <label>Tên sản phẩm *</label>
              <input
                type="text"
                [(ngModel)]="form.name"
                placeholder="Nhập tên sản phẩm"
              />
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Slug</label>
                <input
                  type="text"
                  [(ngModel)]="form.slug"
                  placeholder="tu-dong-tao"
                />
              </div>
              <div class="form-group">
                <label>Danh mục</label>
                <select [(ngModel)]="form.category_id">
                  <option value="">Chọn danh mục</option>
                  <option *ngFor="let c of categories()" [value]="c.id">
                    {{ c.name }}
                  </option>
                </select>
              </div>
            </div>
            <div class="form-group">
              <label>Mô tả ngắn</label>
              <textarea
                [(ngModel)]="form.short_description"
                rows="2"
                placeholder="Mô tả ngắn sản phẩm"
              ></textarea>
            </div>
            <div class="form-group">
              <label>Mô tả chi tiết</label>
              <textarea
                [(ngModel)]="form.description"
                rows="4"
                placeholder="Mô tả chi tiết"
              ></textarea>
            </div>
            <div class="form-group">
              <label>Ảnh sản phẩm</label>
              <input
                type="file"
                (change)="onImageSelect($event)"
                accept="image/*"
              />
              <img
                *ngIf="form.image_url"
                [src]="form.image_url"
                class="preview-img"
              />
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Hãng sản xuất</label>
                <input
                  type="text"
                  [(ngModel)]="form.manufacturer"
                  placeholder="Nhập tên hãng"
                />
              </div>
              <div class="form-group">
                <label>Xuất xứ</label>
                <input
                  type="text"
                  [(ngModel)]="form.origin"
                  placeholder="Việt Nam"
                />
              </div>
            </div>
            <div class="form-group">
              <label>
                <input
                  type="checkbox"
                  [(ngModel)]="form.requires_prescription"
                />
                Cần kê đơn
              </label>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn-cancel" (click)="showForm = false">Hủy</button>
            <button
              class="btn-primary"
              (click)="saveProduct()"
              [disabled]="saving()"
            >
              {{
                saving() ? 'Đang lưu...' : editingId ? 'Cập nhật' : 'Thêm mới'
              }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./products.component.scss'],
})
export class AdminProductsComponent implements OnInit {
  products = signal<any[]>([]);
  filteredProducts = signal<any[]>([]);
  categories = signal<any[]>([]);
  saving = signal(false);
  showForm = false;
  editingId = '';
  searchTerm = '';
  filterCategory = '';
  imageFile: File | null = null;

  form: any = {};

  constructor(private supabase: SupabaseService) {}

  async ngOnInit() {
    await this.loadData();
  }

  async loadData() {
    const [prods, cats] = await Promise.all([
      this.supabase.client
        .from('v_product_catalog')
        .select('*')
        .order('created_at', { ascending: false }),
      this.supabase.client.from('categories').select('id, name').order('name'),
    ]);
    this.products.set(prods.data || []);
    this.filteredProducts.set(prods.data || []);
    this.categories.set(cats.data || []);
  }

  filterProducts() {
    let result = this.products();
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      result = result.filter(
        (p) => p.name?.toLowerCase().includes(term) || p.slug?.includes(term),
      );
    }
    if (this.filterCategory) {
      result = result.filter((p) => p.category_id === this.filterCategory);
    }
    this.filteredProducts.set(result);
  }

  resetForm() {
    this.editingId = '';
    this.form = {
      name: '',
      slug: '',
      category_id: '',
      short_description: '',
      description: '',
      image_url: '',
      manufacturer: '',
      origin: '',
      requires_prescription: false,
    };
    this.imageFile = null;
  }

  editProduct(p: any) {
    this.editingId = p.id;
    this.form = { ...p };
    this.showForm = true;
  }

  onImageSelect(event: any) {
    this.imageFile = event.target.files[0];
    if (this.imageFile) {
      const reader = new FileReader();
      reader.onload = (e: any) => (this.form.image_url = e.target.result);
      reader.readAsDataURL(this.imageFile);
    }
  }

  async saveProduct() {
    this.saving.set(true);
    try {
      // Auto-generate slug if empty
      if (!this.form.slug) {
        this.form.slug = this.form.name
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/đ/g, 'd')
          .replace(/Đ/g, 'D')
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '');
      }

      // Upload image if selected
      if (this.imageFile) {
        const path = `products/${this.form.slug}.jpg`;
        await this.supabase.client.storage
          .from('product-images')
          .upload(path, this.imageFile, { upsert: true });
        const { data } = this.supabase.client.storage
          .from('product-images')
          .getPublicUrl(path);
        this.form.image_url = data.publicUrl;
      }

      const payload = {
        name: this.form.name,
        slug: this.form.slug,
        category_id: this.form.category_id || null,
        short_description: this.form.short_description,
        description: this.form.description,
        image_url: this.form.image_url,
        manufacturer: this.form.manufacturer,
        origin: this.form.origin,
        requires_prescription: this.form.requires_prescription,
      };

      if (this.editingId) {
        await this.supabase.client
          .from('products')
          .update(payload)
          .eq('id', this.editingId);
      } else {
        await this.supabase.client.from('products').insert(payload);
      }

      this.showForm = false;
      await this.loadData();
    } catch (err) {
      console.error('Error saving product:', err);
      alert('Lỗi khi lưu sản phẩm');
    } finally {
      this.saving.set(false);
    }
  }

  async deleteProduct(id: string) {
    if (!confirm('Bạn có chắc muốn xóa sản phẩm này?')) return;
    await this.supabase.client.from('products').delete().eq('id', id);
    await this.loadData();
  }
}
