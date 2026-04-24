import { Injectable, inject, signal } from '@angular/core';
import { SupabaseService } from './supabase.service';

export interface AuthUser {
  id: string;
  email: string;
  role: 'administrator' | 'team_lead' | 'team_member' | 'executive';
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private supabase = inject(SupabaseService);

  readonly currentUser = signal<AuthUser | null>(null);
  readonly isLoading = signal(false);

  async signIn(email: string, password: string): Promise<void> {
    this.isLoading.set(true);
    try {
      const { data, error } = await this.supabase.client.auth.signInWithPassword(
        { email, password },
      );
      if (error) throw new Error(error.message);

      const user = data.user;
      this.currentUser.set({
        id: user.id,
        email: user.email ?? '',
        role: (user.user_metadata?.['role'] as AuthUser['role']) ?? 'team_member',
      });
    } finally {
      this.isLoading.set(false);
    }
  }

  async sendPasswordReset(email: string): Promise<void> {
    this.isLoading.set(true);
    try {
      const { error } = await this.supabase.client.auth.resetPasswordForEmail(
        email,
        { redirectTo: `${window.location.origin}/auth/reset-password` },
      );
      if (error) throw new Error(error.message);
    } finally {
      this.isLoading.set(false);
    }
  }

  async restoreSession(): Promise<void> {
    const { data } = await this.supabase.client.auth.getSession();
    const user = data.session?.user;
    if (user) {
      this.currentUser.set({
        id: user.id,
        email: user.email ?? '',
        role: (user.user_metadata?.['role'] as AuthUser['role']) ?? 'team_member',
      });
    }
  }

  async signOut(): Promise<void> {
    await this.supabase.client.auth.signOut();
    this.currentUser.set(null);
  }

  isAuthenticated(): boolean {
    return this.currentUser() !== null;
  }
}
