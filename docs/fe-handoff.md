## Frontend Handoff — ChekLists
**Status:** IN PROGRESS (Dashboard complete — additional screens pending)
**Date:** April 24, 2026

---

### Screens Completed
| Screen | Route | Status |
|--------|-------|--------|
| Login | `/auth/login` | ✅ Complete |
| Forgot Password | `/auth/forgot-password` | ✅ Complete |
| Dashboard | `/dashboard` | ✅ Complete (mock data) |
| Checklist Detail | `/checklists/:id` | 🔜 Next |
| Task Detail | `/checklists/:id/tasks/:taskId` | 🔜 Pending |
| Team Management | `/team` | 🔜 Pending |
| Reports | `/reports` | 🔜 Pending |
| Checklist Builder | `/checklists/new` | 🔜 Pending |

---

### API Endpoints Required
| Method | Path | Request Body | Response Shape | Screen |
|--------|------|--------------|----------------|--------|
| POST | `/auth/login` | `{ email, password }` | Handled by Supabase Auth | Login |
| POST | `/auth/reset-password` | `{ email }` | Handled by Supabase Auth | Forgot Password |
| GET | `/api/dashboard/summary` | — | `DashboardSummary` | Dashboard |
| GET | `/api/checklists` | — | `Checklist[]` | Dashboard, Checklist list |
| POST | `/api/checklists` | `CreateChecklistDto` | `Checklist` | Checklist Builder |
| GET | `/api/checklists/:id` | — | `Checklist` | Checklist Detail |
| PUT | `/api/checklists/:id` | `UpdateChecklistDto` | `Checklist` | Checklist Builder |
| DELETE | `/api/checklists/:id` | — | `204` | Checklist Builder |
| GET | `/api/checklists/:id/tasks` | — | `Task[]` | Checklist Detail |
| POST | `/api/checklists/:id/tasks` | `CreateTaskDto` | `Task` | Task Detail |
| PATCH | `/api/tasks/:id/complete` | `{ completedBy: userId }` | `Task` | Mark Complete |
| GET | `/api/team` | — | `TeamMember[]` | Team Management |
| POST | `/api/team` | `CreateMemberDto` | `TeamMember` | Team Management |
| GET | `/api/reports` | `{ checklistId?, from?, to?, memberId? }` | `ReportRow[]` | Reports |

---

### Environment Configuration
**Angular** — `src/environments/environment.development.ts`:
```ts
export const environment = {
  production: false,
  useMock: true,          // ← set to false to use real API
  supabase: {
    url: 'https://bvpfdtlsoawwhdctwgze.supabase.co',
    anonKey: '<anon-key>',
  },
};
```

### Mock Data
All mock data lives in `src/app/core/mock-data/`. Toggle `useMock: true` in the dev environment to use it.

### How to run
```bash
cd frontend
npm install
npx ng serve
```
App runs at `http://localhost:4200`

### Known Limitations / Deferred Items
- Auth guard on `/dashboard` temporarily disabled for testing — re-enable in `app.routes.ts` once test users are created in Supabase
- Badge colour contrast not formally measured — validate in accessibility audit
- i18n deferred per product brief
- Real-time updates (Supabase subscriptions) not yet wired — dashboard does not auto-refresh
