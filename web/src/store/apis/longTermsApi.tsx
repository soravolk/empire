import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const longTermsApi = createApi({
  reducerPath: "longTerms",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:5000/longTerms",
  }),
  endpoints(builder) {
    return {
      fetchLongTerms: builder.query({
        query: () => {
          return {
            url: "/",
            method: "GET",
          };
        },
      }),
    };
  },
});

export const { useFetchLongTermsQuery } = longTermsApi;
export { longTermsApi };
