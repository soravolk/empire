import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { CycleCategoryItem } from "../../types";
import { API_URL } from "../constants";

interface AddCategoryInput {
  userId: string;
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

export const { useAddCategoryMutation, useFetchCatetoryByIdQuery } =
  categoriesApi;
export { categoriesApi };
