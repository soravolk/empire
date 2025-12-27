import { renderHook } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { categoriesApi, useUpdateCategoryMutation } from "../categoriesApi";
import { setupServer } from "msw/node";
import { rest } from "msw";

// Mock API server
const server = setupServer();

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// Helper to create a store for testing
function createTestStore() {
  return configureStore({
    reducer: {
      [categoriesApi.reducerPath]: categoriesApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(categoriesApi.middleware),
  });
}

describe("categoriesApi - updateCategory", () => {
  it("should successfully update a category", async () => {
    const mockResponse = {
      id: 1,
      name: "Updated Category",
      user_id: "user123",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    server.use(
      rest.put("http://localhost:3001/categories/1", (req, res, ctx) => {
        return res(ctx.json(mockResponse));
      }),
    );

    const store = createTestStore();
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <Provider store={store}>{children}</Provider>
    );

    const { result } = renderHook(() => useUpdateCategoryMutation(), {
      wrapper,
    });
    const [updateCategory] = result.current;

    const updateResult = await updateCategory({
      id: 1,
      name: "Updated Category",
    });

    expect("data" in updateResult).toBe(true);
    if ("data" in updateResult) {
      expect(updateResult.data).toEqual(mockResponse);
    }
  });

  it("should handle update errors", async () => {
    server.use(
      rest.put("http://localhost:3001/categories/1", (req, res, ctx) => {
        return res(ctx.status(400), ctx.json({ error: "Name is required" }));
      }),
    );

    const store = createTestStore();
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <Provider store={store}>{children}</Provider>
    );

    const { result } = renderHook(() => useUpdateCategoryMutation(), {
      wrapper,
    });
    const [updateCategory] = result.current;

    const updateResult = await updateCategory({ id: 1, name: "" });

    expect("error" in updateResult).toBe(true);
    if ("error" in updateResult) {
      expect(updateResult.error).toBeDefined();
    }
  });
});
