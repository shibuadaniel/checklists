import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { ALL_ROLES, ROLE_LABELS, InviteMemberDto } from '../../../core/models/team.model';

@Component({
  selector: 'app-add-member-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './add-member-dialog.component.html',
  styleUrl: './add-member-dialog.component.scss',
})
export class AddMemberDialogComponent {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<AddMemberDialogComponent>);

  readonly allRoles = ALL_ROLES;
  readonly roleLabels = ROLE_LABELS;
  sending = false;

  form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    role: ['team_member' as const, Validators.required],
  });

  get nameError(): string {
    const c = this.form.controls.name;
    if (c.hasError('required')) return 'Name is required';
    if (c.hasError('minlength')) return 'Name must be at least 2 characters';
    return '';
  }

  get emailError(): string {
    const c = this.form.controls.email;
    if (c.hasError('required')) return 'Email is required';
    if (c.hasError('email')) return 'Enter a valid email address';
    return '';
  }

  cancel(): void { this.dialogRef.close(); }

  async send(): Promise<void> {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.sending = true;
    await new Promise(r => setTimeout(r, 200));
    this.dialogRef.close(this.form.getRawValue() as InviteMemberDto);
  }
}
