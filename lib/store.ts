// lib/store.ts
import { configureStore } from "@reduxjs/toolkit";
import { productApi } from "./api/productApi";
import { orderApi } from "./api/orderApi";
import { loginApi } from "./api/loginApi"; // ✅ Import loginApi
import { reviewApi } from "./api/reviewApi"; // ✅ Import reviewApi
import { homeApi } from "./api/homeApi"; // ✅ Import homeApi
import { aboutApi } from "./api/aboutApi"; // ✅ Import aboutApi
import { storyApi } from "./api/storyApi"; // ✅ Import storyApi
import { bannerApi } from "./api/bannerApi"; // ✅ Import bannerApi
import { privacyApi } from "./api/privacyApi"; // ✅ Import privacyApi
export const store = configureStore({
  reducer: {
    [productApi.reducerPath]: productApi.reducer,
    [orderApi.reducerPath]: orderApi.reducer,
    [loginApi.reducerPath]: loginApi.reducer, // ✅ Add reducer
    [reviewApi.reducerPath]: reviewApi.reducer, // ✅ Add reducer
    [homeApi.reducerPath]: homeApi.reducer, // ✅ Add reducer
    [aboutApi.reducerPath]: aboutApi.reducer, // ✅ Add reducer
    [storyApi.reducerPath]: storyApi.reducer, // ✅ Add reducer
    [bannerApi.reducerPath]: bannerApi.reducer, // ✅ Add reducer
    [privacyApi.reducerPath]: privacyApi.reducer, // ✅ Add reducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(productApi.middleware)
      .concat(orderApi.middleware)
      .concat(loginApi.middleware)
      .concat(reviewApi.middleware)
      .concat(homeApi.middleware)
      .concat(aboutApi.middleware)
      .concat(storyApi.middleware)
      .concat(bannerApi.middleware)
      .concat(privacyApi.middleware), // ✅ Add middleware
});
