import { Component } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './shared/components/header/header.component';
import { FooterComponent } from './shared/components/footer/footer.component';
import { NgxSonnerToaster } from 'ngx-sonner';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, HeaderComponent, FooterComponent, NgxSonnerToaster],
  template: `
    <div class="app-layout d-flex flex-column min-vh-100">
      <app-header *ngIf="!isAdminRoute"></app-header>

      <main class="flex-grow-1">
        <router-outlet></router-outlet>
      </main>

      <app-footer *ngIf="!isAdminRoute"></app-footer>
    </div>
    <ngx-sonner-toaster
      position="bottom-right"
      [richColors]="true"
      [closeButton]="true"
      [duration]="3000"
      [toastOptions]="{ style: { 'font-family': 'inherit' } }"
    />
  `,
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'pharmify-angular';
  isAdminRoute = false;

  constructor(private router: Router) {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.isAdminRoute = event.urlAfterRedirects?.startsWith('/admin');
      });
  }
}
