/** Router `navigationExtras.state` key for passing a parsed import to New checklist. */
export const CHECKLIST_IMPORT_NAV_STATE_KEY = 'checklistImport' as const;

export interface ChecklistImportNavPayload {
  title: string;
  tasks: string[];
}
