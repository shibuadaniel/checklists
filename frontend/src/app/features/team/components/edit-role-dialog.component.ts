import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';

import { TeamMember, UserRole, ALL_ROLES, ROLE_LABELS } from '../../../core/models/team.model';

@Component({
  selector: 'app-edit-role-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatSelectModule,
    MatFormFieldModule,
    MatButtonModule,
  ],
  template: `
    <h2 mat-dialog-title class="dialog-title">
      <i class="fa-solid fa-pen" aria-hidden="true"></i>
      Edit role — {{ data.member.name }}
    </h2>
    <button mat-icon-button mat-dialog-close class="dialog-close" aria-label="Close dialog">
      <i class="fa-solid fa-xmark" aria-hidden="true"></i>
    </button>
    <mat-dialog-content class="dialog-content">
      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Role</mat-label>
        <mat-select [formControl]="roleControl">
          @for (role of allRoles; track role) {
            <mat-option [value]="role">{{ roleLabels[role] }}</mat-option>
          }
        </mat-select>
      </mat-form-field>
    </mat-dialog-content>
    <mat-dialog-actions class="dialog-actions">
      <button mat-button (click)="cancel()">Cancel</button>
      <button mat-flat-button (click)="save()">Save</button>
    </mat-dialog-actions>
  `,
  styles: [`
    .dialog-title { display:flex; align-items:center; gap:10px; i { color:var(--mat-sys-primary); } }
    .dialog-content { padding-top: 4px !important; }
    .full-width { width: 100%; }
  `],
})
export class EditRoleDialogComponent {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<EditRoleDialogComponent>);
  readonly data: { member: TeamMember } = inject(MAT_DIALOG_DATA);

  readonly allRoles = ALL_ROLES;
  readonly roleLabels = ROLE_LABELS;

  roleControl = this.fb.nonNullable.control<UserRole>(
    this.data.member.role,
    Validators.required,
  );

  cancel(): void { this.dialogRef.close(); }
  save(): void { this.dialogRef.close(this.roleControl.value); }
}
