import { Injectable, signal } from '@angular/core';
import { SystemSettings, DEFAULT_SETTINGS } from '../models/settings.model';
import { RecurrenceType } from '../models/checklist.model';

const STORAGE_KEY = 'app_settings';

@Injectable({ providedIn: 'root' })
export class SettingsService {
  readonly settings = signal<SystemSettings>(this.load());

  update(patch: Partial<SystemSettings>): void {
    const next = { ...this.settings(), ...patch };
    this.settings.set(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }

  /**
   * Returns the default due date (YYYY-MM-DD) for a given recurrence type.
   *
   * - Daily   → today (end of day is tracked via endOfDay setting)
   * - Weekly  → coming Sunday (week starts Monday; if today is Sunday, use today)
   * - Monthly → last day of the current month
   * - Yearly  → 31 December of the current year
   */
  dueDateFor(recurrence: RecurrenceType): string {
    const now = new Date();
    let due: Date;

    switch (recurrence) {
      case 'daily':
        due = new Date(now);
        break;

      case 'weekly': {
        const day = now.getDay(); // 0=Sun … 6=Sat
        const daysUntilSunday = day === 0 ? 0 : 7 - day;
        due = new Date(now);
        due.setDate(now.getDate() + daysUntilSunday);
        break;
      }

      case 'monthly':
        // Day 0 of next month = last day of current month
        due = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        break;

      case 'yearly':
        due = new Date(now.getFullYear(), 11, 31);
        break;
    }

    return due.toISOString().split('T')[0]; // YYYY-MM-DD
  }

  private load(): SystemSettings {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
    } catch { /* ignore */ }
    return { ...DEFAULT_SETTINGS };
  }
}
