import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { SettingsService } from '../../core/services/settings.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSnackBarModule,
  ],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss',
})
export class SettingsComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);
  readonly settingsService = inject(SettingsService);

  readonly saving = signal(false);

  form = this.fb.nonNullable.group({
    startOfDay: [this.settingsService.settings().startOfDay, [Validators.required, Validators.pattern(/^\d{2}:\d{2}$/)]],
    endOfDay:   [this.settingsService.settings().endOfDay,   [Validators.required, Validators.pattern(/^\d{2}:\d{2}$/)]],
  });

  async save(): Promise<void> {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving.set(true);
    await new Promise(r => setTimeout(r, 300));
    const raw = this.form.getRawValue();
    this.settingsService.update({ startOfDay: raw.startOfDay, endOfDay: raw.endOfDay });
    this.snackBar.open('Settings saved', '', { duration: 3000 });
    this.saving.set(false);
  }

  cancel(): void {
    this.router.navigate(['/dashboard']);
  }
}
