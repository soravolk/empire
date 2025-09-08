# Tasks: Long-Term Goals with Category Linking (Frontend-first, no testing scope)

**Input**: Design documents from `/Users/soravolk/Codes/Empire/empire/specs/001-build-a-goal/`
**Prerequisites**: plan.md (required), research.md, data-model.md, contracts/

## Execution Flow (main)

- Load plan.md and available docs; generate tasks aligned with frontend-first and no testing scope.

## Format: `[ID] [P] Description`

- [P] means tasks can run in parallel (different files, no dependency).

## Phase 3.1: Frontend Setup

- [ ] T001 Create `/Users/soravolk/Codes/Empire/empire/web/src/store/apis/goalsApi.tsx` file (scaffold only): export placeholder RTK Query endpoints (list/create/update/delete/link/unlink) that match `/Users/soravolk/Codes/Empire/empire/specs/001-build-a-goal/contracts/goals.openapi.yaml` paths and method names.
- [ ] T002 Register `goalsApi` in `/Users/soravolk/Codes/Empire/empire/web/src/store/index.tsx` (reducers + middleware) and export hooks (e.g., `useFetchGoalsQuery`, `useCreateGoalMutation`, etc.).
- [ ] T003 [P] Add Goal types to `/Users/soravolk/Codes/Empire/empire/web/src/types/index.ts` (Goal, GoalCreate, GoalUpdate) consistent with OpenAPI schema.

## Phase 3.2: Frontend Core Implementation

- [ ] T004 Implement `/Users/soravolk/Codes/Empire/empire/web/src/components/Goal.tsx` for a single goal item: render statement, category chips, edit/delete buttons, and a link/unlink action control.
- [ ] T005 Implement `/Users/soravolk/Codes/Empire/empire/web/src/components/GoalsSection.tsx`: empty state, list of goals using hooks, create-new input/form, and optional category linking UI (reuse `Category` selection pattern where feasible).
- [ ] T006 Integrate `GoalsSection` in `/Users/soravolk/Codes/Empire/empire/web/src/pages/LongTerm.tsx` above existing controls; pass current user and selected long term; ensure UI tolerates no-backend-yet gracefully (loading/error/empty states).
- [ ] T007 [P] Accessibility and UX polish: labels, aria, keyboard focus, text length enforcement (280 chars), and helpful error messages in `Goal.tsx` and `GoalsSection.tsx`.

## Phase 3.3: Backend Core Implementation

- [ ] T008 Add DB schema changes for `goals` and `goal_category_links` according to `/Users/soravolk/Codes/Empire/empire/specs/001-build-a-goal/data-model.md` (follow repo’s existing DB utils/migration pattern under `/Users/soravolk/Codes/Empire/empire/backend/src/db/`).
- [ ] T009 [P] Implement backend controller/service for goals in `/Users/soravolk/Codes/Empire/empire/backend/src/controllers/goal.ts` (or `/Users/soravolk/Codes/Empire/empire/backend/src/services/goal.ts`) to support: list (by long_term_id), create, update, delete, link, unlink.
- [ ] T010 Add routes in `/Users/soravolk/Codes/Empire/empire/backend/src/routes/goal.ts` and mount in `/Users/soravolk/Codes/Empire/empire/backend/src/app.ts` under auth middleware.
- [ ] T011 Validation and auth: enforce ownership, per-LongTerm cap (10), and 280-char constraint; handle category delete cascade behavior.
- [ ] T012 Logging/error handling: consistent responses, include user and long_term_id context.

## Phase 3.4: Integration & Docs

- [ ] T013 Wire frontend API calls to backend base URL (reusing `API_URL` and proxy setup); verify list/create/edit/delete/link/unlink paths.
- [ ] T014 Update `/Users/soravolk/Codes/Empire/empire/specs/001-build-a-goal/quickstart.md` with working curl examples and UI walkthrough screenshots/notes.
- [ ] T015 [P] Performance sanity: spot-check CRUD p95 locally and note results in quickstart.
- [ ] T016 [P] Cleanup: code comments, small refactors, remove dead code.

## Dependencies

- Frontend setup (T001–T003) before frontend implementation (T004–T007).
- Backend DB/schema (T008) before backend services/routes (T009–T012).
- Backend routes (T010) before wiring frontend to live backend (T013).
- Docs and polish (T014–T016) last.

## Parallel Example

```
# Parallelizable tasks on different files:
Task: "Add Goal types in /Users/soravolk/Codes/Empire/empire/web/src/types/index.ts"  # T003
Task: "Build Goal component in /Users/soravolk/Codes/Empire/empire/web/src/components/Goal.tsx"  # T004
Task: "Scaffold GoalsSection in /Users/soravolk/Codes/Empire/empire/web/src/components/GoalsSection.tsx"  # T005

# Later during backend work:
Task: "Implement goals service/controller in /Users/soravolk/Codes/Empire/empire/backend/src/controllers/goal.ts"  # T009
Task: "Create routes in /Users/soravolk/Codes/Empire/empire/backend/src/routes/goal.ts"  # T010
```

## Validation Checklist

- [ ] Entities have implementation tasks (DB + services + routes + UI)
- [ ] Clear file paths for every task
- [ ] Parallel tasks are truly independent
- [ ] Dependencies are ordered (store → UI, schema → service → routes → FE wiring)
