import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import { longTermsApi } from "./apis/longTermsApi";
import { cyclesApi } from "./apis/cyclesApi";
import { userApi } from "./apis/userApi";
import { categoriesApi } from "./apis/categoriesApi";
import { subcategoriesApi } from "./apis/subcategoriesApi";

export const store = configureStore({
  reducer: {
    [longTermsApi.reducerPath]: longTermsApi.reducer,
    [cyclesApi.reducerPath]: cyclesApi.reducer,
    [userApi.reducerPath]: userApi.reducer,
    [categoriesApi.reducerPath]: categoriesApi.reducer,
    [subcategoriesApi.reducerPath]: subcategoriesApi.reducer,
  },
  middleware: (getDefaultMiddleware) => {
    return getDefaultMiddleware()
      .concat(longTermsApi.middleware)
      .concat(cyclesApi.middleware)
      .concat(userApi.middleware)
      .concat(categoriesApi.middleware)
      .concat(subcategoriesApi.middleware);
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
} from "./apis/cyclesApi";
export { useFetchCurrentUserQuery } from "./apis/userApi";
export { useAddCategoryMutation } from "./apis/categoriesApi";
export { useAddSubcategoryMutation } from "./apis/subcategoriesApi";
