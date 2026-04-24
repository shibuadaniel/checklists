import { Component, input } from '@angular/core';
import { MemberStatus } from '../../../core/models/team.model';

const LABELS: Record<MemberStatus, string> = {
  active: 'Active',
  invited: 'Invited',
  inactive: 'Inactive',
};

@Component({
  selector: 'app-status-badge-team',
  standalone: true,
  template: `<span class="badge" [class]="'badge--' + status()" [attr.aria-label]="'Status: ' + label()">{{ label() }}</span>`,
  styles: [`
    .badge {
      display: inline-flex;
      align-items: center;
      padding: 3px 10px;
      border-radius: 99px;
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      white-space: nowrap;
    }
    .badge--active   { background: #dcfce7; color: #2d7a50; }
    .badge--invited  { background: #ede9fe; color: #6d4eaa; }
    .badge--inactive { background: #f5f5f5; color: #737373; }
  `],
})
export class StatusBadgeTeamComponent {
  status = input.required<MemberStatus>();
  label(): string { return LABELS[this.status()]; }
}
