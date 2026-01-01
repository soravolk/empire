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
  }),
});

export const { useFetchRoadmapGoalsQuery } = roadmapApi;
