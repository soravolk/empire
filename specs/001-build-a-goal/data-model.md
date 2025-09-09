# Phase 1: Data Model

## Entities

### Goal

- id: integer (PK)
- user_id: integer (FK → users.id)
- long_term_id: integer (FK → long_terms.id)
- statement: varchar(280) (required)
- created_at: timestamp
- updated_at: timestamp

Constraints

- Each goal belongs to exactly one user and one long term.
- Owner-only access.
- Order by updated_at desc.

Validation

- statement: trimmed, 1..280 chars.

### GoalCategoryLink

- id: integer (PK)
- goal_id: integer (FK → goals.id)
- category_id: integer (FK → categories.id)
- created_at: timestamp

Constraints

- Unique(goal_id, category_id)
- On category delete: cascade remove link
- A goal can have 0.._ categories; a category can be linked to 0.._ goals

## Relationships

- User 1..\* Goals
- LongTerm 1..\* Goals
- Goal _.._ Category via GoalCategoryLink

## Non-functional notes

- Keep queries within existing backend patterns; reuse auth middleware.
