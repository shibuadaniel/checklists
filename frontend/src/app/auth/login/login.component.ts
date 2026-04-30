import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { AuthService } from '../../core/services/auth.service';
import { ChecklistModeService } from '../../core/services/checklist-mode.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);
  private checklistMode = inject(ChecklistModeService);

  readonly isLoading = this.auth.isLoading;
  readonly hidePassword = signal(true);

  form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  get emailError(): string {
    const c = this.form.controls.email;
    if (c.hasError('required')) return 'Email is required';
    if (c.hasError('email')) return 'Enter a valid email address';
    return '';
  }

  get passwordError(): string {
    const c = this.form.controls.password;
    if (c.hasError('required')) return 'Password is required';
    if (c.hasError('minlength')) return 'Password must be at least 8 characters';
    return '';
  }

  togglePassword(): void {
    this.hidePassword.update(v => !v);
  }

  tryDemo(): void {
    this.auth.signInAsDemo();
    this.checklistMode.setMode('practice');
    this.router.navigate(['/dashboard'], { queryParams: { mode: 'practice' } });
  }

  async onSubmit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { email, password } = this.form.getRawValue();
    try {
      await this.auth.signIn(email, password);
      this.router.navigate(['/dashboard']);
    } catch {
      this.snackBar.open('Invalid email or password. Please try again.', 'Dismiss', {
        duration: 5000,
        panelClass: ['snack-error'],
      });
    }
  }
}
