# Implementation Plan: Long-Term Goals with Category Linking (Frontend-first, no testing scope)

**Branch**: `[001-build-a-goal]` | **Date**: 2025-09-08 | **Spec**: [/Users/soravolk/Codes/Empire/empire/specs/001-build-a-goal/spec.md]
**Input**: Feature specification from `/Users/soravolk/Codes/Empire/empire/specs/001-build-a-goal/spec.md`

## Execution Flow (/plan command scope)

```
1. Load feature spec from Input path
   → If not found: ERROR "No feature spec at {path}"
2. Fill Technical Context (scan for NEEDS CLARIFICATION)
   → Detect Project Type from context (web=frontend+backend, mobile=app+api)
   → Set Structure Decision based on project type
3. Evaluate Constitution Check section below
   → If violations exist: Document in Complexity Tracking
   → If no justification possible: ERROR "Simplify approach first"
   → Update Progress Tracking: Initial Constitution Check
4. Execute Phase 0 → research.md
   → If NEEDS CLARIFICATION remain: ERROR "Resolve unknowns"
5. Execute Phase 1 → contracts, data-model.md, quickstart.md (design only; no test planning in this plan)
6. Re-evaluate Constitution Check section
   → If new violations: Refactor design, return to Phase 1
   → Update Progress Tracking: Post-Design Constitution Check
7. Plan Phase 2 → Describe task generation approach (implementation-only; do NOT include any test tasks)
8. STOP - Ready for /tasks command
```

Note: This plan intentionally excludes any mention of tests or integration testing per request.

## Summary

Add a Goals section at the top of the Long Term page where users can create, view, and edit one or more goals scoped to the selected Long Term. Users can optionally link goals to existing categories. Persist goals and goal–category links; reflect category rename/delete gracefully; restrict management to the authenticated owner. Approach: implement frontend UI first (RTK Query endpoints, components, and page wiring), then backend endpoints and data model.

## Technical Context

**Language/Version**: TypeScript (React frontend), Node/Express (backend)
**Primary Dependencies**: Frontend: React, RTK Query, TailwindCSS; Backend: Express, PostgreSQL, existing auth middleware
**Storage**: PostgreSQL (existing backend/db)
**Target Platform**: Web (frontend + backend)
**Project Type**: Web application (frontend + backend code present)
**Performance Goals**: Goal CRUD p95 < 250ms server-side
**Constraints**: Keep UI responsive; follow existing auth/data shapes; frontend-first sequencing
**Scale/Scope**: Single-user goals per Long Term; small data volume

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

**Simplicity**:

- Projects: 2 (backend, frontend)
- Use frameworks directly (Express, React)
- Minimal new data model (Goal + GoalCategoryLink)
- Avoid extra abstraction; thin controllers + queries

**Architecture**:

- Extend existing backend routes/controllers and frontend pages/components
- No new library projects added
- Contracts captured under `specs/001-build-a-goal/contracts/`

**Observability**:

- Ensure meaningful error messages; log request context server-side (user, long_term_id)
- Keep client UI states explicit (loading, error, empty)

**Versioning**:

- Additive APIs only; no breaking changes anticipated

## Project Structure

### Documentation (this feature)

```
specs/001-build-a-goal/
├── plan.md              # This file (/plan command output)
├── research.md          # Phase 0 output (/plan command)
├── data-model.md        # Phase 1 output (/plan command)
├── quickstart.md        # Phase 1 output (/plan command)
└── contracts/           # Phase 1 output (/plan command)
```

### Source Code (repository root)

```
backend/
├── src/
│   ├── controllers/
│   ├── routes/
│   ├── db/
│   └── services/

web/
├── src/
│   ├── components/
│   ├── pages/
│   ├── store/
│   └── types/
```

**Structure Decision**: Web application (backend + frontend present)

## Phase 0: Outline & Research

1. **Extract unknowns from Technical Context** above:

   - For each NEEDS CLARIFICATION → research task
   - For each dependency → best practices task
   - For each integration → patterns task

2. **Generate and dispatch research agents**:

   ```
   For each unknown in Technical Context:
     Task: "Research {unknown} for {feature context}"
   For each technology choice:
     Task: "Find best practices for {tech} in {domain}"
   ```

3. **Consolidate findings** in `research.md` using format:

   - Decision: [what was chosen]
   - Rationale: [why chosen]
   - Alternatives considered: [what else evaluated]

**Output**: research.md with all NEEDS CLARIFICATION resolved (see `/Users/soravolk/Codes/Empire/empire/specs/001-build-a-goal/research.md`)

## Phase 1: Design & Contracts

_Prerequisites: research.md complete_

1. **Extract entities from feature spec** → `data-model.md`:

   - Entity name, fields, relationships
   - Validation rules from requirements
   - State transitions if applicable

2. **Generate API contracts** from functional requirements (design only in this phase):

   - For each user action → endpoint
   - Use standard REST patterns
   - Output OpenAPI schema to `/contracts/`

3. Capture usage scenarios in prose only:

   - Derive scenarios from user stories in quickstart.md for later manual validation
   - Do not include any testing artifacts in this plan

4. Optional: Update agent file incrementally (O(1)) if present

**Output**: data-model.md, /contracts/\*, quickstart.md

Files:

- `/Users/soravolk/Codes/Empire/empire/specs/001-build-a-goal/data-model.md`
- `/Users/soravolk/Codes/Empire/empire/specs/001-build-a-goal/contracts/goals.openapi.yaml`
- `/Users/soravolk/Codes/Empire/empire/specs/001-build-a-goal/quickstart.md`

## Phase 2: Task Planning Approach

_This section describes what the /tasks command will do - DO NOT execute during /plan_

**Task Generation Strategy**:

- Load `/Users/soravolk/Codes/Empire/empire/templates/tasks-template.md` as base
- Generate tasks from Phase 1 design docs (contracts, data model, quickstart)
- Focus on implementation tasks only (UI, store, routes, controllers, DB)
- Exclude any test-related tasks
- Each entity → model/service/route/UI tasks
- Each endpoint → implementation task with clear file paths

**Ordering Strategy**:

- Implementation-first for frontend
- Dependency order: Models/DB before services before routes before UI wiring where applicable
- Mark [P] for parallel execution (independent files)

**Estimated Output**: Numbered, ordered tasks in tasks.md with no test items

**IMPORTANT**: This phase is executed by the /tasks command, NOT by /plan

## Phase 3+: Future Implementation

_These phases are beyond the scope of the /plan command_

**Phase 3**: Task execution (/tasks command creates tasks.md)
**Phase 4**: Implementation (execute tasks.md following constitutional principles)
**Phase 5**: Validation (follow quickstart.md manual steps and performance checks)

## Complexity Tracking

No constitutional deviations identified at this time.

## Progress Tracking

_This checklist is updated during execution flow_

**Phase Status**:

- [x] Phase 0: Research complete (/plan command)
- [x] Phase 1: Design complete (/plan command)
- [x] Phase 2: Task planning complete (/plan command - describe approach only)
- [ ] Phase 3: Tasks generated (/tasks command)
- [ ] Phase 4: Implementation complete
- [ ] Phase 5: Validation passed

**Gate Status**:

- [x] Initial Constitution Check: PASS
- [x] Post-Design Constitution Check: PASS
- [x] All NEEDS CLARIFICATION resolved
- [x] Complexity deviations documented (none)

---

Based on Constitution v2.1.1 - See `/Users/soravolk/Codes/Empire/empire/memory/constitution.md`
