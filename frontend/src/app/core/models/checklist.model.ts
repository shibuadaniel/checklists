export type ChecklistStatus = 'active' | 'completed' | 'overdue' | 'paused';
export type RecurrenceType = 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface Checklist {
  id: string;
  name: string;
  description?: string;
  status: ChecklistStatus;
  recurrence: RecurrenceType;
  completionRate: number; // 0–100
  totalTasks: number;
  completedTasks: number;
  overdueTasks: number;
  assignedTeam?: string;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardSummary {
  totalActive: number;
  completedToday: number;
  overdue: number;
  avgCompletionRate: number;
  checklists: Checklist[];
}
