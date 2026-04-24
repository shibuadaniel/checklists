import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment.development';
import { DashboardSummary } from '../models/checklist.model';
import { MOCK_DASHBOARD } from '../mock-data/dashboard.mock';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);
  private base = environment.supabase.url;

  async getDashboardSummary(): Promise<DashboardSummary> {
    if (environment.useMock) return MOCK_DASHBOARD;
    // BACKEND: GET /api/dashboard/summary
    return firstValueFrom(
      this.http.get<DashboardSummary>(`${this.base}/rest/v1/dashboard_summary`),
    );
  }
}
