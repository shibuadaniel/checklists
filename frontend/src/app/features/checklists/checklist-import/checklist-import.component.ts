import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import {
  CHECKLIST_IMPORT_MAX_FILE_BYTES,
  CHECKLIST_IMPORT_MAX_TASKS,
  parseChecklistImportFile,
} from '../checklist-file-import.parser';
import { ImportChecklistDialogComponent } from '../import-checklist-dialog/import-checklist-dialog.component';
import {
  CHECKLIST_IMPORT_NAV_STATE_KEY,
  type ChecklistImportNavPayload,
} from '../checklist-import-nav';

@Component({
  selector: 'app-checklist-import',
  standalone: true,
  imports: [
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatDialogModule,
  ],
  templateUrl: './checklist-import.component.html',
  styleUrl: './checklist-import.component.scss',
})
export class ChecklistImportComponent {
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);

  readonly importMaxTasks = CHECKLIST_IMPORT_MAX_TASKS;
  readonly importMaxFileMb = CHECKLIST_IMPORT_MAX_FILE_BYTES / (1024 * 1024);

  /** Drag enter/leave nesting counter so highlighting does not flicker over children. */
  private dragDepth = 0;
  readonly dropActive = signal(false);

  cancel(): void {
    void this.router.navigate(['/checklists']);
  }

  onDragEnter(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.dragDepth++;
    this.dropActive.set(true);
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.dragDepth = Math.max(0, this.dragDepth - 1);
    if (this.dragDepth === 0) {
      this.dropActive.set(false);
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'copy';
    }
  }

  async onDrop(event: DragEvent): Promise<void> {
    event.preventDefault();
    event.stopPropagation();
    this.dragDepth = 0;
    this.dropActive.set(false);
    const file = event.dataTransfer?.files?.[0];
    await this.processFile(file);
  }

  async onFileSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    await this.processFile(file);
  }

  triggerFileInput(input: HTMLInputElement): void {
    input.click();
  }

  private async processFile(file: File | undefined): Promise<void> {
    if (!file) return;

    const parsed = await parseChecklistImportFile(file);
    if (!parsed.ok) {
      this.snackBar.open(parsed.message, 'Dismiss', { duration: 8000 });
      return;
    }

    const ref = this.dialog.open(ImportChecklistDialogComponent, {
      width: 'min(480px, calc(100vw - 32px))',
      data: { title: parsed.title, tasks: parsed.tasks },
      disableClose: false,
    });
    const close = await firstValueFrom(ref.afterClosed());
    if (!close?.apply) return;

    const payload: ChecklistImportNavPayload = {
      title: parsed.title,
      tasks: parsed.tasks,
    };
    await this.router.navigate(['/checklists/new'], {
      state: { [CHECKLIST_IMPORT_NAV_STATE_KEY]: payload },
    });
  }
}
