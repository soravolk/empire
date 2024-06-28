import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const userApi = createApi({
  reducerPath: "user",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:5000/users",
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
