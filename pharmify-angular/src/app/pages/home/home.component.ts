import {
  Component,
  OnInit,
  signal,
  CUSTOM_ELEMENTS_SCHEMA,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ProductService } from '../../core/services/product.service';
import { CategoryService } from '../../core/services/category.service';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';
import { LoadingSkeletonComponent } from '../../shared/components/loading-skeleton/loading-skeleton.component';
import { Product } from '../../core/models/product.model';
import { Category } from '../../core/models/category.model';

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
  hotProducts = signal<Product[]>([]);
  newProducts = signal<Product[]>([]);
  categories = signal<Category[]>([]);

  loadingCategories = signal(true);
  loadingProducts = signal(true);

  banners = [
    'assets/images/banner1.jpg',
    'assets/images/banner2.jpg',
    'assets/images/banner3.jpg',
  ];

  brands = [
    {
      name: 'Sanofi',
      image:
        'https://cdn.haitrieu.com/wp-content/uploads/2022/10/Logo-Sanofi.png',
    },
    {
      name: 'Mega We Care',
      image:
        'https://vcdn1-suckhoe.vnecdn.net/2023/12/28/MWe-5054-1703759972.png?w=0&h=0&q=100&dpr=2&fit=crop&s=Z6p-M-G_bS_0-r-JpZ_4pQ',
    },
    { name: 'Rohto', image: 'https://rohto.com.vn/images/Logo-Rohto.png' },
    {
      name: 'GSK',
      image:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/GlaxoSmithKline_logo.svg/1024px-GlaxoSmithKline_logo.svg.png',
    },
    {
      name: 'Abbott',
      image:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/Abbott_Laboratories_logo.svg/1200px-Abbott_Laboratories_logo.svg.png',
    },
    {
      name: 'Pfizer',
      image:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1f/Pfizer_logo_2021.svg/1200px-Pfizer_logo_2021.svg.png',
    },
  ];

  constructor(
    private productService: ProductService,
    private categoryService: CategoryService,
  ) {}

  async ngOnInit() {
    this.loadData();
  }

  async loadData() {
    try {
      const [cats, hots, news] = await Promise.all([
        this.categoryService.getParentCategories(),
        this.productService.getHotProducts(6),
        this.productService.getNewProducts(6),
      ]);

      this.categories.set(cats);
      this.hotProducts.set(hots);
      this.newProducts.set(news);
    } catch (err) {
      console.error('Error loading home data:', err);
    } finally {
      this.loadingCategories.set(false);
      this.loadingProducts.set(false);
    }
  }
}
