import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_URL } from "../constants";

// Goals API: list/create/update/delete and link/unlink categories
// Contract: /specs/001-build-a-goal/contracts/goals.openapi.yaml

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
        const params = args?.longTermId
          ? `?long_term_id=${args.longTermId}`
          : "";
        return { url: `/goals${params}`, method: "GET" };
      },
    }),
    createGoal: builder.mutation<
      any,
      { long_term_id: number; statement: string; category_ids?: number[] }
    >({
      invalidatesTags: ["Goal"],
      query: (body) => ({ url: "/goals", method: "POST", body }),
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
      { id: number; category_ids: number[] }
    >({
      invalidatesTags: (result, error, { id }) => [
        { type: "Goal" as const, id },
      ],
      query: ({ id, category_ids }) => ({
        url: `/goals/${id}/categories`,
        method: "POST",
        body: { category_ids },
      }),
    }),
    unlinkCategories: builder.mutation<
      null,
      { id: number; category_ids: number[] }
    >({
      invalidatesTags: (result, error, { id }) => [
        { type: "Goal" as const, id },
      ],
      query: ({ id, category_ids }) => ({
        url: `/goals/${id}/categories`,
        method: "DELETE",
        body: { category_ids },
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
