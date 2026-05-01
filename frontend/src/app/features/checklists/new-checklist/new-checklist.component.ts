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
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { TextFieldModule } from '@angular/cdk/text-field';
import { MatDividerModule } from '@angular/material/divider';

import { Team, TeamMember } from '../../../core/models/team.model';
import {
  AssignmentMode,
  RecurrenceType,
  CreateChecklistDto,
  CreateChecklistTaskDto,
} from '../../../core/models/checklist.model';
import { MOCK_TEAM, MOCK_TEAMS } from '../../../core/mock-data/team.mock';
import { SettingsService } from '../../../core/services/settings.service';
import { ChecklistModeService } from '../../../core/services/checklist-mode.service';
import { environment } from '../../../../environments/environment.development';
import {
  CHECKLIST_IMPORT_NAV_STATE_KEY,
  type ChecklistImportNavPayload,
} from '../checklist-import-nav';

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
    MatCardModule,
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
  readonly checklistModeService = inject(ChecklistModeService);

  readonly saving = signal(false);
  readonly members = signal<TeamMember[]>([]);
  readonly teams = signal<Team[]>([]);
  readonly assignmentMode = signal<AssignmentMode>('team');
  readonly recurrenceOptions = RECURRENCE_OPTIONS;

  form = this.fb.nonNullable.group({
    title:          ['', [Validators.required, Validators.minLength(2)]],
    recurrence:     ['daily' as RecurrenceType, Validators.required],
    dueDate:        [this.settingsService.dueDateFor('daily'), Validators.required],
    assignedTeamId: [''],
    tasks:          this.fb.array<FormGroup<TaskFormGroup>>([]),
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
      this.teams.set(MOCK_TEAMS);
    }

    const imported = this.consumeImportFromNavigationState();
    if (imported) {
      this.applyImportedChecklist(imported.title, imported.tasks);
    } else {
      this.addTask();
    }

    // Auto-update due date whenever recurrence changes
    this.form.controls.recurrence.valueChanges.subscribe(rec => {
      this.form.controls.dueDate.setValue(this.settingsService.dueDateFor(rec));
    });
  }

  private consumeImportFromNavigationState(): ChecklistImportNavPayload | null {
    const state = history.state as Record<string, unknown> | null | undefined;
    const raw = state?.[CHECKLIST_IMPORT_NAV_STATE_KEY];
    if (!raw || typeof raw !== 'object') return null;
    const payload = raw as { title?: unknown; tasks?: unknown };
    if (typeof payload.title !== 'string' || !Array.isArray(payload.tasks)) return null;
    const tasks = payload.tasks.filter((t): t is string => typeof t === 'string' && t.length > 0);
    if (tasks.length === 0) return null;
    const nextState = { ...state };
    delete nextState[CHECKLIST_IMPORT_NAV_STATE_KEY];
    history.replaceState(nextState, '');
    return { title: payload.title, tasks };
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

  private applyImportedChecklist(title: string, taskTitles: string[]): void {
    this.form.controls.title.setValue(title);
    while (this.tasksArray.length > 0) {
      this.tasksArray.removeAt(0);
    }
    for (const t of taskTitles) {
      const group = this.fb.nonNullable.group<TaskFormGroup>({
        title: this.fb.nonNullable.control(t, Validators.required),
        assigneeId: this.fb.nonNullable.control(''),
      });
      this.tasksArray.push(group);
    }
    this.snackBar.open('Imported title and tasks replaced the form.', '', { duration: 3500 });
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

  setAssignmentMode(mode: AssignmentMode): void {
    this.assignmentMode.set(mode);
    if (mode === 'team') {
      this.tasksArray.controls.forEach(g => g.controls.assigneeId.setValue(''));
    } else {
      this.form.controls.assignedTeamId.setValue('');
    }
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

    const checklistMode = this.checklistModeService.mode();
    const mode = this.assignmentMode();
    if (checklistMode === 'practice' && mode === 'team' && !raw.assignedTeamId) {
      this.snackBar.open('Please select a team to assign this checklist to.', '', { duration: 3000 });
      return;
    }
    if (checklistMode === 'practice' && mode === 'member' && tasks.every(t => !t.assigneeId)) {
      this.snackBar.open('Please assign at least one task to a team member.', '', { duration: 3000 });
      return;
    }

    const normalizedTasks = checklistMode === 'personal'
      ? tasks.map(t => ({ ...t, assigneeId: undefined }))
      : tasks;

    const dto: CreateChecklistDto = {
      title:          raw.title.trim(),
      recurrence:     raw.recurrence,
      dueDate:        raw.dueDate,
      tasks: normalizedTasks,
      checklistMode,
      assignmentMode: checklistMode === 'practice' ? mode : undefined,
      assignedTeamId: checklistMode === 'practice' && mode === 'team' ? raw.assignedTeamId : undefined,
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
