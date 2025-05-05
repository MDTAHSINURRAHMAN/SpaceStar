// lib/api/bannerApi.ts

import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { BannerEntry } from "@/types/banner";

export const bannerApi = createApi({
  reducerPath: "bannerApi",
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_URL + "/api/banner",
    credentials: "include",
  }),
  tagTypes: ["Banner"],
  endpoints: (builder) => ({
    getBanner: builder.query<BannerEntry, void>({
      query: () => "/",
      providesTags: ["Banner"],
    }),

    createBanner: builder.mutation<BannerEntry, FormData>({
      query: (formData) => ({
        url: "/",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["Banner"],
    }),

    updateBanner: builder.mutation<
      BannerEntry,
      { id: string; formData: FormData }
    >({
      query: ({ id, formData }) => ({
        url: `/${id}`,
        method: "PUT",
        body: formData,
      }),
      invalidatesTags: ["Banner"],
    }),

    deleteBanner: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Banner"],
    }),
  }),
});

export const {
  useGetBannerQuery,
  useCreateBannerMutation,
  useUpdateBannerMutation,
  useDeleteBannerMutation,
} = bannerApi;
