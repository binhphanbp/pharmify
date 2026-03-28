import { Injectable, signal } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { User, Session } from '@supabase/supabase-js';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  currentUser = signal<User | null>(null);
  session = signal<Session | null>(null);
  isLoggedIn = signal(false);
  userRole = signal<string>('customer');

  private _initialized = false;
  private _initPromise: Promise<void> | null = null;

  constructor(private supabase: SupabaseService) {
    this._initPromise = this.initAuthSession();
  }

  /** Wait for auth to be ready (use in guards) */
  async waitForInit(): Promise<void> {
    if (this._initPromise) {
      await this._initPromise;
    }
  }

  private async initAuthSession(): Promise<void> {
    try {
      const {
        data: { session },
      } = await this.supabase.client.auth.getSession();
      this.session.set(session);
      this.currentUser.set(session?.user ?? null);
      this.isLoggedIn.set(!!session);

      if (session) {
        await this.loadUserRole();
      }
    } catch (err) {
      console.error('Auth init error:', err);
    } finally {
      this._initialized = true;
    }

    this.supabase.client.auth.onAuthStateChange(async (_event, session) => {
      this.session.set(session);
      this.currentUser.set(session?.user ?? null);
      this.isLoggedIn.set(!!session);

      if (session) {
        await this.loadUserRole();
      } else {
        this.userRole.set('customer');
      }
    });
  }

  private async loadUserRole(): Promise<void> {
    try {
      const { data, error } = await this.supabase.client.rpc('is_admin');

      if (!error && data === true) {
        this.userRole.set('admin');
      } else {
        this.userRole.set('customer');
      }
    } catch {
      this.userRole.set('customer');
    }
  }

  isAdmin(): boolean {
    return this.userRole() === 'admin';
  }

  async signInWithEmail(email: string, password: string) {
    return await this.supabase.client.auth.signInWithPassword({
      email,
      password,
    });
  }

  async signUpWithEmail(email: string, password: string, fullName: string) {
    return await this.supabase.client.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
      },
    });
  }

  async signOut() {
    this.userRole.set('customer');
    return await this.supabase.client.auth.signOut();
  }
}
