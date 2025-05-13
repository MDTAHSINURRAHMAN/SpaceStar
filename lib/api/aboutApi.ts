// lib/api/aboutApi.ts
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { AboutContent } from "@/types/about";

export const aboutApi = createApi({
  reducerPath: "aboutApi",
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_URL + "/api/about",
    credentials: "include",
  }),
  tagTypes: ["About"],
  endpoints: (builder) => ({
    getAboutContent: builder.query<AboutContent | null, void>({
      query: () => "/",
      providesTags: ["About"],
    }),

    createAboutContent: builder.mutation<AboutContent, FormData>({
      query: (formData) => ({
        url: "/",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["About"],
    }),

    updateAboutContent: builder.mutation<AboutContent, FormData>({
      query: (formData) => ({
        url: "/",
        method: "PUT",
        body: formData,
      }),
      invalidatesTags: ["About"],
    }),

    deleteAboutContent: builder.mutation<{ message: string }, void>({
      query: () => ({
        url: "/",
        method: "DELETE",
      }),
      invalidatesTags: ["About"],
    }),
  }),
});

export const {
  useGetAboutContentQuery,
  useCreateAboutContentMutation,
  useUpdateAboutContentMutation,
  useDeleteAboutContentMutation,
} = aboutApi;
