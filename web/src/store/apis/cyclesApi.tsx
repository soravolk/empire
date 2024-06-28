import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { CycleCategoryItem, CycleItem } from "../../types";

const cyclesApi = createApi({
  reducerPath: "cycles",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:5000/cycles",
  }),
  tagTypes: ["Cycle", "LongTerm", "Category"],
  endpoints(builder) {
    return {
      fetchCyclesOfLongTerm: builder.query({
        providesTags: (result, error, longTerm) => {
          const tags = result.map((cycle: CycleItem) => {
            return { type: "Cycle", id: cycle.id };
          });
          tags.push({ type: "LongTerm", id: longTerm.id });
          return tags;
        },
        query: (longTerm) => {
          return {
            url: "/",
            query: {
              longTermId: longTerm.id,
            },
            method: "GET",
          };
        },
      }),
      fetchCategoriesFromCycle: builder.query({
        providesTags: (result, error, cycle) => {
          const tags = result.map((category: CycleCategoryItem) => {
            return { type: "Category", id: category.id };
          });
          tags.push({ type: "Cycle", id: cycle.id });
          return tags;
        },
        query: (cycle) => {
          return {
            url: `/${cycle.id}/categories`,
            method: "GET",
          };
        },
      }),
      fetchSubcategoriesFromCycle: builder.query({
        query: (cycle) => {
          return {
            url: `/${cycle.id}/subcategories`,
            method: "GET",
          };
        },
      }),
      fetchContentsFromCycle: builder.query({
        query: (cycle) => {
          return {
            url: `/${cycle.id}/contents`,
            method: "GET",
          };
        },
      }),
      addCycle: builder.mutation({
        invalidatesTags: (result, error, longTerm) => {
          return [{ type: "LongTerm", id: longTerm.id }];
        },
        query: ({ longTermId, startTime, endTime }) => {
          return {
            method: "POST",
            url: "/",
            body: {
              longTermId: longTermId,
              startTime: startTime,
              endTime: endTime,
            },
          };
        },
      }),
      deleteCycle: builder.mutation({
        invalidatesTags: (result, error, cycle) => {
          return [{ type: "Cycle", id: cycle.id }];
        },
        query: (cycle) => {
          return {
            method: "DELETE",
            url: `/${cycle.id}`,
          };
        },
      }),
      addCategoryToCycle: builder.mutation({
        invalidatesTags: (result, error, arg) => {
          return [{ type: "Cycle", id: arg.cycleId }];
        },
        query: ({ cycleId, categoryId }) => {
          return {
            method: "POST",
            url: `/${cycleId}/categories`,
            body: {
              categoryId,
            },
          };
        },
      }),
      deleteCategoryFromCycle: builder.mutation({
        invalidatesTags: (result, error, arg) => {
          return [{ type: "Category", id: arg.categoryId }];
        },
        query: (cycleCategoryId) => {
          return {
            method: "DELETE",
            url: `/categories/${cycleCategoryId}`,
          };
        },
      }),
    };
  },
});

export const {
  useFetchCyclesOfLongTermQuery,
  useFetchCategoriesFromCycleQuery,
  useFetchSubcategoriesFromCycleQuery,
  useFetchContentsFromCycleQuery,
  useAddCycleMutation,
  useDeleteCycleMutation,
  useAddCategoryToCycleMutation,
  useDeleteCategoryFromCycleMutation,
} = cyclesApi;
export { cyclesApi };
