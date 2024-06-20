import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const longTermsApi = createApi({
  reducerPath: "longTerms",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:5000",
  }),
  endpoints(builder) {
    return {
      fetchLongTerms: builder.query({
        query: () => {
          return {
            url: "/longTerms",
            method: "GET",
          };
        },
      }),
    };
  },
});

export const { useFetchLongTermsQuery } = longTermsApi;
export { longTermsApi };
