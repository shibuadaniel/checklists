import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

import { Team } from '../../../core/models/team.model';

@Component({
  selector: 'app-create-team-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
  ],
  template: `
    <h2 mat-dialog-title class="dialog-title">
      <i class="fa-solid fa-people-group" aria-hidden="true"></i>
      Create team
    </h2>

    <mat-dialog-content class="dialog-content">
      <form [formGroup]="form" novalidate>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Team name</mat-label>
          <input
            matInput
            formControlName="name"
            placeholder="e.g. Front-office"
            autocomplete="off"
            (keyup.enter)="create()"
          />
          @if (form.controls.name.invalid && form.controls.name.touched) {
            <mat-error>{{ nameError }}</mat-error>
          }
        </mat-form-field>
      </form>
    </mat-dialog-content>

    <mat-dialog-actions align="end" class="dialog-actions">
      <button mat-button (click)="cancel()">Cancel</button>
      <button mat-flat-button (click)="create()" class="create-btn">
        <i class="fa-solid fa-check" aria-hidden="true"></i>
        Create
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .dialog-title { display: flex; align-items: center; gap: 10px; margin: 0; i { color: var(--mat-sys-primary); } }
    .dialog-content { padding-top: 4px !important; min-width: 320px; }
    .full-width { width: 100%; margin-top: 8px; }
    .create-btn { display: flex; align-items: center; gap: 8px; }
  `],
})
export class CreateTeamDialogComponent {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<CreateTeamDialogComponent>);

  form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
  });

  get nameError(): string {
    const c = this.form.controls.name;
    if (c.hasError('required')) return 'Team name is required';
    if (c.hasError('minlength')) return 'Name must be at least 2 characters';
    return '';
  }

  cancel(): void { this.dialogRef.close(); }

  create(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const partial: Omit<Team, 'id'> = { name: this.form.getRawValue().name.trim() };
    this.dialogRef.close(partial);
  }
}
