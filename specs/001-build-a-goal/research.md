# Phase 0: Research

## Unknowns from Spec and Context

- Multiple goals per Long Term vs single goal: choose support for multiple with a practical cap.
- Duplicate goal statements: allowed or prevented.
- Max goal length and validation.
- Deleting/archiving goals behavior.

## Findings and Decisions

- Decision: Support multiple goals per Long Term with a soft cap of 10 per Long Term.
  - Rationale: Users may have several end goals; small cap prevents clutter.
  - Alternatives: Single primary goal (too limiting), unlimited (risk clutter).
- Decision: Allow duplicate statements (no uniqueness constraint).
  - Rationale: Similar goals may exist; uniqueness isn’t essential.
  - Alternatives: Enforce uniqueness (adds friction), warn only (UI concern).
- Decision: Goal text max 280 characters; trim and collapse whitespace.
  - Rationale: Encourages concise goals; aligns with quick entry UX.
  - Alternatives: 140 (too short) / 500+ (too long for header area).
- Decision: Goals are deletable; no archive state for v1.
  - Rationale: Simplicity; archive can be added later if needed.
  - Alternatives: Archive state (adds complexity now).
- Decision: Linking to Categories is optional; 0..\* categories per goal.
  - Rationale: Matches spec; categories may be absent.

## Best Practices & Patterns

- Backend: CRUD endpoints with idempotent updates, validate ownership via auth middleware.
- Frontend: Collapsible Goals section; optimistic updates optional but keep simple.
- Data integrity: On category delete, remove link rows via ON DELETE CASCADE or service cleanup.

## Open Questions (Tracked)

- Primary goal display ordering beyond created_at? Decision: order by updated_at desc.
- Permission model beyond owner? Decision: owner-only in v1.

## Conclusion

All NEEDS CLARIFICATION from spec are resolved for v1 with pragmatic defaults above.
