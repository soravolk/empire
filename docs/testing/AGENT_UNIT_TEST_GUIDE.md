# Unit Testing Guidelines

- Frontend: TypeScript + React
- Backend: TypeScript + Node.js

## 1) Goals

- Ensure **correctness** of logic, components, and APIs
- Catch regressions early
- Provide **confidence to release fast** without heavy manual testing

## 2) Tools

- **Runner:** Jest
- **Frontend:** `@testing-library/react`, `@testing-library/jest-dom`, `@testing-library/user-event`, `msw`
- **Backend:** `supertest` (HTTP), `jest.mock`, `nock` or `msw` for HTTP mocks
- **Linting (recommended):** `eslint-plugin-jest`, `eslint-plugin-testing-library`, `eslint-plugin-jest-dom`

## 3) What to Test

### Frontend

- Components: render, interaction, and async UI updates
- Hooks: input → output behavior
- **Exported** helpers (e.g., formatting, calculations)

### Backend

- Services: business logic (DB/HTTP mocked)
- Controllers/Routes: status codes, response shapes, and error handling
- **Exported** helpers (parsers, validators, date/time utils)

## 4) What Not to Test

- Private/unexported helpers (covered via public API tests)
- Implementation details (internal state variables, CSS classes)
- Trivial one-liners (`isEmpty`, `capitalize`, etc.)

## 5) How to Test

- Focus on **observable behavior**
  - Frontend → what the user sees/clicks
  - Backend → request/response, not internals
- Use **realistic, deterministic data** (factories; avoid randomness in assertions)
- Cover both **happy** and **unhappy** paths
- Keep tests **fast and isolated**; no real network/DB in unit tests

## 6) Conventions

- Test files next to source: `*.test.ts` / `*.test.tsx`
- Descriptive spec names:
  ```ts
  it("returns 401 when token is missing", () => {
    /* ... */
  });
  ```
- React Testing Library:
  - Prefer accessible queries: screen.getByRole, getByLabelText, getByText
  - Prefer userEvent over fireEvent
  - Async UI: await screen.findByText(...)
- Mock at boundaries
  - Frontend: mock API with MSW
  - Backend: mock DB/HTTP clients with jest.mock or nock

### 6.1 Naming & Grouping (Controller / Service Functions)

- Group related specs by exported function using a nested `describe` block:
  ```ts
  describe("createContent", () => {
    it("returns 201 with created row", () => {
      /* ... */
    });
    it("returns 500 when insert fails", () => {
      /* ... */
    });
  });
  ```
- Inside the inner `describe`, omit the function name from individual `it` descriptions—start with the behavioral outcome (`returns 200 ...`, `throws error when ...`).
- Prefer the pattern: `it("returns <status> <condition>")` or `it("calls <dependency> with expected args")` for clarity.
- Avoid repetition like `it("createContent returns 201 ...")` when already inside `describe("createContent")`.
- When asserting the absence of side-effects, add a negative assertion (e.g., `expect(res.json).not.toHaveBeenCalled()`) only if it increases confidence or guards against common regressions (don't add them mechanically everywhere).
- Keep test names outcome-focused; avoid implementation details (no references to variable names or internal helper function names).

### 6.2 Mocking & Test Data Best Practices

**Mock Objects (req/res):**

- Use `beforeEach` to create fresh mock instances per test (prevents cross-test pollution):

  ```ts
  let res: any;

  beforeEach(() => {
    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
      json: jest.fn(),
    };
  });
  ```

- Prefer `as any` for inline test mocks (req/res) instead of verbose type intersections—you're testing behavior, not TypeScript contracts.
- `jest.clearAllMocks()` in `afterEach` resets call counts but doesn't recreate objects—always use `beforeEach` for mutable state.

**Test Data Constants:**

- **Extract** constants when used across multiple tests (DRY, maintainability):
  ```ts
  const userId = "test_user_id";
  const contentName = "Test Content";
  ```
- **Keep inline** when test-specific or used only once—avoid over-abstracting.
- Use primitive constants (strings, numbers, booleans) at describe scope—no need for `beforeEach` since they're immutable.
- Use `beforeEach` for objects/arrays that tests might mutate:
  ```ts
  let rows: any[];
  beforeEach(() => {
    rows = [{ id: "10", name: "test" }];
  });
  ```

**Typing in Tests:**

- Minimal typing for test mocks keeps tests lean and readable.
- Use `as any` for one-off mocks; save stricter types for shared test utilities.
- TypeScript in tests catches typos, not correctness—focus on behavior assertions.

**Spy Assertions in Error Paths:**

- Always verify spy calls with `toHaveBeenCalledWith` in **both success AND error tests**:
  ```ts
  it("returns 500 when insert fails", async () => {
    const spy = jest
      .spyOn(db, "insert")
      .mockRejectedValue(new Error("db fail"));

    const req = { body: { name: "test" } } as any;
    await controller.create(req, res, (() => {}) as NextFunction);

    // ✅ Verify the function called db with correct params BEFORE the error
    expect(spy).toHaveBeenCalledWith("table", { name: "test" });
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "internal server error" });
  });
  ```
- **Why:** Even when the db call fails, the function should still transform request data correctly before calling the db method. This catches input processing bugs, not just error handling.
- **Benefit:** Ensures consistency—both happy and unhappy paths verify the complete behavior (input → db call → output).

## 7) Quality Gates

- Every PR updates/adds tests for changed logic
- Minimum coverage:
- Statements: 80%
- Branches: 75%
- Functions: 80%
- Lines: 80%
- No flaky tests (use fake timers / deterministic seeds)

## 8) Examples

Frontend (React)

```typescript
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Login } from "./Login";

test("logs in and greets user", async () => {
  render(<Login />);
  await userEvent.type(screen.getByLabelText(/email/i), "me@test.com");
  await userEvent.type(screen.getByLabelText(/password/i), "secret");
  await userEvent.click(screen.getByRole("button", { name: /submit/i }));
  expect(await screen.findByText(/welcome/i)).toBeInTheDocument();
});
```

Backend (Express)

```typescript
import request from "supertest";
import { app } from "../app";
import { userRepo } from "../userRepo";

jest.mock("../userRepo");

test("GET /users/:id returns user", async () => {
  (userRepo.getById as jest.Mock).mockResolvedValue({
    id: "1",
    name: "Soravolk",
  });
  const res = await request(app).get("/users/1");
  expect(res.status).toBe(200);
  expect(res.body).toEqual({ id: "1", name: "Soravolk" });
});
```

## 9) Helper Functions Policy

- Test directly if the helper is exported, reused, and contains non-trivial logic
- Do not test directly if it’s private/unexported or trivial — cover via public API/component tests

## 10) Definition of Done (per PR)

- Tests added/updated for new or changed logic
- All tests pass in CI (npm run test:ci)
- Coverage thresholds met
- Tests assert behavior, not implementation details
