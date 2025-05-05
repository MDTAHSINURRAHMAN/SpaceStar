// lib/api/bannerApi.ts
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { BannerEntry } from "@/types/banner";

export const bannerApi = createApi({
  reducerPath: "bannerApi",
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_URL + "/api",
    credentials: "include",
    // Add timeout to prevent hanging requests
    timeout: 30000,
  }),
  tagTypes: ["Banner"],
  endpoints: (builder) => ({
    getBanner: builder.query<BannerEntry, void>({
      query: () => "/banner",
      providesTags: ["Banner"],
    }),
    updateBanner: builder.mutation<BannerEntry, FormData>({
      query: (formData) => ({
        url: "/banner",
        method: "PUT",
        body: formData,
        formData: true,
      }),
      invalidatesTags: ["Banner"],
      async onQueryStarted(_, { queryFulfilled }) {
        try {
          console.log("Banner update query started");
          await queryFulfilled;
          console.log("Banner update query fulfilled");
        } catch (err) {
          console.error("Banner update query failed:", err);
        }
      },
    }),
  }),
});

// Export a direct fetch function for backup usage
export const updateBannerDirectFetch = async (
  id: string,
  formData: FormData
): Promise<BannerEntry> => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/banner/${id}`,
    {
      method: "PUT",
      credentials: "include",
      body: formData,
    }
  );

  if (!response.ok) {
    const errorData = await response
      .json()
      .catch(() => ({ message: "Unknown error" }));
    throw new Error(errorData.message || response.statusText);
  }

  return await response.json();
};

export const { useGetBannerQuery, useUpdateBannerMutation } = bannerApi;
