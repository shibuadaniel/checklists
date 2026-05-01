import { Injectable, inject, signal } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { parseUserRole } from '../models/team.model';

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  role: 'administrator' | 'team_lead' | 'team_member' | 'executive';
  teamId?: string;
  avatarUrl?: string;
}

/** In-memory only — no Supabase session; full app preview (administrator). */
const DEMO_USER: AuthUser = {
  id: '00000000-0000-4000-8000-000000000001',
  email: 'demo@cheklists.app',
  fullName: 'Demo Admin',
  role: 'administrator',
  teamId: 'team-1',
};

@Injectable({ providedIn: 'root' })
export class AuthService {
  private supabase = inject(SupabaseService);

  readonly currentUser = signal<AuthUser | null>(null);
  readonly isLoading = signal(false);

  /**
   * Skip Supabase; sets an administrator demo user so routes and UI for all
   * roles (Settings, team management, checklists, etc.) are reachable. No real
   * Supabase session — data-changing calls may still fail.
   */
  signInAsDemo(): void {
    this.currentUser.set({ ...DEMO_USER });
  }

  async signIn(email: string, password: string): Promise<void> {
    this.isLoading.set(true);
    try {
      const { data, error } = await this.supabase.client.auth.signInWithPassword(
        { email, password },
      );
      if (error) throw new Error(error.message);

      const profile = await this.fetchProfile(data.user.id);
      this.currentUser.set(profile ?? this.fallbackUser(data.user));
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
    if (!user) return;

    const profile = await this.fetchProfile(user.id);
    this.currentUser.set(profile ?? this.fallbackUser(user));
  }

  async signOut(): Promise<void> {
    await this.supabase.client.auth.signOut();
    this.currentUser.set(null);
  }

  isAuthenticated(): boolean {
    return this.currentUser() !== null;
  }

  /** Update the avatar URL in the current user signal (called after upload). */
  updateAvatarUrl(url: string): void {
    const user = this.currentUser();
    if (user) this.currentUser.set({ ...user, avatarUrl: url });
  }

  // ── Private helpers ───────────────────────────────────────────────────

  private async fetchProfile(userId: string): Promise<AuthUser | null> {
    const { data, error } = await this.supabase.client
      .from('profiles')
      .select('id, email, full_name, role, team_id, avatar_url')
      .eq('id', userId)
      .single();

    if (error || !data) return null;

    return {
      id: data['id'],
      email: data['email'] ?? '',
      fullName: data['full_name'] ?? '',
      role: parseUserRole(data['role']) ?? 'team_member',
      teamId: data['team_id'] ?? undefined,
      avatarUrl: data['avatar_url'] ?? undefined,
    };
  }

  private fallbackUser(user: { id: string; email?: string }): AuthUser {
    return {
      id: user.id,
      email: user.email ?? '',
      fullName: user.email?.split('@')[0] ?? 'User',
      role: 'team_member',
    };
  }
}
