import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_URL } from "../constants";

const longTermsApi = createApi({
  reducerPath: "longTerms",
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_URL}/longTerms`,
    credentials: "include",
  }),
  tagTypes: ["LongTerm", "Category"],
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
      fetchCategoriesFromLongTerm: builder.query({
        providesTags: (result, error, longTerm) => {
          const tags = (result ?? []).map((category: any) => {
            return { type: "Category" as const, id: category.id };
          });
          tags.push({ type: "LongTerm" as const, id: longTerm.id });
          return tags;
        },
        query: (longTerm) => {
          return {
            url: `/${longTerm.id}/categories`,
            method: "GET",
          };
        },
      }),
      fetchSubcategoriesFromLongTerm: builder.query({
        providesTags: (result, error, longTerm) => {
          const tags = (result ?? []).map((subcategory: any) => {
            return { type: "Subcategory" as const, id: subcategory.id };
          });
          tags.push({ type: "LongTerm" as const, id: longTerm.id });
          return tags;
        },
        query: (longTerm) => {
          return {
            url: `/${longTerm.id}/subcategories`,
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
  useFetchCategoriesFromLongTermQuery,
  useFetchSubcategoriesFromLongTermQuery,
} = longTermsApi;
export { longTermsApi };
