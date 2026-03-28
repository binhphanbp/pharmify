import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss']
})
export class AuthComponent {
  isLoginMode = signal(true);
  loading = signal(false);
  
  email = '';
  password = '';
  fullName = '';
  
  errorMessage = signal('');

  constructor(private authService: AuthService, private router: Router) {
    if (this.authService.currentUser()) {
      this.router.navigate(['/']);
    }
  }

  toggleMode() {
    this.isLoginMode.update(m => !m);
    this.errorMessage.set('');
  }

  async onSubmit() {
    this.loading.set(true);
    this.errorMessage.set('');

    try {
      if (this.isLoginMode()) {
        const { error } = await this.authService.signInWithEmail(this.email, this.password);
        if (error) throw error;
      } else {
        const { error } = await this.authService.signUpWithEmail(this.email, this.password, this.fullName);
        if (error) throw error;
        // Sometimes signup requires email confirmation in Supabase. We assume auto-confirm for dev or show instruction.
      }
      
      this.router.navigate(['/']);
    } catch (err: any) {
      this.errorMessage.set(err.message || 'Có lỗi xảy ra, vui lòng thử lại.');
    } finally {
      this.loading.set(false);
    }
  }
}
