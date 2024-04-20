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
    };
  },
});

export const { useFetchCyclesOfLongTermQuery } = cyclesApi;
export { cyclesApi };
