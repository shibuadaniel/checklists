import { Component, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { DatePipe, TitleCasePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatRippleModule } from '@angular/material/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BaseChartDirective } from 'ng2-charts';
import { ChartData, ChartOptions } from 'chart.js';
import {
  Chart,
  ArcElement,
  DoughnutController,
  Tooltip,
  Legend,
} from 'chart.js';

import { StatCardComponent } from '../../shared/components/stat-card/stat-card.component';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';
import { AuthService } from '../../core/services/auth.service';
import { ThemeService } from '../../core/services/theme.service';
import { DashboardSummary, Checklist } from '../../core/models/checklist.model';
import { MOCK_DASHBOARD } from '../../core/mock-data/dashboard.mock';
import { environment } from '../../../environments/environment.development';

Chart.register(ArcElement, DoughnutController, Tooltip, Legend);

type PageState = 'loading' | 'empty' | 'error' | 'success';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    DatePipe,
    TitleCasePipe,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatProgressBarModule,
    MatRippleModule,
    MatTooltipModule,
    BaseChartDirective,
    StatCardComponent,
    StatusBadgeComponent,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {
  private router = inject(Router);
  private auth = inject(AuthService);
  readonly theme = inject(ThemeService);

  readonly state = signal<PageState>('loading');
  readonly data = signal<DashboardSummary | null>(null);
  readonly errorMessage = signal('');

  get userName(): string {
    return this.auth.currentUser()?.email?.split('@')[0] ?? 'there';
  }

  donutData: ChartData<'doughnut'> = { labels: [], datasets: [] };

  readonly donutOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '70%',
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: ctx => ` ${ctx.label}: ${ctx.parsed}%`,
        },
      },
    },
  };

  async ngOnInit(): Promise<void> {
    await this.loadDashboard();
  }

  async loadDashboard(): Promise<void> {
    this.state.set('loading');
    try {
      // BACKEND: GET /api/dashboard/summary
      await new Promise(r => setTimeout(r, 600));

      const summary = environment.useMock
        ? MOCK_DASHBOARD
        : await this.fetchFromApi();

      this.data.set(summary);
      this.buildChart(summary.checklists);
      this.state.set(summary.checklists.length === 0 ? 'empty' : 'success');
    } catch {
      this.errorMessage.set('Failed to load dashboard. Please try again.');
      this.state.set('error');
    }
  }

  private buildChart(checklists: Checklist[]): void {
    const active = checklists.filter(c => c.completionRate < 100);
    this.donutData = {
      labels: active.map(c => c.name),
      datasets: [
        {
          data: active.map(c => c.completionRate),
          backgroundColor: [
            '#f9a8d4', // pastel rose
            '#93c5fd', // pastel blue
            '#86efac', // pastel green
            '#fde68a', // pastel amber
            '#c4b5fd', // pastel violet
            '#99f6e4', // pastel teal
          ],
          borderWidth: 0,
          hoverOffset: 4,
        },
      ],
    };
  }

  private async fetchFromApi(): Promise<DashboardSummary> {
    // BACKEND: GET /api/dashboard/summary
    throw new Error('API not yet connected');
  }

  navigateToChecklist(id: string): void {
    this.router.navigate(['/checklists', id]);
  }

  createChecklist(): void {
    this.router.navigate(['/checklists', 'new']);
  }

  getProgressColor(rate: number): string {
    if (rate >= 80) return 'success';
    if (rate >= 50) return 'warn';
    return 'error';
  }

  isOverdue(dateStr?: string): boolean {
    if (!dateStr) return false;
    return new Date(dateStr) < new Date();
  }
}
