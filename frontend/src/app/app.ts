import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ThemeService } from './core/services/theme.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  template: '<router-outlet />',
})
export class App {
  // Inject ThemeService so its constructor runs (and theme is applied)
  // immediately on boot — before any component renders.
  private theme = inject(ThemeService);
}
