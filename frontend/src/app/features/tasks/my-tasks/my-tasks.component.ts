import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDividerModule } from '@angular/material/divider';

import { MyTask } from '../../../core/models/checklist.model';
import { MOCK_MY_TASKS } from '../../../core/mock-data/tasks.mock';
import { AuthService } from '../../../core/services/auth.service';
import { ChecklistModeService } from '../../../core/services/checklist-mode.service';
import { environment } from '../../../../environments/environment.development';

type GroupMode = 'checklist' | 'status';

interface ChecklistGroup {
  checklistId: string;
  checklistName: string;
  pending: MyTask[];
  completed: MyTask[];
}

@Component({
  selector: 'app-my-tasks',
  standalone: true,
  imports: [MatCardModule, MatCheckboxModule, MatDividerModule],
  templateUrl: './my-tasks.component.html',
  styleUrl: './my-tasks.component.scss',
})
export class MyTasksComponent implements OnInit {
  private auth = inject(AuthService);
  readonly checklistModeService = inject(ChecklistModeService);

  readonly groupMode = signal<GroupMode>('checklist');
  readonly tasks = signal<MyTask[]>([]);

  readonly visibleTasks = computed(() => {
    const mode = this.checklistModeService.mode();
    return this.tasks().filter(task =>
      mode === 'personal' ? task.checklistMode === 'personal' : task.checklistMode !== 'personal',
    );
  });

  readonly pendingTasks = computed(() =>
    this.visibleTasks()
      .filter(t => !t.completed)
      .sort((a, b) => this.dueSortKey(a.dueDate) - this.dueSortKey(b.dueDate)),
  );
  readonly completedTasks = computed(() => this.visibleTasks().filter(t => t.completed));

  readonly tasksByChecklist = computed<ChecklistGroup[]>(() => {
    const map = new Map<string, ChecklistGroup>();
    for (const task of this.visibleTasks()) {
      if (!map.has(task.checklistId)) {
        map.set(task.checklistId, {
          checklistId: task.checklistId,
          checklistName: task.checklistName,
          pending: [],
          completed: [],
        });
      }
      const group = map.get(task.checklistId)!;
      if (task.completed) group.completed.push(task);
      else group.pending.push(task);
    }
    return Array.from(map.values());
  });

  readonly activeGroupMode = computed<GroupMode>(() =>
    this.isPersonalMode ? 'status' : this.groupMode(),
  );

  ngOnInit(): void {
    if (environment.useMock) {
      // BACKEND: GET /api/tasks?assigneeId=currentUser.id (member)
      //          or GET /api/tasks?teamId=currentUser.teamId (team_lead)
      this.tasks.set([...MOCK_MY_TASKS]);
    }
  }

  setGroupMode(mode: GroupMode): void {
    this.groupMode.set(mode);
  }

  get isPersonalMode(): boolean {
    return this.checklistModeService.mode() === 'personal';
  }

  toggleTask(task: MyTask): void {
    this.tasks.update(all =>
      all.map(t => t.id === task.id ? { ...t, completed: !t.completed } : t),
    );
  }

  // Sort key: today (0) → overdue by recency → future by date → no date last
  private dueSortKey(iso?: string): number {
    if (!iso) return Number.MAX_SAFE_INTEGER;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(iso);
    due.setHours(0, 0, 0, 0);
    const diffDays = Math.round((due.getTime() - today.getTime()) / 86400000);
    if (diffDays === 0) return 0;                   // today — always first
    if (diffDays > 0) return 1_000 + diffDays;      // future — soonest next
    return 500 + Math.abs(diffDays);                // overdue — most recent first
  }

  formatDueDate(iso?: string): string {
    if (!iso) return '';
    const d = new Date(iso);
    d.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diff = Math.round((d.getTime() - today.getTime()) / 86400000);
    if (diff === 0) return 'Today';
    if (diff === -1) return 'Yesterday';
    if (diff < -1) return `${Math.abs(diff)}d overdue`;
    if (diff === 1) return 'Tomorrow';
    return `In ${diff}d`;
  }

  isOverdue(iso?: string): boolean {
    if (!iso) return false;
    const d = new Date(iso);
    d.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return d < today;
  }
}
