import { MyTask } from '../models/checklist.model';

// Mock tasks for the My Tasks view.
// assigneeId refs match MOCK_TEAM ids: '1'=Sarah(admin), '2'=Marcus(lead,team-1), '3'=Priya(member,team-2)
// In mock mode the component shows all tasks; production will filter by currentUser.id / teamId.
export const MOCK_MY_TASKS: MyTask[] = [
  // ── Daily Opening Checklist ───────────────────────────
  {
    id: 't1',
    title: 'Unlock front entrance and disable alarm',
    completed: false,
    checklistId: '1',
    checklistName: 'Daily Opening Checklist',
    dueDate: new Date().toISOString(),
    assigneeId: '2',
  },
  {
    id: 't2',
    title: 'Turn on all examination room lights and equipment',
    completed: false,
    checklistId: '1',
    checklistName: 'Daily Opening Checklist',
    dueDate: new Date().toISOString(),
    assigneeId: '2',
  },
  {
    id: 't3',
    title: 'Start up reception computers and check overnight voicemails',
    completed: true,
    checklistId: '1',
    checklistName: 'Daily Opening Checklist',
    dueDate: new Date().toISOString(),
    assigneeId: '1',
  },
  {
    id: 't4',
    title: 'Confirm today\'s appointment schedule with front desk',
    completed: true,
    checklistId: '1',
    checklistName: 'Daily Opening Checklist',
    dueDate: new Date().toISOString(),
    assigneeId: '1',
  },

  // ── Weekly Safety Inspection ──────────────────────────
  {
    id: 't5',
    title: 'Inspect fire extinguisher pressure gauges',
    completed: false,
    checklistId: '2',
    checklistName: 'Weekly Safety Inspection',
    dueDate: new Date().toISOString(),          // due today
    assigneeId: '2',
  },
  {
    id: 't6',
    title: 'Check all emergency exit signage and lighting',
    completed: false,
    checklistId: '2',
    checklistName: 'Weekly Safety Inspection',
    dueDate: new Date(Date.now() + 86400000 * 2).toISOString(),
    assigneeId: '3',
  },
  {
    id: 't7',
    title: 'Verify autoclave sterilisation logs are up to date',
    completed: true,
    checklistId: '2',
    checklistName: 'Weekly Safety Inspection',
    dueDate: new Date().toISOString(),
    assigneeId: '3',
  },

  // ── Monthly Compliance Review ─────────────────────────
  {
    id: 't8',
    title: 'Review patient privacy policy acknowledgements',
    completed: false,
    checklistId: '3',
    checklistName: 'Monthly Compliance Review',
    dueDate: new Date().toISOString(),          // due today
    assigneeId: '2',
  },
  {
    id: 't9',
    title: 'Update HIPAA training completion records',
    completed: false,
    checklistId: '3',
    checklistName: 'Monthly Compliance Review',
    dueDate: new Date(Date.now() - 86400000).toISOString(), // overdue
    assigneeId: '2',
  },
];
