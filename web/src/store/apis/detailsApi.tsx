import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const detailsApi = createApi({
  reducerPath: "details",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:5001/details",
    credentials: "include",
  }),
  endpoints(builder) {
    return {
      fetchDetails: builder.query({
        query: () => {
          return {
            method: "GET",
            url: `/`,
          };
        },
      }),
    };
  },
});

export const { useFetchDetailsQuery } = detailsApi;
export { detailsApi };
