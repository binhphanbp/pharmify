import { Component, OnInit, signal } from '@angular/core';
import { toast } from 'ngx-sonner';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SupabaseService } from '../../../core/services/supabase.service';

@Component({
  selector: 'app-admin-categories',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="admin-page">
      <div class="page-header">
        <h2>Quản lý danh mục</h2>
        <button class="btn-primary" (click)="showForm = true; resetForm()">
          <span class="material-icons">add</span> Thêm danh mục
        </button>
      </div>

      <div class="table-card">
        <table class="data-table">
          <thead>
            <tr>
              <th>Icon</th>
              <th>Tên danh mục</th>
              <th>Slug</th>
              <th>Danh mục cha</th>
              <th>Thứ tự</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let c of categories()">
              <td>
                <span class="material-icons cat-icon">{{
                  c.icon || 'folder'
                }}</span>
              </td>
              <td>
                <strong>{{ c.name }}</strong>
              </td>
              <td class="text-muted">{{ c.slug }}</td>
              <td>{{ getParentName(c.parent_id) }}</td>
              <td>{{ c.sort_order }}</td>
              <td class="actions">
                <button class="btn-icon edit" (click)="editCategory(c)">
                  <span class="material-icons">edit</span>
                </button>
                <button class="btn-icon danger" (click)="deleteCategory(c.id)">
                  <span class="material-icons">delete</span>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Modal -->
      <div class="modal-overlay" *ngIf="showForm" (click)="showForm = false">
        <div class="modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>{{ editingId ? 'Cập nhật danh mục' : 'Thêm danh mục mới' }}</h3>
            <button class="btn-close" (click)="showForm = false">
              <span class="material-icons">close</span>
            </button>
          </div>
          <div class="modal-body">
            <div class="form-group">
              <label>Tên danh mục *</label>
              <input type="text" [(ngModel)]="form.name" placeholder="Thuốc" />
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Slug</label>
                <input
                  type="text"
                  [(ngModel)]="form.slug"
                  placeholder="thuoc"
                />
              </div>
              <div class="form-group">
                <label>Danh mục cha</label>
                <select [(ngModel)]="form.parent_id">
                  <option value="">Không (cấp cao nhất)</option>
                  <option *ngFor="let c of parentCategories()" [value]="c.id">
                    {{ c.name }}
                  </option>
                </select>
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Icon (Material Icons)</label>
                <input
                  type="text"
                  [(ngModel)]="form.icon"
                  placeholder="medication"
                />
              </div>
              <div class="form-group">
                <label>Thứ tự</label>
                <input type="number" [(ngModel)]="form.sort_order" min="0" />
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn-cancel" (click)="showForm = false">Hủy</button>
            <button
              class="btn-primary"
              (click)="saveCategory()"
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
  styleUrls: ['./categories.component.scss'],
})
export class AdminCategoriesComponent implements OnInit {
  categories = signal<any[]>([]);
  parentCategories = signal<any[]>([]);
  saving = signal(false);
  showForm = false;
  editingId = '';
  form: any = {};

  constructor(private supabase: SupabaseService) {}

  async ngOnInit() {
    await this.loadCategories();
  }

  async loadCategories() {
    const { data } = await this.supabase.client
      .from('categories')
      .select('*')
      .order('sort_order')
      .order('name');
    this.categories.set(data || []);
    this.parentCategories.set((data || []).filter((c: any) => !c.parent_id));
  }

  getParentName(parentId: string): string {
    if (!parentId) return '—';
    const parent = this.categories().find((c) => c.id === parentId);
    return parent?.name || '—';
  }

  resetForm() {
    this.editingId = '';
    this.form = { name: '', slug: '', parent_id: '', icon: '', sort_order: 0 };
  }

  editCategory(c: any) {
    this.editingId = c.id;
    this.form = { ...c, parent_id: c.parent_id || '' };
    this.showForm = true;
  }

  async saveCategory() {
    this.saving.set(true);
    try {
      if (!this.form.slug) {
        this.form.slug = this.form.name
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/đ/g, 'd')
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '');
      }
      const payload = {
        name: this.form.name,
        slug: this.form.slug,
        parent_id: this.form.parent_id || null,
        icon: this.form.icon,
        sort_order: this.form.sort_order,
      };
      if (this.editingId) {
        await this.supabase.client
          .from('categories')
          .update(payload)
          .eq('id', this.editingId);
      } else {
        await this.supabase.client.from('categories').insert(payload);
      }
      this.showForm = false;
      await this.loadCategories();
    } catch (err) {
      toast.error('Lỗi khi lưu danh mục');
    } finally {
      this.saving.set(false);
    }
  }

  async deleteCategory(id: string) {
    if (
      !confirm(
        'Xóa danh mục này? Sản phẩm thuộc danh mục sẽ không bị ảnh hưởng.',
      )
    )
      return;
    await this.supabase.client.from('categories').delete().eq('id', id);
    await this.loadCategories();
  }
}
