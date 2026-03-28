import {
  Component,
  OnInit,
  signal,
  CUSTOM_ELEMENTS_SCHEMA,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { HomeService } from '../../core/services/home.service';
import { BannerService } from '../../core/services/banner.service';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';
import { FlashSaleComponent } from '../../shared/components/flash-sale/flash-sale.component';
import { Product } from '../../core/models/product.model';
import { Category } from '../../core/models/category.model';
import { Banner, Brand } from '../../core/models/banner.model';

// Register swiper web components
import { register } from 'swiper/element/bundle';
register();

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ProductCardComponent,
    FlashSaleComponent,
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class HomeComponent implements OnInit {
  @ViewChild('heroSwiper') heroSwiperRef!: ElementRef;
  @ViewChild('subBannersSwiper') subBannersSwiperRef!: ElementRef;

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
    private bannerService: BannerService,
    private router: Router,
  ) {}

  async ngOnInit() {
    this.loadData();
  }

  onSearch(input: HTMLInputElement) {
    if (input.value && input.value.trim().length > 0) {
      this.router.navigate(['/search'], {
        queryParams: { q: input.value.trim() },
      });
    }
  }

  scrollCarousel(element: HTMLElement, direction: 'left' | 'right') {
    const scrollAmount = 400;
    if (direction === 'left') {
      element.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    } else {
      element.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  }

  initSwiper() {
    // Wait for Angular to render the slides, then initialize Swiper
    setTimeout(() => {
      const heroSwiperEl = this.heroSwiperRef?.nativeElement;
      if (heroSwiperEl) {
        Object.assign(heroSwiperEl, {
          slidesPerView: 1,
          loop: true,
          autoplay: { delay: 4000, disableOnInteraction: false },
          pagination: false,
          navigation: true,
        });
        heroSwiperEl.initialize();
      }

      const subSwiperEl = this.subBannersSwiperRef?.nativeElement;
      if (subSwiperEl) {
        Object.assign(subSwiperEl, {
          slidesPerView: 2,
          slidesPerGroup: 2,
          spaceBetween: 16,
          loop: true,
          autoplay: { delay: 5000, disableOnInteraction: false },
          pagination: { clickable: true },
          navigation: true,
          injectStyles: [
            `
            :host {
              --swiper-theme-color: #0072bc;
            }
            .swiper-wrapper {
              padding-bottom: 50px; /* Create 50px empty vertical space below the banner images */
            }
            .swiper-pagination-bullets {
              background: #f0f2f5;
              padding: 4px 10px;
              border-radius: 16px;
              display: inline-flex !important;
              align-items: center;
              left: 50% !important;
              transform: translateX(-50%) !important;
              width: auto !important;
            }
            .swiper-pagination-bullet {
              width: 6px;
              height: 6px;
              background: #aab2bd;
              opacity: 1;
              margin: 0 3px !important;
              transition: all 0.3s;
            }
            .swiper-pagination-bullet-active {
              background: #333;
              width: 6px;
              border-radius: 50%;
            }
          `,
          ],
          breakpoints: {
            320: {
              slidesPerView: 1,
              slidesPerGroup: 1,
              spaceBetween: 10,
            },
            768: {
              slidesPerView: 2,
              slidesPerGroup: 2,
              spaceBetween: 16,
            },
          },
        });
        subSwiperEl.initialize();
      }
    }, 100);
  }

  async loadData() {
    try {
      // Load RPC data + hero banners in parallel
      const [data, heroBanners] = await Promise.all([
        this.homeService.getHomePageData(),
        this.bannerService.getBannersByPosition('hero'),
      ]);

      // Use direct query for hero banners (RPC may return incomplete)
      this.heroBanners.set(
        heroBanners.length > 0 ? heroBanners : data.hero_banners,
      );
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

      // Initialize Swiper after data is loaded and view updates
      this.initSwiper();
    }
  }
}
