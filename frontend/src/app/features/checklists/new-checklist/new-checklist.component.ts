import { Component, inject, OnInit, signal } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
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
import { TextFieldModule } from '@angular/cdk/text-field';
import { MatDividerModule } from '@angular/material/divider';

import { TeamMember } from '../../../core/models/team.model';
import { RecurrenceType, CreateChecklistDto, CreateChecklistTaskDto } from '../../../core/models/checklist.model';
import { MOCK_TEAM } from '../../../core/mock-data/team.mock';
import { SettingsService } from '../../../core/services/settings.service';
import { environment } from '../../../../environments/environment.development';

interface TaskFormGroup {
  title: FormControl<string>;
  assigneeId: FormControl<string>;
}

const RECURRENCE_OPTIONS: { value: RecurrenceType; label: string }[] = [
  { value: 'daily',   label: 'Daily'   },
  { value: 'weekly',  label: 'Weekly'  },
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly',  label: 'Yearly'  },
];

@Component({
  selector: 'app-new-checklist',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    TextFieldModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatDividerModule,
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
  readonly settingsService = inject(SettingsService);

  readonly saving = signal(false);
  readonly members = signal<TeamMember[]>([]);
  readonly recurrenceOptions = RECURRENCE_OPTIONS;

  form = this.fb.nonNullable.group({
    title:      ['', [Validators.required, Validators.minLength(2)]],
    recurrence: ['daily' as RecurrenceType, Validators.required],
    dueDate:    [this.settingsService.dueDateFor('daily'), Validators.required],
    tasks:      this.fb.array<FormGroup<TaskFormGroup>>([]),
  });

  get tasksArray(): FormArray<FormGroup<TaskFormGroup>> {
    return this.form.controls.tasks;
  }

  get titleError(): string {
    const c = this.form.controls.title;
    if (c.hasError('required')) return 'Title is required';
    if (c.hasError('minlength')) return 'Title must be at least 2 characters';
    return '';
  }

  ngOnInit(): void {
    if (environment.useMock) {
      this.members.set(MOCK_TEAM.filter(m => m.status === 'active'));
    }
    this.addTask();

    // Auto-update due date whenever recurrence changes
    this.form.controls.recurrence.valueChanges.subscribe(rec => {
      this.form.controls.dueDate.setValue(this.settingsService.dueDateFor(rec));
    });
  }

  addTask(): void {
    const group = this.fb.nonNullable.group<TaskFormGroup>({
      title:      this.fb.nonNullable.control('', Validators.required),
      assigneeId: this.fb.nonNullable.control(''),
    });
    this.tasksArray.push(group);
  }

  removeTask(index: number): void {
    if (this.tasksArray.length > 1) this.tasksArray.removeAt(index);
  }

  onTaskKeydown(event: KeyboardEvent, index: number): void {
    if (event.key !== 'Enter') return;
    event.preventDefault();
    if (index === this.tasksArray.length - 1) {
      this.addTask();
      setTimeout(() => {
        const inputs = document.querySelectorAll<HTMLInputElement>('.task-title-input');
        inputs[index + 1]?.focus();
      });
    }
  }

  setRecurrence(value: RecurrenceType): void {
    this.form.controls.recurrence.setValue(value);
  }

  async save(): Promise<void> {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }

    const raw = this.form.getRawValue();
    const tasks: CreateChecklistTaskDto[] = raw.tasks
      .filter(t => t.title.trim().length > 0)
      .map(t => ({ title: t.title.trim(), assigneeId: t.assigneeId || undefined }));

    if (tasks.length === 0) {
      this.snackBar.open('Add at least one task before saving.', '', { duration: 3000 });
      return;
    }

    const dto: CreateChecklistDto = {
      title:      raw.title.trim(),
      recurrence: raw.recurrence,
      dueDate:    raw.dueDate,
      tasks,
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
