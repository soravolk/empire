import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { SubcategoryItem } from "../../types";

interface AddSubcategoryInput {
  categoryId: string;
  name: string;
}

const subcategoriesApi = createApi({
  reducerPath: "subcategories",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:5000/subcategories",
  }),
  endpoints(builder) {
    return {
      addSubcategory: builder.mutation<SubcategoryItem, AddSubcategoryInput>({
        query: ({ categoryId, name }) => {
          return {
            method: "POST",
            url: "/",
            body: {
              categoryId,
              name,
            },
          };
        },
      }),
    };
  },
});

export const { useAddSubcategoryMutation } = subcategoriesApi;
export { subcategoriesApi };
