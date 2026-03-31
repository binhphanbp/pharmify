import { Component, OnInit, signal } from '@angular/core';
import { toast } from 'ngx-sonner';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BannerService } from '../../../core/services/banner.service';
import { Banner } from '../../../core/models/banner.model';

@Component({
  selector: 'app-admin-banners',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="admin-page">
      <div class="page-header">
        <h2>Quản lý Banner</h2>
        <button class="btn-primary" (click)="showForm = true; resetForm()">
          <span class="material-icons">add</span> Thêm banner
        </button>
      </div>

      <!-- Tabs: Hero / Sub -->
      <div class="tabs">
        <button
          class="tab"
          [class.active]="activeTab === 'hero'"
          (click)="activeTab = 'hero'"
        >
          Hero Banners ({{ heroBanners().length }})
        </button>
        <button
          class="tab"
          [class.active]="activeTab === 'sub'"
          (click)="activeTab = 'sub'"
        >
          Sub Banners ({{ subBanners().length }})
        </button>
      </div>

      <!-- Banners Grid -->
      <div class="banner-grid">
        <div
          class="banner-card"
          *ngFor="let b of activeTab === 'hero' ? heroBanners() : subBanners()"
        >
          <div class="banner-img-wrap">
            <img
              [src]="b.image_url"
              [alt]="b.title"
              onerror="this.src='https://placehold.co/600x200/004D95/fff?text=Banner'"
            />
            <span class="banner-position">{{ b.position }}</span>
            <span class="banner-order">#{{ b.sort_order }}</span>
          </div>
          <div class="banner-info">
            <strong>{{ b.title }}</strong>
            <small>{{ b.subtitle }}</small>
            <div class="banner-meta">
              <span
                class="badge"
                [class.active]="b.is_active"
                [class.inactive]="!b.is_active"
              >
                {{ b.is_active ? 'Đang hiện' : 'Đã tắt' }}
              </span>
              <span class="link-text" *ngIf="b.link_url"
                >→ {{ b.link_url }}</span
              >
            </div>
          </div>
          <div class="banner-actions">
            <button class="btn-icon edit" (click)="editBanner(b)">
              <span class="material-icons">edit</span>
            </button>
            <button class="btn-icon danger" (click)="deleteBanner(b.id)">
              <span class="material-icons">delete</span>
            </button>
          </div>
        </div>
      </div>

      <p
        class="empty-text"
        *ngIf="
          (activeTab === 'hero' ? heroBanners() : subBanners()).length === 0
        "
      >
        Chưa có banner nào trong tab này
      </p>

      <!-- Modal -->
      <div class="modal-overlay" *ngIf="showForm" (click)="showForm = false">
        <div class="modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>{{ editingId ? 'Cập nhật banner' : 'Thêm banner mới' }}</h3>
            <button class="btn-close" (click)="showForm = false">
              <span class="material-icons">close</span>
            </button>
          </div>
          <div class="modal-body">
            <div class="form-group">
              <label>Tiêu đề *</label>
              <input
                type="text"
                [(ngModel)]="form.title"
                placeholder="Tiêu đề banner"
              />
            </div>
            <div class="form-group">
              <label>Phụ đề</label>
              <input
                type="text"
                [(ngModel)]="form.subtitle"
                placeholder="Mô tả ngắn"
              />
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Vị trí *</label>
                <select [(ngModel)]="form.position">
                  <option value="hero">Hero (carousel chính)</option>
                  <option value="sub">Sub (banner phụ)</option>
                  <option value="popup">Popup</option>
                  <option value="sidebar">Sidebar</option>
                </select>
              </div>
              <div class="form-group">
                <label>Thứ tự</label>
                <input type="number" [(ngModel)]="form.sort_order" min="1" />
              </div>
            </div>
            <div class="form-group">
              <label>Ảnh banner</label>
              <input
                type="file"
                (change)="onImageSelect($event)"
                accept="image/*"
              />
              <input
                type="url"
                [(ngModel)]="form.image_url"
                placeholder="hoặc nhập URL ảnh"
                style="margin-top: 8px"
              />
              <img
                *ngIf="form.image_url"
                [src]="form.image_url"
                class="preview-img"
                style="max-width: 100%"
              />
            </div>
            <div class="form-group">
              <label>Link khi click</label>
              <input
                type="text"
                [(ngModel)]="form.link_url"
                placeholder="/category/vitamin"
              />
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Ngày bắt đầu</label>
                <input type="date" [(ngModel)]="form.start_date" />
              </div>
              <div class="form-group">
                <label>Ngày kết thúc</label>
                <input type="date" [(ngModel)]="form.end_date" />
              </div>
            </div>
            <div class="form-group">
              <label
                ><input type="checkbox" [(ngModel)]="form.is_active" /> Đang
                hoạt động</label
              >
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn-cancel" (click)="showForm = false">Hủy</button>
            <button
              class="btn-primary"
              (click)="saveBanner()"
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
  styleUrls: ['./banners.component.scss'],
})
export class AdminBannersComponent implements OnInit {
  heroBanners = signal<Banner[]>([]);
  subBanners = signal<Banner[]>([]);
  saving = signal(false);
  showForm = false;
  editingId = '';
  activeTab: 'hero' | 'sub' = 'hero';
  imageFile: File | null = null;

  form: any = {};

  constructor(private bannerService: BannerService) {}

  async ngOnInit() {
    await this.loadBanners();
  }

  async loadBanners() {
    const [hero, sub] = await Promise.all([
      this.bannerService.getAllBannersByPosition('hero'),
      this.bannerService.getAllBannersByPosition('sub'),
    ]);
    this.heroBanners.set(hero);
    this.subBanners.set(sub);
  }

  resetForm() {
    this.editingId = '';
    this.form = {
      title: '',
      subtitle: '',
      image_url: '',
      link_url: '',
      position: this.activeTab,
      sort_order: 1,
      is_active: true,
      start_date: '',
      end_date: '',
    };
    this.imageFile = null;
  }

  editBanner(b: Banner) {
    this.editingId = b.id;
    this.form = {
      ...b,
      start_date: b.start_date?.split('T')[0] || '',
      end_date: b.end_date?.split('T')[0] || '',
    };
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

  async saveBanner() {
    this.saving.set(true);
    try {
      if (this.imageFile) {
        const filename = `banner-${Date.now()}.jpg`;
        this.form.image_url = await this.bannerService.uploadBannerImage(
          this.imageFile,
          filename,
        );
      }
      const payload = {
        title: this.form.title,
        subtitle: this.form.subtitle,
        image_url: this.form.image_url,
        link_url: this.form.link_url,
        position: this.form.position,
        sort_order: this.form.sort_order,
        is_active: this.form.is_active,
        start_date: this.form.start_date || null,
        end_date: this.form.end_date || null,
      };

      if (this.editingId) {
        await this.bannerService.updateBanner(this.editingId, payload);
      } else {
        await this.bannerService.createBanner(payload);
      }
      this.showForm = false;
      await this.loadBanners();
    } catch (err) {
      console.error('Error saving banner:', err);
      toast.error('Lỗi khi lưu banner');
    } finally {
      this.saving.set(false);
    }
  }

  async deleteBanner(id: string) {
    if (!confirm('Bạn có chắc muốn xóa banner này?')) return;
    try {
      await this.bannerService.deleteBanner(id);
      await this.loadBanners();
    } catch (err) {
      toast.error('Lỗi khi xóa banner');
    }
  }
}
