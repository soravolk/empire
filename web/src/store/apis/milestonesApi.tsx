import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_URL } from "../constants";

export interface Milestone {
  id: string;
  name: string;
  targetDate: string;
  level: number;
  type?: "target" | "routine";
  created_at?: number;
  // Routine-specific fields
  frequencyCount?: number;
  frequencyPeriod?: "day" | "week" | "month";
  durationAmount?: number;
  durationUnit?: "minutes" | "hours";
  durationPeriod?: "day" | "week" | "month";
  linkedTargetId?: string;
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
        // Routine-specific fields
        frequencyCount?: number;
        frequencyPeriod?: "day" | "week" | "month";
        durationAmount?: number;
        durationUnit?: "minutes" | "hours";
        durationPeriod?: "day" | "week" | "month";
        linkedTargetId?: string;
      }
    >({
      query: ({
        goalId,
        name,
        targetDate,
        level,
        type,
        frequencyCount,
        frequencyPeriod,
        durationAmount,
        durationUnit,
        durationPeriod,
        linkedTargetId,
      }) => ({
        url: `/goals/${goalId}/milestones`,
        method: "POST",
        body: {
          name,
          targetDate,
          level,
          type,
          frequencyCount,
          frequencyPeriod,
          durationAmount,
          durationUnit,
          durationPeriod,
          linkedTargetId,
        },
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
        // Routine-specific fields
        frequencyCount?: number;
        frequencyPeriod?: "day" | "week" | "month";
        durationAmount?: number;
        durationUnit?: "minutes" | "hours";
        durationPeriod?: "day" | "week" | "month";
        linkedTargetId?: string;
      }
    >({
      query: ({
        goalId,
        milestoneId,
        name,
        targetDate,
        type,
        frequencyCount,
        frequencyPeriod,
        durationAmount,
        durationUnit,
        durationPeriod,
        linkedTargetId,
      }) => ({
        url: `/goals/${goalId}/milestones/${milestoneId}`,
        method: "PUT",
        body: {
          name,
          targetDate,
          type,
          frequencyCount,
          frequencyPeriod,
          durationAmount,
          durationUnit,
          durationPeriod,
          linkedTargetId,
        },
      }),
      invalidatesTags: (result, error, { goalId, milestoneId }) => [
        { type: "Milestone", id: milestoneId },
        { type: "Milestone", id: `GOAL_${goalId}` },
      ],
    }),
    // Routine tracking mutations
    addRoutineCompletion: builder.mutation<
      {
        id: string;
        milestoneId: string;
        completedAt: number;
        createdAt: number;
      },
      {
        goalId: string;
        milestoneId: string;
        timestamp?: number;
      }
    >({
      query: ({ goalId, milestoneId, timestamp }) => ({
        url: `/goals/${goalId}/milestones/${milestoneId}/routine/complete`,
        method: "POST",
        body: { timestamp },
      }),
    }),
    addRoutineTime: builder.mutation<
      {
        id: string;
        milestoneId: string;
        durationMinutes: number;
        recordedAt: number;
        createdAt: number;
      },
      {
        goalId: string;
        milestoneId: string;
        minutes: number;
        timestamp?: number;
      }
    >({
      query: ({ goalId, milestoneId, minutes, timestamp }) => ({
        url: `/goals/${goalId}/milestones/${milestoneId}/routine/time`,
        method: "POST",
        body: { minutes, timestamp },
      }),
    }),
    getRoutineStats: builder.query<
      {
        today: { completions: number; minutes: number };
        week: { completions: number; minutes: number };
        month: { completions: number; minutes: number };
        total: { completions: number; minutes: number };
      },
      { goalId: string; milestoneId: string }
    >({
      query: ({ goalId, milestoneId }) =>
        `/goals/${goalId}/milestones/${milestoneId}/routine/stats`,
    }),
  }),
});

export const {
  useFetchMilestonesQuery,
  useCreateMilestoneMutation,
  useDeleteMilestoneMutation,
  useUpdateMilestoneMutation,
  useAddRoutineCompletionMutation,
  useAddRoutineTimeMutation,
  useGetRoutineStatsQuery,
} = milestonesApi;
