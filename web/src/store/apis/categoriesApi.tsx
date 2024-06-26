import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { CategoryItem } from "../../types";

interface AddCategoryInput {
  userId: string;
  name: string;
}

const categoriesApi = createApi({
  reducerPath: "categories",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:5000/categories",
  }),
  endpoints(builder) {
    return {
      addCategory: builder.mutation<CategoryItem, AddCategoryInput>({
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
    };
  },
});

export const { useAddCategoryMutation } = categoriesApi;
export { categoriesApi };
