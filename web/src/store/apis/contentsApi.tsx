import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { CycleContentItem } from "../../types";

interface AddContentInput {
  subcategoryId: string;
  name: string;
}

const contentsApi = createApi({
  reducerPath: "contents",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:5001/contents",
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
