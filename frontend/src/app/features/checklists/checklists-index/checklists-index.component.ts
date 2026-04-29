import { Component, signal } from '@angular/core';
import { TitleCasePipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';

import { Checklist } from '../../../core/models/checklist.model';
import { MOCK_DASHBOARD } from '../../../core/mock-data/dashboard.mock';

@Component({
  selector: 'app-checklists-hub',
  standalone: true,
  imports: [TitleCasePipe, MatCardModule, MatDividerModule],
  templateUrl: './checklists-index.component.html',
  styleUrl: './checklists-index.component.scss',
})
export class ChecklistsIndexComponent {
  /**
   * Until 3.1 (Supabase), hub uses dashboard mock rows; replace with API data later.
   */
  readonly checklists = signal<Checklist[]>(MOCK_DASHBOARD.checklists);
}
