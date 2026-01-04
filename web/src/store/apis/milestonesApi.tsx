import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_URL } from "../constants";

export interface Milestone {
  id: string;
  name: string;
  targetDate: string;
  level: number;
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
      { goalId: string; name: string; targetDate: string; level: number }
    >({
      query: ({ goalId, name, targetDate, level }) => ({
        url: `/goals/${goalId}/milestones`,
        method: "POST",
        body: { name, targetDate, level },
      }),
      invalidatesTags: (result, error, { goalId }) => [
        { type: "Milestone", id: `GOAL_${goalId}` },
      ],
    }),
  }),
});

export const { useFetchMilestonesQuery, useCreateMilestoneMutation } =
  milestonesApi;
