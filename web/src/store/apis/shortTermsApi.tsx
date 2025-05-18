import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { Detail, ShortTermItem } from "../../types";

interface CreateShortTermInput {
  userId: string;
}

interface DeleteShortTermInput {
  id: string;
}

interface CreateDetailInput {
  contentId: string;
  shortTermId: string;
  name: string;
}

interface UpdateTimeSpentInput {
  id: string;
  timeSpent: number;
}

interface UpdateFinishedDateInput {
  id: string;
  finishedDate: string | null;
}

interface DeleteDetailInput {
  id: string;
  detailId: string;
}

const shortTermsApi = createApi({
  reducerPath: "shortTerms",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:5001/shortTerms",
    credentials: "include",
  }),
  tagTypes: ["All", "ShortTerm", "Detail"],
  endpoints(builder) {
    return {
      fetchShortTerms: builder.query({
        providesTags: (result, error, args) => {
          if (error) return [];
          const tags = result.map((shortTerm: ShortTermItem) => {
            return { type: "ShortTerm", id: shortTerm.id };
          });
          tags.push({ type: "All" });
          return tags;
        },
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
        invalidatesTags: (result, error, args) => {
          return [{ type: "All" }];
        },
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
      updateTimeSpent: builder.mutation<Detail, UpdateTimeSpentInput>({
        invalidatesTags: (result, error, args) => {
          return [{ type: "Detail", id: args.id }];
        },
        query: ({ id, timeSpent }) => {
          return {
            method: "PUT",
            url: `/details/${id}/time-spent`,
            body: {
              timeSpent,
            },
          };
        },
      }),
      updateFinishedDate: builder.mutation<Detail, UpdateFinishedDateInput>({
        invalidatesTags: (result, error, args) => {
          return [{ type: "Detail", id: args.id }];
        },
        query: ({ id, finishedDate }) => {
          return {
            method: "PUT",
            url: `/details/${id}/finished-date`,
            body: {
              finishedDate,
            },
          };
        },
      }),
      deleteShortTerm: builder.mutation<ShortTermItem, DeleteShortTermInput>({
        invalidatesTags: (result, error, args) => {
          return [{ type: "All" }];
        },
        query: ({ id }) => {
          return {
            method: "DELETE",
            url: `/${id}`,
          };
        },
      }),
      deleteShortTermDetail: builder.mutation<Detail, DeleteDetailInput>({
        invalidatesTags: (result, error, args) => {
          return [{ type: "ShortTerm", id: args.id }];
        },
        query: ({ id, detailId }) => {
          return {
            method: "DELETE",
            url: `/details/${detailId}`,
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
  useUpdateTimeSpentMutation,
  useUpdateFinishedDateMutation,
  useDeleteShortTermMutation,
  useDeleteShortTermDetailMutation,
} = shortTermsApi;
export { shortTermsApi };
