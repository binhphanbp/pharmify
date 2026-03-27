import { Injectable, signal } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { User, Session } from '@supabase/supabase-js';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  currentUser = signal<User | null>(null);
  session = signal<Session | null>(null);

  constructor(private supabase: SupabaseService) {
    this.initAuthSession();
  }

  private initAuthSession() {
    this.supabase.client.auth.getSession().then(({ data: { session } }) => {
      this.session.set(session);
      this.currentUser.set(session?.user ?? null);
    });

    this.supabase.client.auth.onAuthStateChange((_event, session) => {
      this.session.set(session);
      this.currentUser.set(session?.user ?? null);
    });
  }

  async signInWithEmail(email: string, password: string) {
    return await this.supabase.client.auth.signInWithPassword({ email, password });
  }

  async signUpWithEmail(email: string, password: string, fullName: string) {
    return await this.supabase.client.auth.signUp({ 
      email, 
      password,
      options: {
        data: { full_name: fullName }
      }
    });
  }

  async signOut() {
    return await this.supabase.client.auth.signOut();
  }
}
