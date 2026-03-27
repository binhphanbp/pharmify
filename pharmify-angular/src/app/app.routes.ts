import { Routes } from '@angular/router';

export const routes: Routes = [
  { 
    path: '', 
    loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent) 
  },
  { 
    path: 'category', 
    loadComponent: () => import('./pages/category/category.component').then(m => m.CategoryComponent) 
  },
  { 
    path: 'category/:slug', 
    loadComponent: () => import('./pages/category/category.component').then(m => m.CategoryComponent) 
  },
  { 
    path: 'product/:slug', 
    loadComponent: () => import('./pages/product-detail/product-detail.component').then(m => m.ProductDetailComponent) 
  },
  { 
    path: 'auth', 
    loadComponent: () => import('./pages/auth/auth.component').then(m => m.AuthComponent) 
  },
  { 
    path: 'cart', 
    loadComponent: () => import('./pages/cart/cart.component').then(m => m.CartComponent) 
  },
  { 
    path: '**', 
    redirectTo: '' 
  }
];
