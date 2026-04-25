import { Component, inject, OnInit, signal } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormControl,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { TeamMember } from '../../../core/models/team.model';
import { CreateChecklistDto } from '../../../core/models/checklist.model';
import { MOCK_TEAM } from '../../../core/mock-data/team.mock';
import { environment } from '../../../../environments/environment.development';

@Component({
  selector: 'app-new-checklist',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatSnackBarModule,
  ],
  templateUrl: './new-checklist.component.html',
  styleUrl: './new-checklist.component.scss',
})
export class NewChecklistComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  readonly saving = signal(false);
  readonly members = signal<TeamMember[]>([]);

  form = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.minLength(2)]],
    assigneeId: [''],
    tasks: this.fb.array<FormControl<string>>([]),
  });

  get tasksArray(): FormArray<FormControl<string>> {
    return this.form.controls.tasks;
  }

  get titleError(): string {
    const c = this.form.controls.title;
    if (c.hasError('required')) return 'Title is required';
    if (c.hasError('minlength')) return 'Title must be at least 2 characters';
    return '';
  }

  ngOnInit(): void {
    // Load team members for the assignee dropdown
    if (environment.useMock) {
      this.members.set(MOCK_TEAM.filter(m => m.status === 'active'));
    }
    // Start with one empty task row
    this.addTask();
  }

  addTask(value = ''): void {
    const control = this.fb.nonNullable.control(value, Validators.required);
    this.tasksArray.push(control);
  }

  removeTask(index: number): void {
    if (this.tasksArray.length > 1) {
      this.tasksArray.removeAt(index);
    }
  }

  onTaskKeydown(event: KeyboardEvent, index: number): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      // If this is the last row, add a new one; otherwise move focus to next
      if (index === this.tasksArray.length - 1) {
        this.addTask();
        // Focus the new input after DOM update
        setTimeout(() => {
          const inputs = document.querySelectorAll<HTMLInputElement>('.task-input');
          inputs[index + 1]?.focus();
        });
      }
    }
  }

  async save(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    const nonEmptyTasks = raw.tasks.filter(t => t.trim().length > 0);

    if (nonEmptyTasks.length === 0) {
      this.snackBar.open('Add at least one task before saving.', '', { duration: 3000 });
      return;
    }

    const dto: CreateChecklistDto = {
      title: raw.title.trim(),
      tasks: nonEmptyTasks,
      assigneeId: raw.assigneeId || undefined,
    };

    this.saving.set(true);
    try {
      // BACKEND: POST /api/checklists
      await new Promise(r => setTimeout(r, 700));
      this.snackBar.open(`"${dto.title}" created!`, '', { duration: 3000 });
      this.router.navigate(['/dashboard']);
    } catch {
      this.snackBar.open('Failed to save. Please try again.', 'Dismiss', {
        duration: 5000,
        panelClass: ['snack-error'],
      });
    } finally {
      this.saving.set(false);
    }
  }

  cancel(): void {
    this.router.navigate(['/dashboard']);
  }
}
