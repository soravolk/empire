import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { CycleSubcategoryItem } from "../../types";
import { API_URL } from "../constants";

interface AddSubcategoryInput {
  categoryId: string;
  name: string;
}

const subcategoriesApi = createApi({
  reducerPath: "subcategories",
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_URL}/subcategories`,
    credentials: "include",
  }),
  endpoints(builder) {
    return {
      addSubcategory: builder.mutation<
        CycleSubcategoryItem,
        AddSubcategoryInput
      >({
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
      fetchSubcatetoryById: builder.query({
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

export const { useAddSubcategoryMutation, useFetchSubcatetoryByIdQuery } =
  subcategoriesApi;
export { subcategoriesApi };
