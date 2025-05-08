import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { Detail, ShortTermItem } from "../../types";

interface CreateShortTermInput {
  userId: string;
}

interface CreateDetailInput {
  contentId: string;
  shortTermId: string;
  name: string;
}

const shortTermsApi = createApi({
  reducerPath: "shortTerms",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:5001/shortTerms",
  }),
  tagTypes: ["ShortTerm", "Detail"],
  endpoints(builder) {
    return {
      fetchShortTerms: builder.query({
        query: () => {
          return {
            method: "GET",
            url: "/",
          };
        },
      }),
      fetchDetailsFromShortTerm: builder.query({
        providesTags: (result, error, args) => {
          if (error) return [];
          const { shortTermId } = args;
          const tags = result.map((detail: Detail) => {
            return { type: "Detail", id: detail.id };
          });
          tags.push({ type: "ShortTerm", id: shortTermId });
          return tags;
        },
        query: ({ shortTermId }) => {
          return {
            method: "GET",
            url: `/${shortTermId}/details`,
          };
        },
      }),
      createShortTerm: builder.mutation<ShortTermItem, CreateShortTermInput>({
        query: ({ userId }) => {
          return {
            method: "POST",
            url: "/",
            body: {
              userId,
            },
          };
        },
      }),
      createDetail: builder.mutation<Detail, CreateDetailInput>({
        invalidatesTags: (result, error, args) => {
          const { shortTermId } = args;
          return [{ type: "ShortTerm", id: shortTermId }];
        },
        query: ({ contentId, shortTermId, name }) => {
          return {
            method: "POST",
            url: `/${shortTermId}/details`,
            body: {
              contentId,
              name,
            },
          };
        },
      }),
    };
  },
});

export const {
  useCreateShortTermMutation,
  useCreateDetailMutation,
  useFetchShortTermsQuery,
  useFetchDetailsFromShortTermQuery,
} = shortTermsApi;
export { shortTermsApi };
