import { Injectable, signal } from '@angular/core';
import { Params } from '@angular/router';

import { ChecklistMode } from '../models/checklist.model';

const MODE_STORAGE_KEY = 'checklists.mode';

@Injectable({ providedIn: 'root' })
export class ChecklistModeService {
  readonly mode = signal<ChecklistMode>(this.loadStoredMode());

  setMode(mode: ChecklistMode): void {
    this.mode.set(mode);
    this.persistMode(mode);
  }

  syncFromQueryParams(params: Params): void {
    const rawMode = params['mode'];
    const nextMode = this.parseMode(rawMode);
    if (!nextMode) return;
    this.setMode(nextMode);
  }

  private parseMode(value: unknown): ChecklistMode | null {
    if (value === 'personal' || value === 'practice') return value;
    return null;
  }

  private loadStoredMode(): ChecklistMode {
    if (typeof localStorage === 'undefined') return 'practice';
    const stored = localStorage.getItem(MODE_STORAGE_KEY);
    return this.parseMode(stored) ?? 'practice';
  }

  private persistMode(mode: ChecklistMode): void {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem(MODE_STORAGE_KEY, mode);
  }
}
