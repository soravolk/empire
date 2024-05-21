import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import { longTermsApi } from "./apis/longTermsApi";
import { cyclesApi } from "./apis/cyclesApi";

export const store = configureStore({
  reducer: {
    [longTermsApi.reducerPath]: longTermsApi.reducer,
    [cyclesApi.reducerPath]: cyclesApi.reducer,
  },
  middleware: (getDefaultMiddleware) => {
    return getDefaultMiddleware()
      .concat(longTermsApi.middleware)
      .concat(cyclesApi.middleware);
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
} from "./apis/cyclesApi";
