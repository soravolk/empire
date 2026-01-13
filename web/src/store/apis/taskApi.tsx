import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_URL } from "../constants";

export interface Task {
  task_id: string;
  milestone_id: string;
  name: string;
  description: string;
  due_date: string | null;
  time_spent: number;
}

export const taskApi = createApi({
  reducerPath: "task",
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_URL}/tasks`,
    credentials: "include",
  }),
  tagTypes: ["Task"],
  endpoints: (builder) => ({
    getTasksByMilestone: builder.query<Task[], string>({
      providesTags: ["Task"],
      query: (milestone_id) => ({
        url: `/milestone/${milestone_id}`,
        method: "GET",
      }),
    }),
    createTask: builder.mutation<
      Task,
      {
        milestone_id: string;
        name: string;
        description?: string;
        due_date?: string;
      }
    >({
      invalidatesTags: ["Task"],
      query: ({ milestone_id, name, description, due_date }) => ({
        url: "/",
        method: "POST",
        body: { milestone_id, name, description, due_date },
      }),
    }),
    updateTask: builder.mutation<
      Task,
      {
        task_id: string;
        name?: string;
        description?: string;
        due_date?: string;
        time_spent?: number;
      }
    >({
      invalidatesTags: ["Task"],
      query: ({ task_id, ...body }) => ({
        url: `/${task_id}`,
        method: "PUT",
        body,
      }),
    }),
  }),
});

export const {
  useGetTasksByMilestoneQuery,
  useCreateTaskMutation,
  useUpdateTaskMutation,
} = taskApi;
