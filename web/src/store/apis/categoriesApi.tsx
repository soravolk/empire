import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { CycleCategoryItem } from "../../types";
import { API_URL } from "../constants";

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
      }),
      fetchCatetoryById: builder.query({
        query: ({ id }) => {
          return {
            url: `/${id}`,
            method: "GET",
          };
        },
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
