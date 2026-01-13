import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import { longTermsApi } from "./apis/longTermsApi";
import { cyclesApi } from "./apis/cyclesApi";
import { userApi } from "./apis/userApi";
import { categoriesApi } from "./apis/categoriesApi";
import { subcategoriesApi } from "./apis/subcategoriesApi";
import { contentsApi } from "./apis/contentsApi";
import { shortTermsApi } from "./apis/shortTermsApi";
import { detailsApi } from "./apis/detailsApi";
import { subtasksApi } from "./apis/subtasksApi";
import { goalsApi } from "./apis/goalsApi";
import { roadmapApi } from "./apis/roadmapApi";
import { milestonesApi } from "./apis/milestonesApi";
import { taskApi } from "./apis/taskApi";

export const store = configureStore({
  reducer: {
    [longTermsApi.reducerPath]: longTermsApi.reducer,
    [cyclesApi.reducerPath]: cyclesApi.reducer,
    [userApi.reducerPath]: userApi.reducer,
    [categoriesApi.reducerPath]: categoriesApi.reducer,
    [subcategoriesApi.reducerPath]: subcategoriesApi.reducer,
    [contentsApi.reducerPath]: contentsApi.reducer,
    [shortTermsApi.reducerPath]: shortTermsApi.reducer,
    [detailsApi.reducerPath]: detailsApi.reducer,
    [subtasksApi.reducerPath]: subtasksApi.reducer,
    [goalsApi.reducerPath]: goalsApi.reducer,
    [roadmapApi.reducerPath]: roadmapApi.reducer,
    [milestonesApi.reducerPath]: milestonesApi.reducer,
    [taskApi.reducerPath]: taskApi.reducer,
  },
  middleware: (getDefaultMiddleware) => {
    return getDefaultMiddleware()
      .concat(longTermsApi.middleware)
      .concat(cyclesApi.middleware)
      .concat(userApi.middleware)
      .concat(categoriesApi.middleware)
      .concat(subcategoriesApi.middleware)
      .concat(contentsApi.middleware)
      .concat(shortTermsApi.middleware)
      .concat(detailsApi.middleware)
      .concat(subtasksApi.middleware)
      .concat(goalsApi.middleware)
      .concat(roadmapApi.middleware)
      .concat(milestonesApi.middleware)
      .concat(taskApi.middleware);
  },
});

setupListeners(store.dispatch);

export {
  useCreateLongTermMutation,
  useAddCategoryToLongTermMutation,
  useAddSubcategoryToLongTermMutation,
  useDeleteCategoryFromLongTermMutation,
  useFetchLongTermsQuery,
  useFetchCategoriesFromLongTermQuery,
  useFetchSubcategoriesFromLongTermQuery,
  useDeleteLongTermMutation,
  useDeleteSubcategoryFromLongTermMutation,
} from "./apis/longTermsApi";
export {
  useFetchCyclesOfLongTermQuery,
  useFetchSubcategoriesFromCycleQuery,
  useFetchContentsFromCycleQuery,
  useFetchContentFromCycleByIdQuery,
  useAddCycleMutation,
  useDeleteCycleMutation,
  useAddSubcategoryToCycleMutation,
  useAddContentToCycleMutation,
  useDeleteContentFromCycleMutation,
} from "./apis/cyclesApi";
export { useFetchCurrentUserQuery } from "./apis/userApi";
export {
  useAddCategoryMutation,
  useFetchCatetoryByIdQuery,
} from "./apis/categoriesApi";
export {
  useAddSubcategoryMutation,
  useFetchSubcatetoryByIdQuery,
} from "./apis/subcategoriesApi";
export { useAddContentMutation } from "./apis/contentsApi";
export { useFetchDetailsQuery } from "./apis/detailsApi";
export {
  useFetchGoalsQuery,
  useCreateGoalMutation,
  useUpdateGoalMutation,
  useDeleteGoalMutation,
  useLinkCategoriesMutation,
  useUnlinkCategoriesMutation,
} from "./apis/goalsApi";
export {
  useCreateShortTermMutation,
  useCreateTaskMutation,
  useFetchShortTermsQuery,
  useFetchTasksFromShortTermQuery,
  useUpdateTimeSpentMutation,
  useUpdateFinishedDateMutation,
  useDeleteShortTermMutation,
  useDeleteShortTermTaskMutation,
} from "./apis/shortTermsApi";
export {
  useFetchSubtasksFromTaskQuery,
  useCreateSubtaskMutation,
  useUpdateSubtaskTimeSpentMutation,
  useUpdateSubtaskFinishedDateMutation,
  useUpdateSubtaskMutation,
  useDeleteSubtaskMutation,
} from "./apis/subtasksApi";
export {
  useFetchRoadmapGoalsQuery,
  useCreateRoadmapGoalMutation,
} from "./apis/roadmapApi";
export {
  useFetchMilestonesQuery,
  useCreateMilestoneMutation,
  useDeleteMilestoneMutation,
  useUpdateMilestoneMutation,
} from "./apis/milestonesApi";
export { useCreateTaskMutation as useCreateTaskInMilestoneMutation } from "./apis/taskApi";
