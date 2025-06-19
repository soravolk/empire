import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_URL } from "../constants";

const userApi = createApi({
  reducerPath: "user",
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_URL}/users`,
    credentials: "include",
  }),
  endpoints(builder) {
    return {
      fetchCurrentUser: builder.query({
        query: () => {
          return {
            url: "/me",
            method: "GET",
          };
        },
      }),
    };
  },
});

export const { useFetchCurrentUserQuery } = userApi;
export { userApi };
