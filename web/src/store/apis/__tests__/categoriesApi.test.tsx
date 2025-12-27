import { renderHook, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { categoriesApi, useUpdateCategoryMutation } from "../categoriesApi";
import {
  longTermsApi,
  useFetchCategoriesFromLongTermQuery,
} from "../longTermsApi";
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

// Helper to create a store with both APIs for cross-API cache invalidation tests
function createTestStoreWithBothApis() {
  return configureStore({
    reducer: {
      [categoriesApi.reducerPath]: categoriesApi.reducer,
      [longTermsApi.reducerPath]: longTermsApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware()
        .concat(categoriesApi.middleware)
        .concat(longTermsApi.middleware),
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

  it("should invalidate longTermsApi cache when category is updated", async () => {
    let fetchCount = 0;
    const mockLongTerm = { id: 1 };
    const initialCategories = [
      {
        id: 100,
        cycle_id: 1,
        category_id: 1,
        name: "Original Category",
      },
    ];
    const updatedCategories = [
      {
        id: 100,
        cycle_id: 1,
        category_id: 1,
        name: "Updated Category",
      },
    ];

    server.use(
      // Mock fetching categories from long term
      rest.get(
        "http://localhost:3001/longTerms/1/categories",
        (_req, res, ctx) => {
          fetchCount++;
          // Return updated name on second fetch (after invalidation)
          return res(
            ctx.json(fetchCount === 1 ? initialCategories : updatedCategories),
          );
        },
      ),
      // Mock updating category
      rest.put("http://localhost:3001/categories/1", (req, res, ctx) => {
        return res(
          ctx.json({
            id: 1,
            name: "Updated Category",
            user_id: "user123",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }),
        );
      }),
    );

    const store = createTestStoreWithBothApis();
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <Provider store={store}>{children}</Provider>
    );

    // First, fetch categories from long term
    const { result: fetchResult } = renderHook(
      () => useFetchCategoriesFromLongTermQuery(mockLongTerm),
      { wrapper },
    );

    // Wait for initial fetch to complete
    await waitFor(() => {
      expect(fetchResult.current.isSuccess).toBe(true);
    });

    expect(fetchResult.current.data).toEqual(initialCategories);
    expect(fetchResult.current.data?.[0].name).toBe("Original Category");
    expect(fetchCount).toBe(1);

    // Now update the category
    const { result: updateResult } = renderHook(
      () => useUpdateCategoryMutation(),
      { wrapper },
    );
    const [updateCategory] = updateResult.current;

    await updateCategory({ id: 1, name: "Updated Category" });

    // Wait for cache invalidation to trigger refetch
    await waitFor(
      () => {
        expect(fetchCount).toBe(2);
      },
      { timeout: 3000 },
    );

    // Verify the cache has been updated with new data
    await waitFor(() => {
      expect(fetchResult.current.data?.[0].name).toBe("Updated Category");
    });
  });
});
