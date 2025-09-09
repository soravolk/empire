# Quickstart: Long-Term Goals

This validates the feature via contract-level and integration steps.

## Backend

1. Start backend server.
2. Ensure a user is authenticated via existing auth.
3. Create a Long Term if none exists.
4. Create a goal:
   - POST /goals { long_term_id, statement, category_ids? }
5. List goals:
   - GET /goals?long_term_id=<id>
6. Update goal statement:
   - PATCH /goals/{id} { statement }
7. Link and unlink categories:
   - POST /goals/{id}/categories { category_ids: [...] }
   - DELETE /goals/{id}/categories { category_ids: [...] }

## Frontend

1. Open Long Term page.
2. Verify Goals section shows current goals or empty state.
3. Create a goal, optionally link categories.
4. Edit a goal and modify category links.
5. Refresh; verify persistence and category rename/delete handling.
