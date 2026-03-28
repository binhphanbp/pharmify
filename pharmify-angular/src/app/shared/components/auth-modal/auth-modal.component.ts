import { Component, EventEmitter, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-auth-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './auth-modal.component.html',
  styleUrls: ['./auth-modal.component.scss'],
})
export class AuthModalComponent {
  @Output() close = new EventEmitter<void>();

  isLoginMode = signal(true);
  loading = signal(false);
  errorMessage = signal('');
  successMessage = signal('');

  // Login fields
  email = '';
  password = '';

  // Register fields
  fullName = '';
  phone = '';
  regEmail = '';
  regPassword = '';

  constructor(private authService: AuthService) {}

  switchToLogin() {
    this.isLoginMode.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');
  }

  switchToRegister() {
    this.isLoginMode.set(false);
    this.errorMessage.set('');
    this.successMessage.set('');
  }

  closeModal() {
    this.close.emit();
  }

  onOverlayClick(event: MouseEvent) {
    if ((event.target as HTMLElement).classList.contains('modal-overlay')) {
      this.closeModal();
    }
  }

  async onLogin() {
    if (!this.email || !this.password) {
      this.errorMessage.set('Vui lòng nhập đầy đủ email và mật khẩu');
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');

    try {
      const { error } = await this.authService.signInWithEmail(
        this.email,
        this.password,
      );
      if (error) throw error;
      this.closeModal();
    } catch (err: any) {
      this.errorMessage.set(
        err.message || 'Đăng nhập thất bại, vui lòng thử lại.',
      );
    } finally {
      this.loading.set(false);
    }
  }

  async onRegister() {
    if (!this.fullName || !this.regEmail || !this.regPassword) {
      this.errorMessage.set('Vui lòng nhập đầy đủ thông tin');
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');

    try {
      const { error } = await this.authService.signUpWithEmail(
        this.regEmail,
        this.regPassword,
        this.fullName,
      );
      if (error) throw error;
      this.successMessage.set('Đăng ký thành công!');
      // Auto-switch to login after successful registration
      setTimeout(() => {
        this.switchToLogin();
        this.email = this.regEmail;
      }, 1500);
    } catch (err: any) {
      this.errorMessage.set(
        err.message || 'Đăng ký thất bại, vui lòng thử lại.',
      );
    } finally {
      this.loading.set(false);
    }
  }
}
