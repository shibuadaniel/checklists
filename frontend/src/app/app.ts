import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from './core/services/auth.service';
import { ThemeService } from './core/services/theme.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  template: '<router-outlet />',
})
export class App implements OnInit {
  private auth = inject(AuthService);
  // Inject ThemeService so its constructor runs (and theme is applied)
  // immediately on boot — before any component renders.
  private theme = inject(ThemeService);

  async ngOnInit(): Promise<void> {
    await this.auth.restoreSession();
  }
}
