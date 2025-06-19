import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_URL } from "../constants";

const detailsApi = createApi({
  reducerPath: "details",
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_URL}/details`,
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
