import { Component, inject, signal, ViewChild } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { MatDrawer, MatSidenavModule } from '@angular/material/sidenav';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSelectModule } from '@angular/material/select';

import { AuthService } from '../../core/services/auth.service';
import { ThemeService } from '../../core/services/theme.service';
import { SupabaseService } from '../../core/services/supabase.service';
import { AvatarComponent } from '../../shared/components/avatar/avatar.component';
import { ROLE_LABELS } from '../../core/models/team.model';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    MatSidenavModule,
    MatButtonModule,
    MatDividerModule,
    MatSnackBarModule,
    MatTooltipModule,
    MatSelectModule,
    AvatarComponent,
  ],
  templateUrl: './app-layout.component.html',
  styleUrl: './app-layout.component.scss',
})
export class AppLayoutComponent {
  @ViewChild('drawer') drawer!: MatDrawer;

  readonly auth = inject(AuthService);
  readonly theme = inject(ThemeService);
  private supabase = inject(SupabaseService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  readonly uploadingAvatar = signal(false);

  get userName(): string {
    const user = this.auth.currentUser();
    return user?.fullName || user?.email?.split('@')[0] || 'User';
  }

  get userEmail(): string {
    return this.auth.currentUser()?.email ?? '';
  }

  get userRole(): string {
    const role = this.auth.currentUser()?.role;
    return role ? ROLE_LABELS[role] : '';
  }

  get avatarUrl(): string | null {
    return this.auth.currentUser()?.avatarUrl ?? null;
  }

  get canAccessSettings(): boolean {
    const role = this.auth.currentUser()?.role;
    return role === 'administrator' || role === 'executive';
  }

  get canAccessTeam(): boolean {
    const role = this.auth.currentUser()?.role;
    return role === 'administrator' || role === 'executive' || role === 'team_lead';
  }

  get initials(): string {
    return this.userName.slice(0, 2).toUpperCase();
  }

  toggleDrawer(): void {
    this.drawer.toggle();
  }

  async onAvatarChange(file: File): Promise<void> {
    this.uploadingAvatar.set(true);
    try {
      const userId = this.auth.currentUser()?.id;
      if (!userId) return;

      const ext = file.name.split('.').pop();
      const path = `${userId}/avatar.${ext}`;

      const { error } = await this.supabase.client.storage
        .from('avatars')
        .upload(path, file, { upsert: true });

      if (error) throw error;

      const { data } = this.supabase.client.storage
        .from('avatars')
        .getPublicUrl(path);

      const publicUrl = data.publicUrl + `?t=${Date.now()}`;

      // Persist to profiles table
      await this.supabase.client
        .from('profiles')
        .update({ avatar_url: data.publicUrl })
        .eq('id', userId);

      // Update the in-memory user signal
      this.auth.updateAvatarUrl(publicUrl);
      this.snackBar.open('Profile photo updated', '', { duration: 3000 });
    } catch {
      this.snackBar.open('Failed to upload photo. Please try again.', 'Dismiss', {
        duration: 4000,
        panelClass: ['snack-error'],
      });
    } finally {
      this.uploadingAvatar.set(false);
    }
  }

  async signOut(): Promise<void> {
    await this.auth.signOut();
    this.drawer.close();
    this.router.navigate(['/auth/login']);
  }

  navigateTo(path: string): void {
    this.router.navigate([path]);
    this.drawer.close();
  }
}
