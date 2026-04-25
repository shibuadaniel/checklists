export interface SystemSettings {
  /** 24-hour HH:MM — when the workday begins (used for daily checklist start) */
  startOfDay: string;
  /** 24-hour HH:MM — when the workday ends (daily checklist due by this time) */
  endOfDay: string;
}

export const DEFAULT_SETTINGS: SystemSettings = {
  startOfDay: '09:00',
  endOfDay: '17:00',
};
