import { Component, input } from '@angular/core';
import { ChecklistStatus } from '../../../core/models/checklist.model';

const LABEL_MAP: Record<ChecklistStatus, string> = {
  active: 'Active',
  completed: 'Completed',
  overdue: 'Overdue',
  paused: 'Paused',
};

@Component({
  selector: 'app-status-badge',
  standalone: true,
  template: `<span class="badge" [class]="'badge--' + status()" [attr.aria-label]="'Status: ' + label()">{{ label() }}</span>`,
  styleUrl: './status-badge.component.scss',
})
export class StatusBadgeComponent {
  status = input.required<ChecklistStatus>();
  label(): string { return LABEL_MAP[this.status()]; }
}
