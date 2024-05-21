import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const cyclesApi = createApi({
  reducerPath: "cycles",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:3000",
  }),
  endpoints(builder) {
    return {
      fetchCyclesOfLongTerm: builder.query({
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
    };
  },
});

export const {
  useFetchCyclesOfLongTermQuery,
  useFetchCategoriesFromCycleQuery,
  useFetchSubcategoriesFromCycleQuery,
  useFetchContentsFromCycleQuery,
  useAddCycleMutation,
} = cyclesApi;
export { cyclesApi };
