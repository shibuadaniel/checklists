import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-avatar',
  standalone: true,
  templateUrl: './avatar.component.html',
  styleUrl: './avatar.component.scss',
})
export class AvatarComponent {
  name = input<string>('');
  photoUrl = input<string | null>(null);
  size = input<'sm' | 'md' | 'lg'>('md');
  editable = input(false);
  photoChange = output<File>();

  get initials(): string {
    return this.name()
      .split(' ')
      .slice(0, 2)
      .map(w => w[0])
      .join('')
      .toUpperCase() || '?';
  }

  onFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) this.photoChange.emit(file);
  }
}
