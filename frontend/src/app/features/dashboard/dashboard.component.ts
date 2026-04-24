import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [MatButtonModule, MatIconModule],
  template: `
    <div style="padding: 32px; text-align: center;">
      <mat-icon style="font-size: 48px; width: 48px; height: 48px; color: var(--mat-sys-primary)">
        check_circle
      </mat-icon>
      <h1>Dashboard</h1>
      <p>Coming soon — checklist overview and completion rates.</p>
    </div>
  `,
})
export class DashboardComponent {}
