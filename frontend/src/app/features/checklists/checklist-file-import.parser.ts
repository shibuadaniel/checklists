import Papa from 'papaparse';

export const CHECKLIST_IMPORT_MAX_FILE_BYTES = 1024 * 1024;
export const CHECKLIST_IMPORT_MAX_TASKS = 500;
export const CHECKLIST_IMPORT_PREVIEW_TASKS = 5;

const ALLOWED_EXTENSIONS = ['.txt', '.csv'] as const;

export type ParseChecklistImportResult =
  | { ok: true; title: string; tasks: string[] }
  | { ok: false; message: string };

function stripUtf8Bom(text: string): string {
  if (text.length > 0 && text.charCodeAt(0) === 0xfeff) {
    return text.slice(1);
  }
  return text;
}

function validateExtension(file: File): ParseChecklistImportResult | null {
  const lower = file.name.toLowerCase();
  const allowed = ALLOWED_EXTENSIONS.some(ext => lower.endsWith(ext));
  if (!allowed) {
    return { ok: false, message: 'Please choose a .txt or .csv file.' };
  }
  return null;
}

function validateTitle(title: string): ParseChecklistImportResult | null {
  const t = title.trim();
  if (t.length < 2) {
    return {
      ok: false,
      message: 'Checklist title (first line or first CSV cell) must be at least 2 characters.',
    };
  }
  return null;
}

function parsePlainText(text: string): ParseChecklistImportResult {
  const normalized = stripUtf8Bom(text);
  const lines = normalized.split(/\r\n|\r|\n/);
  if (lines.length === 0) {
    return { ok: false, message: 'File is empty.' };
  }
  const title = lines[0].trim();
  const titleErr = validateTitle(title);
  if (titleErr) return titleErr;

  const tasks: string[] = [];
  for (let i = 1; i < lines.length; i++) {
    const raw = lines[i].trim();
    if (raw === '') continue;
    tasks.push(raw);
  }
  if (tasks.length === 0) {
    return { ok: false, message: 'Add at least one task after the title line.' };
  }
  if (tasks.length > CHECKLIST_IMPORT_MAX_TASKS) {
    return {
      ok: false,
      message: `Too many tasks. Maximum is ${CHECKLIST_IMPORT_MAX_TASKS} per import.`,
    };
  }
  return { ok: true, title, tasks };
}

function parseCsv(text: string): ParseChecklistImportResult {
  const normalized = stripUtf8Bom(text);
  const parsed = Papa.parse<string[]>(normalized, {
    header: false,
    skipEmptyLines: 'greedy',
    dynamicTyping: false,
  });

  const quoteOrFieldErrors = parsed.errors.filter(
    e => e.type === 'Quotes' || e.type === 'FieldMismatch' || e.type === 'Delimiter',
  );
  if (quoteOrFieldErrors.length > 0) {
    return {
      ok: false,
      message: 'Could not parse CSV. Check quoting and commas in the first column.',
    };
  }

  const rows = parsed.data;
  if (!rows.length) {
    return { ok: false, message: 'File is empty.' };
  }

  const firstCell = (row: unknown): string => {
    if (!Array.isArray(row) || row.length === 0) return '';
    const v = row[0];
    return typeof v === 'string' ? v.trim() : String(v ?? '').trim();
  };

  const title = firstCell(rows[0]);
  const titleErr = validateTitle(title);
  if (titleErr) return titleErr;

  const tasks: string[] = [];
  for (let i = 1; i < rows.length; i++) {
    const cell = firstCell(rows[i]);
    if (cell === '') continue;
    tasks.push(cell);
  }
  if (tasks.length === 0) {
    return { ok: false, message: 'Add at least one task after the title row.' };
  }
  if (tasks.length > CHECKLIST_IMPORT_MAX_TASKS) {
    return {
      ok: false,
      message: `Too many tasks. Maximum is ${CHECKLIST_IMPORT_MAX_TASKS} per import.`,
    };
  }
  return { ok: true, title, tasks };
}

/**
 * Parse a .txt or .csv checklist import per product spec: UTF-8, 1 MiB max, 500 tasks max.
 */
export async function parseChecklistImportFile(file: File): Promise<ParseChecklistImportResult> {
  const extErr = validateExtension(file);
  if (extErr) return extErr;

  if (file.size > CHECKLIST_IMPORT_MAX_FILE_BYTES) {
    return { ok: false, message: 'File is too large. Maximum size is 1 MB.' };
  }

  let text: string;
  try {
    const buf = await file.arrayBuffer();
    text = new TextDecoder('utf-8', { fatal: true }).decode(buf);
  } catch {
    return { ok: false, message: 'File must be valid UTF-8.' };
  }

  const lower = file.name.toLowerCase();
  if (lower.endsWith('.txt')) {
    return parsePlainText(text);
  }
  if (lower.endsWith('.csv')) {
    return parseCsv(text);
  }
  return { ok: false, message: 'Please choose a .txt or .csv file.' };
}
