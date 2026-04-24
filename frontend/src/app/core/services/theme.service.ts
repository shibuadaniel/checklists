import { Injectable, signal, effect } from '@angular/core';

export type ThemeMode = 'light' | 'dark' | 'system';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  /** The user's explicit preference (or 'system' if unset). */
  readonly mode = signal<ThemeMode>(this.savedMode());

  /** Resolved value — true when the UI is actually dark. */
  readonly isDark = signal(false);

  private readonly systemDarkQuery =
    window.matchMedia('(prefers-color-scheme: dark)');

  constructor() {
    // Resolve and apply whenever mode changes
    effect(() => this.apply(this.mode()));

    // Re-apply when the OS preference flips (only relevant in 'system' mode)
    this.systemDarkQuery.addEventListener('change', () => {
      if (this.mode() === 'system') this.apply('system');
    });
  }

  toggle(): void {
    this.mode.set(this.isDark() ? 'light' : 'dark');
    localStorage.setItem('theme', this.mode());
  }

  setMode(mode: ThemeMode): void {
    this.mode.set(mode);
    localStorage.setItem('theme', mode);
  }

  private apply(mode: ThemeMode): void {
    const dark =
      mode === 'dark' ||
      (mode === 'system' && this.systemDarkQuery.matches);

    this.isDark.set(dark);

    const html = document.documentElement;
    html.classList.toggle('dark-mode', dark);
    html.classList.toggle('light-mode', !dark);
  }

  private savedMode(): ThemeMode {
    const stored = localStorage.getItem('theme') as ThemeMode | null;
    if (stored === 'light' || stored === 'dark' || stored === 'system') {
      return stored;
    }
    return 'system'; // respect OS by default
  }
}
