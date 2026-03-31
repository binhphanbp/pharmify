import { Component, OnInit, signal } from '@angular/core';
import { toast } from 'ngx-sonner';
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
              <th>Biến thể</th>
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
                <span class="variant-count" *ngIf="p.unit_count">
                  {{ p.unit_count }} đơn vị
                </span>
                <span class="text-muted" *ngIf="!p.unit_count">—</span>
              </td>
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
              rows="3"
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
              <input type="checkbox" [(ngModel)]="form.requires_prescription" />
              Cần kê đơn
            </label>
          </div>

          <!-- Product Variants / Units Section -->
          <div class="variants-section">
            <div class="variants-header">
              <h4>
                <span class="material-icons">inventory_2</span>
                Đơn vị tính & Giá
              </h4>
              <button class="btn-add-variant" (click)="addVariant()">
                <span class="material-icons">add</span> Thêm đơn vị
              </button>
            </div>
            <div class="variants-table-wrap" *ngIf="variants.length > 0">
              <table class="variants-table">
                <thead>
                  <tr>
                    <th>Đơn vị</th>
                    <th>Hệ số quy đổi</th>
                    <th>Giá bán (₫)</th>
                    <th>Giá gốc (₫)</th>
                    <th>Cơ bản</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let v of variants; let i = index">
                    <td>
                      <input
                        type="text"
                        [(ngModel)]="v.unit_name"
                        placeholder="Viên, Vỉ, Hộp..."
                        class="variant-input"
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        [(ngModel)]="v.conversion_factor"
                        min="1"
                        class="variant-input sm"
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        [(ngModel)]="v.price"
                        min="0"
                        class="variant-input"
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        [(ngModel)]="v.original_price"
                        min="0"
                        class="variant-input"
                        placeholder="Không bắt buộc"
                      />
                    </td>
                    <td class="text-center">
                      <input
                        type="radio"
                        name="base_unit"
                        [checked]="v.is_base_unit"
                        (change)="setBaseUnit(i)"
                      />
                    </td>
                    <td>
                      <button
                        class="btn-icon danger sm"
                        (click)="removeVariant(i)"
                        title="Xóa đơn vị"
                      >
                        <span class="material-icons">close</span>
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p class="variant-hint" *ngIf="variants.length === 0">
              Chưa có đơn vị tính nào. Nhấn "Thêm đơn vị" để thêm.
            </p>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-cancel" (click)="showForm = false">Hủy</button>
          <button
            class="btn-primary"
            (click)="saveProduct()"
            [disabled]="saving()"
          >
            {{ saving() ? 'Đang lưu...' : editingId ? 'Cập nhật' : 'Thêm mới' }}
          </button>
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
  variants: any[] = [];
  deletedVariantIds: string[] = [];

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

    // Enrich products with variant count
    const products = prods.data || [];
    if (products.length > 0) {
      const productIds = products.map((p: any) => p.id);
      const { data: unitCounts } = await this.supabase.client
        .from('product_units')
        .select('product_id')
        .in('product_id', productIds);

      const countMap: Record<string, number> = {};
      (unitCounts || []).forEach((u: any) => {
        countMap[u.product_id] = (countMap[u.product_id] || 0) + 1;
      });
      products.forEach((p: any) => {
        p.unit_count = countMap[p.id] || 0;
      });
    }

    this.products.set(products);
    this.filteredProducts.set(products);
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
      sku: '',
      category_id: '',
      short_description: '',
      description: '',
      image_url: '',
      manufacturer: '',
      origin: '',
      requires_prescription: false,
    };
    this.imageFile = null;
    this.variants = [];
    this.deletedVariantIds = [];
  }

  async editProduct(p: any) {
    this.editingId = p.id;
    this.form = { ...p };
    this.showForm = true;
    this.deletedVariantIds = [];

    // Load variants (units + prices) for this product
    const { data: units } = await this.supabase.client
      .from('product_units')
      .select('*, product_prices(*)')
      .eq('product_id', p.id)
      .order('is_base_unit', { ascending: false });

    this.variants = (units || []).map((u: any) => {
      const priceData = u.product_prices?.[0] || {};
      return {
        id: u.id,
        price_id: priceData.id || null,
        unit_name: u.unit_name,
        conversion_factor: u.conversion_factor,
        is_base_unit: u.is_base_unit,
        price: priceData.price ? Number(priceData.price) : 0,
        original_price: priceData.original_price
          ? Number(priceData.original_price)
          : null,
      };
    });
  }

  addVariant() {
    this.variants.push({
      id: null,
      price_id: null,
      unit_name: '',
      conversion_factor: 1,
      is_base_unit: this.variants.length === 0,
      price: 0,
      original_price: null,
    });
  }

  removeVariant(index: number) {
    const removed = this.variants[index];
    if (removed.id) {
      this.deletedVariantIds.push(removed.id);
    }
    this.variants.splice(index, 1);
  }

  setBaseUnit(index: number) {
    this.variants.forEach((v, i) => (v.is_base_unit = i === index));
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
        const ext = this.imageFile.name.split('.').pop() || 'jpg';
        const path = `products/${this.form.slug}.${ext}`;
        const { error: uploadError } = await this.supabase.client.storage
          .from('product-images')
          .upload(path, this.imageFile, {
            upsert: true,
            contentType: this.imageFile.type,
          });
        if (uploadError) {
          console.error('Upload error:', uploadError);
          toast.error('Lỗi tải ảnh', { description: uploadError.message });
          this.saving.set(false);
          return;
        }
        const { data } = this.supabase.client.storage
          .from('product-images')
          .getPublicUrl(path);
        this.form.image_url = data.publicUrl;
      }

      // Auto-generate SKU if empty
      if (!this.form.sku) {
        this.form.sku = 'SKU-' + this.form.slug.toUpperCase().replace(/-/g, '');
      }

      const payload: any = {
        name: this.form.name,
        slug: this.form.slug,
        sku: this.form.sku,
        category_id: this.form.category_id || null,
        short_description: this.form.short_description || null,
        description: this.form.description || null,
        image_url: this.form.image_url || null,
        manufacturer: this.form.manufacturer || null,
        origin: this.form.origin || null,
        requires_prescription: this.form.requires_prescription || false,
      };

      let productId = this.editingId;

      if (this.editingId) {
        const { error } = await this.supabase.client
          .from('products')
          .update(payload)
          .eq('id', this.editingId);
        if (error) {
          console.error('Update error:', error);
          toast.error('Lỗi cập nhật sản phẩm', { description: error.message });
          this.saving.set(false);
          return;
        }
      } else {
        const { data: newProduct, error } = await this.supabase.client
          .from('products')
          .insert(payload)
          .select('id')
          .single();
        if (error) {
          console.error('Insert error:', error);
          toast.error('Lỗi thêm sản phẩm', { description: error.message });
          this.saving.set(false);
          return;
        }
        productId = newProduct.id;
      }

      // Save variants
      await this.saveVariants(productId);

      this.showForm = false;
      await this.loadData();
    } catch (err) {
      console.error('Error saving product:', err);
      toast.error('Lỗi khi lưu sản phẩm');
    } finally {
      this.saving.set(false);
    }
  }

  async saveVariants(productId: string) {
    // Delete removed variants (cascade will delete product_prices)
    for (const id of this.deletedVariantIds) {
      // Delete prices first, then unit
      await this.supabase.client
        .from('product_prices')
        .delete()
        .eq('product_unit_id', id);
      await this.supabase.client.from('product_units').delete().eq('id', id);
    }

    // Upsert remaining variants
    for (const v of this.variants) {
      if (!v.unit_name) continue;

      if (v.id) {
        // Update existing unit
        await this.supabase.client
          .from('product_units')
          .update({
            unit_name: v.unit_name,
            conversion_factor: v.conversion_factor || 1,
            is_base_unit: v.is_base_unit || false,
          })
          .eq('id', v.id);

        // Update or insert price
        if (v.price_id) {
          await this.supabase.client
            .from('product_prices')
            .update({
              price: v.price || 0,
              original_price: v.original_price || null,
            })
            .eq('id', v.price_id);
        } else {
          await this.supabase.client.from('product_prices').insert({
            product_unit_id: v.id,
            price: v.price || 0,
            original_price: v.original_price || null,
          });
        }
      } else {
        // Insert new unit
        const { data: newUnit, error: unitError } = await this.supabase.client
          .from('product_units')
          .insert({
            product_id: productId,
            unit_name: v.unit_name,
            conversion_factor: v.conversion_factor || 1,
            is_base_unit: v.is_base_unit || false,
          })
          .select('id')
          .single();

        if (unitError) {
          console.error('Unit insert error:', unitError);
          continue;
        }

        // Insert price
        await this.supabase.client.from('product_prices').insert({
          product_unit_id: newUnit.id,
          price: v.price || 0,
          original_price: v.original_price || null,
        });
      }
    }
  }

  async deleteProduct(id: string) {
    if (!confirm('Bạn có chắc muốn xóa sản phẩm này?')) return;
    await this.supabase.client.from('products').delete().eq('id', id);
    await this.loadData();
  }
}
