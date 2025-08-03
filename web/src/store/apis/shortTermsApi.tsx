import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { Task, ShortTermItem } from "../../types";
import { API_URL } from "../constants";

interface CreateShortTermInput {
  userId: string;
}

interface DeleteShortTermInput {
  id: string;
}
interface CreateTaskInput {
  contentId: string;
  shortTermId: string;
}

interface UpdateTimeSpentInput {
  id: string;
  timeSpent: number;
}

interface UpdateFinishedDateInput {
  id: string;
  finishedDate: string | null;
}

interface DeleteTaskInput {
  id: string;
  taskId: string;
}

const shortTermsApi = createApi({
  reducerPath: "shortTerms",
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_URL}/shortTerms`,
    credentials: "include",
  }),
  tagTypes: ["All", "ShortTerm", "Task"],
  endpoints(builder) {
    return {
      fetchShortTerms: builder.query({
        providesTags: (result, error, args) => {
          if (error) return [];
          const tags = result.map((shortTerm: ShortTermItem) => {
            return { type: "ShortTerm", id: shortTerm.id };
          });
          tags.push({ type: "All" });
          return tags;
        },
        query: () => {
          return {
            method: "GET",
            url: "/",
          };
        },
      }),
      fetchTasksFromShortTerm: builder.query({
        providesTags: (result, error, args) => {
          if (error) return [];
          const { shortTermId } = args;
          const tags = result.map((task: Task) => {
            return { type: "Task", id: task.id };
          });
          tags.push({ type: "ShortTerm", id: shortTermId });
          return tags;
        },
        query: ({ shortTermId }) => {
          return {
            method: "GET",
            url: `/${shortTermId}/tasks`,
          };
        },
      }),
      createShortTerm: builder.mutation<ShortTermItem, CreateShortTermInput>({
        invalidatesTags: (result, error, args) => {
          return [{ type: "All" }];
        },
        query: ({ userId }) => {
          return {
            method: "POST",
            url: "/",
            body: {
              userId,
            },
          };
        },
      }),
      createTask: builder.mutation<Task, CreateTaskInput>({
        invalidatesTags: (result, error, args) => {
          const { shortTermId } = args;
          return [{ type: "ShortTerm", id: shortTermId }];
        },
        query: ({ contentId, shortTermId }) => {
          return {
            method: "POST",
            url: `/${shortTermId}/tasks`,
            body: {
              contentId,
            },
          };
        },
      }),
      updateTimeSpent: builder.mutation<Task, UpdateTimeSpentInput>({
        invalidatesTags: (result, error, args) => {
          return [{ type: "Task", id: args.id }];
        },
        query: ({ id, timeSpent }) => {
          return {
            method: "PUT",
            url: `/tasks/${id}/time-spent`,
            body: {
              timeSpent,
            },
          };
        },
      }),
      updateFinishedDate: builder.mutation<Task, UpdateFinishedDateInput>({
        invalidatesTags: (result, error, args) => {
          return [{ type: "Task", id: args.id }];
        },
        query: ({ id, finishedDate }) => {
          return {
            method: "PUT",
            url: `/tasks/${id}/finished-date`,
            body: {
              finishedDate,
            },
          };
        },
      }),
      deleteShortTerm: builder.mutation<ShortTermItem, DeleteShortTermInput>({
        invalidatesTags: (result, error, args) => {
          return [{ type: "All" }];
        },
        query: ({ id }) => {
          return {
            method: "DELETE",
            url: `/${id}`,
          };
        },
      }),
      deleteShortTermTask: builder.mutation<Task, DeleteTaskInput>({
        invalidatesTags: (result, error, args) => {
          return [{ type: "ShortTerm", id: args.id }];
        },
        query: ({ id, taskId }) => {
          return {
            method: "DELETE",
            url: `/tasks/${taskId}`,
          };
        },
      }),
    };
  },
});

export const {
  useCreateShortTermMutation,
  useCreateTaskMutation,
  useFetchShortTermsQuery,
  useFetchTasksFromShortTermQuery,
  useUpdateTimeSpentMutation,
  useUpdateFinishedDateMutation,
  useDeleteShortTermMutation,
  useDeleteShortTermTaskMutation,
} = shortTermsApi;
export { shortTermsApi };
