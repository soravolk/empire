import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { Detail } from "../../types";

interface AddDetailInput {
  contentId: string;
  shortTermId: string;
  name: string;
}

const detailsApi = createApi({
  reducerPath: "details",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:5001/details",
  }),
  endpoints(builder) {
    return {
      addDetail: builder.mutation<Detail, AddDetailInput>({
        query: ({ contentId, shortTermId, name }) => {
          return {
            method: "POST",
            url: "/",
            body: {
              contentId,
              shortTermId,
              name,
            },
          };
        },
      }),
    };
  },
});

export const { useAddDetailMutation } = detailsApi;
export { detailsApi };
