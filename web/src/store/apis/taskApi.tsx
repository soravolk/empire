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
    createTask: builder.mutation<
      Task,
      { milestone_id: string; name: string; description?: string; due_date?: string }
    >({
      invalidatesTags: ["Task"],
      query: ({ milestone_id, name, description, due_date }) => ({
        url: "/",
        method: "POST",
        body: { milestone_id, name, description, due_date },
      }),
    }),
  }),
});

export const { useCreateTaskMutation } = taskApi;
