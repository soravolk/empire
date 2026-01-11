import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_URL } from "../constants";

export interface RoadmapGoal {
  goal_id: string;
  title: string;
  targetDate: string;
}

export const roadmapApi = createApi({
  reducerPath: "roadmap",
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_URL}/roadmap`,
    credentials: "include",
  }),
  tagTypes: ["RoadmapGoal"],
  endpoints: (builder) => ({
    fetchRoadmapGoals: builder.query<RoadmapGoal[], void>({
      providesTags: (result) =>
        (result ?? []).map((g: RoadmapGoal) => ({
          type: "RoadmapGoal" as const,
          id: g.goal_id,
        })) || ["RoadmapGoal"],
      query: () => ({
        url: "/goals",
        method: "GET",
      }),
    }),
    createRoadmapGoal: builder.mutation<
      RoadmapGoal,
      { title: string; targetDate: string }
    >({
      invalidatesTags: ["RoadmapGoal"],
      query: ({ title, targetDate }) => ({
        url: "/goals",
        method: "POST",
        body: { title, targetDate },
      }),
    }),
    updateRoadmapGoal: builder.mutation<
      RoadmapGoal,
      { goal_id: string; title: string; targetDate: string }
    >({
      invalidatesTags: (result, error, arg) => [
        { type: "RoadmapGoal", id: arg.goal_id },
        "RoadmapGoal",
      ],
      query: ({ goal_id, title, targetDate }) => ({
        url: `/goals/${goal_id}`,
        method: "PUT",
        body: { title, targetDate },
      }),
    }),
    deleteRoadmapGoal: builder.mutation<void, string>({
      invalidatesTags: ["RoadmapGoal"],
      query: (goal_id) => ({
        url: `/goals/${goal_id}`,
        method: "DELETE",
      }),
    }),
  }),
});

export const {
  useFetchRoadmapGoalsQuery,
  useCreateRoadmapGoalMutation,
  useUpdateRoadmapGoalMutation,
  useDeleteRoadmapGoalMutation,
} = roadmapApi;
