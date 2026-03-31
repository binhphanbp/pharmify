import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { SupabaseService } from '../../core/services/supabase.service';
import { Product } from '../../core/models/product.model';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ProductCardComponent],
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],
})
export class SearchComponent implements OnInit, OnDestroy {
  query = '';
  results = signal<Product[]>([]);
  loading = signal(false);
  totalCount = signal(0);
  categories = signal<{ id: string; name: string; slug: string }[]>([]);

  // Filters
  selectedCategory = '';
  sortBy = 'relevance'; // relevance | price_asc | price_desc | newest
  priceMin: number | null = null;
  priceMax: number | null = null;

  // Pagination
  page = 1;
  pageSize = 20;
  hasMore = signal(false);

  // Suggestions
  popularSearches = [
    'Paracetamol',
    'Vitamin C',
    'Omega 3',
    'Collagen',
    'Sữa dinh dưỡng',
    'Men tiêu hóa',
    'Khẩu trang',
    'Nước muối',
  ];

  private routeSub!: Subscription;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private supabase: SupabaseService,
  ) {}

  ngOnInit() {
    this.loadCategories();
    this.routeSub = this.route.queryParams.subscribe((params) => {
      this.query = params['q'] || '';
      this.selectedCategory = params['category'] || '';
      this.sortBy = params['sort'] || 'relevance';
      this.page = 1;
      if (this.query) {
        this.search();
      }
    });
  }

  ngOnDestroy() {
    this.routeSub?.unsubscribe();
  }

  async loadCategories() {
    const { data } = await this.supabase.client
      .from('categories')
      .select('id, name, slug')
      .order('sort_order');
    this.categories.set(data || []);
  }

  async search() {
    if (!this.query.trim()) return;
    this.loading.set(true);

    try {
      const from = (this.page - 1) * this.pageSize;
      const to = from + this.pageSize - 1;

      // Use the products view with ilike search
      let q = this.supabase.client
        .from('v_product_catalog')
        .select('*', { count: 'exact' })
        .or(
          `name.ilike.%${this.query}%,short_description.ilike.%${this.query}%,active_ingredient.ilike.%${this.query}%,manufacturer.ilike.%${this.query}%`,
        )
        .range(from, to);

      // Category filter
      if (this.selectedCategory) {
        q = q.eq('category_slug', this.selectedCategory);
      }

      // Price filters
      if (this.priceMin !== null && this.priceMin > 0) {
        q = q.gte('price', this.priceMin);
      }
      if (this.priceMax !== null && this.priceMax > 0) {
        q = q.lte('price', this.priceMax);
      }

      // Sorting
      switch (this.sortBy) {
        case 'price_asc':
          q = q.order('price', { ascending: true });
          break;
        case 'price_desc':
          q = q.order('price', { ascending: false });
          break;
        case 'newest':
          q = q.order('created_at', { ascending: false });
          break;
        default:
          q = q.order('name', { ascending: true });
          break;
      }

      const { data, count, error } = await q;

      if (error) throw error;

      if (this.page === 1) {
        this.results.set(data || []);
      } else {
        this.results.set([...this.results(), ...(data || [])]);
      }
      this.totalCount.set(count || 0);
      this.hasMore.set((data?.length || 0) === this.pageSize);
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      this.loading.set(false);
    }
  }

  onSearchInput(event: Event) {
    const input = event.target as HTMLInputElement;
    this.query = input.value;
  }

  submitSearch() {
    if (!this.query.trim()) return;
    this.page = 1;
    this.updateUrl();
    this.search();
  }

  onFilterChange() {
    this.page = 1;
    this.updateUrl();
    this.search();
  }

  onSortChange() {
    this.page = 1;
    this.updateUrl();
    this.search();
  }

  applyPriceFilter() {
    this.page = 1;
    this.search();
  }

  clearPriceFilter() {
    this.priceMin = null;
    this.priceMax = null;
    this.page = 1;
    this.search();
  }

  loadMore() {
    this.page++;
    this.search();
  }

  searchTag(tag: string) {
    this.query = tag;
    this.page = 1;
    this.selectedCategory = '';
    this.updateUrl();
    this.search();
  }

  clearAll() {
    this.selectedCategory = '';
    this.sortBy = 'relevance';
    this.priceMin = null;
    this.priceMax = null;
    this.page = 1;
    this.updateUrl();
    this.search();
  }

  private updateUrl() {
    const queryParams: any = {};
    if (this.query) queryParams.q = this.query;
    if (this.selectedCategory) queryParams.category = this.selectedCategory;
    if (this.sortBy !== 'relevance') queryParams.sort = this.sortBy;
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams,
      queryParamsHandling: 'merge',
    });
  }
}
