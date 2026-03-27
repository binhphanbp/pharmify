import {
  Component,
  OnInit,
  signal,
  CUSTOM_ELEMENTS_SCHEMA,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { HomeService } from '../../core/services/home.service';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';
import { Product } from '../../core/models/product.model';
import { Category } from '../../core/models/category.model';
import { Banner, Brand } from '../../core/models/banner.model';

// Register swiper web components
import { register } from 'swiper/element/bundle';
register();

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, ProductCardComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class HomeComponent implements OnInit {
  // Data signals
  heroBanners = signal<Banner[]>([]);
  subBanners = signal<Banner[]>([]);
  hotProducts = signal<Product[]>([]);
  newProducts = signal<Product[]>([]);
  categories = signal<Category[]>([]);
  brands = signal<Brand[]>([]);

  // Loading states
  loadingBanners = signal(true);
  loadingCategories = signal(true);
  loadingProducts = signal(true);

  constructor(
    private homeService: HomeService,
    private router: Router,
  ) {}

  async ngOnInit() {
    this.loadData();
  }

  onSearchInput(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.value && input.value.length > 2) {
      // Could implement debounced search later
    }
  }

  async loadData() {
    try {
      // Single RPC call replaces 6 separate API calls
      const data = await this.homeService.getHomePageData();

      this.heroBanners.set(data.hero_banners);
      this.subBanners.set(data.sub_banners);
      this.brands.set(data.brands);
      this.categories.set(data.categories);
      this.hotProducts.set(data.hot_products);
      this.newProducts.set(data.new_products);
    } catch (err) {
      console.error('Error loading home data:', err);
    } finally {
      this.loadingBanners.set(false);
      this.loadingCategories.set(false);
      this.loadingProducts.set(false);
    }
  }
}
