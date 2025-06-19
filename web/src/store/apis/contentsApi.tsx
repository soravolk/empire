import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { CycleContentItem } from "../../types";
import { API_URL } from "../constants";

interface AddContentInput {
  subcategoryId: string;
  name: string;
}

const contentsApi = createApi({
  reducerPath: "contents",
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_URL}/contents`,
    credentials: "include",
  }),
  endpoints(builder) {
    return {
      addContent: builder.mutation<CycleContentItem, AddContentInput>({
        query: ({ subcategoryId, name }) => {
          return {
            method: "POST",
            url: "/",
            body: {
              subcategoryId,
              name,
            },
          };
        },
      }),
      fetchContentsById: builder.query({
        query: ({ id }) => {
          console.log(id);
          return {
            url: `/${id}`,
            method: "GET",
          };
        },
      }),
    };
  },
});

export const { useAddContentMutation, useFetchContentsByIdQuery } = contentsApi;
export { contentsApi };
