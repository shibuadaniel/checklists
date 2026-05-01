import {
  Component,
  computed,
  inject,
  OnDestroy,
  OnInit,
  signal,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, RouterLink, RouterOutlet } from '@angular/router';
import { MatDrawer, MatSidenavModule } from '@angular/material/sidenav';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSelectModule } from '@angular/material/select';
import { MatMenuModule } from '@angular/material/menu';
import { filter, Subscription } from 'rxjs';

import { AuthService } from '../../core/services/auth.service';
import { ThemeService } from '../../core/services/theme.service';
import { SupabaseService } from '../../core/services/supabase.service';
import { ChecklistModeService } from '../../core/services/checklist-mode.service';
import { AvatarComponent } from '../../shared/components/avatar/avatar.component';
import { ChecklistMode } from '../../core/models/checklist.model';
import {
  CHECKLIST_ACCESS_ROLES,
  parseUserRole,
  ROLE_LABELS,
  UserRole,
} from '../../core/models/team.model';

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
    MatMenuModule,
    AvatarComponent,
  ],
  templateUrl: './app-layout.component.html',
  styleUrl: './app-layout.component.scss',
})
export class AppLayoutComponent implements OnInit, OnDestroy {
  @ViewChild('drawer') drawer!: MatDrawer;

  readonly auth = inject(AuthService);
  readonly theme = inject(ThemeService);
  private supabase = inject(SupabaseService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private snackBar = inject(MatSnackBar);
  readonly checklistModeService = inject(ChecklistModeService);

  readonly uploadingAvatar = signal(false);
  private navigationSub?: Subscription;

  /** Signal-based so the header updates when session restore sets the user. */
  readonly canAccessChecklists = computed(() => {
    const user = this.auth.currentUser();
    if (!user) return false;
    const role = parseUserRole(user.role) ?? 'team_member';
    return CHECKLIST_ACCESS_ROLES.includes(role);
  });

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

  ngOnInit(): void {
    this.syncChecklistModeFromUrl();
    this.navigationSub = this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe(() => this.syncChecklistModeFromUrl());
  }

  ngOnDestroy(): void {
    this.navigationSub?.unsubscribe();
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

  navigateToNewChecklistBuild(): void {
    this.router.navigate(['/checklists/new']);
  }

  navigateToNewChecklistImport(): void {
    this.router.navigate(['/checklists/import']);
  }

  setChecklistMode(mode: ChecklistMode): void {
    this.checklistModeService.setMode(mode);
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { mode },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }

  private syncChecklistModeFromUrl(): void {
    const mode = this.router.parseUrl(this.router.url).queryParams['mode'];
    this.checklistModeService.syncFromQueryParams({ mode });
  }
}
