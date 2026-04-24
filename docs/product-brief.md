## Product Brief — ChekLists
**Status:** CONFIRMED
**Date:** April 24, 2026
**Frontend Framework:** Angular + Angular Material

---

### Problem
Teams lack a structured way to manage recurring tasks at defined intervals (daily, weekly, monthly, yearly), with no visibility into completion rates or accountability for what gets done.

### Goals
- Team leads and managers can monitor checklist completion rates in real time
- Identify patterns — tasks consistently missed or taking too long
- COO/executive has a single view across all checklists and teams

### Success Metrics
- Dashboard shows completion rate per checklist at a glance
- Team leads can identify overdue or problematic tasks without manual follow-up
- Every completed task has a clear audit trail (who, when)

### Users
- **Administrator** — creates/manages checklists, reassigns tasks, manages team
- **Team Lead / Manager** — monitors progress, oversight of their team's checklists
- **Team Member** — views and completes assigned tasks
- **COO / Executive** — read-only access across all checklists and teams

### Core User Tasks
1. Create, edit, and delete checklists with recurrence settings
2. Add, edit, and delete tasks within a checklist (with task card instructions)
3. Mark tasks as complete (captures who completed it; concurrent lock prevents double-submission)
4. Manage team members — add, edit, delete, assign roles
5. Query and filter task status by checklist, date, and team member

### Screens / Entry Points
- Login (with forgot username / password flow)
- Dashboard (donut chart of active checklists + CTA to start new)
- Checklist detail view
- Task detail / task card view
- Mark task complete (with concurrent lock)
- Team member management (Add / Edit / Delete)
- Checklist builder (with optional team/member assignments)
- Reports & query view (filter by checklist / date / team member)

### Tech Stack
- **Frontend:** Angular + Angular Material
- **Backend:** Node.js + TypeScript
- **Database:** Supabase (PostgreSQL + real-time)
- **Auth:** Email + password (with forgot password)
- **Hosting:** Vercel (frontend) + Railway (backend)

### Integrations
- Email notifications (overdue alerts, task reminders)
- Slack alerts

### Non-Functional
- **Accessibility:** WCAG AA required
- **Performance:** Mobile-first
- **i18n:** Planned for a later iteration
- **Compliance:** HIPAA

### Out of Scope
- Billing / subscription management
- SSO / SAML enterprise login
- Offline mode
- AI / smart suggestions

### Timeline
- Priority: **P0 — Critical**
- Target: This month

### References
- Clean and simple aesthetic
- Angular Material components and patterns throughout
