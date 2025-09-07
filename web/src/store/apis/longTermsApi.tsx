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
      addCategoryToLongTerm: builder.mutation({
        invalidatesTags: (result, error, { longTermId }) => {
          return [{ type: "LongTerm" as const, id: longTermId }];
        },
        query: ({
          longTermId,
          categoryId,
        }: {
          longTermId: number;
          categoryId: number;
        }) => {
          return {
            method: "POST",
            url: `/${longTermId}/categories`,
            body: { categoryId },
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
      addSubcategoryToLongTerm: builder.mutation({
        invalidatesTags: (result, error, { longTermId }) => {
          return [{ type: "LongTerm" as const, id: longTermId }];
        },
        query: ({
          longTermId,
          subcategoryId,
        }: {
          longTermId: number;
          subcategoryId: number;
        }) => {
          return {
            method: "POST",
            url: `/${longTermId}/subcategories`,
            body: { subcategoryId },
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
      deleteCategoryFromLongTerm: builder.mutation({
        // We can't easily know which LongTerm to invalidate with only a row id; broadly invalidate LongTerm list
        invalidatesTags: () => [{ type: "LongTerm" as const }],
        query: (id: number) => {
          return {
            method: "DELETE",
            url: `/categories/${id}`,
          };
        },
      }),
      deleteSubcategoryFromLongTerm: builder.mutation({
        invalidatesTags: () => [{ type: "LongTerm" as const }],
        query: (id: number) => {
          return {
            method: "DELETE",
            url: `/subcategories/${id}`,
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
  useAddCategoryToLongTermMutation,
  useAddSubcategoryToLongTermMutation,
  useDeleteCategoryFromLongTermMutation,
  useDeleteSubcategoryFromLongTermMutation,
} = longTermsApi;
export { longTermsApi };
