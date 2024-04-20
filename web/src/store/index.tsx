import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import { longTermsApi } from "./apis/longTermsApi";

export const store = configureStore({
  reducer: {
    [longTermsApi.reducerPath]: longTermsApi.reducer,
  },
  middleware: (getDefaultMiddleware) => {
    return getDefaultMiddleware().concat(longTermsApi.middleware);
  },
});

setupListeners(store.dispatch);

export { useFetchLongTermsQuery } from "./apis/longTermsApi";
