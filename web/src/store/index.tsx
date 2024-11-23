import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import { longTermsApi } from "./apis/longTermsApi";
import { cyclesApi } from "./apis/cyclesApi";
import { userApi } from "./apis/userApi";
import { categoriesApi } from "./apis/categoriesApi";
import { subcategoriesApi } from "./apis/subcategoriesApi";
import { contentsApi } from "./apis/contentsApi";
import { shortTermsApi } from "./apis/shortTermsApi";

export const store = configureStore({
  reducer: {
    [longTermsApi.reducerPath]: longTermsApi.reducer,
    [cyclesApi.reducerPath]: cyclesApi.reducer,
    [userApi.reducerPath]: userApi.reducer,
    [categoriesApi.reducerPath]: categoriesApi.reducer,
    [subcategoriesApi.reducerPath]: subcategoriesApi.reducer,
    [contentsApi.reducerPath]: contentsApi.reducer,
    [shortTermsApi.reducerPath]: shortTermsApi.reducer,
  },
  middleware: (getDefaultMiddleware) => {
    return getDefaultMiddleware()
      .concat(longTermsApi.middleware)
      .concat(cyclesApi.middleware)
      .concat(userApi.middleware)
      .concat(categoriesApi.middleware)
      .concat(subcategoriesApi.middleware)
      .concat(contentsApi.middleware)
      .concat(shortTermsApi.middleware);
  },
});

setupListeners(store.dispatch);

export { useFetchLongTermsQuery } from "./apis/longTermsApi";
export {
  useFetchCyclesOfLongTermQuery,
  useFetchCategoriesFromCycleQuery,
  useFetchSubcategoriesFromCycleQuery,
  useFetchContentsFromCycleQuery,
  useAddCycleMutation,
  useDeleteCycleMutation,
  useAddCategoryToCycleMutation,
  useDeleteCategoryFromCycleMutation,
  useAddSubcategoryToCycleMutation,
  useDeleteSubcategoryFromCycleMutation,
  useAddContentToCycleMutation,
  useDeleteContentFromCycleMutation,
} from "./apis/cyclesApi";
export { useFetchCurrentUserQuery } from "./apis/userApi";
export { useAddCategoryMutation } from "./apis/categoriesApi";
export { useAddSubcategoryMutation } from "./apis/subcategoriesApi";
export { useAddContentMutation } from "./apis/contentsApi";
export {
  useCreateShortTermMutation,
  useFetchShortTermsQuery,
} from "./apis/shortTermsApi";
