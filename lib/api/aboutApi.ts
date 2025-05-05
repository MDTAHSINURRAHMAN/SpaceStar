import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { AboutContent } from "@/types/about";

export const aboutApi = createApi({
  reducerPath: "aboutApi",
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_URL + "/api/about", // adjust if needed
    credentials: "include",
  }),
  endpoints: (builder) => ({
    getAboutContent: builder.query<AboutContent, void>({
      query: () => "/",
    }),
  }),
});

export const { useGetAboutContentQuery } = aboutApi;
