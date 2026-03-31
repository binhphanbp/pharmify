import { Component, OnInit, signal } from '@angular/core';
import { toast } from 'ngx-sonner';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BannerService } from '../../../core/services/banner.service';
import { Brand } from '../../../core/models/banner.model';

@Component({
  selector: 'app-admin-brands',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="admin-page">
      <div class="page-header">
        <h2>Quản lý thương hiệu</h2>
        <button class="btn-primary" (click)="showForm = true; resetForm()">
          <span class="material-icons">add</span> Thêm thương hiệu
        </button>
      </div>

      <div class="brand-grid">
        <div class="brand-card" *ngFor="let b of brands()">
          <img
            [src]="
              b.logo_url ||
              'https://placehold.co/120x60/f0f0f0/999?text=' + b.name
            "
            [alt]="b.name"
            class="brand-logo"
          />
          <div class="brand-info">
            <strong>{{ b.name }}</strong>
            <small>{{ b.slug }}</small>
          </div>
          <div class="brand-actions">
            <button class="btn-icon edit" (click)="editBrand(b)">
              <span class="material-icons">edit</span>
            </button>
            <button class="btn-icon danger" (click)="deleteBrand(b.id)">
              <span class="material-icons">delete</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Modal -->
      <div class="modal-overlay" *ngIf="showForm" (click)="showForm = false">
        <div class="modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>
              {{ editingId ? 'Cập nhật thương hiệu' : 'Thêm thương hiệu mới' }}
            </h3>
            <button class="btn-close" (click)="showForm = false">
              <span class="material-icons">close</span>
            </button>
          </div>
          <div class="modal-body">
            <div class="form-row">
              <div class="form-group">
                <label>Tên thương hiệu *</label>
                <input
                  type="text"
                  [(ngModel)]="form.name"
                  placeholder="Sanofi"
                />
              </div>
              <div class="form-group">
                <label>Slug</label>
                <input
                  type="text"
                  [(ngModel)]="form.slug"
                  placeholder="sanofi"
                />
              </div>
            </div>
            <div class="form-group">
              <label>Logo</label>
              <input
                type="file"
                (change)="onLogoSelect($event)"
                accept="image/*"
              />
              <input
                type="url"
                [(ngModel)]="form.logo_url"
                placeholder="hoặc nhập URL logo"
                style="margin-top: 8px"
              />
              <img
                *ngIf="form.logo_url"
                [src]="form.logo_url"
                class="preview-img"
              />
            </div>
            <div class="form-group">
              <label>Website</label>
              <input
                type="url"
                [(ngModel)]="form.website_url"
                placeholder="https://sanofi.com"
              />
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Thứ tự</label>
                <input type="number" [(ngModel)]="form.sort_order" min="1" />
              </div>
              <div class="form-group">
                <label
                  ><input type="checkbox" [(ngModel)]="form.is_active" /> Đang
                  hiện</label
                >
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn-cancel" (click)="showForm = false">Hủy</button>
            <button
              class="btn-primary"
              (click)="saveBrand()"
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
  styleUrls: ['./brands.component.scss'],
})
export class AdminBrandsComponent implements OnInit {
  brands = signal<Brand[]>([]);
  saving = signal(false);
  showForm = false;
  editingId = '';
  logoFile: File | null = null;
  form: any = {};

  constructor(private bannerService: BannerService) {}

  async ngOnInit() {
    await this.loadBrands();
  }

  async loadBrands() {
    const brands = await this.bannerService.getActiveBrands();
    this.brands.set(brands);
  }

  resetForm() {
    this.editingId = '';
    this.form = {
      name: '',
      slug: '',
      logo_url: '',
      website_url: '',
      sort_order: 1,
      is_active: true,
    };
    this.logoFile = null;
  }

  editBrand(b: Brand) {
    this.editingId = b.id;
    this.form = { ...b };
    this.showForm = true;
  }

  onLogoSelect(event: any) {
    this.logoFile = event.target.files[0];
    if (this.logoFile) {
      const reader = new FileReader();
      reader.onload = (e: any) => (this.form.logo_url = e.target.result);
      reader.readAsDataURL(this.logoFile);
    }
  }

  async saveBrand() {
    this.saving.set(true);
    try {
      if (!this.form.slug) {
        this.form.slug = this.form.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-');
      }
      if (this.logoFile) {
        this.form.logo_url = await this.bannerService.uploadBrandLogo(
          this.logoFile,
          this.form.slug,
        );
      }
      const payload = {
        name: this.form.name,
        slug: this.form.slug,
        logo_url: this.form.logo_url,
        website_url: this.form.website_url,
        sort_order: this.form.sort_order,
        is_active: this.form.is_active,
      };
      if (this.editingId) {
        await this.bannerService.updateBrand(this.editingId, payload);
      } else {
        await this.bannerService.createBrand(payload);
      }
      this.showForm = false;
      await this.loadBrands();
    } catch (err) {
      toast.error('Lỗi khi lưu thương hiệu');
    } finally {
      this.saving.set(false);
    }
  }

  async deleteBrand(id: string) {
    if (!confirm('Bạn có chắc muốn xóa thương hiệu này?')) return;
    try {
      await this.bannerService.deleteBrand(id);
      await this.loadBrands();
    } catch {
      toast.error('Lỗi khi xóa');
    }
  }
}
