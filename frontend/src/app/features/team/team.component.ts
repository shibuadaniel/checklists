import { Component, inject, OnInit, signal } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';

import { TeamMember, UserRole, ALL_ROLES, ROLE_LABELS, InviteMemberDto } from '../../core/models/team.model';
import { MOCK_TEAM } from '../../core/mock-data/team.mock';
import { AvatarComponent } from '../../shared/components/avatar/avatar.component';
import { StatusBadgeTeamComponent } from './components/status-badge-team.component';
import { AddMemberDialogComponent } from './components/add-member-dialog.component';
import { EditRoleDialogComponent } from './components/edit-role-dialog.component';
import { environment } from '../../../environments/environment.development';

type PageState = 'loading' | 'empty' | 'error' | 'success';

@Component({
  selector: 'app-team',
  standalone: true,
  imports: [
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatTooltipModule,
    AvatarComponent,
    StatusBadgeTeamComponent,
  ],
  templateUrl: './team.component.html',
  styleUrl: './team.component.scss',
})
export class TeamComponent implements OnInit {
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  readonly state = signal<PageState>('loading');
  readonly members = signal<TeamMember[]>([]);
  readonly errorMessage = signal('');

  readonly displayedColumns = ['member', 'role', 'email', 'status', 'actions'];
  readonly roleLabels = ROLE_LABELS;

  getRoleLabel(role: string): string {
    return ROLE_LABELS[role as UserRole] ?? role;
  }

  async ngOnInit(): Promise<void> {
    await this.loadTeam();
  }

  async loadTeam(): Promise<void> {
    this.state.set('loading');
    try {
      // BACKEND: GET /api/team
      await new Promise(r => setTimeout(r, 500));
      const data = environment.useMock ? MOCK_TEAM : [];
      this.members.set(data);
      this.state.set(data.length === 0 ? 'empty' : 'success');
    } catch {
      this.errorMessage.set('Failed to load team members.');
      this.state.set('error');
    }
  }

  openAddMember(): void {
    const ref = this.dialog.open(AddMemberDialogComponent, {
      width: '440px',
      maxWidth: '95vw',
      panelClass: 'app-dialog',
    });

    ref.afterClosed().subscribe(async (dto: InviteMemberDto | undefined) => {
      if (!dto) return;
      await this.inviteMember(dto);
    });
  }

  openEditRole(member: TeamMember): void {
    const ref = this.dialog.open(EditRoleDialogComponent, {
      width: '380px',
      maxWidth: '95vw',
      panelClass: 'app-dialog',
      data: { member },
    });

    ref.afterClosed().subscribe((newRole: UserRole | undefined) => {
      if (!newRole) return;
      this.members.update(list =>
        list.map(m => m.id === member.id ? { ...m, role: newRole } : m)
      );
      this.snackBar.open(`Role updated to ${ROLE_LABELS[newRole]}`, '', { duration: 3000 });
    });
  }

  private async inviteMember(dto: InviteMemberDto): Promise<void> {
    try {
      // BACKEND: POST /api/team/invite — calls supabase.auth.admin.inviteUserByEmail()
      // Requires a Supabase Edge Function with service_role key
      await new Promise(r => setTimeout(r, 800));

      const newMember: TeamMember = {
        id: crypto.randomUUID(),
        name: dto.name,
        email: dto.email,
        role: dto.role,
        status: 'invited',
        dateAdded: new Date().toISOString(),
      };
      this.members.update(list => [...list, newMember]);
      this.snackBar.open(`Invite sent to ${dto.email}`, '', { duration: 4000 });
    } catch {
      this.snackBar.open('Failed to send invite. Please try again.', 'Dismiss', {
        duration: 5000,
        panelClass: ['snack-error'],
      });
    }
  }
}
