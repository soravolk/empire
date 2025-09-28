import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_URL } from "../constants";

export const goalsApi = createApi({
  reducerPath: "goals",
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_URL}`,
    credentials: "include",
  }),
  tagTypes: ["Goal"],
  endpoints: (builder) => ({
    fetchGoals: builder.query<any[], { longTermId?: number } | null>({
      providesTags: (result) =>
        (result ?? []).map((g: any) => ({ type: "Goal" as const, id: g.id })),
      query: (args) => {
        const params = args?.longTermId ? `?longTermId=${args.longTermId}` : "";
        return { url: `/goals${params}`, method: "GET" };
      },
    }),
    createGoal: builder.mutation<
      any,
      { longTermId: number; statement: string; categoryIds?: number[] }
    >({
      invalidatesTags: ["Goal"],
      query: ({ longTermId, statement, categoryIds }) => ({
        url: "/goals",
        method: "POST",
        body: {
          longTermId,
          statement,
          ...(Array.isArray(categoryIds) && categoryIds.length
            ? { categoryIds }
            : {}),
        },
      }),
    }),
    updateGoal: builder.mutation<any, { id: number; statement: string }>({
      invalidatesTags: (result, error, { id }) => [
        { type: "Goal" as const, id },
      ],
      query: ({ id, statement }) => ({
        url: `/goals/${id}`,
        method: "PATCH",
        body: { statement },
      }),
    }),
    deleteGoal: builder.mutation<null, { id: number }>({
      invalidatesTags: (result, error, { id }) => [
        { type: "Goal" as const, id },
      ],
      query: ({ id }) => ({ url: `/goals/${id}`, method: "DELETE" }),
    }),
    linkCategories: builder.mutation<
      any,
      { id: number; categoryIds: number[] }
    >({
      invalidatesTags: (result, error, { id }) => [
        { type: "Goal" as const, id },
      ],
      query: ({ id, categoryIds }) => ({
        url: `/goals/${id}/categories`,
        method: "POST",
        body: { categoryIds },
      }),
    }),
    unlinkCategories: builder.mutation<
      null,
      { id: number; categoryIds: number[] }
    >({
      invalidatesTags: (result, error, { id }) => [
        { type: "Goal" as const, id },
      ],
      query: ({ id, categoryIds }) => ({
        url: `/goals/${id}/categories`,
        method: "DELETE",
        body: { categoryIds },
      }),
    }),
  }),
});

export const {
  useFetchGoalsQuery,
  useCreateGoalMutation,
  useUpdateGoalMutation,
  useDeleteGoalMutation,
  useLinkCategoriesMutation,
  useUnlinkCategoriesMutation,
} = goalsApi;
