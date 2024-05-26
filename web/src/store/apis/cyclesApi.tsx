import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { CycleItem } from "../../types";

const cyclesApi = createApi({
  reducerPath: "cycles",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:3000",
  }),
  tagTypes: ["Cycle"],
  endpoints(builder) {
    return {
      fetchCyclesOfLongTerm: builder.query({
        providesTags: (result, error, longTerm) => {
          const tags = result.map((cycle: CycleItem) => {
            return { type: "Cycle", id: cycle.id };
          });
          tags.push({ type: "LongTermCycle", id: longTerm.id });
          return tags;
        },
        query: (longTerm) => {
          return {
            url: "/cycles",
            query: {
              longTermId: longTerm.id,
            },
            method: "GET",
          };
        },
      }),
      fetchCategoriesFromCycle: builder.query({
        query: (cycle) => {
          return {
            url: `/cycles/${cycle.id}/categories`,
            method: "GET",
          };
        },
      }),
      fetchSubcategoriesFromCycle: builder.query({
        query: (cycle) => {
          return {
            url: `/cycles/${cycle.id}/subcategories`,
            method: "GET",
          };
        },
      }),
      fetchContentsFromCycle: builder.query({
        query: (cycle) => {
          return {
            url: `/cycles/${cycle.id}/contents`,
            method: "GET",
          };
        },
      }),
      addCycle: builder.mutation({
        query: ({ longTermId, startTime, endTime }) => {
          return {
            method: "POST",
            url: "/cycles",
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
            url: `/cycles/${cycle.id}`,
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
} = cyclesApi;
export { cyclesApi };
