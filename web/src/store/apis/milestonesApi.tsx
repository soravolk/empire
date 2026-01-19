import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_URL } from "../constants";

export interface Milestone {
  id: string;
  name: string;
  targetDate: string;
  level: number;
  type?: "target" | "routine";
  created_at?: number;
}

export const milestonesApi = createApi({
  reducerPath: "milestones",
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_URL}/roadmap`,
    credentials: "include",
  }),
  tagTypes: ["Milestone"],
  endpoints: (builder) => ({
    fetchMilestones: builder.query<Milestone[], string>({
      query: (goalId) => `/goals/${goalId}/milestones`,
      providesTags: (result, error, goalId) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Milestone" as const, id })),
              { type: "Milestone", id: `GOAL_${goalId}` },
            ]
          : [{ type: "Milestone", id: `GOAL_${goalId}` }],
    }),
    createMilestone: builder.mutation<
      Milestone,
      {
        goalId: string;
        name: string;
        targetDate: string;
        level: number;
        type?: "target" | "routine";
      }
    >({
      query: ({ goalId, name, targetDate, level, type }) => ({
        url: `/goals/${goalId}/milestones`,
        method: "POST",
        body: { name, targetDate, level, type: type || "target" },
      }),
      invalidatesTags: (result, error, { goalId }) => [
        { type: "Milestone", id: `GOAL_${goalId}` },
      ],
    }),
    deleteMilestone: builder.mutation<
      void,
      { goalId: string; milestoneId: string }
    >({
      query: ({ goalId, milestoneId }) => ({
        url: `/goals/${goalId}/milestones/${milestoneId}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, { goalId, milestoneId }) => [
        { type: "Milestone", id: milestoneId },
        { type: "Milestone", id: `GOAL_${goalId}` },
      ],
    }),
    updateMilestone: builder.mutation<
      Milestone,
      {
        goalId: string;
        milestoneId: string;
        name: string;
        targetDate: string;
        type?: "target" | "routine";
      }
    >({
      query: ({ goalId, milestoneId, name, targetDate, type }) => ({
        url: `/goals/${goalId}/milestones/${milestoneId}`,
        method: "PUT",
        body: { name, targetDate, type },
      }),
      invalidatesTags: (result, error, { goalId, milestoneId }) => [
        { type: "Milestone", id: milestoneId },
        { type: "Milestone", id: `GOAL_${goalId}` },
      ],
    }),
  }),
});

export const {
  useFetchMilestonesQuery,
  useCreateMilestoneMutation,
  useDeleteMilestoneMutation,
  useUpdateMilestoneMutation,
} = milestonesApi;
