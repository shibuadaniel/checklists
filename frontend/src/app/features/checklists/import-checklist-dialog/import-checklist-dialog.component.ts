import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';

import {
  CHECKLIST_IMPORT_MAX_FILE_BYTES,
  CHECKLIST_IMPORT_MAX_TASKS,
  CHECKLIST_IMPORT_PREVIEW_TASKS,
} from '../checklist-file-import.parser';

export interface ImportChecklistDialogData {
  title: string;
  tasks: string[];
}

export interface ImportChecklistDialogResult {
  apply: true;
}

@Component({
  selector: 'app-import-checklist-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule, MatDividerModule],
  template: `
    <h2 mat-dialog-title class="dialog-title">
      <i class="fa-solid fa-file-import" aria-hidden="true"></i>
      Import checklist
    </h2>
    <button mat-icon-button mat-dialog-close class="dialog-close" aria-label="Close dialog">
      <i class="fa-solid fa-xmark" aria-hidden="true"></i>
    </button>

    <mat-dialog-content class="dialog-content">
      <p class="lede">
        This will <strong>replace</strong> the checklist title and <strong>all</strong> tasks on this form.
      </p>

      <section class="section" aria-label="Imported title">
        <div class="section-label">New title</div>
        <p class="title-preview">{{ data.title }}</p>
      </section>

      <section class="section" aria-label="Imported tasks summary">
        <div class="section-label">Tasks ({{ data.tasks.length }} total)</div>
        <ul class="task-preview">
          @for (t of previewTasks; track $index) {
            <li>{{ t }}</li>
          }
        </ul>
        @if (remainingCount > 0) {
          <p class="more">… and {{ remainingCount }} more</p>
        }
      </section>

      <mat-divider />

      <p class="hint">
        UTF-8 · up to {{ maxTasks }} tasks · max {{ maxFileMb }} MB file
      </p>
    </mat-dialog-content>

    <mat-dialog-actions class="dialog-actions">
      <button mat-button type="button" (click)="cancel()">Cancel</button>
      <button mat-flat-button type="button" class="confirm-btn" (click)="confirm()">
        <i class="fa-solid fa-check" aria-hidden="true"></i>
        Replace title and tasks
      </button>
    </mat-dialog-actions>
  `,
  styles: [
    `
      .dialog-title {
        display: flex;
        align-items: center;
        gap: 10px;
        margin: 0;
        padding-right: 40px;
      }
      .dialog-title i {
        color: var(--mat-sys-primary);
      }
      .dialog-close {
        position: absolute;
        top: 8px;
        right: 8px;
      }
      .dialog-content {
        padding-top: 4px !important;
        min-width: min(440px, 100vw - 48px);
      }
      .lede {
        margin: 0 0 12px;
        font-size: 14px;
        color: var(--mat-sys-on-surface-variant);
      }
      .section {
        margin-bottom: 16px;
      }
      .section-label {
        font-size: 11px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        color: var(--mat-sys-on-surface-variant);
        margin-bottom: 6px;
      }
      .title-preview {
        margin: 0;
        font-size: 16px;
        font-weight: 600;
        color: var(--mat-sys-on-surface);
        word-break: break-word;
      }
      .task-preview {
        margin: 0;
        padding-left: 1.25rem;
        font-size: 14px;
        color: var(--mat-sys-on-surface);
      }
      .task-preview li {
        margin-bottom: 4px;
        word-break: break-word;
      }
      .more {
        margin: 8px 0 0;
        font-size: 13px;
        color: var(--mat-sys-on-surface-variant);
      }
      .hint {
        margin: 12px 0 0;
        font-size: 12px;
        color: var(--mat-sys-on-surface-variant);
      }
      .dialog-actions {
        display: flex;
        justify-content: flex-end;
        gap: 8px;
        flex-wrap: wrap;
      }
      .confirm-btn {
        display: inline-flex;
        align-items: center;
        gap: 8px;
      }
    `,
  ],
})
export class ImportChecklistDialogComponent {
  readonly data = inject<ImportChecklistDialogData>(MAT_DIALOG_DATA);
  private dialogRef = inject(MatDialogRef<ImportChecklistDialogComponent, ImportChecklistDialogResult | undefined>);

  readonly previewTasks = this.data.tasks.slice(0, CHECKLIST_IMPORT_PREVIEW_TASKS);
  readonly remainingCount = Math.max(0, this.data.tasks.length - CHECKLIST_IMPORT_PREVIEW_TASKS);
  readonly maxTasks = CHECKLIST_IMPORT_MAX_TASKS;
  readonly maxFileMb = CHECKLIST_IMPORT_MAX_FILE_BYTES / (1024 * 1024);

  cancel(): void {
    this.dialogRef.close();
  }

  confirm(): void {
    this.dialogRef.close({ apply: true });
  }
}
