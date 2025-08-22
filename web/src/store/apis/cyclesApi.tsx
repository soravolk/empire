import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import {
  CycleCategoryItem,
  CycleSubcategoryItem,
  CycleItem,
  CycleContentItem,
} from "../../types";
import { API_URL } from "../constants";

const cyclesApi = createApi({
  reducerPath: "cycles",
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_URL}/cycles`,
    credentials: "include",
  }),
  tagTypes: ["Cycle", "LongTerm", "Category", "Subcategory", "Content"],
  endpoints(builder) {
    return {
      fetchCyclesOfLongTerm: builder.query({
        providesTags: (result, error, longTerm) => {
          const tags = result.map((cycle: CycleItem) => {
            return { type: "Cycle", id: cycle.id };
          });
          tags.push({ type: "LongTerm", id: longTerm.id });
          return tags;
        },
        query: (longTerm) => {
          return {
            url: "/",
            params: {
              longTermId: longTerm.id,
            },
            method: "GET",
          };
        },
      }),
      fetchSubcategoriesFromCycle: builder.query({
        providesTags: (result, error, cycle) => {
          const tags = result.map((subcategory: CycleSubcategoryItem) => {
            return { type: "Subcategory", id: subcategory.id };
          });
          tags.push({ type: "Cycle", id: cycle.id });
          return tags;
        },
        query: (cycle) => {
          return {
            url: `/${cycle.id}/subcategories`,
            method: "GET",
          };
        },
      }),
      fetchContentsFromCycle: builder.query({
        providesTags: (result, error, cycle) => {
          const tags = result.map((content: CycleContentItem) => {
            return { type: "Content", id: content.id };
          });
          tags.push({ type: "Cycle", id: cycle.id });
          return tags;
        },
        query: (cycle) => {
          return {
            url: `/${cycle.id}/contents`,
            method: "GET",
          };
        },
      }),
      fetchContentFromCycleById: builder.query({
        query: ({ id }) => {
          return {
            url: `/contents/${id}`,
            method: "GET",
          };
        },
      }),
      addCycle: builder.mutation({
        invalidatesTags: (result, error, longTerm) => {
          return [{ type: "LongTerm", id: longTerm.id }];
        },
        query: ({ longTermId, startTime, endTime }) => {
          return {
            method: "POST",
            url: "/",
            body: {
              longTermId: longTermId,
              startTime: startTime,
              endTime: endTime,
            },
          };
        },
      }),
      deleteCycle: builder.mutation({
        invalidatesTags: (result, error, cycle) => {
          return [{ type: "Cycle", id: cycle.id }];
        },
        query: (cycle) => {
          return {
            method: "DELETE",
            url: `/${cycle.id}`,
          };
        },
      }),
      addSubcategoryToCycle: builder.mutation({
        invalidatesTags: (result, error, arg) => {
          return [{ type: "Cycle", id: arg.cycleId }];
        },
        query: ({ cycleId, subcategoryId }) => {
          return {
            method: "POST",
            url: `/${cycleId}/subcategories`,
            body: {
              subcategoryId,
            },
          };
        },
      }),
      deleteSubcategoryFromCycle: builder.mutation({
        invalidatesTags: (result, error, arg) => {
          return [{ type: "Subcategory", id: arg.cycleSubcategoryId }];
        },
        query: (cycleSubcategoryId) => {
          return {
            method: "DELETE",
            url: `/subcategories/${cycleSubcategoryId}`,
          };
        },
      }),
      addContentToCycle: builder.mutation({
        invalidatesTags: (result, error, arg) => {
          return [{ type: "Cycle", id: arg.cycleId }];
        },
        query: ({ cycleId, contentId }) => {
          return {
            method: "POST",
            url: `/${cycleId}/contents`,
            body: {
              contentId,
            },
          };
        },
      }),
      deleteContentFromCycle: builder.mutation({
        invalidatesTags: (result, error, arg) => {
          return [{ type: "Content", id: arg.cycleContentId }];
        },
        query: (cycleContentId) => {
          return {
            method: "DELETE",
            url: `/contents/${cycleContentId}`,
          };
        },
      }),
    };
  },
});

export const {
  useFetchCyclesOfLongTermQuery,
  useFetchSubcategoriesFromCycleQuery,
  useFetchContentsFromCycleQuery,
  useFetchContentFromCycleByIdQuery,
  useAddCycleMutation,
  useDeleteCycleMutation,
  useAddSubcategoryToCycleMutation,
  useDeleteSubcategoryFromCycleMutation,
  useAddContentToCycleMutation,
  useDeleteContentFromCycleMutation,
} = cyclesApi;
export { cyclesApi };
