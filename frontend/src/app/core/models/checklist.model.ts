export type ChecklistStatus = 'active' | 'completed' | 'overdue' | 'paused';
export type RecurrenceType = 'daily' | 'weekly' | 'monthly' | 'yearly';
export type AssignmentMode = 'team' | 'member';

export interface ChecklistTask {
  id: string;
  title: string;
  completed: boolean;
}

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
  assignedTeamId?: string;
  assigneeId?: string;
  assigneeName?: string;
  dueDate?: string;
  tasks?: ChecklistTask[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateChecklistTaskDto {
  title: string;
  assigneeId?: string;   // team member assigned to this specific task
}

export interface CreateChecklistDto {
  title: string;
  recurrence: RecurrenceType;
  dueDate: string;         // YYYY-MM-DD, auto-calculated but user-editable
  tasks: CreateChecklistTaskDto[];
  assignmentMode: AssignmentMode;
  assignedTeamId?: string; // set when assignmentMode === 'team'
}

export interface DashboardSummary {
  totalActive: number;
  completedToday: number;
  overdue: number;
  avgCompletionRate: number;
  checklists: Checklist[];
}
