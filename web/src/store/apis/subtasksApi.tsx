import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { Subtask } from "../../types";
import { API_URL } from "../constants";

interface CreateSubtaskInput {
  taskId: string;
  name: string;
  description?: string;
}

interface UpdateSubtaskTimeSpentInput {
  id: string;
  timeSpent: number;
}

interface UpdateSubtaskFinishedDateInput {
  id: string;
  finishedDate: string | null;
}

interface UpdateSubtaskInput {
  id: string;
  name?: string;
  description?: string;
}

interface DeleteSubtaskInput {
  id: string;
}

const subtasksApi = createApi({
  reducerPath: "subtasks",
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_URL}/tasks`,
    credentials: "include",
  }),
  tagTypes: ["Subtask", "Task"],
  endpoints(builder) {
    return {
      fetchSubtasksFromTask: builder.query({
        providesTags: (result, error, args) => {
          if (error) return [];
          const { taskId } = args;
          const tags =
            result?.map((subtask: Subtask) => {
              return { type: "Subtask", id: subtask.id };
            }) || [];
          tags.push({ type: "Task", id: taskId });
          return tags;
        },
        query: ({ taskId }) => {
          return {
            method: "GET",
            url: `/${taskId}/subtasks`,
          };
        },
      }),
      createSubtask: builder.mutation<Subtask, CreateSubtaskInput>({
        invalidatesTags: (result, error, args) => {
          const { taskId } = args;
          return [{ type: "Task", id: taskId }];
        },
        query: ({ taskId, name, description }) => {
          return {
            method: "POST",
            url: `/${taskId}/subtasks`,
            body: {
              name,
              description,
            },
          };
        },
      }),
      updateSubtaskTimeSpent: builder.mutation<
        Subtask,
        UpdateSubtaskTimeSpentInput
      >({
        invalidatesTags: (result, error, args) => {
          return [{ type: "Subtask", id: args.id }];
        },
        query: ({ id, timeSpent }) => {
          return {
            method: "PUT",
            url: `/subtasks/${id}/time-spent`,
            body: {
              timeSpent,
            },
          };
        },
      }),
      updateSubtaskFinishedDate: builder.mutation<
        Subtask,
        UpdateSubtaskFinishedDateInput
      >({
        invalidatesTags: (result, error, args) => {
          return [{ type: "Subtask", id: args.id }];
        },
        query: ({ id, finishedDate }) => {
          return {
            method: "PUT",
            url: `/subtasks/${id}/finished-date`,
            body: {
              finishedDate,
            },
          };
        },
      }),
      updateSubtask: builder.mutation<Subtask, UpdateSubtaskInput>({
        invalidatesTags: (result, error, args) => {
          return [{ type: "Subtask", id: args.id }];
        },
        query: ({ id, name, description }) => {
          return {
            method: "PUT",
            url: `/subtasks/${id}`,
            body: {
              name,
              description,
            },
          };
        },
      }),
      deleteSubtask: builder.mutation<Subtask, DeleteSubtaskInput>({
        invalidatesTags: (result, error, args) => {
          return [{ type: "Subtask", id: args.id }];
        },
        query: ({ id }) => {
          return {
            method: "DELETE",
            url: `/subtasks/${id}`,
          };
        },
      }),
    };
  },
});

export const {
  useFetchSubtasksFromTaskQuery,
  useCreateSubtaskMutation,
  useUpdateSubtaskTimeSpentMutation,
  useUpdateSubtaskFinishedDateMutation,
  useUpdateSubtaskMutation,
  useDeleteSubtaskMutation,
} = subtasksApi;
export { subtasksApi };
