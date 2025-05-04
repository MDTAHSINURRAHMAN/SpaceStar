// lib/store.ts
import { configureStore } from "@reduxjs/toolkit";
import { productApi } from "./api/productApi";
import { orderApi } from "./api/orderApi";
import { loginApi } from "./api/loginApi"; // ✅ Import loginApi
import { reviewApi } from "./api/reviewApi"; // ✅ Import reviewApi
export const store = configureStore({
  reducer: {
    [productApi.reducerPath]: productApi.reducer,
    [orderApi.reducerPath]: orderApi.reducer,
    [loginApi.reducerPath]: loginApi.reducer, // ✅ Add reducer
    [reviewApi.reducerPath]: reviewApi.reducer, // ✅ Add reducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(productApi.middleware)
      .concat(orderApi.middleware)
      .concat(loginApi.middleware)
      .concat(reviewApi.middleware), // ✅ Add middleware
});
