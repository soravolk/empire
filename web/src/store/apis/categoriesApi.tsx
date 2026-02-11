import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { CycleCategoryItem } from "../../types";
import { API_URL } from "../constants";
import { longTermsApi } from "./longTermsApi";

interface AddCategoryInput {
  userId: string;
  name: string;
}

interface UpdateCategoryInput {
  id: number;
  name: string;
}

const categoriesApi = createApi({
  reducerPath: "categories",
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_URL}/categories`,
    credentials: "include",
  }),
  tagTypes: ["Category"],
  endpoints(builder) {
    return {
      addCategory: builder.mutation<CycleCategoryItem, AddCategoryInput>({
        query: ({ userId, name }) => {
          return {
            method: "POST",
            url: "/",
            body: {
              userId,
              name,
            },
          };
        },
        invalidatesTags: ["Category"],
      }),
      updateCategory: builder.mutation<CycleCategoryItem, UpdateCategoryInput>({
        query: ({ id, name }) => {
          return {
            method: "PUT",
            url: `/${id}`,
            body: {
              name,
            },
          };
        },
        invalidatesTags: (_result, _error, arg) => [
          { type: "Category", id: arg.id },
          "Category",
        ],
        async onQueryStarted(arg, { dispatch, queryFulfilled }) {
          try {
            await queryFulfilled;
            // Also invalidate the longTermsApi cache to update the Category component
            dispatch(
              longTermsApi.util.invalidateTags([
                { type: "Category", id: arg.id },
                "Category",
              ]),
            );
          } catch {
            // Mutation failed, no need to invalidate
          }
        },
      }),
      fetchCatetoryById: builder.query({
        query: ({ id }) => {
          return {
            url: `/${id}`,
            method: "GET",
          };
        },
        providesTags: (_result, _error, arg) => [
          { type: "Category", id: arg.id },
        ],
      }),
    };
  },
});

export const {
  useAddCategoryMutation,
  useUpdateCategoryMutation,
  useFetchCatetoryByIdQuery,
} = categoriesApi;
export { categoriesApi };
