import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ProductService } from '../../core/services/product.service';
import { CategoryService } from '../../core/services/category.service';
import { SupabaseService } from '../../core/services/supabase.service';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';
import { LoadingSkeletonComponent } from '../../shared/components/loading-skeleton/loading-skeleton.component';
import { Product } from '../../core/models/product.model';

@Component({
  selector: 'app-category',
  standalone: true,
  imports: [CommonModule, RouterModule, ProductCardComponent],
  templateUrl: './category.component.html',
  styleUrls: ['./category.component.scss'],
})
export class CategoryComponent implements OnInit {
  products = signal<Product[]>([]);
  loading = signal(true);
  categoryName = signal<string>('Tất cả sản phẩm');
  currentSlug = signal<string | null>(null);

  constructor(
    private route: ActivatedRoute,
    private supabase: SupabaseService,
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      this.currentSlug.set(params.get('slug'));
      this.loadProducts();
    });
  }

  async loadProducts() {
    this.loading.set(true);
    try {
      let query = this.supabase.client.from('v_product_catalog').select('*');

      const slug = this.currentSlug();
      if (slug) {
        query = query.eq('category_slug', slug);
        // Would ideally fetch category name too
        this.categoryName.set(slug.replace(/-/g, ' ').toUpperCase());
      } else {
        this.categoryName.set('Tất cả sản phẩm');
      }

      const { data, error } = await query;
      if (error) throw error;

      this.products.set(data as Product[]);
    } catch (err) {
      console.error('Error loading category products', err);
    } finally {
      this.loading.set(false);
    }
  }
}
