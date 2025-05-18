import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const longTermsApi = createApi({
  reducerPath: "longTerms",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:5001/longTerms",
    credentials: "include",
  }),
  tagTypes: ["LongTerm"],
  endpoints(builder) {
    return {
      createLongTerm: builder.mutation({
        invalidatesTags: ["LongTerm"],
        query: ({ userId, startTime, endTime }) => {
          return {
            method: "POST",
            url: "/",
            body: {
              userId,
              startTime,
              endTime,
            },
          };
        },
      }),
      fetchLongTerms: builder.query({
        providesTags: ["LongTerm"],
        query: () => {
          return {
            url: "/",
            method: "GET",
          };
        },
      }),
      deleteLongTerm: builder.mutation({
        invalidatesTags: (result, error, args) => {
          return [{ type: "LongTerm" }];
        },
        query: ({ id }) => {
          return {
            method: "DELETE",
            url: `/${id}`,
          };
        },
      }),
    };
  },
});

export const {
  useCreateLongTermMutation,
  useFetchLongTermsQuery,
  useDeleteLongTermMutation,
} = longTermsApi;
export { longTermsApi };
