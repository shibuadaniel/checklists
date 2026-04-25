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

  private auth = inject(AuthService);
  readonly theme = inject(ThemeService);
  private supabase = inject(SupabaseService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  readonly avatarUrl = signal<string | null>(null);
  readonly uploadingAvatar = signal(false);

  get userName(): string {
    const email = this.auth.currentUser()?.email ?? '';
    return email.split('@')[0] ?? 'User';
  }

  get userEmail(): string {
    return this.auth.currentUser()?.email ?? '';
  }

  get userRole(): string {
    const role = this.auth.currentUser()?.role;
    return role ? ROLE_LABELS[role] : '';
  }

  get canAccessSettings(): boolean {
    const role = this.auth.currentUser()?.role;
    // In mock mode with no logged-in user, show settings for demo purposes
    if (!role) return true;
    return role === 'administrator' || role === 'executive';
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

      // BACKEND: POST /storage/v1/object/avatars/:path
      const { error } = await this.supabase.client.storage
        .from('avatars')
        .upload(path, file, { upsert: true });

      if (error) throw error;

      const { data } = this.supabase.client.storage
        .from('avatars')
        .getPublicUrl(path);

      this.avatarUrl.set(data.publicUrl + `?t=${Date.now()}`);
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
