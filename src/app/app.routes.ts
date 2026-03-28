import { Routes } from '@angular/router';
import { adminGuard, authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/home/home.component').then((m) => m.HomeComponent),
  },
  {
    path: 'category',
    loadComponent: () =>
      import('./pages/category/category.component').then(
        (m) => m.CategoryComponent,
      ),
  },
  {
    path: 'category/:slug',
    loadComponent: () =>
      import('./pages/category/category.component').then(
        (m) => m.CategoryComponent,
      ),
  },
  {
    path: 'product/:slug',
    loadComponent: () =>
      import('./pages/product-detail/product-detail.component').then(
        (m) => m.ProductDetailComponent,
      ),
  },
  {
    path: 'cart',
    loadComponent: () =>
      import('./pages/cart/cart.component').then((m) => m.CartComponent),
  },
  {
    path: 'checkout',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/checkout/checkout.component').then(
        (m) => m.CheckoutComponent,
      ),
  },
  // ============ ADMIN ROUTES (Protected) ============
  {
    path: 'admin',
    canActivate: [adminGuard],
    loadComponent: () =>
      import('./pages/admin/layout/admin-layout.component').then(
        (m) => m.AdminLayoutComponent,
      ),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./pages/admin/dashboard/dashboard.component').then(
            (m) => m.DashboardComponent,
          ),
      },
      {
        path: 'products',
        loadComponent: () =>
          import('./pages/admin/products/products.component').then(
            (m) => m.AdminProductsComponent,
          ),
      },
      {
        path: 'categories',
        loadComponent: () =>
          import('./pages/admin/categories/categories.component').then(
            (m) => m.AdminCategoriesComponent,
          ),
      },
      {
        path: 'banners',
        loadComponent: () =>
          import('./pages/admin/banners/banners.component').then(
            (m) => m.AdminBannersComponent,
          ),
      },
      {
        path: 'brands',
        loadComponent: () =>
          import('./pages/admin/brands/brands.component').then(
            (m) => m.AdminBrandsComponent,
          ),
      },
      {
        path: 'flash-sale',
        loadComponent: () =>
          import('./pages/admin/flash-sale/flash-sale.component').then(
            (m) => m.AdminFlashSaleComponent,
          ),
      },
      {
        path: 'orders',
        loadComponent: () =>
          import('./pages/admin/orders/orders.component').then(
            (m) => m.AdminOrdersComponent,
          ),
      },
    ],
  },
  {
    path: '**',
    redirectTo: '',
  },
];
